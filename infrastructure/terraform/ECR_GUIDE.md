# 🐳 ECR (Elastic Container Registry) - Hướng dẫn Chi Tiết

## 📋 Tổng quan

**ECR** là dịch vụ lưu trữ Docker images trên AWS, thay thế cho Docker Hub.

**AWS Account ID của bạn:** `703172063283`
**Region:** `ap-southeast-1` (Singapore)

---

## 🚀 **BƯỚC 1: Tạo ECR Repository**

### Cách 1: Dùng AWS CLI (Nhanh)

```bash
# Tạo repository cho backend
aws ecr create-repository \
  --repository-name legal-connect-backend \
  --region ap-southeast-1

# Output sẽ in ra:
# {
#   "repository": {
#     "repositoryArn": "arn:aws:ecr:ap-southeast-1:703172063283:repository/legal-connect-backend",
#     "registryId": "703172063283",
#     "repositoryName": "legal-connect-backend",
#     "repositoryUri": "703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend",
#     ...
#   }
# }

# Lưu lại URI: 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend
```

### Cách 2: Dùng AWS Console (Dễ nhìn)

1. Vào: https://ap-southeast-1.console.aws.amazon.com/ecr/repositories
2. Click "Create repository"
3. Điền:
   - Repository name: `legal-connect-backend`
   - Tag immutability: Enable (tùy chọn)
   - Scan on push: Enable (tùy chọn)
4. Click "Create repository"

---

## 🔑 **BƯỚC 2: Login vào ECR**

### Command:

```bash
# Login vào ECR (authorization token sử dụng được 12 giờ)
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com

# Output:
# Login Succeeded
```

**Nếu có lỗi "command not found: docker":**

```bash
# Cài Docker trước
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user vào docker group (không cần sudo)
sudo usermod -aG docker $USER
newgrp docker
```

---

## 🏗️ **BƯỚC 3: Build Docker Image**

### Xem Dockerfile của backend

```bash
# Xem Dockerfile
cat backend/Dockerfile

# Nó sẽ trông như thế này:
# FROM openjdk:17-slim
# WORKDIR /app
# COPY target/legal-connect-*.jar app.jar
# EXPOSE 8080
# ENTRYPOINT ["java","-jar","app.jar"]
```

### Build image

```bash
# Di chuyển vào thư mục backend
cd backend

# Build image
docker build -t legal-connect-backend:latest .

# Output:
# [+] Building 5.3s (6/6) FINISHED
# => exporting to image
# => => naming to docker.io/library/legal-connect-backend:latest
```

**Nếu lỗi:**

```bash
# Error: "target/legal-connect-*.jar" không tìm thấy?
# Cần build Maven trước:
./mvnw clean package

# Hoặc nếu dùng mvn:
mvn clean package
```

---

## 🏷️ **BƯỚC 4: Tag Image**

### Command:

```bash
# Tag image với ECR URI
docker tag legal-connect-backend:latest \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest

# Hoặc tag với version:
docker tag legal-connect-backend:latest \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:v1.0.0
```

### Verify tag

```bash
# Xem các images
docker images

# Output:
# REPOSITORY                                                               TAG       IMAGE ID       SIZE
# 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend latest    abc123def456   250MB
# legal-connect-backend                                                    latest    abc123def456   250MB
```

---

## ⬆️ **BƯỚC 5: Push Image lên ECR**

### Command:

```bash
# Push image lên ECR
docker push 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest

# Output sẽ in từng layer:
# Pushing [==================================================>] 1.234MB/1.234MB
# latest: digest: sha256:abc123def456... size: 5678
```

### Verify push thành công

```bash
# List images trong ECR
aws ecr describe-images \
  --repository-name legal-connect-backend \
  --region ap-southeast-1

# Hoặc dùng Console:
# https://ap-southeast-1.console.aws.amazon.com/ecr/repositories/legal-connect-backend
```

---

## 📝 **BƯỚC 6: Update terraform.tfvars**

Image đã được push, giờ update terraform.tfvars:

```bash
# Edit file
nano infrastructure/terraform/terraform.tfvars

# Thay dòng này:
backend_image = "703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest"
```

**Đã có sẵn trong file của bạn!** ✅

---

## 🔄 **BƯỚC 7: Update Image (Lần sau)**

Khi bạn cập nhật code backend:

```bash
# 1. Build lại
./mvnw clean package

# 2. Build Docker image
cd backend
docker build -t legal-connect-backend:v1.0.1 .

# 3. Tag image
docker tag legal-connect-backend:v1.0.1 \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:v1.0.1

# 4. Push
docker push 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:v1.0.1

# 5. Update terraform.tfvars
backend_image = "703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:v1.0.1"

# 6. Redeploy
terraform apply
```

---

## 🚀 **QUICK REFERENCE - Lệnh nhanh**

```bash
# 1. Login
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com

# 2. Build
cd backend
./mvnw clean package
docker build -t legal-connect-backend:latest .

# 3. Tag
docker tag legal-connect-backend:latest \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest

# 4. Push
docker push 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest

# 5. Verify
aws ecr describe-images \
  --repository-name legal-connect-backend \
  --region ap-southeast-1
```

---

## 💡 **TIPS & TRICKS**

### Tag naming convention

```bash
# Tag theo version
v1.0.0, v1.0.1, v2.0.0

# Tag theo git commit
abc123, def456

# Tag theo environment
dev, staging, prod

# Tag theo date
2025-01-17, 2025-01-17-v1

# Khuyến khích: Dùng cả latest + version
docker tag legal-connect-backend:latest \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest

docker tag legal-connect-backend:latest \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:v1.0.0

# Push cả 2
docker push 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest
docker push 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:v1.0.0
```

### Xem logs của image

```bash
# Build with debug output
docker build --progress=plain -t legal-connect-backend:latest .

# Xem container logs
docker run -it 703172063283.dkr.ecr.ap-southeast-1.amazonaws.com/legal-connect-backend:latest
```

### Cleanup (xóa images cũ)

```bash
# Xem các images
docker images

# Xóa image local
docker rmi legal-connect-backend:latest

# Xóa image trong ECR
aws ecr batch-delete-image \
  --repository-name legal-connect-backend \
  --image-ids imageTag=v0.0.1 \
  --region ap-southeast-1
```

---

## ⚠️ **TROUBLESHOOTING**

### Error 1: "denied: User is not authorized to perform"

```bash
# Lỗi: Không có quyền push
# Giải pháp: Re-login vào ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  703172063283.dkr.ecr.ap-southeast-1.amazonaws.com
```

### Error 2: "repository not found"

```bash
# Lỗi: ECR repository chưa được tạo
# Giải pháp: Tạo repository
aws ecr create-repository \
  --repository-name legal-connect-backend \
  --region ap-southeast-1
```

### Error 3: "no space left on device"

```bash
# Lỗi: Disk không đủ
# Giải pháp: Xóa images cũ
docker system prune -a
```

### Error 4: "Build failed: target/legal-connect-\*.jar not found"

```bash
# Lỗi: Chưa build Maven
# Giải pháp: Build Maven trước
./mvnw clean package
# Hoặc
mvn clean package -DskipTests
```

---

## 📊 **BẢNG TÓRA TAT**

| Bước | Lệnh                                         | Ghi chú            |
| ---- | -------------------------------------------- | ------------------ |
| 1    | `aws ecr create-repository`                  | Tạo ECR repo       |
| 2    | `aws ecr get-login-password \| docker login` | Login vào ECR      |
| 3    | `./mvnw clean package`                       | Build Maven        |
| 4    | `docker build -t legal-connect-backend .`    | Build Docker image |
| 5    | `docker tag ... 703172063283...`             | Tag image          |
| 6    | `docker push 703172063283...`                | Push lên ECR       |
| 7    | Update `backend_image` in `terraform.tfvars` | Update config      |
| 8    | `terraform apply`                            | Deploy lên ECS     |

---

## ✅ **CHECKLIST**

- [ ] AWS CLI cài đặt và configure
- [ ] Docker cài đặt
- [ ] ECR repository created
- [ ] Maven build thành công (`target/*.jar` tồn tại)
- [ ] Docker image built thành công
- [ ] Logged in vào ECR
- [ ] Image tagged đúng
- [ ] Image pushed lên ECR
- [ ] Verify image trong ECR console
- [ ] terraform.tfvars updated với backend_image
- [ ] Ready để `terraform apply`

Good luck! 🚀
