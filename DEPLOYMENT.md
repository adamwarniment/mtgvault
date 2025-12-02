# Deployment Guide

This guide explains how to deploy the `mtgvault` application using Docker, GitHub Packages, and Docker Compose.

## Prerequisites

- A Linux server with Docker and Docker Compose installed.
- A GitHub repository with the project code.
- A Personal Access Token (PAT) with `read:packages` scope (if the repository is private).

## 1. Generating Packages (Docker Images)

The project is configured with GitHub Actions to automatically build and publish Docker images to the GitHub Container Registry (GHCR) whenever you push to the `main` branch or push a tag starting with `v`.

### Automatic Build
Simply push your changes to the `main` branch:
```bash
git push origin main
```
This will trigger the `Build and Publish` workflow. You can view the progress in the "Actions" tab of your GitHub repository.

### Manual Build (Locally)
If you need to build the images locally for testing:
```bash
# Build API
docker build -t mtgvault-api ./apps/api

# Build Client
docker build -t mtgvault-client ./apps/client
```

## 2. Server Setup

### Environment Variables
Create a `.env` file on your server in the directory where you will run `docker-compose`. You can use the following template:

```env
# Docker Image Configuration
# Replace 'yourusername' with your GitHub username or organization
IMAGE_PREFIX=ghcr.io/yourusername/mtgvault

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=mtgvault

# API Configuration
JWT_SECRET=your_jwt_secret

# Port Configuration (Optional)
# Defaults to 3000 for API and 80 for Client if not set
API_PORT=3000
CLIENT_PORT=80
```

### Docker Compose
Copy the `docker-compose.prod.yml` file to your server.

## 3. Deploying

1. Log in to the GitHub Container Registry on your server:
   ```bash
   echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
   ```
   Replace `USERNAME` with your GitHub username and `$CR_PAT` with your Personal Access Token.

2. Start the application:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. Verify the services are running:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

## 4. Updates

To update the application after a new image has been published:

1. Pull the latest images:
   ```bash
   docker-compose -f docker-compose.prod.yml pull
   ```

2. Restart the services:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```
