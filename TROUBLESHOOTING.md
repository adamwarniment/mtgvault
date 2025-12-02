# Deployment Troubleshooting

## Error: "manifest unknown" when pulling images

This error means Docker cannot find the images in GitHub Container Registry. Here's how to fix it:

### Step 1: Verify GitHub Actions Ran Successfully

1. Go to your GitHub repository
2. Click the "Actions" tab
3. Look for the "Build and Publish" workflow
4. Check if it completed successfully (green checkmark)
5. If it failed, click on it to see the error logs

### Step 2: Check Your Image Names

The images should be named: `ghcr.io/YOUR_GITHUB_USERNAME/mtgvault-api` and `ghcr.io/YOUR_GITHUB_USERNAME/mtgvault-client`

In your `.env` file on the server, make sure you have:
```env
IMAGE_PREFIX=ghcr.io/YOUR_GITHUB_USERNAME/mtgvault
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username (lowercase).

### Step 3: Verify Images Exist

You can check if the images were published:
1. Go to your GitHub repository
2. Click on "Packages" (on the right sidebar)
3. You should see `mtgvault-api` and `mtgvault-client` listed

### Step 4: Check Authentication

Make sure you're logged into GHCR on your server:
```bash
echo $CR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### Step 5: Use Specific Tags

Instead of `:latest`, try using a specific tag. The workflow creates tags based on:
- Branch name (e.g., `:main`)
- Git SHA (e.g., `:sha-abc123`)

Update your `docker-compose.prod.yml` to use a specific tag:
```yaml
api:
  image: ${IMAGE_PREFIX:-ghcr.io/yourusername/mtgvault}-api:main
```

## Alternative: Build Locally and Push

If GitHub Actions isn't working, you can build and push manually:

```bash
# Login to GHCR
echo $CR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Build and tag API
docker build -t ghcr.io/YOUR_GITHUB_USERNAME/mtgvault-api:latest ./apps/api
docker push ghcr.io/YOUR_GITHUB_USERNAME/mtgvault-api:latest

# Build and tag Client
docker build -t ghcr.io/YOUR_GITHUB_USERNAME/mtgvault-client:latest ./apps/client
docker push ghcr.io/YOUR_GITHUB_USERNAME/mtgvault-client:latest
```

## Quick Fix: Use Local Images

If you just want to test locally without GHCR, you can build the images locally and update the compose file:

1. Build the images:
```bash
docker build -t mtgvault-api:latest ./apps/api
docker build -t mtgvault-client:latest ./apps/client
```

2. Update `docker-compose.prod.yml` to use local images:
```yaml
api:
  image: mtgvault-api:latest
  # ... rest of config

client:
  image: mtgvault-client:latest
  # ... rest of config
```
