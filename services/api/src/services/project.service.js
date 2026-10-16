const prisma = require('../repositories/prisma');
const { AppError } = require('../middleware/errorHandler');
const auditService = require('./audit.service');

class ProjectService {
  async createProject({ name, description, userId }) {
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'owner'
          }
        }
      },
      include: {
        members: true
      }
    });

    await auditService.record({
      userId,
      action: 'PROJECT_CREATED',
      resourceType: 'Project',
      resourceId: project.id,
      details: { name }
    });

    return project;
  }

  async listProjects(userId) {
    return await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getProject(projectId, userId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true }
            }
          }
        },
        workspaces: true
      }
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    const hasAccess = project.ownerId === userId || project.members.some(m => m.userId === userId);
    if (!hasAccess) {
      throw new AppError('Forbidden: Access to this project is denied', 403, 'FORBIDDEN');
    }

    return project;
  }

  async updateProject(projectId, userId, { name, description }) {
    const project = await this.getProject(projectId, userId);

    if (project.ownerId !== userId) {
      throw new AppError('Forbidden: Only the project owner can update settings', 403, 'FORBIDDEN');
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: name !== undefined ? name : project.name,
        description: description !== undefined ? description : project.description
      }
    });

    await auditService.record({
      userId,
      action: 'PROJECT_UPDATED',
      resourceType: 'Project',
      resourceId: projectId
    });

    return updated;
  }

  async deleteProject(projectId, userId) {
    const project = await this.getProject(projectId, userId);

    if (project.ownerId !== userId) {
      throw new AppError('Forbidden: Only the project owner can delete this project', 403, 'FORBIDDEN');
    }

    await prisma.project.delete({
      where: { id: projectId }
    });

    await auditService.record({
      userId,
      action: 'PROJECT_DELETED',
      resourceType: 'Project',
      resourceId: projectId
    });

    return true;
  }
}

module.exports = new ProjectService();
