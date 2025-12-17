# 🚀 Deploy Terraform - Step by Step Guide

## 📋 Tóm tắt

Hướng dẫn chi tiết cách chạy `terraform apply` để deploy toàn bộ AWS infrastructure.

**AWS Account ID:** `703172063283`
**Region:** `ap-southeast-1` (Singapore)
**Environment:** `prod`

---

## 📋 **PRE-REQUIREMENTS - Kiểm tra trước**

```bash
# 1. Terraform installed?
terraform version

# 2. AWS CLI installed?
aws --version

# 3. AWS credentials configured?
aws sts get-caller-identity

# 4. Docker installed? (để build backend image)
docker --version

# 5. Maven installed? (để build backend)
./mvnw --version
```

**Nếu không cài đủ, cài trước:**

```bash
# Install Terraform
brew install terraform  # macOS
# or
sudo apt-get install terraform  # Linux

# Install AWS CLI
pip install awscli

# Configure AWS
aws configure
# AWS Access Key ID: YOUR_KEY
# AWS Secret Access Key: YOUR_SECRET
# Default region: ap-southeast-1
```

---

## 🔑 **BƯỚC 1: Chuẩn bị AWS Credentials**

### 1.1 Verify AWS credentials

```bash
# Check current AWS account
aws sts get-caller-identity

# Output:
# {
#   "UserId": "...",
#   "Account": "703172063283",
#   "Arn": "arn:aws:iam::703172063283:user/your-user"
# }
```

### 1.2 Có 2 cách setup credentials:

**Cách 1: AWS CLI config (Dễ nhất)**

```bash
aws configure

# Nhập:
# AWS Access Key ID: AKIA...
# AWS Secret Access Key: ...
# Default region: ap-southeast-1
# Default output format: json
```

**Cách 2: Environment variables**

```bash
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_DEFAULT_REGION="ap-southeast-1"
```

---

## 📦 **BƯỚC 2: Build Backend Docker Image**

### 2.1 Build Maven project

```bash
cd backend

# Build with Maven (skip tests để nhanh)
./mvnw clean package -DskipTests

# Output:
# BUILD SUCCESS
#
# Artifacts:
# - target/legal-connect-*.jar

# Verify JAR file exists
ls -lh target/legal-connect-*.jar
```

### 2.2 Build Docker image

```bash
# Build Docker image
docker build -t legal-connect-backend:latest .

# Verify image built
docker images | grep legal-connect-backend

# Output:
# legal-connect-backend     latest    abc123def456   250MB
```

### 2.3 Tag image for ECR

```bash
docker tag legal-connect-backend:latest \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest
```

### 2.4 Push to ECR

```bash
# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com

# Push image
docker push 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest

# Verify push
aws ecr describe-images \
  --repository-name legal-connect-backend \
  --region ap-southeast-1

# Output:
# {
#   "imageDetails": [
#     {
#       "imageTags": ["latest"],
#       "imageSize": 250000000
#     }
#   ]
# }
```

---

## 🪣 **BƯỚC 3: Create S3 Frontend Bucket**

```bash
# Create bucket
aws s3api create-bucket \
  --bucket legal-connect-prod-frontend \
  --region ap-southeast-1 \
  --create-bucket-configuration LocationConstraint=ap-southeast-1

# Enable website hosting
aws s3api put-bucket-website \
  --bucket legal-connect-prod-frontend \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "404.html"}
  }'

# Block public access
aws s3api put-public-access-block \
  --bucket legal-connect-prod-frontend \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Verify
aws s3 ls s3://legal-connect-prod-frontend
```

---

## 📝 **BƯỚC 4: Update terraform.tfvars**

### 4.1 Open terraform.tfvars

```bash
cd infrastructure/terraform

# Edit file
nano terraform.tfvars
```

### 4.2 Update critical fields

**Find and replace:**

```hcl
# ❌ OLD
db_password = "AbCdEf123456GhIjKl789012MnOp"
jwt_secret = "Xy1zA2bC3dE4fG5hI6jK7lM8nO9pQ0rS1tU2vW3xY4zA"

# ✅ NEW (generate new passwords)
db_password = "YOUR_NEW_STRONG_PASSWORD"
jwt_secret = "YOUR_NEW_JWT_SECRET"
```

**Generate new passwords:**

```bash
# Generate strong database password
openssl rand -base64 32

# Generate JWT secret (hex)
openssl rand -hex 32
```

**Complete file should look like:**

```hcl
# AWS Configuration
aws_region  = "ap-southeast-1"
project_name = "legal-connect"
environment  = "prod"

# VPC Configuration
vpc_cidr                     = "10.0.0.0/16"
availability_zones           = ["ap-southeast-1a", "ap-southeast-1b"]
public_subnet_cidrs          = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs_app     = ["10.0.10.0/24", "10.0.11.0/24"]
private_subnet_cidrs_data    = ["10.0.20.0/24", "10.0.21.0/24"]

# SSL Certificates
ssl_certificate_arn        = ""
cloudfront_certificate_arn = ""

# RDS Configuration
db_engine            = "postgres"
db_engine_version    = "15.5"
db_instance_class    = "db.t3.micro"
db_name              = "legalconnect"
db_username          = "legalconnect_admin"
db_password          = "pM7xK9qL2mN5pR8sT3vW1yX4zB6cD9eF"  # ✅ NEW
db_allocated_storage = 20
db_backup_retention  = 7

# ECS Configuration
backend_image           = "703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest"
backend_cpu             = 512
backend_memory          = 1024
backend_desired_count   = 2
backend_container_port  = 8080

# Application Configuration
jwt_secret = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"  # ✅ NEW

# CloudWatch Configuration
log_retention_days = 30
alarm_email        = "ng.phihoc123@gmail.com"
```

---

## 🔧 **BƯỚC 5: Initialize Terraform**

```bash
# Từ folder infrastructure/terraform
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Output:
# Terraform has been successfully configured!
#
# Your working directory contains the following Terraform files:
# - main.tf
# - variables.tf
# - outputs.tf
# - terraform.tfvars
# - modules/...

# List Terraform state
terraform state list
```

---

## 📋 **BƯỚC 6: Review Terraform Plan**

### 6.1 Generate plan

```bash
# Generate execution plan (không apply)
terraform plan

# Output:
# Terraform will perform the following actions:
#
# + aws_vpc.main
# + aws_subnet.public[0]
# + aws_subnet.public[1]
# + aws_subnet.private_app[0]
# + aws_subnet.private_app[1]
# + aws_subnet.private_data[0]
# + aws_subnet.private_data[1]
# + aws_security_group.alb
# + aws_security_group.ecs
# + aws_security_group.rds
# + aws_lb.main
# + aws_ecs_cluster.main
# + aws_ecs_task_definition.backend
# + aws_ecs_service.backend
# + aws_db_instance.main
# + aws_s3_bucket.frontend
# + aws_s3_bucket.pdfs
# + aws_s3_bucket.avatars
# + aws_s3_bucket.logs
# + aws_cloudfront_distribution.main
# + aws_cloudwatch_log_group.ecs
# + ...
#
# Plan: 50+ resources to be created, 0 to be destroyed.
```

### 6.2 Save plan to file (Optional)

```bash
# Save plan
terraform plan -out=tfplan

# Review plan
terraform show tfplan

# Hoặc save to JSON
terraform plan -out=tfplan
terraform show -json tfplan > tfplan.json
```

---

## ✅ **BƯỚC 7: Apply Terraform**

### 7.1 Run terraform apply

```bash
# Apply changes (sẽ hỏi confirm)
terraform apply

# Hoặc apply từ saved plan
terraform apply tfplan

# Hoặc auto-approve (không hỏi)
terraform apply -auto-approve
```

### 7.2 Confirm apply

```bash
# Terraform sẽ hỏi:
# Do you want to perform these actions?
# Only 'yes' will be accepted to approve.
#
# Enter a value: yes

# Type: yes
# Press: Enter

# Output:
# Apply complete! Resources: 50 added, 0 changed, 0 destroyed.
#
# Outputs:
#
# alb_dns_name = "alb-12345678.ap-southeast-1.elb.amazonaws.com"
# alb_dns_name_https = "alb-12345678.ap-southeast-1.elb.amazonaws.com"
# rds_endpoint = "legal-connect-prod.c9akciq32.ap-southeast-1.rds.amazonaws.com:5432"
# rds_database_name = "legalconnect"
# rds_master_username = "legalconnect_admin"
# cloudfront_distribution_domain_name = "d123456abc.cloudfront.net"
# cloudfront_distribution_id = "E123ABC456"
# frontend_bucket_name = "legal-connect-prod-frontend"
```

---

## 🔍 **BƯỚC 8: Verify Deployment**

### 8.1 Check Terraform state

```bash
# List all resources
terraform state list

# Show specific resource
terraform state show aws_lb.main

# Get all outputs
terraform output

# Get specific output
terraform output alb_dns_name
```

### 8.2 Verify AWS resources

```bash
# Check ALB
aws elbv2 describe-load-balancers \
  --region ap-southeast-1 \
  --query 'LoadBalancers[*].{Name:LoadBalancerName,DNS:DNSName}' \
  --output table

# Check ECS cluster
aws ecs describe-clusters \
  --cluster legal-connect-prod \
  --region ap-southeast-1

# Check ECS services
aws ecs describe-services \
  --cluster legal-connect-prod \
  --services legal-connect-backend \
  --region ap-southeast-1

# Check RDS
aws rds describe-db-instances \
  --db-instance-identifier legal-connect-prod \
  --region ap-southeast-1 \
  --query 'DBInstances[0]' \
  --output table

# Check CloudFront
aws cloudfront list-distributions \
  --query 'DistributionList.Items[*].{Id:Id,Domain:DomainName,Status:Status}'
```

### 8.3 Test ALB health

```bash
# Get ALB DNS
ALB_DNS=$(terraform output -raw alb_dns_name)

# Test ALB
curl http://$ALB_DNS

# Test health endpoint (nếu backend có)
curl http://$ALB_DNS/api/health
```

---

## 📝 **BƯỚC 9: Get Important Outputs**

```bash
# Print all outputs
terraform output

# Copy outputs for next steps:

# 1. ALB DNS (cho frontend)
ALB_DNS=$(terraform output -raw alb_dns_name)
echo "ALB DNS: $ALB_DNS"

# 2. RDS endpoint (cho backend config)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
echo "RDS Endpoint: $RDS_ENDPOINT"

# 3. CloudFront domain (để access frontend)
CF_DOMAIN=$(terraform output -raw cloudfront_distribution_domain_name)
echo "CloudFront Domain: $CF_DOMAIN"

# 4. Frontend bucket (để upload files)
FRONTEND_BUCKET=$(terraform output -raw frontend_bucket_name)
echo "Frontend Bucket: $FRONTEND_BUCKET"

# 5. CloudFront distribution ID (để invalidate)
CF_DIST_ID=$(terraform output -raw cloudfront_distribution_id)
echo "CloudFront Distribution ID: $CF_DIST_ID"
```

---

## 🔄 **BƯỚC 10: Update Backend Environment Variables**

Backend container cần biết RDS endpoint:

```bash
# Lấy RDS endpoint
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

# Cập nhật backend/.env hoặc ECS task definition
# SPRING_DATASOURCE_URL=jdbc:postgresql://${RDS_ENDPOINT}/legalconnect

# Hoặc update qua AWS Console:
# 1. ECS → Clusters → legal-connect-prod
# 2. Services → legal-connect-backend
# 3. Update service → Task Definition
# 4. Update environment variables
```

---

## 🌐 **BƯỚC 11: Deploy Frontend**

Sau khi terraform apply xong:

```bash
# 1. Update .env.production
cd frontend

# Create/Update .env.production
ALB_DNS=$(cd ../infrastructure/terraform && terraform output -raw alb_dns_name && cd -)
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=http://$ALB_DNS/api
NEXT_PUBLIC_WS_URL=http://$ALB_DNS/ws
NEXT_PUBLIC_TINYMCE_API_KEY=9yla0xwxxvze4fsl8jgyfa1pwb0qoq18tm8arj8hkyl4y5w4
EOF

# 2. Build frontend
npm install
npm run build

# 3. Upload to S3
FRONTEND_BUCKET=$(cd ../infrastructure/terraform && terraform output -raw frontend_bucket_name && cd -)
aws s3 sync out/ s3://$FRONTEND_BUCKET --delete

# 4. Invalidate CloudFront
CF_DIST_ID=$(cd ../infrastructure/terraform && terraform output -raw cloudfront_distribution_id && cd -)
aws cloudfront create-invalidation \
  --distribution-id $CF_DIST_ID \
  --paths "/*"

# 5. Get CloudFront domain
CF_DOMAIN=$(cd ../infrastructure/terraform && terraform output -raw cloudfront_distribution_domain_name && cd -)
echo "Frontend URL: https://$CF_DOMAIN"
```

---

## 🚀 **COMPLETE SCRIPT - One Command Deploy**

Tạo file `deploy-all.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Complete AWS Deployment Pipeline"
echo "===================================="

# STEP 1: Build Backend
echo ""
echo "1️⃣  Building Backend..."
cd backend
./mvnw clean package -DskipTests
docker build -t legal-connect-backend:latest .
docker tag legal-connect-backend:latest \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest

echo "2️⃣  Pushing to ECR..."
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com
docker push 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest

# STEP 2: Create S3 bucket
echo ""
echo "3️⃣  Creating S3 bucket..."
aws s3api create-bucket \
  --bucket legal-connect-prod-frontend \
  --region ap-southeast-1 \
  --create-bucket-configuration LocationConstraint=ap-southeast-1 || true

# STEP 3: Terraform
echo ""
echo "4️⃣  Running Terraform..."
cd ../infrastructure/terraform
terraform init
terraform plan
terraform apply -auto-approve

# STEP 4: Get outputs
echo ""
echo "5️⃣  Getting AWS outputs..."
ALB_DNS=$(terraform output -raw alb_dns_name)
CF_DOMAIN=$(terraform output -raw cloudfront_distribution_domain_name)
FRONTEND_BUCKET=$(terraform output -raw frontend_bucket_name)
CF_DIST_ID=$(terraform output -raw cloudfront_distribution_id)

# STEP 5: Deploy Frontend
echo ""
echo "6️⃣  Building and deploying frontend..."
cd ../../frontend

cat > .env.production << EOF
NEXT_PUBLIC_API_URL=http://$ALB_DNS/api
NEXT_PUBLIC_WS_URL=http://$ALB_DNS/ws
NEXT_PUBLIC_TINYMCE_API_KEY=9yla0xwxxvze4fsl8jgyfa1pwb0qoq18tm8arj8hkyl4y5w4
EOF

npm install
npm run build
aws s3 sync out/ s3://$FRONTEND_BUCKET --delete

echo ""
echo "7️⃣  Invalidating CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id $CF_DIST_ID \
  --paths "/*"

echo ""
echo "✅ Deployment Complete!"
echo "🌐 Frontend: https://$CF_DOMAIN"
echo "🎯 Backend API: http://$ALB_DNS/api"
```

**Chạy script:**

```bash
chmod +x deploy-all.sh
./deploy-all.sh
```

---

## 📊 **BẢNG TÓRA TẮT**

| Bước | Lệnh                                 | Ghi chú              |
| ---- | ------------------------------------ | -------------------- |
| 1    | `./mvnw clean package`               | Build Maven          |
| 2    | `docker build -t ...`                | Build Docker image   |
| 3    | `docker push ...`                    | Push to ECR          |
| 4    | `aws s3api create-bucket`            | Create S3 bucket     |
| 5    | `terraform init`                     | Initialize Terraform |
| 6    | `terraform plan`                     | Review changes       |
| 7    | `terraform apply`                    | Deploy AWS resources |
| 8    | `terraform output`                   | Get outputs          |
| 9    | `npm run build`                      | Build frontend       |
| 10   | `aws s3 sync`                        | Upload to S3         |
| 11   | `aws cloudfront create-invalidation` | Invalidate cache     |

---

## ✅ **CHECKLIST - Trước khi deploy**

- [ ] AWS CLI configured
- [ ] Docker installed
- [ ] Maven installed
- [ ] terraform.tfvars updated (passwords)
- [ ] Backend JAR file built
- [ ] Docker image built & pushed to ECR
- [ ] S3 bucket created
- [ ] Terraform initialized
- [ ] Terraform plan reviewed
- [ ] Ready for terraform apply

---

## ⚠️ **TROUBLESHOOTING**

### Error: "access denied" when pushing to ECR

```bash
# Re-login to ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com
```

### Error: "terraform not found"

```bash
# Install Terraform
brew install terraform  # macOS
sudo apt-get install terraform  # Linux
```

### Error: "AWS credentials not found"

```bash
# Configure AWS
aws configure
# Enter: Access Key, Secret Key, Region, Format
```

### Error: "Docker image not found"

```bash
# Build image first
cd backend
docker build -t legal-connect-backend:latest .
```

### Error: "Terraform apply timeout"

```bash
# Increase timeout
terraform apply -var="timeout=20m"

# Hoặc check logs
aws ecs describe-task-definition \
  --task-definition legal-connect-backend \
  --region ap-southeast-1
```

Good luck! 🚀
