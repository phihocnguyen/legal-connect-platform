# Terraform Troubleshooting Guide

## Các lỗi thường gặp và cách khắc phục

### 1. Lỗi PostgreSQL Version không hợp lệ

**Lỗi:**

```
Cannot find version 15.5 for postgres
```

**Nguyên nhân:** AWS RDS không hỗ trợ version PostgreSQL 15.5

**Giải pháp:** ✅ ĐÃ FIX - Đổi sang version `15.7` trong `terraform.tfvars`

**Kiểm tra các version PostgreSQL hỗ trợ:**

```bash
aws rds describe-db-engine-versions \
  --engine postgres \
  --engine-version 15 \
  --query "DBEngineVersions[].EngineVersion" \
  --region ap-southeast-2
```

### 2. Lỗi S3 Bucket đã tồn tại

**Lỗi:**

```
BucketAlreadyOwnedByYou: Your previous request to create the named bucket succeeded and you already own it.
```

**Nguyên nhân:** Bucket đã được tạo từ lần chạy terraform trước

**Giải pháp:** Import bucket vào Terraform state

```bash
# Di chuyển vào thư mục terraform
cd infrastructure/terraform

# Import các bucket đã tồn tại
terraform import module.s3.aws_s3_bucket.frontend legal-connect-prod-frontend
terraform import module.s3.aws_s3_bucket.pdfs legal-connect-prod-pdfs
terraform import module.s3.aws_s3_bucket.avatars legal-connect-prod-avatars
terraform import module.s3.aws_s3_bucket.logs legal-connect-prod-logs

# Sau đó chạy lại terraform apply
terraform apply
```

**Hoặc xóa bucket và tạo lại (CẢNH BÁO: Mất dữ liệu!):**

```bash
# Xóa bucket (chỉ làm nếu chắc chắn không có dữ liệu quan trọng)
aws s3 rb s3://legal-connect-prod-frontend --force --region ap-southeast-2
aws s3 rb s3://legal-connect-prod-pdfs --force --region ap-southeast-2
aws s3 rb s3://legal-connect-prod-avatars --force --region ap-southeast-2
aws s3 rb s3://legal-connect-prod-logs --force --region ap-southeast-2
```

### 3. Lỗi S3 Lifecycle Configuration Timeout

**Lỗi:**

```
While waiting: timeout while waiting for state to become 'true'
```

**Nguyên nhân:** S3 service có thể bị chậm hoặc bucket đang được xử lý

**Giải pháp:**

1. **Chờ và thử lại:**

```bash
# Đợi 5-10 phút rồi chạy lại
terraform apply
```

2. **Import resource nếu đã tạo thành công:**

```bash
terraform import module.s3.aws_s3_bucket_lifecycle_configuration.pdfs legal-connect-prod-pdfs
terraform import module.s3.aws_s3_bucket_lifecycle_configuration.logs legal-connect-prod-logs
```

3. **Kiểm tra trạng thái bucket:**

```bash
aws s3api head-bucket --bucket legal-connect-prod-pdfs --region ap-southeast-2
aws s3api get-bucket-versioning --bucket legal-connect-prod-pdfs --region ap-southeast-2
```

### 4. Lỗi NAT Gateway Timeout

**Lỗi:**

```
waiting for EC2 NAT Gateway create: operation error EC2: DescribeNatGateways, UnknownError
```

**Nguyên nhân:**

- Network issue khi tạo NAT Gateway
- Quota limit đã đạt
- EIP không khả dụng

**Giải pháp:**

1. **Kiểm tra NAT Gateway đã tạo chưa:**

```bash
aws ec2 describe-nat-gateways \
  --filter "Name=tag:Name,Values=legal-connect-prod-nat-*" \
  --region ap-southeast-2
```

2. **Import NAT Gateway nếu đã tạo:**

```bash
# Lấy NAT Gateway ID từ lệnh trên
terraform import module.vpc.aws_nat_gateway.main[0] nat-xxxxxxxxxx
terraform import module.vpc.aws_nat_gateway.main[1] nat-yyyyyyyyyy
```

3. **Kiểm tra quota NAT Gateway:**

```bash
aws service-quotas get-service-quota \
  --service-code vpc \
  --quota-code L-FE5A380F \
  --region ap-southeast-2
```

4. **Nếu cần, xóa và tạo lại:**

```bash
# Lấy NAT Gateway IDs
aws ec2 describe-nat-gateways --region ap-southeast-2 \
  --query 'NatGateways[?State==`failed`].NatGatewayId' --output text

# Xóa NAT Gateway bị lỗi
aws ec2 delete-nat-gateway --nat-gateway-id nat-xxxxxxxxxx --region ap-southeast-2

# Chạy lại terraform
terraform apply
```

### 5. Lỗi S3 Bucket Versioning Timeout

**Lỗi:**

```
reading S3 Bucket Versioning: timeout while waiting for state to become 'Enabled, Suspended, Disabled'
```

**Giải pháp:**

1. **Kiểm tra versioning status:**

```bash
aws s3api get-bucket-versioning \
  --bucket legal-connect-prod-avatars \
  --region ap-southeast-2
```

2. **Import resource:**

```bash
terraform import module.s3.aws_s3_bucket_versioning.avatars legal-connect-prod-avatars
```

## Workflow khuyến nghị khi gặp lỗi

### Bước 1: Clean up state nếu cần

```bash
cd infrastructure/terraform

# Xem state hiện tại
terraform state list

# Xóa resource bị lỗi khỏi state (nếu cần)
terraform state rm module.s3.aws_s3_bucket_lifecycle_configuration.pdfs
terraform state rm module.vpc.aws_nat_gateway.main[1]
```

### Bước 2: Import resources đã tạo

```bash
# Import theo hướng dẫn ở trên cho từng resource
```

### Bước 3: Chạy lại terraform

```bash
# Plan để xem những gì sẽ thay đổi
terraform plan

# Apply nếu mọi thứ OK
terraform apply
```

### Bước 4: Nếu vẫn lỗi, tạo targeted apply

```bash
# Apply từng module một
terraform apply -target=module.vpc
terraform apply -target=module.s3
terraform apply -target=module.rds
terraform apply -target=module.ecs
```

## Kiểm tra OAuth2 Configuration

Sau khi deploy thành công, bạn cần cập nhật OAuth2 redirect URIs trong Google Cloud Console:

### 1. Lấy Backend URL

```bash
# Lấy ALB DNS
terraform output alb_dns_name
```

### 2. Cập nhật Google OAuth2 Settings

Vào [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

**Authorized JavaScript origins:**

- `http://localhost:3000` (dev)
- `https://YOUR_FRONTEND_DOMAIN`

**Authorized redirect URIs:**

- `http://localhost:8080/login/oauth2/code/google` (dev)
- `https://YOUR_BACKEND_URL/login/oauth2/code/google` (prod)

### 3. Cập nhật terraform.tfvars với URLs thật

```hcl
backend_url  = "https://YOUR_ALB_DNS"  # hoặc custom domain
frontend_url = "https://YOUR_CLOUDFRONT_URL"  # hoặc custom domain
```

Sau đó chạy lại:

```bash
terraform apply
```

## Useful Commands

```bash
# Xem outputs
terraform output

# Xem state
terraform state list

# Refresh state
terraform refresh

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive

# Show planned changes
terraform plan

# Destroy everything (CAREFUL!)
terraform destroy
```

## Liên hệ

Nếu gặp vấn đề không giải quyết được, tạo issue trong repository hoặc liên hệ team.
