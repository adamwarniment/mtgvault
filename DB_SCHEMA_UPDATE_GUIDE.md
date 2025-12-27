# Database Schema Update Guide

If you make changes to the Prisma schema (`schema.prisma`), you may notice the local development environment breaks with 500 errors, or the API fails to recognize new models/fields.

## The Issue
The API runs inside a Docker container with its own `node_modules` (isolated from your host machine). When you update the schema and run migrations locally on your machine, the Prisma Client *inside* the Docker container does not automatically update.

## The Fix
We have updated the `docker-compose.dev.yml` file to automatically regenerate the Prisma Client every time the container starts.

The `api` service command is now:
```yaml
command: sh -c "npm install && npx prisma migrate deploy && npx prisma generate && npm run dev"
```

## How to Apply Changes Manually
If you are developing and don't want to restart the whole container stack every time you change the schema:

1. **Run Migration on Host** (creates the SQL and updates DB):
   ```bash
   npx prisma migrate dev --name <your_migration_name>
   ```

2. **Update Container's Client**:
   You have two options:
   
   **Option A: Restart the API container** (Recommended)
   This will force the start script to run `prisma generate`.
   ```bash
   docker-compose -f docker-compose.dev.yml restart api
   ```
   
   **Option B: Execute generate inside the running container** (Faster)
   ```bash
   docker-compose -f docker-compose.dev.yml exec api npx prisma generate
   ```

## Troubleshooting
If you still see errors like `Invalid `prisma.wishlist.findMany()` invocation` or `Model ... not found`:
1. Check if the generated client path is correct.
2. Ensure `node_modules` isn't corrupted in the volume. You can prune volumes if desperate: `docker-compose -f docker-compose.dev.yml down -v` (Warning: deletes DB data).
