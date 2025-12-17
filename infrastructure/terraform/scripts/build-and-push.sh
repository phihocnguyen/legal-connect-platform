#!/bin/bash

# Build and Push Docker Images to ECR
# This script builds both backend and frontend Docker images and pushes them to AWS ECR

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="ap-southeast-2"
AWS_ACCOUNT_ID="703172063283"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Get the absolute path to project root (3 levels up from scripts/)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "${SCRIPT_DIR}/../../.." && pwd )"

# Repository names
BACKEND_REPO="legal-connect-backend"
FRONTEND_REPO="legal-connect-frontend"

# Image tags
BACKEND_IMAGE="${ECR_REGISTRY}/${BACKEND_REPO}:latest"
FRONTEND_IMAGE="${ECR_REGISTRY}/${FRONTEND_REPO}:latest"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Legal Connect - Build and Push to ECR${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}Error: AWS CLI is not installed${NC}"
        echo "Please install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
}

# Function to check if Docker is running
check_docker() {
    if ! docker info &> /dev/null; then
        echo -e "${RED}Error: Docker is not running${NC}"
        echo "Please start Docker and try again"
        exit 1
    fi
}

# Function to create ECR repository if it doesn't exist
create_ecr_repo() {
    local repo_name=$1
    echo -e "${YELLOW}Checking ECR repository: ${repo_name}${NC}"
    
    if ! aws ecr describe-repositories --repository-names "${repo_name}" --region "${AWS_REGION}" &> /dev/null; then
        echo -e "${YELLOW}Creating ECR repository: ${repo_name}${NC}"
        aws ecr create-repository \
            --repository-name "${repo_name}" \
            --region "${AWS_REGION}" \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256
        echo -e "${GREEN}✓ Repository created${NC}"
    else
        echo -e "${GREEN}✓ Repository already exists${NC}"
    fi
}

# Function to login to ECR
ecr_login() {
    echo -e "${YELLOW}Logging in to ECR...${NC}"
    aws ecr get-login-password --region "${AWS_REGION}" | \
        docker login --username AWS --password-stdin "${ECR_REGISTRY}"
    echo -e "${GREEN}✓ Logged in to ECR${NC}"
}

# Function to build and push backend
build_backend() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Building Backend${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    cd "${PROJECT_ROOT}/backend"
    
    echo -e "${YELLOW}Building backend Docker image...${NC}"
    docker build -t "${BACKEND_IMAGE}" .
    echo -e "${GREEN}✓ Backend image built${NC}"
    
    echo -e "${YELLOW}Pushing backend image to ECR...${NC}"
    docker push "${BACKEND_IMAGE}"
    echo -e "${GREEN}✓ Backend image pushed${NC}"
    
    # Tag with timestamp
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backend_tag="${ECR_REGISTRY}/${BACKEND_REPO}:${timestamp}"
    docker tag "${BACKEND_IMAGE}" "${backend_tag}"
    docker push "${backend_tag}"
    echo -e "${GREEN}✓ Backend image also tagged as: ${timestamp}${NC}"
}

# Function to build and push frontend
build_frontend() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Building Frontend${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    cd "${PROJECT_ROOT}/frontend"
    
    echo -e "${YELLOW}Building frontend Docker image...${NC}"
    docker build -t "${FRONTEND_IMAGE}" .
    echo -e "${GREEN}✓ Frontend image built${NC}"
    
    echo -e "${YELLOW}Pushing frontend image to ECR...${NC}"
    docker push "${FRONTEND_IMAGE}"
    echo -e "${GREEN}✓ Frontend image pushed${NC}"
    
    # Tag with timestamp
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local frontend_tag="${ECR_REGISTRY}/${FRONTEND_REPO}:${timestamp}"
    docker tag "${FRONTEND_IMAGE}" "${frontend_tag}"
    docker push "${frontend_tag}"
    echo -e "${GREEN}✓ Frontend image also tagged as: ${timestamp}${NC}"
}

# Main execution
main() {
    check_aws_cli
    check_docker
    
    # Create ECR repositories
    create_ecr_repo "${BACKEND_REPO}"
    create_ecr_repo "${FRONTEND_REPO}"
    
    # Login to ECR
    ecr_login
    
    # Build and push images
    if [ "$1" == "backend" ]; then
        build_backend
    elif [ "$1" == "frontend" ]; then
        build_frontend
    else
        build_backend
        build_frontend
    fi
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ All images built and pushed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Backend Image: ${BACKEND_IMAGE}"
    echo "Frontend Image: ${FRONTEND_IMAGE}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Update terraform.tfvars with the image URLs above (if not already set)"
    echo "2. Run: terraform plan"
    echo "3. Run: terraform apply"
}

# Run main function
main "$@"
