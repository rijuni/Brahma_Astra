# Database and Prisma Plan

## Decision
Use SQLite for initial development, then PostgreSQL for integration testing and production. Prisma is the ORM and schema owner for the main application database. Treat the SQLite and PostgreSQL migration histories as provider-specific.

## Responsibilities
- Node.js/Express owns the Prisma schema, generated Prisma Client, migrations and main application persistence.
- Python FastAPI services initially access application data through authenticated internal APIs.
- If a future performance or domain requirement calls for Python direct access, decide table ownership first and document the decision. Do not let Prisma and Alembic independently migrate the same tables.

## Initial domain areas
1. Identity: User, Session, Account/Identity if needed.
2. Projects: Project, ProjectMember/AccessGrant.
3. Conversation: Conversation, Message, Attachment metadata.
4. Memory: MemoryItem, MemoryPreference/Settings.
5. Documents: DocumentAsset, DocumentProcessingJob.
6. AI tasks: AiTask, AiTaskEvent/Status history, ProviderUsage metadata (avoid storing secrets).
7. ASTRA: AstraWorkspace, RepositoryConnection metadata, CodingTask, PatchProposal, ExecutionJob, TestRun, Approval, AuditEvent.
8. Platform: Notification, UserPreference, AuditEvent.

Do not implement every model in one unreviewed migration. Begin with the minimal schema required for auth, users, projects and audit basics; add domains in small migrations.

## Prisma conventions
- Use stable IDs (UUID or CUID2; choose one and keep it consistent).
- Add `createdAt` and `updatedAt` where appropriate.
- Define ownership and foreign-key relations explicitly.
- Add indexes for frequent lookups and unique constraints for identity fields.
- Use transactions for multi-record state changes.
- Store timestamps in UTC.
- Use enum-like constraints carefully; keep forward-compatible where product states may evolve.
- Avoid database-specific raw SQL unless needed and documented.
- Validate Prisma schema and run migrations in CI.

## Initial development: SQLite

Configure the Prisma datasource provider as `sqlite` and use a local file URL, for example:

```env
DATABASE_URL="file:./dev.db"
```

Generate the Prisma client and create the initial SQLite migration using the commands appropriate to the installed Prisma version. Keep the database file local and out of version control.

## Integration testing and production: PostgreSQL

Configure the PostgreSQL Prisma datasource for the PostgreSQL environment and use a PostgreSQL connection URL. Example:

```env
DATABASE_URL="postgresql://app_user:replace_me@localhost:5432/brahma_astra?schema=public"
```

Before relying on PostgreSQL in production, test the schema, constraints, indexes, transactions, queries, and seed data against PostgreSQL itself.

## Local development commands (run from services/api after setup)
```bash
npm install
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init
```

The exact package scripts and Prisma version must be verified when implementation begins. Do not claim these commands work before the project and dependencies are created.

## Environment
Use `DATABASE_URL` from environment injection, for example:
```env
DATABASE_URL="file:./dev.db"
```
This is an example only. Use a local-only password in your ignored `.env`; never commit credentials.

## Database safety
- Production changes use reviewed migration files and a controlled deploy migration command.
- Back up before production migrations and test restore.
- Keep the SQLite database file out of Git and protect it as application data.
- Do not expose PostgreSQL publicly unless there is a specific approved need.
- **Migration warning:** Prisma migration SQL is provider-specific. Do not switch the datasource provider and assume existing SQLite migrations will run on PostgreSQL. Define and test a PostgreSQL migration history, then plan any data transfer explicitly. Verify SQLite-to-PostgreSQL compatibility for types, defaults, constraints, indexes, and raw SQL.
- Use separate credentials for local/test/staging/production.
