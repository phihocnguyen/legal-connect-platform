# 🔐 SSL CERTIFICATES - Hướng dẫn Điền Chi Tiết

## 📌 Tóm tắt nhanh

Phần SSL Certificates trong `terraform.tfvars` là **TÙY CHỌN**:

```hcl
# SSL Certificates (Optional - để trống nếu chưa có)
# Lưu ý: CloudFront certificate phải ở region us-east-1
ssl_certificate_arn        = ""  # Để trống hoặc thêm ARN certificate
cloudfront_certificate_arn = ""  # Để trống hoặc thêm ARN certificate
```

---

## ✅ **PHƯƠNG ÁN 1: BỎ QUA (Khuyến khích ban đầu)**

Nếu bạn **chưa có domain riêng**, hãy **để trống cả 2 field**:

```hcl
ssl_certificate_arn        = ""
cloudfront_certificate_arn = ""
```

**Khi đó:**

- ✅ Website sẽ chạy trên HTTP (không HTTPS)
- ✅ CloudFront sẽ có domain: `d123456xyz.cloudfront.net` (AWS domain)
- ✅ Backend sẽ có domain: `alb-12345678.ap-southeast-1.elb.amazonaws.com`
- ✅ Giúp bạn deploy nhanh để test
- ✅ Sau này có thể thêm HTTPS mà không cần redeploy

---

## 🔧 **PHƯƠNG ÁN 2: THÊM SSL CERTIFICATE (Nếu bạn có domain)**

### Bước 1: Tạo Certificate trong ACM (AWS Certificate Manager)

#### **Tạo Certificate cho ALB (Backend API) - Region ap-southeast-1:**

```bash
# Lưu ý: Chạy lệnh này ở region ap-southeast-1
aws acm request-certificate \
  --domain-name api.yourdomain.com \
  --validation-method DNS \
  --region ap-southeast-1

# Output sẽ có:
# {
#   "CertificateArn": "arn:aws:acm:ap-southeast-1:703172063283:certificate/abc123def456..."
# }
```

**Hoặc dùng AWS Console:**

1. Truy cập: https://ap-southeast-1.console.aws.amazon.com/acm/home
2. Click "Request certificate"
3. Điền domain: `api.yourdomain.com`
4. Chọn "DNS validation"
5. Click "Request"
6. Validate domain (thêm CNAME record vào DNS)

#### **Tạo Certificate cho CloudFront (Frontend) - PHẢI ở Region us-east-1:**

```bash
# ⚠️ QUAN TRỌNG: PHẢI chạy ở region us-east-1
aws acm request-certificate \
  --domain-name yourdomain.com \
  --validation-method DNS \
  --region us-east-1

# Output:
# {
#   "CertificateArn": "arn:aws:acm:us-east-1:703172063283:certificate/xyz789abc123..."
# }
```

**Hoặc dùng AWS Console:**

1. Truy cập: https://us-east-1.console.aws.amazon.com/acm/home
2. Click "Request certificate"
3. Điền domain(s):
   - `yourdomain.com`
   - `*.yourdomain.com` (tùy chọn, cho subdomains)
4. Chọn "DNS validation"
5. Click "Request"
6. Validate domains (thêm CNAME records vào DNS)

### Bước 2: Validate Certificates

Sau khi request, AWS sẽ gửi email yêu cầu validate. Có 2 cách:

#### **Cách 1: Email Validation (Dễ)**

- Nhấp vào link trong email
- Xác nhận domain

#### **Cách 2: DNS Validation (Tốt hơn)**

1. Vào Certificate details
2. Copy CNAME record
3. Thêm vào DNS provider (GoDaddy, Namecheap, v.v.)
4. Chờ AWS verify (vài phút tới vài giờ)

### Bước 3: Copy ARN

Sau khi certificate được issued (status: "Issued"):

```bash
# Lấy ARN cho ALB (ap-southeast-1)
aws acm list-certificates --region ap-southeast-1

# Tìm certificate của api.yourdomain.com
# Lấy CertificateArn, ví dụ:
# arn:aws:acm:ap-southeast-1:703172063283:certificate/abc123def456...

# Lấy ARN cho CloudFront (us-east-1)
aws acm list-certificates --region us-east-1

# Tìm certificate của yourdomain.com
# Lấy CertificateArn, ví dụ:
# arn:aws:acm:us-east-1:703172063283:certificate/xyz789abc123...
```

### Bước 4: Điền vào terraform.tfvars

```hcl
# ALB Certificate (ap-southeast-1)
ssl_certificate_arn = "arn:aws:acm:ap-southeast-1:703172063283:certificate/abc123def456..."

# CloudFront Certificate (us-east-1)
cloudfront_certificate_arn = "arn:aws:acm:us-east-1:703172063283:certificate/xyz789abc123..."
```

### Bước 5: Update terraform.tfvars và deploy

```bash
# Validate
terraform validate

# Plan
terraform plan

# Apply
terraform apply
```

---

## 📋 **BẢNG SO SÁNH**

| Tình huống                | ssl_certificate_arn           | cloudfront_certificate_arn    | Cách làm                          |
| ------------------------- | ----------------------------- | ----------------------------- | --------------------------------- |
| **Chưa có domain**        | `""`                          | `""`                          | Để trống, dùng AWS domains        |
| **Có domain, thêm HTTPS** | Copy ARN từ ap-southeast-1    | Copy ARN từ us-east-1         | Request certificates rồi copy ARN |
| **Muốn HTTPS sau**        | Để trống lúc deploy, thêm sau | Để trống lúc deploy, thêm sau | Deploy lại với ARN mới            |

---

## 🚀 **RECOMMENDED: Phương ÁN TỐT NHẤT**

### **Bước 1 (Ngay bây giờ):** Deploy mà để trống certificates

```hcl
ssl_certificate_arn        = ""
cloudfront_certificate_arn = ""
```

**Lợi ích:**

- ✅ Deploy nhanh, test tính năng
- ✅ Không cần domain ngay
- ✅ Không block deployment

### **Bước 2 (Sau đó):** Khi có domain, thêm HTTPS

1. Request certificates trong ACM
2. Validate domains
3. Update terraform.tfvars với ARN
4. Chạy `terraform apply` lại
5. Update DNS point tới CloudFront domain

---

## ❓ FAQ - Câu hỏi thường gặp

### Q1: Tôi có domain nhưng không có certificate, làm sao?

**A:** Request certificate miễn phí trong ACM (AWS Certificate Manager). Xem hướng dẫn Bước 1 phía trên.

### Q2: CloudFront certificate phải ở us-east-1, why?

**A:** Đó là yêu cầu của AWS. CloudFront không hỗ trợ regional certificates (chỉ support global certificates ở us-east-1).

### Q3: Tôi có certificate từ Let's Encrypt thì sao?

**A:** Có thể import vào ACM:

```bash
aws acm import-certificate \
  --certificate fileb://Certificate.pem \
  --certificate-chain fileb://CertificateChain.pem \
  --private-key fileb://PrivateKey.pem \
  --region ap-southeast-1
```

### Q4: Certificate hết hạn thì sao?

**A:** Nếu dùng ACM (AWS Certificate Manager), AWS tự động renew miễn phí trước khi hết hạn.

### Q5: Tôi có 2 domains (yourdomain.com và api.yourdomain.com) thì sao?

**A:** Dùng 1 certificate với wildcard:

```bash
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names "*.yourdomain.com" \
  --validation-method DNS \
  --region ap-southeast-1
```

### Q6: Chi phí certificate bao nhiêu?

**A:** **MIỄN PHÍ!** AWS Certificate Manager cấp miễn phí cho các certificate được dùng trong AWS services (ALB, CloudFront, v.v.).

---

## 🔒 BẢNG AN TOÀN

| Tình huống              | HTTP             | HTTPS      |
| ----------------------- | ---------------- | ---------- |
| **Để trống (hiện tại)** | ✅               | ❌         |
| **Có certificate**      | ❌ (Redirect)    | ✅         |
| **Công khai**           | ⚠️ Không an toàn | ✅ An toàn |
| **Nên dùng**            | Development only | Production |

---

## 📝 **CURRENT STATUS CỦA BẠN**

**Hiện tại:**

- ✅ AWS Account ID: `703172063283`
- ✅ backend_image: `703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest`
- ✅ Database: PostgreSQL 15.5
- ✅ JWT Secret: Đã set
- ✅ Email: `ng.phihoc123@gmail.com`
- ⏳ SSL Certificates: Để trống (OK, có thể thêm sau)

**Bước tiếp theo:**

1. Build Docker image
2. Push lên ECR
3. Deploy với `terraform apply`
4. Test
5. (Optional) Add HTTPS sau

---

## 🎯 **KHUYẾN NGHỊ CHO BẠN**

Vì bạn chưa mention có domain, tôi khuyên:

**Giữ nguyên:**

```hcl
ssl_certificate_arn        = ""
cloudfront_certificate_arn = ""
```

Deploy như vậy, test tính năng trước. Sau khi có domain, bạn có thể:

1. Request certificates
2. Update terraform.tfvars
3. `terraform apply` lại (update infrastructure)

**Không cần redeploy ứng dụng, chỉ cần redeploy infrastructure!** 🚀

---

Good luck! Nếu có domain và muốn add HTTPS, hãy follow hướng dẫn ở Bước 1-5! 💪
