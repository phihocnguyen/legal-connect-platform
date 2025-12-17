# 🚀 AWS và Terraform Configuration Guide

## 📋 Tổng quan

Dự án Legal Connect hiện tại đang dùng:

- **Database**: Neon PostgreSQL (serverless PostgreSQL trên cloud)
- **Storage**: Cloudinary (cho images/avatars)
- **Cache**: Redis (local trong Docker)
- **Message Queue**: RabbitMQ (local trong Docker)

Khi deploy lên AWS, chúng ta sẽ:

- **Database**: Chuyển sang AWS RDS PostgreSQL
- **Storage**: Chuyển sang AWS S3 (cho PDFs, avatars, legal docs)
- **Cache**: Có thể dùng AWS ElastiCache Redis (optional)
- **Message Queue**: Có thể dùng AWS SQS/SNS thay RabbitMQ (optional)
- **Backend**: Deploy trên ECS Fargate
- **Frontend**: Deploy trên S3 + CloudFront CDN

---

## 🔑 Bước 1: Tạo AWS Account và Cấu hình AWS CLI

### 1.1. Tạo AWS Account

1. Truy cập https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Điền thông tin và thẻ tín dụng
4. Xác thực tài khoản

### 1.2. Tạo IAM User cho Terraform

**Quan trọng**: Không dùng root account để deploy!

```bash
# Login vào AWS Console
# Vào IAM → Users → Create User

# Tạo user với thông tin:
Username: terraform-admin
Access type: ✓ Programmatic access

# Gắn permissions:
AdministratorAccess (cho development)
# Hoặc custom policy cho production (giới hạn quyền hơn)
```

### 1.3. Cài đặt AWS CLI

```bash
# Ubuntu/Debian
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify
aws --version
```

### 1.4. Configure AWS CLI

```bash
aws configure
```

Nhập các thông tin sau:

```
AWS Access Key ID: AKIAIOSFODNN7EXAMPLE        # Từ IAM user
AWS Secret Access Key: wJalrXUtnFEMI/K7MDENG   # Từ IAM user
Default region name: ap-southeast-1             # Singapore region
Default output format: json
```

**Lưu ý**: Access Key sẽ hiển thị 1 lần duy nhất khi tạo user. Lưu lại an toàn!

---

## 📦 Bước 2: Chuẩn bị Docker Images

### 2.1. Lấy AWS Account ID

```bash
aws sts get-caller-identity --query Account --output text
# Output: 123456789012 (đây là Account ID của bạn)
```

### 2.2. Tạo ECR Repository

```bash
# Tạo repository cho backend
aws ecr create-repository \
  --repository-name legal-connect-backend \
  --region ap-southeast-1

# Output sẽ có URI:
# 123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend
```

### 2.3. Build và Push Docker Image

```bash
# Login vào ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.ap-southeast-1.amazonaws.com

# Build image
cd backend
docker build -t legal-connect-backend:latest .

# Tag image
docker tag legal-connect-backend:latest \
  123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest

# Push image
docker push 123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest
```

---

## 🔧 Bước 3: Cấu hình Terraform Variables

### 3.1. Copy và edit terraform.tfvars

File `terraform.tfvars` đã được tạo với các giá trị mẫu. Bạn cần cập nhật:

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Hoặc dùng editor khác
```

### 3.2. Các biến QUAN TRỌNG cần thay đổi:

#### a) Backend Docker Image

```hcl
backend_image = "123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest"
# Thay 123456789012 bằng AWS Account ID của bạn
```

#### b) Database Credentials

```hcl
db_username = "legalconnect_admin"
db_password = "YourSuperSecurePassword123!@#"
# ⚠️ QUAN TRỌNG: Dùng password mạnh, ít nhất 16 ký tự
```

#### c) JWT Secret

```hcl
jwt_secret = "your-super-secret-jwt-key-with-at-least-32-characters-long"
# ⚠️ QUAN TRỌNG: Thay thế bằng secret ngẫu nhiên
```

#### d) Email cho Alerts

```hcl
alarm_email = "your-email@example.com"
# Email này sẽ nhận CloudWatch alarms
```

#### e) SSL Certificates (Optional, có thể để trống ban đầu)

```hcl
ssl_certificate_arn        = ""  # Để trống nếu chưa có
cloudfront_certificate_arn = ""  # Để trống nếu chưa có
```

### 3.3. Generate Strong Secrets

```bash
# Generate JWT Secret (32 bytes)
openssl rand -base64 32

# Generate Database Password
openssl rand -base64 24
```

---

## 🚀 Bước 4: Deploy Infrastructure

### 4.1. Setup Terraform Backend (Lần đầu tiên)

```bash
cd infrastructure/terraform

# Tạo S3 bucket cho Terraform state
aws s3 mb s3://legal-connect-terraform-state --region ap-southeast-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket legal-connect-terraform-state \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket legal-connect-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Tạo DynamoDB table cho state locking
aws dynamodb create-table \
  --table-name legal-connect-terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-southeast-1
```

### 4.2. Initialize Terraform

```bash
terraform init
```

### 4.3. Validate Configuration

```bash
terraform validate
terraform fmt -recursive
```

### 4.4. Plan Deployment

```bash
terraform plan -out=tfplan

# Review kỹ các resources sẽ được tạo:
# - VPC và networking
# - Security Groups
# - RDS Database
# - ECS Cluster và Services
# - S3 Buckets
# - CloudFront Distribution
# - CloudWatch Logs và Alarms
```

### 4.5. Apply Infrastructure

```bash
terraform apply tfplan

# Quá trình này sẽ mất khoảng 15-20 phút
# Terraform sẽ tạo tất cả resources theo thứ tự phụ thuộc
```

### 4.6. Lấy Outputs

```bash
terraform output

# Outputs quan trọng:
# - alb_dns_name: DNS của ALB (backend API)
# - cloudfront_distribution_domain_name: Domain của frontend
# - rds_endpoint: Database endpoint (dùng để update môi trường)
```

---

## 📝 Bước 5: Cập nhật Application Configuration

### 5.1. Lấy thông tin từ Terraform

```bash
# RDS Endpoint
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
echo "Database: $RDS_ENDPOINT"

# ALB DNS
ALB_DNS=$(terraform output -raw alb_dns_name)
echo "Backend API: http://$ALB_DNS"

# CloudFront Domain
CF_DOMAIN=$(terraform output -raw cloudfront_distribution_domain_name)
echo "Frontend: https://$CF_DOMAIN"

# S3 Buckets
PDFS_BUCKET=$(terraform output -raw pdfs_bucket_name)
AVATARS_BUCKET=$(terraform output -raw avatars_bucket_name)
```

### 5.2. Cập nhật Backend Environment Variables

Terraform đã tự động inject các biến môi trường vào ECS Task Definition:

- `DB_HOST`: RDS endpoint
- `DB_NAME`: Database name
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: JWT secret
- `S3_BUCKET_PDFS`: S3 bucket cho PDFs
- `S3_BUCKET_AVATARS`: S3 bucket cho avatars

**Không cần thay đổi gì trong code!** ECS sẽ tự động inject.

### 5.3. Migrate Database

```bash
# Connect vào ECS task
aws ecs list-tasks \
  --cluster legal-connect-prod-cluster \
  --service-name legal-connect-prod-backend-service

# Execute command trong container
aws ecs execute-command \
  --cluster legal-connect-prod-cluster \
  --task TASK_ARN \
  --container backend \
  --interactive \
  --command "/bin/bash"

# Trong container, chạy migrations (nếu dùng Flyway)
./mvnw flyway:migrate
```

---

## 🌐 Bước 6: Deploy Frontend

### 6.1. Build Frontend

```bash
cd frontend

# Update .env.production
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=http://${ALB_DNS}/api
NEXT_PUBLIC_WS_URL=http://${ALB_DNS}/ws
NEXT_PUBLIC_TINYMCE_API_KEY=9yla0xwxxvze4fsl8jgyfa1pwb0qoq18tm8arj8hkyl4y5w4
EOF

# Build
npm install
npm run build
```

### 6.2. Upload lên S3

```bash
# Get frontend bucket name
FRONTEND_BUCKET=$(terraform output -raw frontend_bucket_name)

# Sync build output to S3
aws s3 sync out/ s3://${FRONTEND_BUCKET} --delete

# Invalidate CloudFront cache
CF_DIST_ID=$(terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation \
  --distribution-id ${CF_DIST_ID} \
  --paths "/*"
```

---

## 🔍 Bước 7: Verify Deployment

### 7.1. Test Backend API

```bash
# Health check
curl http://${ALB_DNS}/actuator/health

# Expected output:
# {"status":"UP"}
```

### 7.2. Test Frontend

```bash
# Open in browser
echo "Frontend: https://${CF_DOMAIN}"
```

### 7.3. Check CloudWatch Logs

```bash
# View ECS logs
aws logs tail /aws/ecs/legal-connect-prod --follow

# Check alarms
aws cloudwatch describe-alarms \
  --alarm-name-prefix legal-connect-prod
```

---

## 💰 Bước 8: Chi phí ước tính (Singapore Region)

### Free Tier (12 tháng đầu):

- RDS db.t3.micro: 750 giờ/tháng
- ECS Fargate: 50GB lưu trữ miễn phí
- S3: 5GB lưu trữ, 20,000 GET requests
- CloudFront: 1TB transfer/tháng
- CloudWatch: 10 custom metrics

### Sau Free Tier (ước tính):

- **RDS db.t3.micro**: ~$25/tháng
- **ECS Fargate (2 tasks x 0.5vCPU, 1GB RAM)**: ~$30/tháng
- **NAT Gateway**: ~$45/tháng (có thể tắt để tiết kiệm)
- **S3**: ~$5/tháng (50GB)
- **CloudFront**: ~$10/tháng (100GB transfer)
- **ALB**: ~$20/tháng
- **CloudWatch**: ~$5/tháng

**Tổng**: ~$140/tháng

### Tối ưu chi phí cho Dev:

```hcl
# Trong terraform.tfvars
environment = "dev"
backend_desired_count = 1  # Chỉ 1 task thay vì 2
db_instance_class = "db.t3.micro"
backend_cpu = 256
backend_memory = 512
```

---

## 🛠️ Bước 9: Quản lý Infrastructure

### Scale ECS Tasks

```bash
# Scale up
aws ecs update-service \
  --cluster legal-connect-prod-cluster \
  --service legal-connect-prod-backend-service \
  --desired-count 4

# Scale down
aws ecs update-service \
  --cluster legal-connect-prod-cluster \
  --service legal-connect-prod-backend-service \
  --desired-count 1
```

### Update Backend Image

```bash
# Build và push image mới
docker build -t legal-connect-backend:v2 .
docker tag legal-connect-backend:v2 \
  123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:v2
docker push 123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:v2

# Update terraform.tfvars
backend_image = "....:v2"

# Apply changes
terraform apply
```

### Destroy Infrastructure

```bash
# ⚠️ CẢNH BÁO: Sẽ xóa TẤT CẢ resources!
terraform destroy

# Nhập "yes" để confirm
```

---

## 🔒 Bước 10: Security Best Practices

### 10.1. Secrets Management

Thay vì hardcode trong terraform.tfvars:

```bash
# Tạo secrets trong AWS Secrets Manager
aws secretsmanager create-secret \
  --name legal-connect/prod/db-password \
  --secret-string "YourSuperSecurePassword"

aws secretsmanager create-secret \
  --name legal-connect/prod/jwt-secret \
  --secret-string "YourJWTSecret"
```

### 10.2. Enable MFA cho AWS Account

```bash
# Vào IAM → Users → Security credentials
# Enable MFA (Virtual MFA device)
# Dùng Google Authenticator hoặc Authy
```

### 10.3. Setup Budget Alerts

```bash
aws budgets create-budget \
  --account-id 123456789012 \
  --budget file://budget.json
```

---

## 📞 Troubleshooting

### Issue 1: ECS Task không start

```bash
# Check service events
aws ecs describe-services \
  --cluster legal-connect-prod-cluster \
  --services legal-connect-prod-backend-service \
  --query 'services[0].events[0:5]'

# Check CloudWatch logs
aws logs tail /aws/ecs/legal-connect-prod --follow
```

### Issue 2: Cannot connect to RDS

```bash
# Check security groups
aws ec2 describe-security-groups \
  --filters "Name=tag:Name,Values=legal-connect-prod-rds-sg"

# Test connectivity from ECS
aws ecs execute-command \
  --cluster legal-connect-prod-cluster \
  --task TASK_ARN \
  --container backend \
  --interactive \
  --command "nc -zv RDS_ENDPOINT 5432"
```

### Issue 3: High costs

```bash
# Analyze costs
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

---

## 📚 Resources

- **AWS Documentation**: https://docs.aws.amazon.com/
- **Terraform AWS Provider**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- **AWS Free Tier**: https://aws.amazon.com/free/
- **AWS Pricing Calculator**: https://calculator.aws/

---

## ✅ Checklist Deploy

- [ ] Tạo AWS Account
- [ ] Configure AWS CLI
- [ ] Build và push Docker image lên ECR
- [ ] Update terraform.tfvars với thông tin thực tế
- [ ] Generate strong secrets
- [ ] Setup Terraform backend (S3 + DynamoDB)
- [ ] Run `terraform init`
- [ ] Run `terraform plan` và review
- [ ] Run `terraform apply`
- [ ] Migrate database
- [ ] Build và deploy frontend
- [ ] Test API endpoint
- [ ] Test frontend
- [ ] Setup CloudWatch alarms email
- [ ] Setup budget alerts
- [ ] Document credentials và endpoints

---

Nếu có vấn đề gì, hãy check CloudWatch Logs và Terraform output!
