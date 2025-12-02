# Prisma OpenSSL Compatibility Fix

## Problem
The API container was crashing with:
```
PrismaClientInitializationError: Unable to require(`/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node`)
Error loading shared library libssl.so.1.1: No such file or directory
```

## Root Cause
- Prisma was looking for OpenSSL 1.1 (`libssl.so.1.1`)
- Alpine Linux 3.22 (node:20-alpine) ships with OpenSSL 3.x
- The `openssl1.1-compat` package no longer exists in Alpine 3.22

## Solution
Updated the API Dockerfile to:
1. Set `PRISMA_QUERY_ENGINE_LIBRARY` to point to the OpenSSL 3.0.x compatible engine
2. Set `PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x` during Prisma generation

This tells Prisma to use the correct pre-compiled binary for Alpine Linux with OpenSSL 3.

## Files Changed
- `apps/api/Dockerfile` - Added environment variables for Prisma binary targeting

## Next Steps
Push the changes to trigger a new build:
```bash
git add apps/api/Dockerfile
git commit -m "Fix Prisma OpenSSL 3 compatibility for Alpine Linux"
git push origin main
```

Then redeploy:
```bash
docker-compose -f docker-compose.prod.yml pull api
docker-compose -f docker-compose.prod.yml up -d
```
