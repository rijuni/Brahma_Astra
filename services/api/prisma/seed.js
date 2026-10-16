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
      name: 'BRAHMA Astra Lead Developer',
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
        name: 'BRAHMA Core Workspace',
        description: 'Default intelligence and coding project workspace.',
        ownerId: user.id
      }
    });
    console.log(`[Seed] Created project: ${project.name} (${project.id})`);
  }

  // Create demo ASTRA workspace
  const existingWorkspace = await prisma.astraWorkspace.findFirst({
    where: { projectId: project.id }
  });

  if (!existingWorkspace) {
    const workspace = await prisma.astraWorkspace.create({
      data: {
        projectId: project.id,
        name: 'Primary Repository Workspace',
        status: 'active'
      }
    });
    console.log(`[Seed] Created ASTRA workspace: ${workspace.name} (${workspace.id})`);
  }

  // Create demo conversation
  const existingConversation = await prisma.conversation.findFirst({
    where: { userId: user.id }
  });

  if (!existingConversation) {
    const conversation = await prisma.conversation.create({
      data: {
        title: 'Welcome to BRAHMA + ASTRA',
        projectId: project.id,
        userId: user.id,
        messages: {
          create: [
            {
              role: 'system',
              content: 'BRAHMA intelligence platform initialized with ASTRA coding engine.'
            },
            {
              role: 'assistant',
              content: 'Hello! I am BRAHMA. Your ASTRA coding workspace is ready.'
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
