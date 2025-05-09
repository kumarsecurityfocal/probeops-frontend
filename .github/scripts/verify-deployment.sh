#!/bin/bash
# Deployment verification script for ProbeOps Frontend

# Set variables
DEPLOYMENT_URL="${1:-https://probeops.com}"
MAX_RETRIES=10
RETRY_INTERVAL=5

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Verifying deployment at $DEPLOYMENT_URL${NC}"

# Function to check if the site is accessible
function check_site() {
  local url=$1
  local http_code=$(curl -s -o /dev/null -w "%{http_code}" $url)
  
  if [[ $http_code == 200 ]]; then
    return 0
  else
    return 1
  fi
}

# Try to access the site with retries
retry_count=0
while [ $retry_count -lt $MAX_RETRIES ]; do
  if check_site $DEPLOYMENT_URL; then
    echo -e "${GREEN}✅ Deployment verification successful!${NC}"
    echo -e "${GREEN}Site is accessible at $DEPLOYMENT_URL${NC}"
    exit 0
  else
    retry_count=$((retry_count+1))
    echo -e "${YELLOW}Site not available yet. Retry $retry_count of $MAX_RETRIES...${NC}"
    sleep $RETRY_INTERVAL
  fi
done

echo -e "${RED}❌ Deployment verification failed after $MAX_RETRIES retries${NC}"
echo -e "${RED}Unable to access $DEPLOYMENT_URL${NC}"
exit 1