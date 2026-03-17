# 🚀 Hướng Dẫn Deploy Miễn Phí Cho Project "Kem Ý Sương"

## Tổng Quan Project
- **Frontend**: Static HTML/CSS/JS (Vanilla JS)
- **Backend API**: Node.js/Express (optional - hiện tại chưa được kết nối)
- **Database**: MongoDB (optional - hiện tại dùng localStorage)
- **Tình trạng**: Có thể deploy **CHỈ FRONTEND** lên Vercel miễn phí 100%

---

## 📌 Combo Deploy Tối Ưu Nhất (Miễn Phí)

| Service | Loại | Giá | Link |
|---------|------|-----|------|
| **Vercel** | Hosting Static | **Free** | vercel.com |
| **Render** | Backend API | **Free** | render.com |
| **MongoDB Atlas** | Database | **Free** | mongodb.com/atlas |

---

## BƯỚC 1: Deploy Frontend Lên Vercel (Miễn Phí)

### 1.1. Chuẩn Bị Code
Kiểm tra file `index.html` có các tham chiếu đúng:
- ✅ `styles.css`
- ✅ `app.js`
- ✅ `img/*`

### 1.2. Đẩy Code Lên GitHub
```
bash
# Tạo repository mới trên GitHub
# Clone về máy
git init
git add .
git commit -m "Initial commit - Kem Y Suong"
git branch -M main
git remote add origin https://github.com/username/kem-y-suong.git
git push -u origin main
```

### 1.3. Deploy Lên Vercel
1. Truy cập [vercel.com](https://vercel.com) → Đăng nhập
2. Click **"Add New..."** → **"Project"**
3. Import GitHub repository `kem-y-suong`
4. Cấu hình:
   - **Framework Preset**: `Other` (vì là vanilla JS)
   - **Build Command**: Để trống
   - **Output Directory**: Để trống (vì file gốc)
5. Click **"Deploy"**

### 1.4. Cập Nhật Base URL
Sau khi deploy, sửa `index.html` để cập nhật canonical URL:
```
html
<link rel="canonical" href="https://kem-y-suong.vercel.app" />
```
Và các link trong schema:
```
html
"image": "https://kem-y-suong.vercel.app/img/og-kem-y-suong.svg"
```

---

## BƯỚC 2: Deploy Backend Lên Render (Nếu Cần)

### 2.1. Tạo Backend Service Trên Render
1. Truy cập [render.com](https://render.com) → Đăng nhập
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. Cấu hình:
   - **Name**: `kem-y-suong-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`

### 2.2. Cấu Hình Environment Variables
Trong Render dashboard, thêm các biến:

```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/kemysuong?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_32_char_random_string_here
JWT_REFRESH_SECRET=your_32_char_random_string_here
CORS_ORIGIN=https://kem-y-suong.vercel.app
APP_BASE_URL=https://kem-y-suong-api.onrender.com
FRONTEND_URL=https://kem-y-suong.vercel.app
```

### 2.3. Lưu Ý Render Free Tier
- ✅ Request đầu tiên sau 15 phút không hoạt động sẽ chậm ~30 giây
- ✅ 750 giờ chạy/tháng
- ⚠️ Service sẽ "sleep" khi không dùng

---

## BƯỚC 3: MongoDB Atlas (Nếu Cần Backend Thực)

### 3.1. Tạo Tài Khoản
1. Truy cập [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register)
2. Đăng ký với email
3. Chọn **"Build a Database"** → **"Free" (M0 Cluster)**

### 3.2. Cấu Hình Network Access
- **Network Access** → **Add IP Address**
- Chọn **"Allow Access from Anywhere"** (0.0.0.0/0)

### 3.3. Tạo Database User
- **Database Access** → **Add New User**
- Username: `kemadmin`
- Password: `MatKhauManh123@` (lưu lại!)

### 3.4. Lấy Connection String
- **Database** → **Connect** → **Drivers**
- Copy:
```
mongodb+srv://kemadmin:<password>@cluster0.xxxxx.mongodb.net/kemysuong?retryWrites=true&w=majority
```

---

## BƯỚC 4: Kết Nối Frontend Với Backend (Nếu Đã Deploy Backend)

### 4.1. Sửa app.js
Thêm biến môi trường cho API URL:
```
javascript
const API_BASE_URL = 'https://kem-y-suong-api.onrender.com';
// Hoặc dùng biến môi trường
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
```

### 4.2. Cập Nhật Checkout Logic
Trong `app.js`, sửa hàm `processCheckout()` để gọi API backend:
```
javascript
async function submitOrder(orderData) {
  const response = await fetch(`${API_BASE_URL}/api/v1/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  return response.json();
}
```

---

## 📊 So Sánh Các Phương Án Deploy

| Phương án | Frontend | Backend | Database | Phù hợp |
|-----------|----------|---------|----------|---------|
| **A (Khuyến nghị)** | Vercel | ❌ | ❌ | Demo/Static |
| **B** | Vercel | Render | ❌ | Có API nhưng không lưu DB |
| **C (Đầy đủ)** | Vercel | Render | MongoDB Atlas | Production |

---

## ✅ Kết Luận

**Project hiện tại của bạn là static website** với:
- Giỏ hàng lưu trong localStorage
- Checkout form chỉ hiển thị thông tin (không lưu đơn)
- Không cần backend hay database

**Chỉ cần deploy frontend lên Vercel là đủ!** 

Deploy ngay bây giờ:
1. ✅ Push code lên GitHub
2. ✅ Vào Vercel → Import project → Deploy
3. ✅ Xong! Website của bạn đã online miễn phí

---

## 🔧 Commands Để Deploy Nhanh

```
bash
# Clone và deploy nhanh (nếu đã có repo)
npm i -g vercel
vercel

# Hoặc sử dụng Vercel CLI
vercel login
vercel --prod
```

---

## 📞 Hỗ Trợ

Nếu cần hỗ trợ thêm:
-[Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)

## ⚠️ Xử Lý Lỗi Git

Nếu bạn gặp lỗi **"Another git process seems to be running"**, hãy chạy file `fix_git_lock.bat` vừa được tạo trong thư mục dự án.

Hoặc chạy lệnh thủ công:
`del .git\index.lock`
