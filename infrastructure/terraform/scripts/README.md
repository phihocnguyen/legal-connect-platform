# Terraform Infrastructure Deployment Scripts

This directory contains helper scripts for deploying and managing the infrastructure.

## Scripts

### deploy.sh - Full Infrastructure Deployment

```bash
#!/bin/bash
set -e

echo "🚀 Starting Terraform deployment..."

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install it first."
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if terraform.tfvars exists
if [ ! -f terraform.tfvars ]; then
    echo "❌ terraform.tfvars not found. Please copy from terraform.tfvars.example and configure it."
    exit 1
fi

# Initialize Terraform
echo "📦 Initializing Terraform..."
terraform init

# Validate configuration
echo "✅ Validating Terraform configuration..."
terraform validate

# Format code
echo "🎨 Formatting Terraform code..."
terraform fmt -recursive

# Plan deployment
echo "📋 Creating deployment plan..."
terraform plan -out=tfplan

# Ask for confirmation
read -p "Do you want to apply this plan? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled."
    exit 0
fi

# Apply configuration
echo "🏗️  Applying Terraform configuration..."
terraform apply tfplan

# Clean up plan file
rm -f tfplan

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Outputs:"
terraform output
```

### destroy.sh - Destroy Infrastructure

```bash
#!/bin/bash
set -e

echo "⚠️  WARNING: This will destroy all infrastructure resources!"
echo "This action cannot be undone."
echo ""

read -p "Are you absolutely sure you want to destroy everything? (type 'destroy' to confirm): " confirm

if [ "$confirm" != "destroy" ]; then
    echo "❌ Destruction cancelled."
    exit 0
fi

echo "🔥 Destroying infrastructure..."
terraform destroy

echo "✅ Infrastructure destroyed."
```

### setup-backend.sh - Set Up Terraform Backend

```bash
#!/bin/bash
set -e

PROJECT_NAME="legal-connect"
REGION="ap-southeast-1"
BUCKET_NAME="${PROJECT_NAME}-terraform-state"
TABLE_NAME="${PROJECT_NAME}-terraform-lock"

echo "🔧 Setting up Terraform backend..."

# Create S3 bucket
echo "📦 Creating S3 bucket for state..."
aws s3 mb s3://${BUCKET_NAME} --region ${REGION} 2>/dev/null || echo "Bucket already exists"

# Enable versioning
echo "🔄 Enabling versioning..."
aws s3api put-bucket-versioning \
  --bucket ${BUCKET_NAME} \
  --versioning-configuration Status=Enabled

# Enable encryption
echo "🔒 Enabling encryption..."
aws s3api put-bucket-encryption \
  --bucket ${BUCKET_NAME} \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Create DynamoDB table
echo "🗄️  Creating DynamoDB table for state locking..."
aws dynamodb create-table \
  --table-name ${TABLE_NAME} \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ${REGION} 2>/dev/null || echo "Table already exists"

echo "✅ Backend setup completed!"
echo ""
echo "Bucket: s3://${BUCKET_NAME}"
echo "DynamoDB Table: ${TABLE_NAME}"
```

### build-and-push-images.sh - Build and Push Docker Images

```bash
#!/bin/bash
set -e

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="ap-southeast-1"
REPOSITORY_NAME="legal-connect-backend"
ECR_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPOSITORY_NAME}"

echo "🐳 Building and pushing Docker images..."

# Create ECR repository if it doesn't exist
echo "📦 Creating ECR repository..."
aws ecr describe-repositories --repository-names ${REPOSITORY_NAME} --region ${REGION} 2>/dev/null || \
aws ecr create-repository --repository-name ${REPOSITORY_NAME} --region ${REGION}

# Get ECR login
echo "🔑 Logging into ECR..."
aws ecr get-login-password --region ${REGION} | \
  docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

# Build backend image
echo "🏗️  Building backend image..."
cd ../../backend
docker build -t ${REPOSITORY_NAME}:latest .

# Tag image
echo "🏷️  Tagging image..."
docker tag ${REPOSITORY_NAME}:latest ${ECR_URI}:latest
docker tag ${REPOSITORY_NAME}:latest ${ECR_URI}:$(date +%Y%m%d-%H%M%S)

# Push image
echo "⬆️  Pushing image to ECR..."
docker push ${ECR_URI}:latest
docker push ${ECR_URI}:$(date +%Y%m%d-%H%M%S)

echo "✅ Images pushed successfully!"
echo ""
echo "Latest image: ${ECR_URI}:latest"
```

### deploy-frontend.sh - Deploy Frontend to S3

```bash
#!/bin/bash
set -e

ENVIRONMENT=${1:-prod}
PROJECT_NAME="legal-connect"
BUCKET_NAME="${PROJECT_NAME}-${ENVIRONMENT}-frontend"

echo "🌐 Deploying frontend to S3..."

# Get CloudFront distribution ID
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)

# Build frontend
echo "🏗️  Building frontend..."
cd ../../frontend
npm install
npm run build

# Sync to S3
echo "⬆️  Uploading to S3..."
aws s3 sync out/ s3://${BUCKET_NAME} --delete

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*"

echo "✅ Frontend deployed successfully!"
echo ""
echo "URL: https://$(terraform output -raw cloudfront_distribution_domain_name)"
```

## Usage

Make scripts executable:

```bash
chmod +x scripts/*.sh
```

Run scripts:

```bash
# Setup backend (first time only)
./scripts/setup-backend.sh

# Build and push Docker images
./scripts/build-and-push-images.sh

# Deploy infrastructure
./scripts/deploy.sh

# Deploy frontend
./scripts/deploy-frontend.sh prod

# Destroy infrastructure (careful!)
./scripts/destroy.sh
```
