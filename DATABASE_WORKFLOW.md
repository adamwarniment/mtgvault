# Local Development Database Workflow

This guide covers how to manage the database in your local Docker environment (`docker-compose.dev.yml`), including how to apply schema changes and how to wipe the environment clean.

## 1. Quick Fix: Apply Schema Changes
If you see errors like `column ... does not exist` after modifying `schema.prisma`, you need to sync the database with your schema.

Run this command to push changes immediately:
```bash
docker exec mtgvault-api-1 npx prisma db push
```
*Note: This works for prototyping but does not create a migration history file.*

## 2. Generate a Migration (Best Practice)
To create a version-controlled migration file (saved in `prisma/migrations`), run:
```bash
docker exec -it mtgvault-api-1 npx prisma migrate dev --name <migration_name>
```
*Example: `docker exec -it mtgvault-api-1 npx prisma migrate dev --name add_tcgplayer_url`*

## 3. How to Wipe and Reset the Database
If you need to completely reset your local database (e.g., conflicting migrations or corrupted data), follow these steps to destroy the database volume and start fresh.

### Step-by-Step Reset
1.  **Stop containers and remove volumes**:
    The `-v` flag is critical—it deletes the persistent data volume (`postgres_data_dev`).
    ```bash
    docker-compose -f docker-compose.dev.yml down -v
    ```

2.  **Restart the environment**:
    ```bash
    docker-compose -f docker-compose.dev.yml up -d
    ```

3.  **Push the schema**:
    Since the database is now empty, you must push the schema to create the tables again.
    ```bash
    docker exec mtgvault-api-1 npx prisma db push
    ```

### One-Liner Command
You can combine these into a single command for convenience:
```bash
docker-compose -f docker-compose.dev.yml down -v && \
docker-compose -f docker-compose.dev.yml up -d && \
sleep 5 && \
docker exec mtgvault-api-1 npx prisma db push
```
*(The `sleep 5` ensures the Postgres container is ready for connections before Prisma tries to connect.)*
