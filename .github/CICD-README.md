# ProbeOps Frontend CI/CD Pipeline

This document explains the CI/CD pipeline configuration for the ProbeOps Frontend application.

## Overview

The CI/CD pipeline is implemented using GitHub Actions and consists of two main jobs:

1. **Build and Test**: Compiles and builds the application
2. **Deploy**: Creates a Docker image and deploys it to the production server

## Required GitHub Secrets

To use this CI/CD pipeline, you need to configure the following secrets in your GitHub repository:

### Required Secrets for Docker Hub Publishing

- `DOCKER_HUB_USERNAME`: Your Docker Hub username
- `DOCKER_HUB_TOKEN`: A Docker Hub access token with push permissions

### Required Secrets for Deployment

- `DEPLOY_HOST`: The hostname or IP address of your production server
- `DEPLOY_USER`: The SSH username to connect to your production server
- `DEPLOY_SSH_KEY`: The private SSH key for authentication

### Optional Secrets

- `VITE_API_URL`: The URL of your backend API (defaults to 'https://probeops.com/api' if not set)
- `DEPLOYMENT_URL`: The URL to verify deployment (defaults to 'https://probeops.com' if not set)

### Notification Secrets

- `SLACK_WEBHOOK_URL`: Slack webhook URL for notifications
- `NOTIFICATION_EMAIL`: Email address to receive deployment notifications
- `SMTP_SERVER`: SMTP server for sending email notifications
- `SMTP_PORT`: SMTP port for sending email notifications
- `SMTP_USERNAME`: SMTP username for authentication
- `SMTP_PASSWORD`: SMTP password for authentication

## How to Setup

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and Variables > Actions
3. Add all the required secrets listed above

## Pipeline Triggers

The pipeline is triggered on:

- Push to `main` or `master` branches
- Pull requests targeting `main` or `master`
- Manual triggering via GitHub Actions interface

## Pipeline Steps

### Build and Test Job

1. Checkout code
2. Setup Node.js environment
3. Install dependencies
4. Update browserslist database
5. Build the project
6. Archive build artifacts

### Deploy Job (only on push to main/master)

1. Download build artifacts
2. Setup Docker Buildx
3. Login to Docker Hub
4. Build and push Docker image
5. Deploy to production server using SSH
6. Verify deployment with health check

## Customizing the Deployment

The deployment step assumes you have a `docker-compose.yml` file on your server. You may need to modify the path in the deployment script to match your server's configuration:

```yaml
script: |
  cd /path/to/deployment
  docker compose pull
  docker compose down
  docker compose up -d
  docker system prune -af
```

## Troubleshooting

1. **Build Fails**: Check the build logs for specific errors
2. **Docker Push Fails**: Verify your Docker Hub credentials
3. **Deployment Fails**: Check SSH connectivity and permissions on the target server

## Security Best Practices

- Use repository secrets for all sensitive information
- Use a dedicated Docker Hub access token with limited permissions
- Consider using a dedicated deployment user on your server with appropriate permissions
- Regularly rotate your secrets and tokens