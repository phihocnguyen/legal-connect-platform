# 🏗️ Legal Connect - Terraform Architecture Presentation

## 📋 Mục Lục

1. [Giới Thiệu Tổng Quan](#giới-thiệu-tổng-quan)
2. [Các Module Terraform](#các-module-terraform)
3. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
4. [Hướng Dẫn Deploy Từng Bước](#hướng-dẫn-deploy-từng-bước)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Giới Thiệu Tổng Quan

### Mục Đích Infrastructure

**Legal Connect Platform** là ứng dụng quản lý pháp lý cho phép:

- Tìm kiếm và quản lý các vấn đề pháp lý
- Tương tác với các luật sư
- Lưu trữ và quản lý tài liệu PDF
- Chat theo thời gian thực
- Bảng điều khiển quản trị

### Kiến Trúc Triển Khai

```
┌─────────────────────────────────────────────────────────┐
│                    Internet Users                        │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼──────────┐          ┌──────────▼──────────┐
│   CloudFront     │          │   Application Load   │
│   (Static Files) │          │   Balancer (ALB)     │
└────────┬─────────┘          └──────────┬──────────┘
         │                               │
         │              ┌────────────────┴────────────┐
         │              │                             │
         │    ┌─────────▼──────────┐    ┌───────────▼─────────┐
         │    │  ECS Fargate       │    │  ECS Fargate        │
         │    │  Frontend Service  │    │  Backend Service    │
         │    │  (Next.js)         │    │  (Spring Boot)      │
         │    └────────────────────┘    └─────────┬───────────┘
         │                                        │
         │              ┌─────────────────────────┼─────────┐
         │              │                         │         │
    ┌────▼──────┐   ┌───▼────────┐        ┌──────▼────┐ ┌──▼───────┐
    │    S3     │   │    RDS     │        │  Redis    │ │  CloudWatch
    │ (Buckets) │   │  (MySQL)   │        │  (Cache)  │ │  (Logs)
    └───────────┘   └────────────┘        └───────────┘ └──────────┘
```

---

## 📦 Các Module Terraform

### 1. **VPC Module** - Mạng Ảo

**Vị trí**: `modules/vpc/`

#### Tác Dụng:

- Tạo Virtual Private Cloud (VPC) - mạng riêng tư trên AWS
- Chia mạng thành các subnets (mạng con) để tách biệt tài nguyên
- Cấu hình routing và gateway

#### Chi Tiết Cấu Trúc Mạng:

```
VPC (CIDR: 10.0.0.0/16)
│
├─ Public Subnets (Có truy cập Internet)
│  ├─ 10.0.1.0/24 (AZ: ap-southeast-1a)
│  └─ 10.0.2.0/24 (AZ: ap-southeast-1b)
│  └─> Dùng cho: ALB (Load Balancer)
│
├─ Private App Subnets (Không truy cập trực tiếp Internet)
│  ├─ 10.0.10.0/24 (AZ: ap-southeast-1a)
│  └─ 10.0.11.0/24 (AZ: ap-southeast-1b)
│  └─> Dùng cho: ECS Fargate (Backend, Frontend)
│
└─ Private Data Subnets (Bảo vệ cơ sở dữ liệu)
   ├─ 10.0.20.0/24 (AZ: ap-southeast-1a)
   └─ 10.0.21.0/24 (AZ: ap-southeast-1b)
   └─> Dùng cho: RDS (Database), Redis (Cache)
```

#### Tài Nguyên Tạo:

- 1 VPC
- 2 Public Subnets
- 2 Private App Subnets
- 2 Private Data Subnets
- Internet Gateway (cho public subnets)
- NAT Gateway (cho private subnets truy cập internet)
- Route Tables

---

### 2. **Security Groups Module** - Tường Lửa

**Vị trí**: `modules/security-groups/`

#### Tác Dụng:

- Định nghĩa các quy tắc mở/đóng cổng cho từng thành phần
- Kiểm soát truy cập giữa các tài nguyên
- Bảo vệ ứng dụng khỏi truy cập không được phép

#### Các Security Groups:

| Security Group | Mục Đích           | Cổng Mở                         |
| -------------- | ------------------ | ------------------------------- |
| **ALB SG**     | Load Balancer      | 80 (HTTP), 443 (HTTPS)          |
| **ECS SG**     | Backend & Frontend | 3000 (Frontend), 8080 (Backend) |
| **RDS SG**     | Database           | 3306 (MySQL) - Chỉ từ ECS       |
| **Redis SG**   | Cache Server       | 6379 (Redis) - Chỉ từ ECS & EC2 |

#### Luồng Truy Cập:

```
Người dùng Internet
    ↓ (HTTP/HTTPS - cổng 80/443)
ALB Security Group ✓
    ↓ (Nội bộ - cổng 3000/8080)
ECS Security Group ✓
    ↓ (Nội bộ - cổng 3306)
RDS Security Group ✓
```

---

### 3. **IAM Module** - Quản Lý Quyền

**Vị trí**: `modules/iam/`

#### Tác Dụng:

- Tạo IAM Roles & Policies cho các dịch vụ
- Cấp quyền tối thiểu cần thiết (Least Privilege)
- Kiểm soát quyền truy cập S3, CloudWatch, ECR

#### Các Roles Tạo:

| Role                        | Sử Dụng Cho              | Quyền Cấp                   |
| --------------------------- | ------------------------ | --------------------------- |
| **ECS Task Execution Role** | ECS nhận task            | Kéo image từ ECR, Ghi logs  |
| **ECS Task Role**           | Ứng dụng trong container | Đọc/ghi S3, CloudWatch logs |
| **EC2 Redis Role**          | Redis instance           | Không cần đặc biệt          |

#### Quyền Chi Tiết:

```
ECS Task Role
├─ S3 Access
│  ├─ frontend-bucket: GetObject, PutObject
│  ├─ pdfs-bucket: GetObject, PutObject
│  └─ avatars-bucket: GetObject, PutObject
├─ CloudWatch Logs
│  └─ CreateLogGroup, CreateLogStream, PutLogEvents
└─ Secrets Manager (nếu có)
   └─ GetSecretValue
```

---

### 4. **ALB Module** - Load Balancer

**Vị trí**: `modules/alb/`

#### Tác Dụng:

- Phân phối traffic từ internet đến các dịch vụ ECS
- Cân bằng tải giữa các task container
- SSL/TLS termination (mã hóa HTTPS)
- Định tuyến theo path hoặc hostname

#### Cấu Trúc ALB:

```
Internet (cổng 80/443)
    ↓
ALB (Application Load Balancer)
    ├─ /api/* → Backend Target Group (Fargate)
    ├─ /       → Frontend Target Group (Fargate)
    └─ Health Checks (mỗi 30s)
```

#### Tính Năng:

- SSL Certificate (HTTPS)
- Path-based routing (`/api` → Backend, `/` → Frontend)
- Target Groups với Health Checks
- Auto Scaling trigger

---

### 5. **RDS Module** - Cơ Sở Dữ Liệu

**Vị trị**: `modules/rds/`

#### Tác Dụng:

- Tạo MySQL Database được quản lý bởi AWS
- Cập nhật, sao lưu, khôi phục tự động
- Multi-AZ deployment cho high availability
- Mã hóa dữ liệu

#### Cấu Hình RDS:

```
RDS MySQL Instance
├─ Engine: MySQL 8.0
├─ Instance Class: db.t3.micro (phát triển) / db.t3.small (production)
├─ Storage: 20-100GB (tùy loại môi trường)
├─ Backup Retention: 7-30 ngày
├─ Multi-AZ: Yes (tự động failover)
├─ Encryption: Yes (KMS)
└─ Location: Private Data Subnets (không truy cập công khai)
```

#### Database Endpoint:

```
Format: <instance-id>.<random>.<region>.rds.amazonaws.com:3306
VD: legal-connect-db-prod.c9akciq32.ap-southeast-1.rds.amazonaws.com:3306
```

#### Thông Tin Kết Nối:

- **Host**: RDS Endpoint
- **Port**: 3306
- **Username**: Được set trong variables
- **Password**: Được set trong variables (Sensitive)
- **Database**: `legalconnect`

---

### 6. **ECS Module** - Container Orchestration

**Vị trí**: `modules/ecs/`

#### Tác Dụng:

- Chạy ứng dụng Docker trên AWS Fargate (serverless)
- Quản lý Backend & Frontend services
- Auto Scaling dựa trên CPU/Memory
- Logging tự động đến CloudWatch

#### Cấu Trúc ECS:

```
ECS Cluster: legal-connect-cluster
│
├─ Backend Service (Spring Boot)
│  ├─ Image: <AWS_ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/legal-connect-backend:<TAG>
│  ├─ Task Definition: legal-connect-backend
│  ├─ Desired Count: 2
│  ├─ CPU: 256 (tùy cấu hình)
│  ├─ Memory: 512 MB
│  ├─ Container Port: 8080
│  ├─ Environment Variables:
│  │  ├─ DB_HOST: <RDS-Endpoint>
│  │  ├─ DB_NAME: legalconnect
│  │  ├─ DB_USER: admin
│  │  ├─ REDIS_HOST: <Redis-IP>
│  │  └─ JWT_SECRET: <secret>
│  └─ Logs: CloudWatch (/ecs/legal-connect-backend)
│
└─ Frontend Service (Next.js)
   ├─ Image: <AWS_ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/legal-connect-frontend:<TAG>
   ├─ Task Definition: legal-connect-frontend
   ├─ Desired Count: 2
   ├─ CPU: 256
   ├─ Memory: 512 MB
   ├─ Container Port: 3000
   └─ Logs: CloudWatch (/ecs/legal-connect-frontend)
```

#### ECS Task Lifecycle:

```
1. AWS kéo image từ ECR
2. Khởi chạy container
3. Container chạy ứng dụng
4. ALB health check container
5. Nếu fail → tạo container mới
6. Khi scale → tạo thêm/bớt container
```

---

### 7. **EC2-Redis Module** - Cache Server

**Vị trí**: `modules/ec2-redis/`

#### Tác Dụng:

- Chạy Redis server trên EC2 instance
- Cache cho session, query results
- Hỗ trợ WebSocket connections
- In-memory data store tăng tốc độ

#### Redis Configuration:

```
EC2 Instance (Redis)
├─ Instance Type: t3.micro (phát triển) / t3.small (production)
├─ AMI: Ubuntu 22.04 LTS
├─ Redis Port: 6379
├─ Password: Được set trong variables
├─ Location: Private Data Subnet
├─ Elastic IP: Yes (không thay đổi)
└─ Security Group: Chỉ từ ECS & ALB
```

#### Sử Dụng:

- **Session Store**: Lưu session người dùng đã login
- **Message Queue**: Hỗ trợ chat real-time
- **Cache**: Lưu kết quả query thường xuyên
- **Rate Limiting**: Giới hạn API requests

---

### 8. **S3 Module** - Object Storage

**Vị trị**: `modules/s3/`

#### Tác Dụng:

- Lưu trữ static files
- Lưu PDFs đã upload
- Lưu avatars người dùng
- Tích hợp CloudFront CDN

#### Các S3 Buckets:

| Bucket                        | Mục Đích          | Công Khai            | Versioning |
| ----------------------------- | ----------------- | -------------------- | ---------- |
| `legal-connect-frontend-prod` | HTML, CSS, JS     | Yes (qua CloudFront) | No         |
| `legal-connect-pdfs-prod`     | PDFs người dùng   | No (qua Signed URLs) | Yes        |
| `legal-connect-avatars-prod`  | Avatar người dùng | Yes (qua CloudFront) | No         |

#### Cấu Hình Bảo Mật:

```
S3 Buckets
├─ Block Public Access: Có
├─ Encryption: AES-256 (SSE-S3)
├─ Versioning: Bật cho PDFs
├─ Lifecycle Policies: Xóa cũ
└─ Access: Chỉ qua Signed URLs / CloudFront
```

---

### 9. **CloudFront Module** - CDN

**Vị trí**: `modules/cloudfront/`

#### Tác Dụng:

- Phân phối nội dung từ edge locations gần người dùng
- Tăng tốc độ tải trang
- Cache static files
- Bảo vệ DDoS

#### CloudFront Configuration:

```
CloudFront Distribution
├─ Origins:
│  ├─ S3 (Frontend static files)
│  └─ ALB (Dynamic content)
├─ Behaviors:
│  ├─ /api/* → ALB (No cache)
│  ├─ /static/* → S3 (Cache 1 năm)
│  └─ /* → S3 (Cache 1 ngày)
├─ SSL: AWS Certificate Manager
├─ HTTP Version: HTTP/2 and HTTP/3
└─ Min TTL: 0, Default: 86400, Max: 31536000
```

---

### 10. **CloudWatch Module** - Monitoring

**Vị trị**: `modules/cloudwatch/`

#### Tác Dụng:

- Thu thập logs từ ECS
- Monitor CPU, Memory, Network
- Cảnh báo khi có vấn đề
- Lưu trữ logs lâu dài

#### Cảnh Báo (Alarms):

```
CloudWatch Alarms
├─ High CPU Usage (> 80%)
├─ High Memory (> 85%)
├─ ECS Task Stopped
├─ RDS CPU High (> 80%)
├─ Database Connection Pool Full
└─ ALB Unhealthy Targets
```

---

## 🏗️ Kiến Trúc Hệ Thống

### Mô Tả Toàn Bộ Luồng:

```
1. NGƯỜI DÙNG
   ↓ (HTTP/HTTPS requests)

2. CLOUDFRONT (CDN)
   ├─ Static files từ S3 (cache)
   └─ Dynamic requests → ALB

3. APPLICATION LOAD BALANCER
   ├─ Path: /api/* → Backend (8080)
   ├─ Path: /* → Frontend (3000)
   └─ Health Checks

4. ECS FARGATE CONTAINERS
   ├─ Backend (Spring Boot) - 2 tasks
   │  ├─ REST APIs
   │  ├─ Database queries (RDS)
   │  ├─ Session management (Redis)
   │  ├─ File uploads (S3)
   │  └─ WebSocket connections (Redis)
   │
   └─ Frontend (Next.js) - 2 tasks
      ├─ Server-side rendering
      ├─ API calls đến Backend
      └─ Session cookies

5. DATA LAYER
   ├─ RDS MySQL (Primary Database)
   │  ├─ User data
   │  ├─ Cases, posts
   │  ├─ Messages
   │  └─ Analytics
   │
   ├─ Redis (Cache & Session)
   │  ├─ Active sessions
   │  ├─ Chat messages
   │  └─ Frequently accessed data
   │
   └─ S3 (File Storage)
      ├─ PDFs
      ├─ Avatars
      └─ Static assets

6. MONITORING
   └─ CloudWatch Logs & Metrics
```

### High Availability & Disaster Recovery:

```
✓ Multi-AZ Deployment:
  - Mỗi service chạy trên 2 AZ khác nhau
  - Nếu 1 AZ down → vẫn có 1 AZ còn lại

✓ Auto Scaling:
  - ECS scales horizontally (thêm/bớt tasks)
  - RDS Multi-AZ (automatic failover)

✓ Backups:
  - RDS: Automated backups 7-30 ngày
  - S3: Versioning & lifecycle policies
  - Redis: Không persistent (session data không quan trọng)

✓ Load Balancing:
  - ALB phân phối traffic
  - Health checks mỗi 30 giây
```

---

## 🚀 Hướng Dẫn Deploy Từng Bước

### PHASE 1: Chuẩn Bị Môi Trường

#### Bước 1.1: Cài Đặt Công Cụ

```bash
# Cài Terraform
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform

# Cài AWS CLI
sudo apt-get install awscli

# Cài Docker (nếu chưa có)
sudo apt-get install docker.io

# Verify
terraform --version
aws --version
```

#### Bước 1.2: Cấu Hình AWS Credentials

```bash
# Có 2 cách:
# Cách 1: Sử dụng AWS CLI
aws configure
# Nhập: AWS Access Key ID
#       AWS Secret Access Key
#       Default region: ap-southeast-1
#       Default output: json

# Cách 2: Set Environment Variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=ap-southeast-1
```

#### Bước 1.3: Tạo S3 Bucket cho Terraform State

```bash
# Tạo bucket để lưu terraform state
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
```

#### Bước 1.4: Chuẩn Bị SSL Certificate

```bash
# Có 2 cách:
# Cách 1: Sử dụng AWS Certificate Manager (khuyến khích)
# - Vào AWS Console → ACM → Request Certificate
# - Domain: yourdomain.com, *.yourdomain.com
# - Validation: DNS / Email
# - Sau khi approved, copy ARN

# Cách 2: Import Certificate bên ngoài
aws acm import-certificate \
  --certificate fileb://path/to/certificate.pem \
  --certificate-chain fileb://path/to/chain.pem \
  --private-key fileb://path/to/private-key.pem \
  --region ap-southeast-1
```

#### Bước 1.5: Chuẩn Bị ECR (Elastic Container Registry)

```bash
# Tạo ECR repositories
aws ecr create-repository \
  --repository-name legal-connect-backend \
  --region ap-southeast-1

aws ecr create-repository \
  --repository-name legal-connect-frontend \
  --region ap-southeast-1

# Get login token và login
aws ecr get-login-password --region ap-southeast-1 | docker login \
  --username AWS \
  --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com
```

---

### PHASE 2: Chuẩn Bị Terraform Variables

#### Bước 2.1: Tạo terraform.tfvars

```bash
# Copy từ example
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars
cat > terraform.tfvars << 'EOF'
# AWS
aws_region = "ap-southeast-1"

# Project
project_name = "legal-connect"
environment  = "prod"  # dev, staging, prod

# VPC
vpc_cidr                 = "10.0.0.0/16"
availability_zones       = ["ap-southeast-1a", "ap-southeast-1b"]
public_subnet_cidrs      = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs_app = ["10.0.10.0/24", "10.0.11.0/24"]
private_subnet_cidrs_data = ["10.0.20.0/24", "10.0.21.0/24"]

# SSL Certificates
ssl_certificate_arn          = "arn:aws:acm:ap-southeast-1:ACCOUNT_ID:certificate/CERT_ID"
cloudfront_certificate_arn   = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"

# RDS Database
db_engine          = "mysql"
db_engine_version  = "8.0"
db_instance_class  = "db.t3.micro"  # t3.micro (free), t3.small (production)
db_name            = "legalconnect"
db_username        = "admin"
db_password        = "YourSecurePassword123!" # ⚠️ Thay đổi!
db_allocated_storage = 20  # GB
db_backup_retention = 7    # days

# Redis
redis_instance_type = "t3.micro"
redis_password      = "RedisPassword123!" # ⚠️ Thay đổi!
redis_key_name      = "legal-connect-key" # EC2 Key Pair

# ECS - Backend
backend_image          = "<ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest"
backend_cpu            = 256    # 256, 512
backend_memory         = 512    # 512, 1024, 2048
backend_desired_count  = 2      # số task
backend_container_port = 8080

# ECS - Frontend
frontend_image          = "<ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-frontend:latest"
frontend_cpu            = 256
frontend_memory         = 512
frontend_desired_count  = 2
frontend_container_port = 3000

# Application
jwt_secret = "YourJWTSecretKey123!" # ⚠️ Thay đổi!
EOF

echo "✓ Tệp terraform.tfvars đã được tạo"
```

#### Bước 2.2: Xác Minh Variables

```bash
# Kiểm tra các required variables
grep "sensitive   = true" variables.tf
# Đảm bảo các sensitive variables đã được set

# Kiểm tra ECR image URIs
echo "Backend Image: <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest"
echo "Frontend Image: <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-frontend:latest"
```

---

### PHASE 3: Build & Push Docker Images

#### Bước 3.1: Build Backend Image

```bash
cd /home/hocnp/Desktop/legal-connect/backend

# Build image
docker build -t legal-connect-backend:latest .

# Tag cho ECR
docker tag legal-connect-backend:latest \
  <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest

# Push đến ECR
docker push <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest

echo "✓ Backend image đã được push"
```

#### Bước 3.2: Build Frontend Image

```bash
cd /home/hocnp/Desktop/legal-connect/frontend

# Build image
docker build -t legal-connect-frontend:latest .

# Tag cho ECR
docker tag legal-connect-frontend:latest \
  <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-frontend:latest

# Push đến ECR
docker push <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-frontend:latest

echo "✓ Frontend image đã được push"
```

---

### PHASE 4: Terraform Initialization

#### Bước 4.1: Init Terraform

```bash
cd /home/hocnp/Desktop/legal-connect/infrastructure/terraform

# Initialize Terraform
terraform init

# Output mong đợi:
# Initializing the backend...
# Successfully configured the backend "s3"!
# Initializing modules...
# Terraform has been successfully initialized!
```

#### Bước 4.2: Validate Configuration

```bash
# Kiểm tra syntax
terraform validate

# Output mong đợi:
# Success! The configuration is valid.
```

#### Bước 4.3: Format Configuration

```bash
# Định dạng tệp Terraform
terraform fmt -recursive

echo "✓ Terraform files đã được format"
```

---

### PHASE 5: Plan & Review

#### Bước 5.1: Tạo Terraform Plan

```bash
# Tạo plan chi tiết
terraform plan -out=tfplan

# Sẽ hiển thị:
# - Các tài nguyên sẽ được tạo
# - Các tài nguyên sẽ bị xóa (thường là 0)
# - Các tài nguyên sẽ bị thay đổi

# Lưu output cho review
terraform plan -out=tfplan -json > tfplan.json
```

#### Bước 5.2: Review Plan

```bash
# Xem plan dễ đọc hơn
terraform show tfplan | head -100

# Kiểm tra các tài nguyên chính:
# ✓ 1 VPC
# ✓ 6 Subnets (2 public + 2 app + 2 data)
# ✓ 4 Security Groups
# ✓ 1 RDS MySQL Instance
# ✓ 1 EC2 Redis Instance
# ✓ 1 ECS Cluster
# ✓ 2 ECS Services (backend, frontend)
# ✓ 1 ALB + Target Groups
# ✓ CloudFront Distribution
# ✓ S3 Buckets
```

---

### PHASE 6: Apply Infrastructure

#### Bước 6.1: Apply Terraform

```bash
# CẢNH BÁO: Bước này sẽ tạo tài nguyên AWS và có thể tính phí!
# Đảm bảo bạn đã review plan ở bước 5

terraform apply tfplan

# Sẽ mất khoảng 15-30 phút

# Theo dõi quá trình:
watch -n 5 "terraform show | grep -E 'state|aws_'"
```

#### Bước 6.2: Xác Minh Deployment

```bash
# Sau khi apply thành công:

# Lấy outputs
terraform output

# Xem các URL quan trọng
ALB_DNS=$(terraform output -raw alb_dns_name)
FRONTEND_URL=$(terraform output -raw frontend_url)
BACKEND_URL=$(terraform output -raw backend_url)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

echo "ALB DNS: $ALB_DNS"
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL"
echo "RDS Endpoint: $RDS_ENDPOINT"
```

---

### PHASE 7: Post-Deployment Configuration

#### Bước 7.1: Kiểm Tra RDS

```bash
# Connect đến RDS để verify
mysql -h <RDS-ENDPOINT> -u admin -p -D legalconnect

# Commands:
SHOW DATABASES;
SHOW TABLES;
# Nếu tables chưa có, cần chạy migrations
exit;
```

#### Bước 7.2: Kiểm Tra ECS

```bash
# Xem ECS services
aws ecs describe-services \
  --cluster legal-connect-prod \
  --services \
    legal-connect-backend-service \
    legal-connect-frontend-service \
  --region ap-southeast-1

# Kiểm tra tasks
aws ecs list-tasks \
  --cluster legal-connect-prod \
  --region ap-southeast-1

# Xem logs
aws logs tail /ecs/legal-connect-backend --follow
aws logs tail /ecs/legal-connect-frontend --follow
```

#### Bước 7.3: Kiểm Tra ALB Health

```bash
# Xem target groups health
aws elbv2 describe-target-health \
  --target-group-arn <TARGET-GROUP-ARN> \
  --region ap-southeast-1

# Output mong đợi:
# "HealthCheckState": "healthy"
# "State": "InService"
```

#### Bước 7.4: Test Endpoints

```bash
# Test Frontend
curl -I http://$ALB_DNS
# Expected: 200 OK

# Test Backend Health
curl -I http://$ALB_DNS/api/health
# Expected: 200 OK

# Test API
curl http://$ALB_DNS/api/cases
# Expected: JSON response (hoặc 401 nếu cần auth)
```

#### Bước 7.5: Chạy Database Migrations

```bash
# Tùy vào ứng dụng của bạn

# Nếu Spring Boot:
# - Flyway/Liquibase sẽ chạy tự động khi startup
# - Kiểm tra logs: aws logs tail /ecs/legal-connect-backend

# Nếu cần chạy thủ công:
mysql -h <RDS-ENDPOINT> -u admin -p < /path/to/migrations.sql

# Seed dữ liệu (nếu cần)
# Xem file ANALYTICS_DATA_SEEDER.md
```

---

### PHASE 8: Domain & DNS

#### Bước 8.1: Point Domain đến ALB

```bash
# Cách 1: Sử dụng Route53 (AWS DNS)
# - Tạo hosted zone cho domain của bạn
# - Tạo A record pointing đến ALB DNS

aws route53 create-resource-record-sets \
  --hosted-zone-id <ZONE_ID> \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "yourdomain.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "<ALB_ZONE_ID>",
          "DNSName": "'$ALB_DNS'",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'

# Cách 2: Sử dụng DNS provider bên ngoài
# - CNAME: yourdomain.com → $ALB_DNS
# - A record: yourdomain.com → ALB IP (nếu cần)
```

#### Bước 8.2: Cấu Hình CloudFront

```bash
# ALB sẽ tự động có SSL certificate từ variables
# CloudFront sẽ cache static files từ S3
# Domain: yourdomain.com
```

---

## 🔍 Troubleshooting

### Vấn Đề: ECS Tasks không khởi chạy

**Triệu chứng**: Tasks stuck in PROVISIONING hoặc PENDING

**Nguyên Nhân Thường Gặp**:

1. Insufficient capacity in AZ
2. Container image không tồn tại trong ECR
3. Security group rules không đúng
4. IAM role không có quyền

**Giải Pháp**:

```bash
# 1. Kiểm tra task definition
aws ecs describe-task-definition \
  --task-definition legal-connect-backend \
  --region ap-southeast-1

# 2. Kiểm tra container image
aws ecr describe-images \
  --repository-name legal-connect-backend \
  --region ap-southeast-1

# 3. Kiểm tra logs
aws logs tail /ecs/legal-connect-backend --follow --since 10m

# 4. Xem chi tiết task
aws ecs describe-tasks \
  --cluster legal-connect-prod \
  --tasks <TASK_ID> \
  --region ap-southeast-1
```

---

### Vấn Đề: Database connection timeout

**Triệu Chứng**: Connection refused hoặc timeout

**Nguyên Nhân**:

1. RDS endpoint không đúng
2. Credentials sai
3. Security group không cho phép ECS → RDS
4. RDS chưa sẵn sàng

**Giải Pháp**:

```bash
# 1. Kiểm tra RDS status
aws rds describe-db-instances \
  --db-instance-identifier legal-connect-db-prod \
  --region ap-southeast-1
# Status phải là: available

# 2. Kiểm tra security group
aws ec2 describe-security-groups \
  --filters Name=group-name,Values=legal-connect-rds-sg \
  --region ap-southeast-1

# 3. Test connection từ bastion host
mysql -h <RDS-ENDPOINT> -u admin -p -D legalconnect

# 4. Kiểm tra RDS logs
aws rds describe-db-log-files \
  --db-instance-identifier legal-connect-db-prod \
  --region ap-southeast-1
```

---

### Vấn Đề: ALB Health Checks Failing

**Triệu Chứng**: Targets marked as unhealthy

**Nguyên Nhân**:

1. Container app không listening trên đúng port
2. Health check endpoint không tồn tại
3. App startup quá lâu (timeout)

**Giải Pháp**:

```bash
# 1. Kiểm tra health check config
aws elbv2 describe-target-groups \
  --names legal-connect-backend-tg \
  --region ap-southeast-1

# 2. Kiểm tra app logs
aws logs tail /ecs/legal-connect-backend --follow

# 3. Tăng health check timeout
terraform apply \
  -var="health_check_timeout=30" \
  -var="health_check_healthy_threshold=2"

# 4. Test health endpoint trực tiếp
curl -I http://localhost:8080/health
```

---

### Vấn Đề: S3/CloudFront Issues

**Triệu Chứng**: Static files không load

**Nguyên Nhân**:

1. S3 bucket policy sai
2. CloudFront origin access identity không được cấp quyền

**Giải Pháp**:

```bash
# 1. Kiểm tra S3 bucket policy
aws s3api get-bucket-policy \
  --bucket legal-connect-frontend-prod

# 2. Kiểm tra CloudFront distribution
aws cloudfront get-distribution \
  --id <DISTRIBUTION_ID>

# 3. Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"

# 4. Test S3 directly
aws s3 ls legal-connect-frontend-prod/
```

---

### Vấn Đề: Out of Memory

**Triệu Chứng**: Containers bị kill hoặc slow

**Nguyên Nhân**:

1. Memory allocation không đủ
2. Memory leak trong app
3. Quá nhiều connections

**Giải Pháp**:

```bash
# 1. Kiểm tra CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ServiceName,Value=legal-connect-backend \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum

# 2. Tăng memory allocation
terraform apply \
  -var="backend_memory=1024"

# 3. Kiểm tra app logs
aws logs tail /ecs/legal-connect-backend --follow
```

---

## 📊 Monitoring & Maintenance

### CloudWatch Dashboards

```bash
# Tạo custom dashboard
aws cloudwatch put-dashboard \
  --dashboard-name legal-connect-dashboard \
  --dashboard-body file://dashboard.json
```

### Auto Scaling Policies

```bash
# Backend auto scaling
# - Scale up: Khi CPU > 70% lâu hơn 5 phút
# - Scale down: Khi CPU < 30% lâu hơn 10 phút
# - Max tasks: 10, Min tasks: 2
```

### Backup & Restore

#### RDS Backup

```bash
# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier legal-connect-db-prod \
  --db-snapshot-identifier legal-connect-backup-$(date +%s) \
  --region ap-southeast-1

# List snapshots
aws rds describe-db-snapshots \
  --region ap-southeast-1
```

#### S3 Backup

```bash
# Enable versioning (already done)
# Enable lifecycle policies để xóa old versions
# Setup cross-region replication

aws s3api put-bucket-lifecycle-configuration \
  --bucket legal-connect-pdfs-prod \
  --lifecycle-configuration file://lifecycle.json
```

---

## ✅ Checklist Deploy

- [ ] AWS credentials configured
- [ ] S3 bucket created for terraform state
- [ ] SSL certificate ready (ALB + CloudFront)
- [ ] ECR repositories created
- [ ] Docker images built and pushed
- [ ] terraform.tfvars filled with correct values
- [ ] terraform init successful
- [ ] terraform validate passed
- [ ] terraform plan reviewed
- [ ] terraform apply completed
- [ ] RDS available and accessible
- [ ] ECS tasks running healthy
- [ ] ALB targets healthy
- [ ] Frontend accessible via ALB DNS
- [ ] Backend API responding
- [ ] Database migrations completed
- [ ] CloudFront distribution active
- [ ] Domain DNS configured
- [ ] SSL certificate working (HTTPS)
- [ ] Monitoring setup complete

---

## 🎓 Tài Liệu Tham Khảo

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [RDS MySQL Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_MySQL.html)
- [Redis on EC2](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.html)

---

**Tác Giả**: AI Assistant  
**Ngày Cập Nhật**: 2024-12-17  
**Phiên Bản**: 1.0
