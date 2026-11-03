const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding initial development data...');

  const devEmail = process.env.DEV_USER_EMAIL || 'developer@brahma-astra.local';
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
  const existingProject = await prisma.project.findFirst({
    where: { ownerId: user.id }
  });

  let project = existingProject;
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
  const existingWorkspace = await prisma.astraWorkspace.findFirst({
    where: { projectId: project.id }
  });

  if (!existingWorkspace) {
    const workspace = await prisma.astraWorkspace.create({
      data: {
        projectId: project.id,
        name: 'EDITH Primary Repository Workspace',
        status: 'active'
      }
    });
    console.log(`[Seed] Created EDITH workspace: ${workspace.name} (${workspace.id})`);
  }

  // Create demo conversation
  const existingConversation = await prisma.conversation.findFirst({
    where: { userId: user.id }
  });

  if (!existingConversation) {
    const conversation = await prisma.conversation.create({
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
