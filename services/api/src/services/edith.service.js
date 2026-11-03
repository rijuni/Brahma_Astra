const prisma = require('../repositories/prisma');
const edithEngineClient = require('../clients/edithEngine.client');
const { AppError } = require('../middleware/errorHandler');
const auditService = require('./audit.service');

class EdithService {
  async createWorkspace(userId, { projectId, name, repositoryUrl = null }) {
    // Verify project access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    const hasAccess = project.ownerId === userId || project.members.some(m => m.userId === userId);
    if (!hasAccess) {
      throw new AppError('Forbidden: Access to this project is denied', 403, 'FORBIDDEN');
    }

    const workspace = await prisma.edithWorkspace.create({
      data: {
        projectId,
        name,
        repositoryUrl,
        status: 'active'
      }
    });

    await auditService.record({
      userId,
      action: 'EDITH_WORKSPACE_CREATED',
      resourceType: 'EdithWorkspace',
      resourceId: workspace.id,
      details: { name, projectId }
    });

    return workspace;
  }

  async getWorkspace(workspaceId, userId) {
    const workspace = await prisma.edithWorkspace.findUnique({
      where: { id: workspaceId },
      include: {
        project: {
          include: { members: true }
        },
        codingTasks: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!workspace) {
      throw new AppError('EDITH Workspace not found', 404, 'NOT_FOUND');
    }

    const hasAccess = workspace.project.ownerId === userId || workspace.project.members.some(m => m.userId === userId);
    if (!hasAccess) {
      throw new AppError('Forbidden: Access to this workspace is denied', 403, 'FORBIDDEN');
    }

    return workspace;
  }

  async createCodingTask(userId, { workspaceId, title, instruction }) {
    await this.getWorkspace(workspaceId, userId);

    const task = await prisma.codingTask.create({
      data: {
        workspaceId,
        title: title || 'Coding Task',
        instruction,
        status: 'proposed'
      }
    });

    await auditService.record({
      userId,
      action: 'EDITH_TASK_PROPOSED',
      resourceType: 'CodingTask',
      resourceId: task.id,
      details: { workspaceId, title }
    });

    // Trigger patch generation in EDITH Engine
    this.planTaskInEdithEngine(task.id, workspaceId, instruction);

    return task;
  }

  async planTaskInEdithEngine(taskId, workspaceId, instruction) {
    try {
      const planResponse = await edithEngineClient.planTask({
        taskId,
        workspaceId,
        instruction
      });

      if (planResponse && planResponse.patch_proposal) {
        await prisma.codingTask.update({
          where: { id: taskId },
          data: {
            patchProposal: JSON.stringify(planResponse.patch_proposal)
          }
        });
      }
    } catch (err) {
      // EDITH Engine might be offline; task remains proposed
    }
  }

  async approveCodingTask(taskId, userId) {
    const task = await prisma.codingTask.findUnique({
      where: { id: taskId },
      include: {
        workspace: {
          include: {
            project: { include: { members: true } }
          }
        }
      }
    });

    if (!task) {
      throw new AppError('Coding task not found', 404, 'NOT_FOUND');
    }

    const hasAccess = task.workspace.project.ownerId === userId || task.workspace.project.members.some(m => m.userId === userId);
    if (!hasAccess) {
      throw new AppError('Forbidden: Access to this task is denied', 403, 'FORBIDDEN');
    }

    if (task.status !== 'proposed') {
      throw new AppError(`Cannot approve task with status '${task.status}'. Only 'proposed' tasks can be approved.`, 400, 'BAD_REQUEST');
    }

    // Update status to approved
    const updatedTask = await prisma.codingTask.update({
      where: { id: taskId },
      data: { status: 'approved' }
    });

    // Create execution job
    const job = await prisma.executionJob.create({
      data: {
        codingTaskId: taskId,
        status: 'queued'
      }
    });

    await auditService.record({
      userId,
      action: 'EDITH_TASK_APPROVED',
      resourceType: 'CodingTask',
      resourceId: taskId,
      details: { executionJobId: job.id }
    });

    // Trigger execution in EDITH Engine
    this.dispatchExecution(taskId, job.id);

    return {
      task: updatedTask,
      executionJob: job
    };
  }

  async dispatchExecution(taskId, executionJobId) {
    try {
      await prisma.codingTask.update({
        where: { id: taskId },
        data: { status: 'running' }
      });

      await prisma.executionJob.update({
        where: { id: executionJobId },
        data: { status: 'running' }
      });

      const result = await edithEngineClient.executeApprovedTask(taskId);

      await prisma.executionJob.update({
        where: { id: executionJobId },
        data: {
          status: result.status || 'succeeded',
          output: result.output || 'Execution completed successfully',
          exitCode: result.exit_code !== undefined ? result.exit_code : 0,
          completedAt: new Date()
        }
      });

      await prisma.codingTask.update({
        where: { id: taskId },
        data: {
          status: result.status === 'failed' ? 'failed' : 'completed'
        }
      });
    } catch (err) {
      await prisma.executionJob.update({
        where: { id: executionJobId },
        data: {
          status: 'failed',
          output: `Execution error: ${err.message}`,
          exitCode: 1,
          completedAt: new Date()
        }
      }).catch(() => { });

      await prisma.codingTask.update({
        where: { id: taskId },
        data: { status: 'failed' }
      }).catch(() => { });
    }
  }

  async getCodingTask(taskId, userId) {
    const task = await prisma.codingTask.findUnique({
      where: { id: taskId },
      include: {
        workspace: {
          include: {
            project: { include: { members: true } }
          }
        },
        executionJobs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!task) {
      throw new AppError('Coding task not found', 404, 'NOT_FOUND');
    }

    const hasAccess = task.workspace.project.ownerId === userId || task.workspace.project.members.some(m => m.userId === userId);
    if (!hasAccess) {
      throw new AppError('Forbidden: Access to this task is denied', 403, 'FORBIDDEN');
    }

    return {
      ...task,
      patchProposal: task.patchProposal ? JSON.parse(task.patchProposal) : null
    };
  }

  async cancelCodingTask(taskId, userId) {
    const task = await this.getCodingTask(taskId, userId);

    if (['completed', 'failed', 'cancelled'].includes(task.status)) {
      throw new AppError(`Cannot cancel task with status '${task.status}'`, 409, 'CONFLICT');
    }

    await edithEngineClient.cancelTask(taskId);

    const updated = await prisma.codingTask.update({
      where: { id: taskId },
      data: { status: 'cancelled' }
    });

    await auditService.record({
      userId,
      action: 'EDITH_TASK_CANCELLED',
      resourceType: 'CodingTask',
      resourceId: taskId
    });

    return updated;
  }
}

module.exports = new EdithService();
