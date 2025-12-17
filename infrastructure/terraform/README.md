# Legal Connect - Terraform Infrastructure

This directory contains Terraform configurations for deploying the Legal Connect platform on AWS.

## Architecture Overview

The infrastructure includes the following AWS services:

- **VPC**: Virtual Private Cloud with public and private subnets across multiple availability zones
- **ALB**: Application Load Balancer for distributing traffic to backend services
- **ECS Fargate**: Container orchestration for running Spring Boot backend
- **RDS**: Managed database (MySQL/PostgreSQL) for persistent data storage
- **S3**: Object storage for frontend static files, PDFs, avatars, and logs
- **CloudFront**: CDN for frontend distribution
- **CloudWatch**: Monitoring, logging, and alerting
- **IAM**: Identity and access management for secure resource access

## Directory Structure

```
infrastructure/terraform/
├── main.tf                 # Main Terraform configuration
├── variables.tf            # Input variables
├── outputs.tf             # Output values
├── terraform.tfvars.example # Example variables file
└── modules/
    ├── vpc/               # VPC and networking resources
    ├── iam/               # IAM roles and policies
    ├── security-groups/   # Security groups
    ├── alb/               # Application Load Balancer
    ├── ecs/               # ECS Cluster and Services
    ├── rds/               # RDS Database
    ├── s3/                # S3 Buckets
    ├── cloudfront/        # CloudFront Distribution
    └── cloudwatch/        # CloudWatch Logs and Alarms
```

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **Terraform** >= 1.0 installed
3. **AWS CLI** configured with credentials
4. **Docker images** pushed to ECR (Elastic Container Registry)
5. **SSL Certificates** (optional, for HTTPS):
   - Certificate in `ap-southeast-1` for ALB
   - Certificate in `us-east-1` for CloudFront

## Getting Started

### 1. Configure AWS Credentials

```bash
aws configure
```

### 2. Create S3 Backend for State (First Time Setup)

```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://legal-connect-terraform-state --region ap-southeast-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket legal-connect-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name legal-connect-terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-southeast-1
```

### 3. Create ECR Repository and Push Docker Images

```bash
# Create ECR repository
aws ecr create-repository --repository-name legal-connect-backend --region ap-southeast-1

# Get login credentials
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com

# Build and push backend image
cd backend
docker build -t legal-connect-backend .
docker tag legal-connect-backend:latest ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest
docker push ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest
```

### 4. Configure Variables

```bash
# Copy example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
nano terraform.tfvars
```

Required variables to update:

- `aws_region`: AWS region (default: ap-southeast-1)
- `backend_image`: ECR image URI for backend
- `db_username`: Database master username
- `db_password`: Database master password (use strong password)
- `jwt_secret`: JWT secret key for authentication
- `alarm_email`: Email for CloudWatch alarms
- `ssl_certificate_arn`: (Optional) SSL certificate ARN for ALB
- `cloudfront_certificate_arn`: (Optional) SSL certificate ARN for CloudFront

### 5. Initialize Terraform

```bash
cd infrastructure/terraform
terraform init
```

### 6. Plan and Apply

```bash
# Review the execution plan
terraform plan

# Apply the configuration
terraform apply
```

Type `yes` when prompted to create the resources.

## Deployment Process

The deployment will:

1. Create VPC with public and private subnets
2. Set up NAT Gateways for private subnet internet access
3. Create security groups for ALB, ECS, and RDS
4. Deploy Application Load Balancer
5. Launch RDS database instance
6. Create S3 buckets for storage
7. Deploy ECS cluster with Fargate tasks
8. Set up CloudFront distribution
9. Configure CloudWatch logging and alarms

## Post-Deployment

### 1. Upload Frontend to S3

```bash
# Build frontend
cd frontend
npm run build

# Sync to S3
aws s3 sync out/ s3://legal-connect-prod-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### 2. Run Database Migrations

```bash
# Connect to ECS task
aws ecs execute-command \
  --cluster legal-connect-prod-cluster \
  --task TASK_ID \
  --container backend \
  --interactive \
  --command "/bin/bash"

# Inside container, run migrations
./mvnw flyway:migrate
```

### 3. Verify Deployment

- **Backend API**: `http://YOUR_ALB_DNS/api/health`
- **Frontend**: `https://YOUR_CLOUDFRONT_DOMAIN`
- **CloudWatch Dashboard**: AWS Console → CloudWatch → Dashboards

### 4. Configure DNS (Optional)

Point your domain to:

- CloudFront distribution (for frontend)
- ALB DNS name (for API, or use CloudFront path-based routing)

## Environment Management

### Development Environment

```bash
# Use dev workspace
terraform workspace new dev
terraform workspace select dev

# Update environment variable in terraform.tfvars
environment = "dev"

# Deploy
terraform apply
```

### Staging/Production

Follow the same process with different workspaces:

```bash
terraform workspace new staging
terraform workspace new prod
```

## Scaling

### ECS Auto Scaling

Configured to scale based on:

- CPU utilization (70% threshold)
- Memory utilization (80% threshold)
- Min: 2 tasks, Max: 10 tasks

### RDS Scaling

- Enable storage auto-scaling (configured)
- For read replicas: Add manually in AWS Console or extend Terraform config

## Monitoring & Alerts

CloudWatch alarms configured for:

- **ALB**: Unhealthy targets, 5XX errors
- **ECS**: High CPU/Memory utilization
- **RDS**: High CPU, low storage, high connections

Alerts sent to email configured in `alarm_email` variable.

## Cost Optimization

To reduce costs:

1. **Use smaller instance sizes** for dev/staging:

   ```hcl
   db_instance_class = "db.t3.micro"
   backend_cpu = 256
   backend_memory = 512
   ```

2. **Reduce redundancy**:

   ```hcl
   backend_desired_count = 1  # For dev environment
   ```

3. **Enable S3 lifecycle policies** (already configured)

4. **Use Spot instances** for non-critical ECS tasks

## Backup & Disaster Recovery

### RDS Backups

- Automated daily backups (retention: 7 days)
- Manual snapshots: Create via AWS Console

### Infrastructure as Code

- All infrastructure versioned in Git
- State stored in S3 with versioning enabled

### Disaster Recovery Steps

```bash
# Restore from RDS snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier legal-connect-prod-db-restored \
  --db-snapshot-identifier SNAPSHOT_ID

# Redeploy infrastructure
terraform apply
```

## Security Best Practices

1. **Secrets Management**: Store sensitive data in AWS Secrets Manager
2. **Network Isolation**: Database in private subnet only
3. **Encryption**: Enabled for RDS and S3
4. **IAM Roles**: Least privilege access
5. **VPC Flow Logs**: Enabled for network monitoring
6. **Security Groups**: Restrictive ingress rules

## Troubleshooting

### ECS Tasks Not Starting

```bash
# Check ECS service events
aws ecs describe-services \
  --cluster legal-connect-prod-cluster \
  --services legal-connect-prod-backend-service

# View CloudWatch logs
aws logs tail /aws/ecs/legal-connect-prod --follow
```

### Database Connection Issues

```bash
# Verify security group rules
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Test connectivity from ECS task
aws ecs execute-command \
  --cluster legal-connect-prod-cluster \
  --task TASK_ID \
  --container backend \
  --interactive \
  --command "nc -zv RDS_ENDPOINT 3306"
```

### High Costs

```bash
# Analyze costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

## Cleanup

To destroy all resources:

```bash
# Destroy infrastructure
terraform destroy

# Remove S3 buckets (if needed)
aws s3 rb s3://legal-connect-prod-frontend --force
aws s3 rb s3://legal-connect-prod-pdfs --force
aws s3 rb s3://legal-connect-prod-avatars --force
aws s3 rb s3://legal-connect-prod-logs --force
```

⚠️ **Warning**: This will delete all resources including databases and stored data!

## Useful Commands

```bash
# Format Terraform files
terraform fmt -recursive

# Validate configuration
terraform validate

# Show current state
terraform show

# List resources
terraform state list

# Import existing resource
terraform import module.vpc.aws_vpc.main vpc-xxxxx

# Refresh state
terraform refresh

# View outputs
terraform output
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Infrastructure

on:
  push:
    branches: [main]
    paths:
      - "infrastructure/terraform/**"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-southeast-1

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2

      - name: Terraform Init
        run: terraform init
        working-directory: infrastructure/terraform

      - name: Terraform Plan
        run: terraform plan
        working-directory: infrastructure/terraform

      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        run: terraform apply -auto-approve
        working-directory: infrastructure/terraform
```

## Support & Contribution

For issues or questions:

- Create an issue in the repository
- Contact the infrastructure team

## License

[Add your license information here]
