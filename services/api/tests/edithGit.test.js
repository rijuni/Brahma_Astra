const request = require('supertest');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const app = require('../src/app');
const prisma = require('../src/repositories/prisma');

describe('EDITH Real Git Integration & Security (/api/v1/edith/git)', () => {
  const testEmail = `edith_git_${Date.now()}@friday-edith.local`;
  const otherEmail = `edith_git_other_${Date.now()}@friday-edith.local`;
  let token;
  let otherToken;
  let userId;
  let otherUserId;
  let tempRoot;
  let projectId;

  beforeAll(async () => {
    // 1. Create temporary directory for real Git repository operations
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'edith-git-suite-'));
    execFileSync('git', ['init', '-b', 'main'], { cwd: tempRoot });
    execFileSync('git', ['config', 'user.email', 'git_tester@friday-edith.local'], { cwd: tempRoot });
    execFileSync('git', ['config', 'user.name', 'Git Tester'], { cwd: tempRoot });

    fs.writeFileSync(path.join(tempRoot, 'README.md'), '# Initial Git Repo\n', 'utf8');
    execFileSync('git', ['add', 'README.md'], { cwd: tempRoot });
    execFileSync('git', ['commit', '-m', 'chore: initial commit'], { cwd: tempRoot });

    // 2. Register primary test user
    const res1 = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: testEmail, password: 'Password123!', name: 'Git Master' });
    token = res1.body.data.token;
    userId = res1.body.data.user.id;

    // 3. Register secondary user for authorization isolation testing
    const res2 = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: otherEmail, password: 'Password123!', name: 'Other Dev' });
    otherToken = res2.body.data.token;
    otherUserId = res2.body.data.user.id;

    // 4. Register tempRoot as project root for primary user
    const regRes = await request(app)
      .post('/api/v1/edith/fs/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Git Integration Project',
        rootPath: tempRoot
      });
    projectId = regRes.body.data.projectId;
  });

  afterAll(async () => {
    // Clean up temporary disk files
    try {
      if (tempRoot && fs.existsSync(tempRoot)) {
        fs.rmSync(tempRoot, { recursive: true, force: true });
      }
    } catch {}

    // Clean up test database records
    await prisma.edithWorkspace.deleteMany({
      where: { project: { ownerId: { in: [userId, otherUserId] } } }
    }).catch(() => {});
    await prisma.project.deleteMany({
      where: { ownerId: { in: [userId, otherUserId] } }
    }).catch(() => {});
    await prisma.user.deleteMany({
      where: { id: { in: [userId, otherUserId] } }
    }).catch(() => {});
    await prisma.$disconnect();
  });

  it('rejects unauthorized requests with 401', async () => {
    const res = await request(app).get(`/api/v1/edith/git/status?projectId=${projectId}`);
    expect(res.statusCode).toBe(401);
  });

  it('retrieves working tree status on clean repository', async () => {
    const res = await request(app)
      .get(`/api/v1/edith/git/status?projectId=${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.branch).toBe('main');
    expect(res.body.data.isClean).toBe(true);
    expect(res.body.data.staged).toEqual([]);
    expect(res.body.data.unstaged).toEqual([]);
    expect(res.body.data.untracked).toEqual([]);
  });

  it('detects unstaged modifications and untracked files', async () => {
    fs.writeFileSync(path.join(tempRoot, 'README.md'), '# Updated Git Repo Header\n', 'utf8');
    fs.writeFileSync(path.join(tempRoot, 'new_script.js'), 'console.log("new file");\n', 'utf8');

    const res = await request(app)
      .get(`/api/v1/edith/git/status?projectId=${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.isClean).toBe(false);

    const unstagedPaths = res.body.data.unstaged.map((f) => f.path);
    const untrackedPaths = res.body.data.untracked.map((f) => f.path);

    expect(unstagedPaths).toContain('README.md');
    expect(untrackedPaths).toContain('new_script.js');
  });

  it('stages specific files into the Git index', async () => {
    const res = await request(app)
      .post('/api/v1/edith/git/stage')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        files: ['README.md']
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.stagedCount).toBe(1);

    const statusRes = await request(app)
      .get(`/api/v1/edith/git/status?projectId=${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    const stagedPaths = statusRes.body.data.staged.map((f) => f.path);
    expect(stagedPaths).toContain('README.md');
  });

  it('retrieves real unified diff for staged files', async () => {
    const res = await request(app)
      .get(`/api/v1/edith/git/diff?projectId=${projectId}&file=README.md&staged=true`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.diff).toContain('+');
    expect(res.body.data.diff).toContain('# Updated Git Repo Header');
  });

  it('unstages files from the Git index', async () => {
    const res = await request(app)
      .post('/api/v1/edith/git/unstage')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        files: ['README.md']
      });

    expect(res.statusCode).toBe(200);

    const statusRes = await request(app)
      .get(`/api/v1/edith/git/status?projectId=${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    const stagedPaths = statusRes.body.data.staged.map((f) => f.path);
    expect(stagedPaths).not.toContain('README.md');
  });

  it('requires explicit user confirmation to commit changes', async () => {
    // Stage all changes
    await request(app)
      .post('/api/v1/edith/git/stage')
      .set('Authorization', `Bearer ${token}`)
      .send({ projectId, all: true });

    // Attempt commit without confirmation flag
    const rejectRes = await request(app)
      .post('/api/v1/edith/git/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        message: 'feat: add new script'
      });

    expect(rejectRes.statusCode).toBe(400);

    // Commit with explicit confirmed: true
    const commitRes = await request(app)
      .post('/api/v1/edith/git/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        message: 'feat: add new script and update readme',
        confirmed: true
      });

    expect(commitRes.statusCode).toBe(201);
    expect(commitRes.body.data.commitHash).toBeDefined();
    expect(commitRes.body.data.message).toBe('feat: add new script and update readme');
  });

  it('retrieves commit log history', async () => {
    const res = await request(app)
      .get(`/api/v1/edith/git/log?projectId=${projectId}&limit=10`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.commits.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.commits[0].message).toBe('feat: add new script and update readme');
  });

  it('creates and checks out a new branch', async () => {
    const res = await request(app)
      .post('/api/v1/edith/git/branches')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        branchName: 'feature/live-db-explorer',
        checkout: true
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.branch).toBe('feature/live-db-explorer');
    expect(res.body.data.checkedOut).toBe(true);

    const branchesRes = await request(app)
      .get(`/api/v1/edith/git/branches?projectId=${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(branchesRes.statusCode).toBe(200);
    expect(branchesRes.body.data.current).toBe('feature/live-db-explorer');
    expect(branchesRes.body.data.branches).toContain('feature/live-db-explorer');
    expect(branchesRes.body.data.branches).toContain('main');
  });

  it('checks out an existing branch', async () => {
    const res = await request(app)
      .post('/api/v1/edith/git/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        branchName: 'main'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.branch).toBe('main');

    const statusRes = await request(app)
      .get(`/api/v1/edith/git/status?projectId=${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(statusRes.body.data.branch).toBe('main');
  });

  describe('Security & Injection Defense', () => {
    it('rejects malicious branch names starting with dashes (flag injection)', async () => {
      const res = await request(app)
        .post('/api/v1/edith/git/branches')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          branchName: '--upload-pack=exploit'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toMatch(/Branch name cannot start with a dash/i);
    });

    it('rejects branch names containing directory traversal sequences ("..")', async () => {
      const res = await request(app)
        .post('/api/v1/edith/git/branches')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          branchName: 'escape..branch'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toMatch(/invalid sequences/i);
    });

    it('rejects file staging paths outside project root (path traversal)', async () => {
      const res = await request(app)
        .post('/api/v1/edith/git/stage')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          files: ['../../Windows/System32/drivers/etc/hosts']
        });

      expect(res.statusCode).toBe(403);
    });

    it('rejects file paths starting with a dash (option injection)', async () => {
      const res = await request(app)
        .post('/api/v1/edith/git/stage')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          files: ['--patch']
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toMatch(/cannot start with a dash/i);
    });

    it('rejects git operations from unauthorized users on someone else project', async () => {
      const res = await request(app)
        .get(`/api/v1/edith/git/status?projectId=${projectId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});

