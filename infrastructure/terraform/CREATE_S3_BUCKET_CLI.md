# 🪣 Tạo S3 Bucket cho Frontend - AWS CLI Guide

## 📋 Tóm tắt

Tạo S3 bucket để lưu trữ frontend files (HTML, CSS, JS, images, etc.)

**Bucket Name:** `legal-connect-prod-frontend`
**Region:** `ap-southeast-1` (Singapore)
**Account ID:** `703172063283`

---

## 🚀 **BƯỚC 1: Tạo S3 Bucket**

### Command (Đơn giản)

```bash
# Tạo bucket
aws s3api create-bucket \
  --bucket legal-connect-prod-frontend \
  --region ap-southeast-1 \
  --create-bucket-configuration LocationConstraint=ap-southeast-1

# Output:
# {
#   "Location": "http://legal-connect-prod-frontend.s3.amazonaws.com/"
# }
```

**Giải thích:**

- `--bucket`: Tên bucket (phải unique trên toàn AWS)
- `--region`: Region deploy (ap-southeast-1 = Singapore)
- `--create-bucket-configuration`: Cấu hình vị trí bucket

### Verify bucket được tạo

```bash
# List tất cả buckets
aws s3 ls

# Output:
# 2025-01-17 10:00:00 legal-connect-prod-frontend
```

---

## 🔒 **BƯỚC 2: Enable Versioning (Optional nhưng recommended)**

Cho phép rollback nếu cần:

```bash
aws s3api put-bucket-versioning \
  --bucket legal-connect-prod-frontend \
  --versioning-configuration Status=Enabled

# Verify
aws s3api get-bucket-versioning \
  --bucket legal-connect-prod-frontend

# Output:
# {
#   "Status": "Enabled"
# }
```

---

## 🛡️ **BƯỚC 3: Block Public Access (IMPORTANT!)**

Vì frontend được serve qua CloudFront, không cần public read:

```bash
# Block tất cả public access
aws s3api put-public-access-block \
  --bucket legal-connect-prod-frontend \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Verify
aws s3api get-public-access-block \
  --bucket legal-connect-prod-frontend

# Output:
# {
#   "PublicAccessBlockConfiguration": {
#     "BlockPublicAcls": true,
#     "IgnorePublicAcls": true,
#     "BlockPublicPolicy": true,
#     "RestrictPublicBuckets": true
#   }
# }
```

---

## 📦 **BƯỚC 4: Enable Server-Side Encryption (Optional)**

Bảo mật files (recommended cho production):

```bash
# Enable AES-256 encryption
aws s3api put-bucket-encryption \
  --bucket legal-connect-prod-frontend \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }'

# Verify
aws s3api get-bucket-encryption \
  --bucket legal-connect-prod-frontend

# Output:
# {
#   "ServerSideEncryptionConfiguration": {
#     "Rules": [...]
#   }
# }
```

---

## 🌐 **BƯỚC 5: Enable Website Hosting (IMPORTANT!)**

Để S3 serve static files như website:

```bash
# Enable website hosting
aws s3api put-bucket-website \
  --bucket legal-connect-prod-frontend \
  --website-configuration '{
    "IndexDocument": {
      "Suffix": "index.html"
    },
    "ErrorDocument": {
      "Key": "404.html"
    }
  }'

# Verify
aws s3api get-bucket-website \
  --bucket legal-connect-prod-frontend

# Output:
# {
#   "IndexDocument": {"Suffix": "index.html"},
#   "ErrorDocument": {"Key": "404.html"}
# }
```

---

## 📝 **BƯỚC 6: Configure CORS (Nếu cần)**

Nếu frontend gọi API cross-domain:

```bash
# Set CORS policy
aws s3api put-bucket-cors \
  --bucket legal-connect-prod-frontend \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedOrigins": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedHeaders": ["*"],
        "MaxAgeSeconds": 3000
      }
    ]
  }'

# Verify
aws s3api get-bucket-cors \
  --bucket legal-connect-prod-frontend
```

---

## 📊 **BƯỚC 7: Configure Lifecycle Policy (Optional)**

Tự động xóa old versions sau 30 ngày:

```bash
# Create lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket legal-connect-prod-frontend \
  --lifecycle-configuration '{
    "Rules": [
      {
        "Id": "delete-old-versions",
        "Status": "Enabled",
        "NoncurrentVersionExpirationInDays": 30
      },
      {
        "Id": "delete-incomplete-uploads",
        "Status": "Enabled",
        "AbortIncompleteMultipartUpload": {
          "DaysAfterInitiation": 7
        }
      }
    ]
  }'

# Verify
aws s3api get-bucket-lifecycle-configuration \
  --bucket legal-connect-prod-frontend
```

---

## 📋 **BƯỚC 8: Add Tags (Optional)**

Gắn tags để dễ quản lý:

```bash
aws s3api put-bucket-tagging \
  --bucket legal-connect-prod-frontend \
  --tagging 'TagSet=[
    {Key=Environment,Value=prod},
    {Key=Project,Value=legal-connect},
    {Key=Application,Value=frontend}
  ]'

# Verify
aws s3api get-bucket-tagging \
  --bucket legal-connect-prod-frontend
```

---

## 🚀 **BƯỚC 9: Verify Bucket Configuration**

```bash
# Get bucket details
aws s3api head-bucket --bucket legal-connect-prod-frontend

# Get bucket location
aws s3api get-bucket-location --bucket legal-connect-prod-frontend
# Output:
# {
#   "LocationConstraint": "ap-southeast-1"
# }

# Get bucket ACL
aws s3api get-bucket-acl --bucket legal-connect-prod-frontend

# List bucket contents
aws s3 ls s3://legal-connect-prod-frontend
# Output: (empty vì bucket mới)
```

---

## 📝 **COMPLETE SCRIPT - One Command Setup**

Tạo file `setup-s3-bucket.sh`:

```bash
#!/bin/bash
set -e

BUCKET_NAME="legal-connect-prod-frontend"
REGION="ap-southeast-1"

echo "🪣 Setting up S3 bucket: $BUCKET_NAME"

# 1. Create bucket
echo "1️⃣  Creating bucket..."
aws s3api create-bucket \
  --bucket $BUCKET_NAME \
  --region $REGION \
  --create-bucket-configuration LocationConstraint=$REGION

# 2. Enable versioning
echo "2️⃣  Enabling versioning..."
aws s3api put-bucket-versioning \
  --bucket $BUCKET_NAME \
  --versioning-configuration Status=Enabled

# 3. Block public access
echo "3️⃣  Blocking public access..."
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# 4. Enable encryption
echo "4️⃣  Enabling encryption..."
aws s3api put-bucket-encryption \
  --bucket $BUCKET_NAME \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# 5. Enable website hosting
echo "5️⃣  Enabling website hosting..."
aws s3api put-bucket-website \
  --bucket $BUCKET_NAME \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "404.html"}
  }'

# 6. Set CORS
echo "6️⃣  Setting CORS policy..."
aws s3api put-bucket-cors \
  --bucket $BUCKET_NAME \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }]
  }'

# 7. Set lifecycle policy
echo "7️⃣  Setting lifecycle policy..."
aws s3api put-bucket-lifecycle-configuration \
  --bucket $BUCKET_NAME \
  --lifecycle-configuration '{
    "Rules": [
      {
        "Id": "delete-old-versions",
        "Status": "Enabled",
        "NoncurrentVersionExpirationInDays": 30
      },
      {
        "Id": "delete-incomplete-uploads",
        "Status": "Enabled",
        "AbortIncompleteMultipartUpload": {"DaysAfterInitiation": 7}
      }
    ]
  }'

# 8. Add tags
echo "8️⃣  Adding tags..."
aws s3api put-bucket-tagging \
  --bucket $BUCKET_NAME \
  --tagging 'TagSet=[
    {Key=Environment,Value=prod},
    {Key=Project,Value=legal-connect},
    {Key=Application,Value=frontend}
  ]'

echo "✅ S3 bucket setup complete!"
echo "🪣 Bucket: $BUCKET_NAME"
echo "🌍 Region: $REGION"
```

**Chạy script:**

```bash
chmod +x setup-s3-bucket.sh
./setup-s3-bucket.sh
```

---

## 🚀 **QUICK REFERENCE - Nhanh nhất**

```bash
# Tạo bucket (cơ bản)
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

## 📊 **BẢNG TÓRA TẮT**

| Bước | Lệnh                                 | Ghi chú                |
| ---- | ------------------------------------ | ---------------------- |
| 1    | `aws s3api create-bucket`            | Tạo bucket             |
| 2    | `put-bucket-versioning`              | Enable versioning      |
| 3    | `put-public-access-block`            | Block public access    |
| 4    | `put-bucket-encryption`              | Enable encryption      |
| 5    | `put-bucket-website`                 | Enable website hosting |
| 6    | `put-bucket-cors`                    | Set CORS policy        |
| 7    | `put-bucket-lifecycle-configuration` | Set lifecycle          |
| 8    | `put-bucket-tagging`                 | Add tags               |
| 9    | `s3 ls`                              | Verify bucket          |

---

## ✅ **CHECKLIST**

- [ ] AWS CLI installed và configured
- [ ] Bucket name unique (không trùng toàn AWS)
- [ ] Bucket created successfully
- [ ] Versioning enabled
- [ ] Public access blocked
- [ ] Encryption enabled
- [ ] Website hosting enabled
- [ ] CORS configured
- [ ] Lifecycle policy set
- [ ] Tags added
- [ ] Bucket verified

---

## 🔗 **Tiếp theo**

Sau khi tạo xong bucket:

1. ✅ Tạo S3 bucket (đang làm)
2. ⏳ Chạy `terraform apply` (tạo ALB, ECS, CloudFront, etc.)
3. ⏳ Upload frontend files to S3
4. ⏳ Invalidate CloudFront cache
5. ⏳ Test website

Good luck! 🚀
