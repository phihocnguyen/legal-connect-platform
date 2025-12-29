# Analytics Data Seeder

## 📋 Mô tả

Class `AnalyticsDataSeeder` tự động generate mock data để test các Analytics API.

## 🎯 Dữ liệu được tạo

- **100 Users** (người dùng thường)
- **20 Lawyers** (luật sư)
- **200 Posts** (bài viết) phân bố qua 8 categories
- **~500 Replies** (trả lời/bình luận)
- **~300 Votes** (upvotes/downvotes)

## 📊 Đặc điểm dữ liệu

### Time Distribution

- Users: Phân bố ngẫu nhiên trong **90 ngày** gần nhất
- Posts: Phân bố ngẫu nhiên trong **60 ngày** gần nhất
- Replies: Tạo sau post từ vài giờ đến 48 giờ
- Votes: Tạo sau post từ vài giờ đến 72 giờ

### Categories (8 loại)

1. Luật Dân sự
2. Luật Hình sự
3. Luật Lao động
4. Luật Đất đai
5. Luật Hôn nhân và Gia đình
6. Luật Kinh doanh
7. Luật Giao thông
8. Luật Thuế

### Vietnamese Data

- Tên người dùng: 100% tiếng Việt có dấu
- Tiêu đề bài viết: 20 templates về các vấn đề pháp lý phổ biến
- Nội dung: Templates tiếng Việt realistic

## 🚀 Cách sử dụng

### 1. Chạy với Spring Boot Profile

Seeder chỉ chạy khi active profile là `dev` hoặc `test`:

```bash
# Dev profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Test profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=test
```

### 2. Hoặc thêm vào application.properties

```properties
spring.profiles.active=dev
```

### 3. Auto-skip nếu đã có data

Seeder tự động bỏ qua nếu phát hiện đã có **> 10 users** trong database để tránh duplicate data.

## 🔒 An toàn

- ✅ Chỉ chạy trong dev/test profiles
- ✅ Kiểm tra data tồn tại trước khi seed
- ✅ Transaction support - rollback nếu có lỗi
- ✅ Skip duplicate votes automatically

## 📝 Thông tin đăng nhập test

### Regular Users

```
Email: user0@example.com, user1@example.com, ... user99@example.com
Password: password123
```

### Lawyers

```
Email: lawyer0@lawfirm.com, lawyer1@lawfirm.com, ... lawyer19@lawfirm.com
Password: password123
```

## 🧪 Test Analytics với Mock Data

Sau khi seed data, bạn có thể test các analytics endpoints:

```bash
# User Growth (30 days)
GET /api/admin/analytics/user-growth?timeRange=30days

# Content Stats
GET /api/admin/analytics/content-stats?timeRange=7days

# Engagement Data
GET /api/admin/analytics/engagement?timeRange=90days

# Category Distribution
GET /api/admin/analytics/category-distribution?timeRange=all

# Hourly Activity
GET /api/admin/analytics/hourly-activity?timeRange=30days
```

## 🗑️ Reset Database

Nếu muốn tạo lại data mới:

```sql
-- Clear all data
TRUNCATE TABLE post_votes CASCADE;
TRUNCATE TABLE post_replies CASCADE;
TRUNCATE TABLE posts CASCADE;
TRUNCATE TABLE post_categories CASCADE;
TRUNCATE TABLE users CASCADE;

-- Or drop and recreate database
DROP DATABASE legal_connect;
CREATE DATABASE legal_connect;
```

## ⚙️ Customize

Bạn có thể customize số lượng data trong `AnalyticsDataSeeder.java`:

```java
createUsers(100);      // Số lượng users
createLawyers(20);     // Số lượng lawyers
createPosts(..., 200); // Số lượng posts
createReplies(..., 500); // Số lượng replies
createVotes(..., 300); // Số lượng votes
```

## 📈 Metrics được generate

- **Views**: 0-1000 views/post
- **Reply Count**: 0-20 replies/post
- **Upvotes**: 0-50 upvotes/post
- **Downvotes**: 0-10 downvotes/post
- **Post Status**:
  - 5% Pinned
  - 30% Solved
  - 10% Hot/Trending

## 🔍 Logs

Xem logs để track quá trình seeding:

```
🌱 Starting Analytics Data Seeding...
Creating categories...
Creating users...
Creating posts...
Creating replies...
Creating votes...
📊 Mock data created:
  - Categories: 8
  - Users: 100
  - Lawyers: 20
  - Posts: 200
  - Replies: ~500
  - Votes: ~300
✅ Analytics Data Seeding completed successfully!
```
