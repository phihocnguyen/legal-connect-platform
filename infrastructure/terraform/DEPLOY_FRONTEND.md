# 🌐 Deploy Frontend lên CloudFront - Hướng dẫn Chi Tiết

## 📋 Tóm tắt

Frontend sẽ được:

1. Build Next.js thành static files
2. Upload lên **S3 bucket**
3. Serve qua **CloudFront CDN**

**Outputs từ Terraform của bạn:**

- S3 Frontend Bucket: `legal-connect-prod-frontend`
- CloudFront Domain: `d123456abc.cloudfront.net` (ví dụ)
- Distribution ID: `E123ABC456` (dùng để invalidate)

---

## 🏗️ **BƯỚC 1: Build Next.js Frontend**

### 1.1 Cài dependencies

```bash
cd frontend

# Cài npm packages
npm install
```

### 1.2 Create .env.production

Tạo file config cho production:

```bash
# Tạo file
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=http://YOUR_ALB_DNS_HERE/api
NEXT_PUBLIC_WS_URL=http://YOUR_ALB_DNS_HERE/ws
NEXT_PUBLIC_TINYMCE_API_KEY=9yla0xwxxvze4fsl8jgyfa1pwb0qoq18tm8arj8hkyl4y5w4
EOF

# Thay YOUR_ALB_DNS_HERE bằng ALB DNS từ Terraform output
# Ví dụ: alb-12345678.ap-southeast-1.elb.amazonaws.com
```

**Lấy ALB DNS từ Terraform:**

```bash
# Sau khi chạy terraform apply, lấy output
terraform output alb_dns_name

# Output: alb-12345678.ap-southeast-1.elb.amazonaws.com
```

### 1.3 Build Next.js

```bash
# Build production
npm run build

# Output sẽ tạo folder:
# .next/         - Next.js build files
# public/        - Static files
# out/           - (Optional, nếu dùng static export)
```

**Nếu lỗi:**

```bash
# Error: "Node modules not installed"
npm install

# Error: "Build failed"
npm run build -- --debug

# Error: "Memory issue"
NODE_OPTIONS=--max_old_space_size=2048 npm run build
```

---

## 📦 **BƯỚC 2: Prepare Files for S3**

### 2.1 Nếu Next.js build bình thường (.next folder)

```bash
# Next.js tạo .next folder
# Bạn cần export thành static files

# Update next.config.ts (nếu chưa có)
cat >> next.config.ts << EOF
export const output = 'export';
EOF

# Build lại
npm run build

# Folder out/ sẽ được tạo với tất cả static files
```

### 2.2 Nếu build với output='export' (tốt nhất cho S3)

```bash
# next.config.ts đã có output = 'export'
npm run build

# Files sẵn sàng trong out/ folder
ls out/
```

---

## ☁️ **BƯỚC 3: Setup AWS CLI**

### 3.1 Configure AWS credentials (nếu chưa)

```bash
aws configure

# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: ap-southeast-1
# Default output format: json
```

### 3.2 Test AWS connection

```bash
aws sts get-caller-identity

# Output:
# {
#   "UserId": "...",
#   "Account": "703172063283",
#   "Arn": "arn:aws:iam::703172063283:user/..."
# }
```

---

## 📤 **BƯỚC 4: Upload Files lên S3**

### 4.1 Lấy S3 bucket name từ Terraform

```bash
# Get frontend bucket name
FRONTEND_BUCKET=$(terraform output -raw frontend_bucket_name)

echo "Frontend bucket: $FRONTEND_BUCKET"
# Output: legal-connect-prod-frontend
```

### 4.2 Sync files lên S3

```bash
# Sync folder out/ lên S3
# --delete: Xóa files trong S3 không có trong out/
aws s3 sync out/ s3://$FRONTEND_BUCKET --delete

# Hoặc specify bucket directly
aws s3 sync out/ s3://legal-connect-prod-frontend --delete --region ap-southeast-1

# Output:
# upload: out/index.html to s3://legal-connect-prod-frontend/index.html
# upload: out/_next/static/... to s3://legal-connect-prod-frontend/_next/static/...
# ...
```

### 4.3 Set correct MIME types (Important!)

```bash
# HTML files
aws s3 cp s3://$FRONTEND_BUCKET/index.html s3://$FRONTEND_BUCKET/index.html \
  --metadata-directive REPLACE \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"

# Hoặc dùng script:
for file in $(aws s3 ls s3://$FRONTEND_BUCKET --recursive | grep "\.html$" | awk '{print $NF}'); do
  aws s3 cp s3://$FRONTEND_BUCKET/$file s3://$FRONTEND_BUCKET/$file \
    --metadata-directive REPLACE \
    --cache-control "no-cache" \
    --content-type "text/html"
done
```

**Hoặc configure S3 bucket directly:**

```bash
# Tạo bucket policy cho public read (nếu cần)
aws s3api put-bucket-policy --bucket $FRONTEND_BUCKET --policy file://policy.json
```

---

## 🚀 **BƯỚC 5: Invalidate CloudFront Cache**

Sau khi upload, cần invalidate cache để users thấy files mới:

### 5.1 Lấy CloudFront Distribution ID

```bash
# Get distribution ID
CF_DIST_ID=$(terraform output -raw cloudfront_distribution_id)

echo "CloudFront Distribution ID: $CF_DIST_ID"
# Output: E123ABC456
```

### 5.2 Invalidate cache

```bash
# Invalidate tất cả files
aws cloudfront create-invalidation \
  --distribution-id $CF_DIST_ID \
  --paths "/*"

# Output:
# {
#   "Invalidation": {
#     "Id": "I123456789ABC",
#     "CreateTime": "2025-01-17T10:00:00.000Z",
#     "Status": "InProgress"
#   }
# }

# Check status
aws cloudfront get-invalidation \
  --distribution-id $CF_DIST_ID \
  --id I123456789ABC

# Status: InProgress → Completed (sau vài phút)
```

---

## 🌍 **BƯỚC 6: Verify Deployment**

### 6.1 Get CloudFront domain

```bash
# Get CloudFront domain
CF_DOMAIN=$(terraform output -raw cloudfront_distribution_domain_name)

echo "Frontend URL: https://$CF_DOMAIN"
# Output: https://d123456abc.cloudfront.net
```

### 6.2 Test website

```bash
# Test bằng curl
curl https://$CF_DOMAIN

# Hoặc mở browser
echo "https://$CF_DOMAIN"
```

### 6.3 Check S3 bucket

```bash
# List files trong S3
aws s3 ls s3://$FRONTEND_BUCKET --recursive

# Output:
# 2025-01-17 10:00:00          0 .nojekyll
# 2025-01-17 10:00:00       1234 index.html
# 2025-01-17 10:00:00       5678 _next/static/...
```

---

## 🔄 **BƯỚC 7: Update lại Frontend (Lần sau)**

Khi bạn update frontend code:

```bash
# 1. Make changes to frontend code

# 2. Rebuild
npm run build

# 3. Sync lên S3
aws s3 sync out/ s3://legal-connect-prod-frontend --delete

# 4. Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id $CF_DIST_ID \
  --paths "/*"

# Done! Users sẽ thấy version mới sau vài phút
```

---

## 📝 **COMPLETE SCRIPT - One Command Deploy**

Tạo file `deploy-frontend.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying frontend to AWS..."

cd frontend

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Build
echo "🏗️  Building Next.js..."
npm run build

# 3. Get bucket and distribution ID from Terraform
echo "☁️  Getting AWS resources..."
cd ../infrastructure/terraform

FRONTEND_BUCKET=$(terraform output -raw frontend_bucket_name)
CF_DIST_ID=$(terraform output -raw cloudfront_distribution_id)
CF_DOMAIN=$(terraform output -raw cloudfront_distribution_domain_name)

cd ../../frontend

# 4. Sync to S3
echo "⬆️  Uploading to S3..."
aws s3 sync out/ s3://$FRONTEND_BUCKET --delete

# 5. Invalidate CloudFront
echo "🔄 Invalidating CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id $CF_DIST_ID \
  --paths "/*"

echo "✅ Deployment complete!"
echo "🌐 Frontend URL: https://$CF_DOMAIN"
```

**Chạy script:**

```bash
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

---

## 🚀 **QUICK REFERENCE**

```bash
# 1. Build
cd frontend
npm install
npm run build

# 2. Get S3 bucket and CF distribution
cd ../infrastructure/terraform
FRONTEND_BUCKET=$(terraform output -raw frontend_bucket_name)
CF_DIST_ID=$(terraform output -raw cloudfront_distribution_id)
CF_DOMAIN=$(terraform output -raw cloudfront_distribution_domain_name)

# 3. Upload to S3
cd ../../frontend
aws s3 sync out/ s3://$FRONTEND_BUCKET --delete

# 4. Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id $CF_DIST_ID \
  --paths "/*"

# 5. Open in browser
echo "https://$CF_DOMAIN"
```

---

## 💡 **TIPS & TRICKS**

### Optimize build size

```bash
# Analyze bundle size
npm run build -- --analyze

# Optimize next.config.ts
export const compress = true;
export const swcMinify = true;
```

### Cache strategy

```bash
# index.html: No cache (always fetch new)
# _next/static: Long cache (1 year)
# images, CSS, JS: Medium cache (1 month)

# Configure in S3 bucket lifecycle
aws s3api put-bucket-lifecycle-configuration \
  --bucket $FRONTEND_BUCKET \
  --lifecycle-configuration file://lifecycle.json
```

### Preview before deployment

```bash
# Test locally
npm run start

# Test with production build
npm run build
npm run start
```

### Monitor CloudFront

```bash
# Get CloudFront stats
aws cloudfront get-distribution-statistics \
  --distribution-id $CF_DIST_ID

# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=$CF_DIST_ID \
  --start-time 2025-01-17T00:00:00Z \
  --end-time 2025-01-17T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

---

## ⚠️ **TROUBLESHOOTING**

### Problem 1: "Files not showing up on CloudFront"

```bash
# Solution: Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id $CF_DIST_ID \
  --paths "/*"

# Wait 5-10 minutes for invalidation to complete
```

### Problem 2: "API calls failing from frontend"

```bash
# Check API_URL in .env.production
cat .env.production

# Make sure NEXT_PUBLIC_API_URL points to correct ALB
# Should be: http://alb-xxx.ap-southeast-1.elb.amazonaws.com/api
```

### Problem 3: "CORS errors"

```bash
# Backend CORS not configured for CloudFront domain
# Update backend CORS setting:
# APP_CORS_ALLOWED_ORIGINS=https://d123.cloudfront.net,http://localhost:3000

# Redeploy backend:
terraform apply
```

### Problem 4: "Static files return 403 Forbidden"

```bash
# S3 bucket policy not set correctly
# Check bucket policy allows CloudFront OAI access

aws s3api get-bucket-policy --bucket $FRONTEND_BUCKET
```

### Problem 5: "Build takes too long"

```bash
# Add more memory to Node
export NODE_OPTIONS=--max_old_space_size=4096

npm run build
```

---

## 📊 **BẢNG TÓRA TẮT**

| Bước | Lệnh                                                        | Ghi chú             |
| ---- | ----------------------------------------------------------- | ------------------- |
| 1    | `npm install`                                               | Cài dependencies    |
| 2    | `npm run build`                                             | Build Next.js       |
| 3    | `terraform output -raw frontend_bucket_name`                | Lấy bucket name     |
| 4    | `terraform output -raw cloudfront_distribution_id`          | Lấy distribution ID |
| 5    | `aws s3 sync out/ s3://bucket --delete`                     | Upload to S3        |
| 6    | `aws cloudfront create-invalidation`                        | Invalidate cache    |
| 7    | `terraform output -raw cloudfront_distribution_domain_name` | Lấy CF domain       |
| 8    | Open in browser                                             | Verify deployment   |

---

## ✅ **CHECKLIST**

- [ ] Next.js built thành công
- [ ] out/ folder có files
- [ ] AWS CLI configured
- [ ] Terraform outputs có sẵn
- [ ] Files uploaded to S3
- [ ] CloudFront invalidation started
- [ ] Waited for invalidation complete (5-10 min)
- [ ] Website accessible qua CloudFront domain
- [ ] API calls working
- [ ] Static assets loading
- [ ] Responsive design working
- [ ] Performance acceptable

---

## 🎯 **NEXT STEPS**

1. ✅ Deploy backend (Terraform + ECS)
2. ✅ Deploy frontend (S3 + CloudFront)
3. Test end-to-end
4. Setup monitoring
5. Setup CI/CD (optional)
6. Add custom domain (optional)
7. Setup HTTPS (optional)

Good luck! 🚀
