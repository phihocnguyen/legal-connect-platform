# ✅ Kiểm tra terraform.tfvars - Mock Data Check

## 📋 Tóm tắt

File `terraform.tfvars` của bạn **hầu hết là production ready**, nhưng cần kiểm tra lại một số field quan trọng.

---

## 🔍 **Status của từng field:**

### ✅ **READY - Không cần thay đổi:**

```hcl
aws_region  = "ap-southeast-1"          ✅ OK
project_name = "legal-connect"          ✅ OK
environment  = "prod"                   ✅ OK

# VPC Configuration
vpc_cidr                     = "10.0.0.0/16"                    ✅ OK (standard)
availability_zones           = ["ap-southeast-1a", "ap-southeast-1b"]  ✅ OK (Singapore AZs)
public_subnet_cidrs          = ["10.0.1.0/24", "10.0.2.0/24"]   ✅ OK
private_subnet_cidrs_app     = ["10.0.10.0/24", "10.0.11.0/24"] ✅ OK
private_subnet_cidrs_data    = ["10.0.20.0/24", "10.0.21.0/24"] ✅ OK

# RDS Configuration
db_engine            = "postgres"                       ✅ OK
db_engine_version    = "15.5"                          ✅ OK (latest stable)
db_instance_class    = "db.t3.micro"                   ✅ OK (free tier eligible)
db_name              = "legalconnect"                  ✅ OK
db_allocated_storage = 20                             ✅ OK (20 GB for dev/prod)
db_backup_retention  = 7                              ✅ OK (7 days backup)

# ECS Configuration
backend_cpu             = 512   # 0.5 vCPU           ✅ OK
backend_memory          = 1024  # 1 GB RAM           ✅ OK
backend_desired_count   = 2     # High availability  ✅ OK
backend_container_port  = 8080                       ✅ OK

# Logs
log_retention_days = 30                              ✅ OK
```

---

## ⚠️ **CẦN KIỂM TRA - Thay đổi bắt buộc:**

### 1. ❌ `db_password` - Mock Data!

**Hiện tại:**

```hcl
db_password = "AbCdEf123456GhIjKl789012MnOp"  ❌ Mock password
```

**Cần thay đổi:**

```bash
# Tạo password mạnh mẽ
openssl rand -base64 32

# Output: pM7xK9qL2mN5pR8sT3vW1yX4zB6cD9eF+gH0jK2lM4
```

**Cập nhật file:**

```hcl
db_password = "pM7xK9qL2mN5pR8sT3vW1yX4zB6cD9eF+gH0jK2lM4"
```

### 2. ⚠️ `jwt_secret` - Mock Data!

**Hiện tại:**

```hcl
jwt_secret = "Xy1zA2bC3dE4fG5hI6jK7lM8nO9pQ0rS1tU2vW3xY4zA"  ⚠️ Mock secret
```

**Cần thay đổi:**

```bash
# Tạo JWT secret mạnh mẽ (32+ ký tự)
openssl rand -hex 32

# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Cập nhật file:**

```hcl
jwt_secret = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

### 3. ⚠️ `backend_image` - Cần build & push!

**Hiện tại:**

```hcl
backend_image = "703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest"
```

**Tình trạng:**

- ❌ Docker image **chưa được build**
- ❌ Docker image **chưa được push** lên ECR

**Cần làm trước:**

```bash
# 1. Login ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com

# 2. Build backend
cd backend
./mvnw clean package -DskipTests

# 3. Build Docker image
docker build -t legal-connect-backend:latest .

# 4. Tag image
docker tag legal-connect-backend:latest \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest

# 5. Push to ECR
docker push 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest

# 6. Verify push success
aws ecr describe-images \
  --repository-name legal-connect-backend \
  --region ap-southeast-1
```

### 4. ✅ `alarm_email` - OK

```hcl
alarm_email = "ng.phihoc123@gmail.com"  ✅ OK (email của bạn)
```

### 5. ✅ `ssl_certificate_arn` & `cloudfront_certificate_arn` - OK (để trống)

```hcl
ssl_certificate_arn        = ""   ✅ OK (optional)
cloudfront_certificate_arn = ""   ✅ OK (optional)
```

---

## 📋 **CHECKLIST - Trước khi chạy `terraform apply`**

- [ ] **db_password** - Thay thành password mạnh mẽ
- [ ] **jwt_secret** - Thay thành secret mạnh mẽ
- [ ] **backend_image** - Docker image được push lên ECR
- [ ] ECR repository created: `legal-connect-backend`
- [ ] S3 bucket created: `legal-connect-prod-frontend`
- [ ] AWS CLI configured với credentials
- [ ] Terraform initialized: `terraform init`
- [ ] Terraform plan reviewed: `terraform plan`
- [ ] All other fields verified

---

## 🚀 **TÓM TẮT - 3 bước bắt buộc:**

```bash
# BƯỚC 1: Tạo password & secret mạnh mẽ
DB_PASS=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -hex 32)

echo "DB Password: $DB_PASS"
echo "JWT Secret: $JWT_SECRET"

# BƯỚC 2: Update terraform.tfvars
nano infrastructure/terraform/terraform.tfvars
# Thay: db_password, jwt_secret

# BƯỚC 3: Build & Push Docker image (nếu chưa)
cd backend
./mvnw clean package -DskipTests
docker build -t legal-connect-backend:latest .
docker tag legal-connect-backend:latest 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com
docker push 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest

# Xong! Bây giờ ready cho terraform apply
```

---

## 📊 **BẢNG TÓM TẮT**

| Field                        | Giá trị                  | Status       | Action             |
| ---------------------------- | ------------------------ | ------------ | ------------------ |
| `aws_region`                 | `ap-southeast-1`         | ✅ OK        | Không cần          |
| `project_name`               | `legal-connect`          | ✅ OK        | Không cần          |
| `environment`                | `prod`                   | ✅ OK        | Không cần          |
| `db_password`                | `AbCdEf123456...`        | ❌ Mock      | **Thay ngay**      |
| `jwt_secret`                 | `Xy1zA2bC3...`           | ❌ Mock      | **Thay ngay**      |
| `backend_image`              | `703172063283...`        | ⚠️ Cần build | **Push ECR trước** |
| `alarm_email`                | `ng.phihoc123@gmail.com` | ✅ OK        | Không cần          |
| `ssl_certificate_arn`        | `` (empty)               | ✅ OK        | Optional           |
| `cloudfront_certificate_arn` | `` (empty)               | ✅ OK        | Optional           |

---

## ⚡ **QUICK COMMAND - Copy & Paste**

```bash
# 1. Generate passwords
openssl rand -base64 32
openssl rand -hex 32

# 2. Push Docker image
cd backend
./mvnw clean package -DskipTests
docker build -t legal-connect-backend:latest .
docker tag legal-connect-backend:latest 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com
docker push 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest

# 3. Update terraform.tfvars with new passwords

# 4. Ready for terraform apply!
cd ../infrastructure/terraform
terraform init
terraform plan
terraform apply
```

Good luck! 🚀
