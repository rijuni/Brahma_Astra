const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding initial development data for FRIDAY + EDITH...');

  const devEmail = process.env.DEV_USER_EMAIL || 'developer@friday-edith.local';
  const devPassword = process.env.DEV_USER_PASSWORD || 'DevPassword123!';
  const passwordHash = await bcrypt.hash(devPassword, 10);

  // Upsert development user
  const user = await prisma.user.upsert({
    where: { email: devEmail },
    update: {},
    create: {
      email: devEmail,
      passwordHash,
      name: 'FRIDAY Lead Developer',
      role: 'admin'
    }
  });

  console.log(`[Seed] Seeded user: ${user.email} (${user.id})`);

  // Create demo project
  let project = await prisma.project.findFirst({
    where: { ownerId: user.id }
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'FRIDAY Core Workspace',
        description: 'Default intelligence and coding project workspace.',
        ownerId: user.id
      }
    });
    console.log(`[Seed] Created project: ${project.name} (${project.id})`);
  }

  // Create demo EDITH workspace
  let workspace = await prisma.edithWorkspace.findFirst({
    where: { projectId: project.id }
  });

  if (!workspace) {
    workspace = await prisma.edithWorkspace.create({
      data: {
        projectId: project.id,
        name: 'EDITH Primary Repository Workspace',
        status: 'active'
      }
    });
    console.log(`[Seed] Created EDITH workspace: ${workspace.name} (${workspace.id})`);
  }

  // Create demo conversation
  let conversation = await prisma.conversation.findFirst({
    where: { userId: user.id }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        title: 'Welcome to FRIDAY + EDITH',
        projectId: project.id,
        userId: user.id,
        messages: {
          create: [
            {
              role: 'system',
              content: 'FRIDAY intelligence platform initialized with EDITH coding engine.'
            },
            {
              role: 'assistant',
              content: 'Hello! I am FRIDAY. Your EDITH coding workspace is ready.'
            }
          ]
        }
      }
    });
    console.log(`[Seed] Created conversation: ${conversation.title} (${conversation.id})`);
  }

  console.log('[Seed] Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
