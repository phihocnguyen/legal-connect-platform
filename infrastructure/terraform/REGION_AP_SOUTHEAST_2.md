# 🌏 AWS Region Update - ap-southeast-2 (Sydney)

## 📋 Tóm tắt

AWS region của bạn là **ap-southeast-2** (Sydney, Australia)

**Thay đổi cần áp dụng:**

- ✅ `aws_region` = `ap-southeast-2`
- ✅ `availability_zones` = `["ap-southeast-2a", "ap-southeast-2b"]`
- ✅ ECR endpoint = `ap-southeast-2.amazonaws.com`
- ✅ RDS endpoint = `*.ap-southeast-2.rds.amazonaws.com`

---

## ✅ **Cập nhật trong terraform.tfvars**

```hcl
# AWS Configuration
aws_region = "ap-southeast-2"  ✅ Already correct

# VPC Configuration
availability_zones = ["ap-southeast-2a", "ap-southeast-2b"]  ✅ Already correct

# ECS Configuration
backend_image = "703172063283.dkr.ecr.ap-southeast-2.amazonaws.com/legal-connect-backend:latest"  ✅ UPDATED
```

---

## 🐳 **ECR Commands - ap-southeast-2**

```bash
# 1. Create ECR repository
aws ecr create-repository \
  --repository-name legal-connect-backend \
  --region ap-southeast-2

# 2. Login to ECR
aws ecr get-login-password --region ap-southeast-2 | \
  docker login --username AWS --password-stdin \
  703172063283.dkr.ecr.ap-southeast-2.amazonaws.com

# 3. Build Docker image
cd backend
docker build -t legal-connect-backend:latest .

# 4. Tag image
docker tag legal-connect-backend:latest \
  703172063283.dkr.ecr.ap-southeast-2.amazonaws.com/legal-connect-backend:latest

# 5. Push to ECR
docker push 703172063283.dkr.ecr.ap-southeast-2.amazonaws.com/legal-connect-backend:latest

# 6. Verify
aws ecr describe-images \
  --repository-name legal-connect-backend \
  --region ap-southeast-2
```

---

## 🪣 **S3 Bucket Commands - ap-southeast-2**

```bash
# Create bucket
aws s3api create-bucket \
  --bucket legal-connect-prod-frontend \
  --region ap-southeast-2 \
  --create-bucket-configuration LocationConstraint=ap-southeast-2

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
```

---

## 🔧 **AWS CLI Configuration - ap-southeast-2**

```bash
# Configure AWS CLI with correct region
aws configure

# Inputs:
# AWS Access Key ID: AKIA...
# AWS Secret Access Key: ...
# Default region: ap-southeast-2
# Default output format: json

# Verify
aws sts get-caller-identity --region ap-southeast-2
```

---

## 🌍 **Availability Zones - ap-southeast-2**

```
Sydney, Australia has 3 AZs:
- ap-southeast-2a
- ap-southeast-2b
- ap-southeast-2c

Your config uses:
- ap-southeast-2a ✅
- ap-southeast-2b ✅

All good!
```

---

## 📝 **Update Environment Variables**

Frontend `.env.production` (sẽ được cập nhật sau terraform apply):

```bash
# Get ALB DNS from terraform output
ALB_DNS=$(cd infrastructure/terraform && terraform output -raw alb_dns_name && cd -)

# Create .env.production
cat > frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=http://$ALB_DNS/api
NEXT_PUBLIC_WS_URL=http://$ALB_DNS/ws
NEXT_PUBLIC_TINYMCE_API_KEY=9yla0xwxxvze4fsl8jgyfa1pwb0qoq18tm8arj8hkyl4y5w4
EOF
```

---

## 🚀 **Terraform Commands - ap-southeast-2**

```bash
cd infrastructure/terraform

# Initialize
terraform init

# Plan
terraform plan

# Apply
terraform apply -auto-approve

# Get outputs
terraform output

# Specific outputs
terraform output alb_dns_name
terraform output rds_endpoint
terraform output cloudfront_distribution_domain_name
```

---

## 📊 **Bảng Tóm Tắt - ap-southeast-2 vs ap-southeast-1**

| Item                 | ap-southeast-2                                      | ap-southeast-1                                      |
| -------------------- | --------------------------------------------------- | --------------------------------------------------- |
| **Region**           | Sydney, Australia                                   | Singapore                                           |
| **ECR Endpoint**     | `703172063283.dkr.ecr.ap-southeast-2.amazonaws.com` | `703172063283.dkr.ecr.ap-southeast-1.amazonaws.com` |
| **RDS Endpoint**     | `*.ap-southeast-2.rds.amazonaws.com`                | `*.ap-southeast-1.rds.amazonaws.com`                |
| **S3 Bucket Config** | `LocationConstraint=ap-southeast-2`                 | `LocationConstraint=ap-southeast-1`                 |
| **ALB DNS**          | `*.ap-southeast-2.elb.amazonaws.com`                | `*.ap-southeast-1.elb.amazonaws.com`                |
| **CloudFront**       | Global (origin in ap-southeast-2)                   | Global (origin in ap-southeast-1)                   |
| **AZs**              | a, b, c                                             | a, b                                                |

---

## ✅ **Checklist - ap-southeast-2**

- [x] `aws_region` = `ap-southeast-2` (in terraform.tfvars)
- [x] `availability_zones` = `["ap-southeast-2a", "ap-southeast-2b"]`
- [x] ECR endpoint = `ap-southeast-2.amazonaws.com` (in backend_image)
- [ ] AWS CLI configured for `ap-southeast-2`
- [ ] ECR repository created in `ap-southeast-2`
- [ ] S3 bucket created with `LocationConstraint=ap-southeast-2`
- [ ] Docker image pushed to ECR in `ap-southeast-2`
- [ ] `terraform apply` run successfully

---

## 🎯 **Next Steps**

1. ✅ Confirm region is `ap-southeast-2`
2. ✅ Update backend_image in terraform.tfvars (DONE)
3. ⏳ Create ECR repository in ap-southeast-2
4. ⏳ Build & push Docker image to ap-southeast-2 ECR
5. ⏳ Create S3 bucket in ap-southeast-2
6. ⏳ Run `terraform apply`
7. ⏳ Deploy frontend to S3 + CloudFront

Good luck! 🚀
