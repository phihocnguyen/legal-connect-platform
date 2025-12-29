# 🔗 ALB DNS Là Gì? - Hướng dẫn Chi Tiết

## 📋 Tóm tắt nhanh

**ALB DNS** = Địa chỉ Internet của **Application Load Balancer** trên AWS

- Được tạo **tự động** bởi AWS khi bạn tạo ALB
- Dùng để **truy cập backend API** từ frontend
- Có dạng: `alb-12345678.ap-southeast-1.elb.amazonaws.com`

---

## 🤔 **ALB (Application Load Balancer) Là Gì?**

### Biểu diễn đơn giản

```
Internet Users
      ↓
   ALB (Load Balancer)
   DNS: alb-xxx.elb.amazonaws.com
      ↓ (forward requests)
   ECS Fargate Cluster
   (Backend Spring Boot)
   Port: 8080
```

### So sánh

| Thành phần | Vai trò                    | Ví dụ                       |
| ---------- | -------------------------- | --------------------------- |
| **ALB**    | Công ty bảo vệ (gateway)   | `alb-xxx.elb.amazonaws.com` |
| **ECS**    | Kho hàng (backend servers) | IP nội bộ: `10.0.1.50:8080` |
| **DNS**    | Địa chỉ công ty            | `alb-xxx.elb.amazonaws.com` |

---

## 🔍 **Cách Lấy ALB DNS**

### Cách 1: Dùng Terraform Output (Nhanh nhất)

```bash
# Di chuyển vào folder terraform
cd infrastructure/terraform

# Lấy ALB DNS
terraform output alb_dns_name

# Output:
# alb-12345678.ap-southeast-1.elb.amazonaws.com
```

### Cách 2: Dùng AWS CLI

```bash
# List tất cả load balancers
aws elbv2 describe-load-balancers \
  --region ap-southeast-1 \
  --query 'LoadBalancers[*].{Name:LoadBalancerName,DNS:DNSName}' \
  --output table

# Output:
# | Name              | DNS                                         |
# |-------------------|--------------------------------------------|
# | legal-connect-alb | alb-12345678.ap-southeast-1.elb.amazonaws.com |
```

### Cách 3: Dùng AWS Console

1. Vào: https://ap-southeast-1.console.aws.amazon.com/ec2/v2/home?region=ap-southeast-1#LoadBalancers:
2. Tìm Load Balancer có tên `legal-connect-alb`
3. Copy **DNS name** (cột bên phải)
4. Dùng cái này trong `.env.production`

---

## 🌍 **Cách ALB DNS được sử dụng**

### Frontend gọi Backend API

```
Frontend (CloudFront)          Backend (ECS)
       ↓                              ↑
Browser makes request:
GET https://d123.cloudfront.net/api/users

       ↓ (calls API)
API_URL = http://alb-xxx.elb.amazonaws.com/api
GET http://alb-xxx.elb.amazonaws.com/api/users

       ↓
ALB routes to ECS task
Spring Boot at port 8080

       ↓
Response back to Frontend
```

### Code JavaScript example

```javascript
// .env.production
NEXT_PUBLIC_API_URL=http://alb-12345678.ap-southeast-1.elb.amazonaws.com/api

// Trong component
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/users`
);
```

---

## 📝 **Ví dụ ALB DNS**

### Real world examples

```
AWS Region: ap-southeast-1 (Singapore)

❌ Sai:
- localhost:8080 (chỉ cho local dev)
- 127.0.0.1:8080 (local machine)
- private-ip-10.0.1.50:8080 (internal, không qua ALB)

✅ Đúng:
- alb-abc12345.ap-southeast-1.elb.amazonaws.com (public)
- alb-abc12345.ap-southeast-1.elb.amazonaws.com:80 (explicit port)
- http://alb-abc12345.ap-southeast-1.elb.amazonaws.com/api (with path)
```

---

## 🎯 **ALB có 2 Listeners**

Terraform của bạn tạo ALB với:

### 1. HTTP Listener (Port 80)

```
http://alb-xxx.elb.amazonaws.com
↓
Redirects to HTTPS (nếu cấu hình)
```

### 2. HTTPS Listener (Port 443)

```
https://alb-xxx.elb.amazonaws.com
↓
Your SSL Certificate (nếu có)
↓
Backend ECS (Port 8080)
```

---

## 🚀 **Complete Flow**

### 1. User mở frontend

```
User browser
↓
https://d123.cloudfront.net (CloudFront)
↓
S3 bucket (static files)
```

### 2. Frontend gọi API

```
Frontend JavaScript
↓
axios.get('http://alb-xxx.elb.amazonaws.com/api/users')
↓
ALB (Port 80/443)
↓
ECS Fargate Task (Spring Boot Port 8080)
↓
Return JSON response
```

### 3. Response back to Frontend

```
Spring Boot
↓
ALB (Port 80/443)
↓
Frontend JavaScript
↓
Display on screen
```

---

## 📊 **Bảng Tóra Tắt**

| Yếu tố           | Giá trị                                    | Ghi chú          |
| ---------------- | ------------------------------------------ | ---------------- |
| **Loại**         | Application Load Balancer                  | AWS Service      |
| **DNS Name**     | `alb-xxx.ap-southeast-1.elb.amazonaws.com` | Auto-generated   |
| **Port**         | 80 (HTTP), 443 (HTTPS)                     | Public facing    |
| **Backend Port** | 8080                                       | Spring Boot      |
| **Backend Host** | ECS Fargate Task                           | Private IP       |
| **Region**       | ap-southeast-1                             | Singapore        |
| **Account ID**   | 703172063283                               | Your AWS Account |

---

## ✅ **Checklist - Lấy ALB DNS**

- [ ] Đã chạy `terraform apply` thành công
- [ ] Terraform output có `alb_dns_name`
- [ ] ALB được tạo trong AWS
- [ ] ALB có 2 listeners (HTTP + HTTPS)
- [ ] ECS tasks được đăng ký với ALB
- [ ] Test ALB DNS: `curl http://alb-xxx.elb.amazonaws.com/api/health`
- [ ] Copy ALB DNS vào `.env.production`

---

## 💡 **TIPS**

### DNS không resolve?

```bash
# Test DNS resolution
nslookup alb-abc.ap-southeast-1.elb.amazonaws.com

# Hoặc
dig alb-abc.ap-southeast-1.elb.amazonaws.com

# Hoặc check ALB health
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:ap-southeast-1:703172063283:targetgroup/legal-connect-alb-tg/abc123 \
  --region ap-southeast-1
```

### ALB health check failed?

```bash
# Check ALB target groups
aws elbv2 describe-target-groups \
  --region ap-southeast-1 \
  --query 'TargetGroups[*]' \
  --output table

# Check target health
aws elbv2 describe-target-health \
  --target-group-arn <ARN> \
  --region ap-southeast-1
```

### Backend not responding?

```bash
# Check ECS task running
aws ecs describe-services \
  --cluster legal-connect-prod \
  --services legal-connect-backend \
  --region ap-southeast-1

# Check ECS task health
aws ecs describe-tasks \
  --cluster legal-connect-prod \
  --tasks <task-arn> \
  --region ap-southeast-1
```

---

## 🎓 **Tham khảo thêm**

- [AWS ALB Documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- [ECS Integration with ALB](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-load-balancing.html)
- [Troubleshooting ALB](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-troubleshooting.html)

Good luck! 🚀
