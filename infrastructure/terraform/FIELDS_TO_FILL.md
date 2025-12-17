# ✅ Checklist: Các Field CẦN ĐIỀN trong terraform.tfvars

## 🎯 TÓM TẮT NHANH

Bạn cần điền **5 fields BẮT BUỘC** trước khi chạy Terraform:

### ✏️ **1. backend_image** (BẮT BUỘC)

```hcl
backend_image = "YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest"
```

**Cách lấy AWS Account ID:**

```bash
aws sts get-caller-identity --query Account --output text
# Output: 123456789012
```

**Sau đó thay thế:**

```hcl
backend_image = "123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest"
```

---

### ✏️ **2. db_password** (BẮT BUỘC)

```hcl
db_password = "CHANGE_ME_STRONG_PASSWORD_HERE_123456"
```

**Generate password mạnh:**

```bash
openssl rand -base64 24
# Output: AbCdEf123456GhIjKl789012MnOp
```

**Sau đó thay thế:**

```hcl
db_password = "AbCdEf123456GhIjKl789012MnOp"
```

**⚠️ LƯU Ý:**

- Password phải có ít nhất 8 ký tự
- Không chứa ký tự đặc biệt như `@`, `/`, `"`, `'`
- Lưu password này vào nơi an toàn (password manager)

---

### ✏️ **3. jwt_secret** (BẮT BUỘC)

```hcl
jwt_secret = "mySecretKey_CHANGE_THIS_TO_STRONG_SECRET_IN_PRODUCTION"
```

**Generate JWT secret mạnh:**

```bash
openssl rand -base64 32
# Output: Xy1zA2bC3dE4fG5hI6jK7lM8nO9pQ0rS1tU2vW3xY4zA=
```

**Sau đó thay thế:**

```hcl
jwt_secret = "Xy1zA2bC3dE4fG5hI6jK7lM8nO9pQ0rS1tU2vW3xY4zA="
```

---

### ✏️ **4. alarm_email** (BẮT BUỘC)

```hcl
alarm_email = "phihocnguyen@example.com"
```

**Thay bằng email thực của bạn:**

```hcl
alarm_email = "your-real-email@gmail.com"
```

**⚠️ LƯU Ý:**

- Email này sẽ nhận alerts từ CloudWatch
- Bạn cần confirm subscription email sau khi deploy
- AWS sẽ gửi email xác nhận, click link để activate

---

### ✏️ **5. db_username** (TÙY CHỌN - nhưng nên đổi)

```hcl
db_username = "legalconnect_admin"
```

**Có thể giữ nguyên HOẶC đổi thành:**

```hcl
db_username = "admin"
# hoặc
db_username = "legalconnect"
```

---

## 📋 CÁC FIELD KHÔNG CẦN THAY ĐỔI (Mặc định ổn)

### ✅ RDS PostgreSQL Configuration (Đã đúng)

```hcl
db_engine            = "postgres"           # ✅ Đúng, bạn dùng PostgreSQL
db_engine_version    = "15.5"               # ✅ Phiên bản mới nhất stable
db_instance_class    = "db.t3.micro"        # ✅ Free tier eligible
db_name              = "legalconnect"       # ✅ OK
db_allocated_storage = 20                   # ✅ 20GB là đủ để bắt đầu
db_backup_retention  = 7                    # ✅ Backup 7 ngày
```

### ✅ VPC Configuration (Đã tối ưu)

```hcl
vpc_cidr                     = "10.0.0.0/16"
availability_zones           = ["ap-southeast-1a", "ap-southeast-1b"]
public_subnet_cidrs          = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs_app     = ["10.0.10.0/24", "10.0.11.0/24"]
private_subnet_cidrs_data    = ["10.0.20.0/24", "10.0.21.0/24"]
```

### ✅ ECS Configuration (Đã tối ưu)

```hcl
backend_cpu             = 512   # 0.5 vCPU - Đủ cho app nhỏ
backend_memory          = 1024  # 1 GB RAM - Đủ cho Spring Boot
backend_desired_count   = 2     # 2 tasks cho high availability
backend_container_port  = 8080  # Port của Spring Boot
```

### ✅ AWS Region (Đã đúng)

```hcl
aws_region  = "ap-southeast-1"  # Singapore - Gần Việt Nam nhất
```

---

## 🔧 FILE HOÀN CHỈNH MẪU

Sau khi điền, file `terraform.tfvars` của bạn sẽ trông như thế này:

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

# SSL Certificates (Để trống ban đầu, có thể thêm sau)
ssl_certificate_arn        = ""
cloudfront_certificate_arn = ""

# RDS PostgreSQL Configuration
db_engine            = "postgres"
db_engine_version    = "15.5"
db_instance_class    = "db.t3.micro"
db_name              = "legalconnect"
db_username          = "legalconnect_admin"                    # ✏️ Có thể đổi
db_password          = "XyZ123AbC456DeF789GhI012JkL345MnO"    # ✏️ THAY ĐỔI BẮT BUỘC
db_allocated_storage = 20
db_backup_retention  = 7

# ECS Configuration
backend_image           = "123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest"  # ✏️ THAY ĐỔI BẮT BUỘC
backend_cpu             = 512
backend_memory          = 1024
backend_desired_count   = 2
backend_container_port  = 8080

# Application Configuration
jwt_secret = "Xy1zA2bC3dE4fG5hI6jK7lM8nO9pQ0rS1tU2vW3xY4zA="  # ✏️ THAY ĐỔI BẮT BUỘC

# CloudWatch Configuration
log_retention_days = 30
alarm_email        = "your-email@gmail.com"  # ✏️ THAY ĐỔI BẮT BUỘC
```

---

## 🚀 CÁC BƯỚC THỰC HIỆN

### Bước 1: Lấy AWS Account ID

```bash
aws sts get-caller-identity --query Account --output text
```

Lưu lại số này (ví dụ: `123456789012`)

### Bước 2: Generate Secrets

```bash
# Database password
openssl rand -base64 24

# JWT secret
openssl rand -base64 32
```

Lưu lại 2 chuỗi này

### Bước 3: Edit terraform.tfvars

```bash
cd infrastructure/terraform
nano terraform.tfvars
# hoặc
code terraform.tfvars
```

Thay đổi 5 fields:

1. ✏️ `backend_image`: Thay `YOUR_ACCOUNT_ID` → AWS Account ID
2. ✏️ `db_password`: Thay bằng password vừa generate
3. ✏️ `jwt_secret`: Thay bằng secret vừa generate
4. ✏️ `alarm_email`: Thay bằng email thật của bạn
5. ✏️ `db_username`: (Tùy chọn) Có thể giữ nguyên hoặc đổi

### Bước 4: Lưu file và Verify

```bash
# Validate syntax
terraform validate

# Preview changes
terraform plan
```

---

## ❓ FAQ - Câu hỏi thường gặp

### Q1: Tôi có thể dùng password yếu cho test không?

**A:** KHÔNG nên! Ngay cả khi test, hãy dùng password mạnh. RDS sẽ exposed trên internet (trong private subnet nhưng vẫn có risk).

### Q2: Tôi quên password RDS thì sao?

**A:** Không thể recover. Phải tạo lại RDS instance mới hoặc restore từ snapshot.

### Q3: Email alarm có bắt buộc không?

**A:** Có, vì nếu có vấn đề (CPU cao, database lỗi), bạn cần được thông báo ngay.

### Q4: Tôi chưa có Docker image thì sao?

**A:** Phải build và push image lên ECR trước. Xem hướng dẫn trong `AWS_SETUP_GUIDE.md` section "Bước 2".

### Q5: SSL certificate có bắt buộc không?

**A:** KHÔNG. Có thể để trống ban đầu. Website sẽ dùng HTTP. Sau này có thể thêm HTTPS.

### Q6: Chi phí sẽ là bao nhiêu?

**A:**

- **Free Tier (12 tháng đầu)**: ~$0-10/tháng (chủ yếu NAT Gateway)
- **Sau Free Tier**: ~$140/tháng
- **Dev mode** (1 task, smaller instances): ~$50-60/tháng

### Q7: Làm sao để giảm chi phí?

**A:** Đổi `environment = "dev"` và giảm resources:

```hcl
environment = "dev"
backend_desired_count = 1
db_instance_class = "db.t3.micro"
backend_cpu = 256
backend_memory = 512
```

---

## 🔒 BẢO MẬT

### ⚠️ QUAN TRỌNG:

1. **KHÔNG** commit file `terraform.tfvars` lên Git

   ```bash
   # File này đã được ignore trong .gitignore
   git status  # Không thấy terraform.tfvars là đúng
   ```

2. **LƯU** password và secrets vào password manager

   - 1Password
   - LastPass
   - Bitwarden
   - Keepass

3. **ROTATE** secrets định kỳ (6 tháng/lần)

4. **ENABLE** MFA cho AWS account

---

## ✅ CHECKLIST TRƯỚC KHI DEPLOY

- [ ] Đã cài AWS CLI và configure
- [ ] Đã có AWS Account ID
- [ ] Đã generate db_password (mạnh)
- [ ] Đã generate jwt_secret (mạnh)
- [ ] Đã thay email thật
- [ ] Đã build và push Docker image lên ECR
- [ ] Đã update backend_image với Account ID đúng
- [ ] Đã verify terraform.tfvars không có lỗi syntax
- [ ] Đã setup Terraform backend (S3 + DynamoDB)
- [ ] Đã chạy `terraform validate`
- [ ] Đã chạy `terraform plan` và review kỹ

---

## 📞 HỖ TRỢ

Nếu gặp lỗi:

1. Check lại 5 fields bắt buộc
2. Verify AWS credentials: `aws sts get-caller-identity`
3. Check Terraform syntax: `terraform validate`
4. Xem logs: `terraform plan` để thấy lỗi chi tiết

Good luck! 🚀
