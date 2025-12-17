# 🔧 Terraform Backend S3 Configuration - ap-southeast-2

## ❌ Error: Region Mismatch

**Lỗi:**

```
Error: Failed to get existing workspaces: Unable to list objects in S3 bucket
"legal-connect-terraform-state" with prefix "env:/": operation error S3: ListObjectsV2,
requested bucket from "ap-southeast-1", actual location "ap-southeast-2"
```

**Nguyên nhân:** S3 bucket được tạo ở `ap-southeast-2` nhưng Terraform config trỏ đến `ap-southeast-1`

---

## ✅ Solution - Update main.tf

### Đã cập nhật trong main.tf:

```hcl
terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "legal-connect-terraform-state"
    key            = "terraform.tfstate"
    region         = "ap-southeast-2"  # ✅ UPDATED from ap-southeast-1
    encrypt        = true
    use_lockfile   = true
  }
}

provider "aws" {
  region = var.aws_region  # From terraform.tfvars = ap-southeast-2

  default_tags {
    tags = {
      Project     = "legal-connect"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
```

---

## 🪣 Create S3 Bucket for Terraform State

Bạn cần tạo S3 bucket để lưu Terraform state:

```bash
# 1. Create bucket
aws s3api create-bucket \
  --bucket legal-connect-terraform-state \
  --region ap-southeast-2 \
  --create-bucket-configuration LocationConstraint=ap-southeast-2

# 2. Enable versioning (recommended)
aws s3api put-bucket-versioning \
  --bucket legal-connect-terraform-state \
  --versioning-configuration Status=Enabled

# 3. Enable encryption
aws s3api put-bucket-encryption \
  --bucket legal-connect-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# 4. Block public access
aws s3api put-public-access-block \
  --bucket legal-connect-terraform-state \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# 5. Verify
aws s3 ls s3://legal-connect-terraform-state
```

---

## 🔑 Configure AWS Credentials

Terraform cần AWS credentials để access S3:

```bash
# Option 1: AWS CLI config (Recommended)
aws configure

# Inputs:
# AWS Access Key ID: AKIA...
# AWS Secret Access Key: ...
# Default region: ap-southeast-2
# Default output format: json

# Option 2: Environment variables
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_DEFAULT_REGION="ap-southeast-2"

# Verify
aws sts get-caller-identity --region ap-southeast-2
```

---

## ⚠️ Deprecated Parameter

**Warning:**

```
Warning: Deprecated Parameter

on main.tf line 16, in terraform:
  16:     dynamodb_table = "legal-connect-terraform-lock"

The parameter "dynamodb_table" is deprecated. Use parameter "use_lockfile" instead.
```

**Solution:** Đã cập nhật trong main.tf - thay `dynamodb_table` bằng `use_lockfile = true`

---

## 🚀 Next Steps

Sau khi cập nhật:

```bash
# 1. Reinitialize Terraform
cd infrastructure/terraform
terraform init

# Output sẽ tương tự:
# Initializing the backend...
# Successfully configured the backend "s3"!
# Terraform has been successfully configured!

# 2. Check state
terraform state list

# 3. Create plan
terraform plan

# 4. Apply
terraform apply -auto-approve
```

---

## 📊 Checklist

- [x] `main.tf` updated: region `ap-southeast-1` → `ap-southeast-2`
- [ ] S3 bucket `legal-connect-terraform-state` created
- [ ] AWS credentials configured
- [ ] `terraform init` run successfully
- [ ] `terraform plan` run successfully
- [ ] `terraform apply` ready to go

---

## ❌ Common Issues

### Error: "Access Denied" to S3

```bash
# Check AWS credentials
aws sts get-caller-identity

# Or re-configure
aws configure
```

### Error: "Bucket does not exist"

```bash
# Create bucket first
aws s3api create-bucket \
  --bucket legal-connect-terraform-state \
  --region ap-southeast-2 \
  --create-bucket-configuration LocationConstraint=ap-southeast-2
```

### Error: "Bucket in wrong region"

```bash
# Delete and recreate in correct region
aws s3 rb s3://legal-connect-terraform-state
aws s3api create-bucket \
  --bucket legal-connect-terraform-state \
  --region ap-southeast-2 \
  --create-bucket-configuration LocationConstraint=ap-southeast-2
```

Good luck! 🚀
