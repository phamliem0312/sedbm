# SEDBM 2026 — Static Website Deployment Guide (Windows)

## Table of Contents
1. [Project Structure](#project-structure)
2. [Option 1: Local Development (Live Server)](#option-1-local-development-live-server)
3. [Option 2: Deploy with IIS (Internet Information Services)](#option-2-deploy-with-iis)
4. [Option 3: Deploy with NGINX on Windows](#option-3-deploy-with-nginx-on-windows)
5. [Option 4: Deploy to GitHub Pages (Free, Recommended)](#option-4-deploy-to-github-pages-free-recommended)
6. [Option 5: Deploy to Netlify (Free, Easiest)](#option-5-deploy-to-netlify-free-easiest)
7. [Option 6: Deploy to a VPS / Shared Hosting via FTP](#option-6-deploy-to-a-vps--shared-hosting-via-ftp)
8. [Adding Images](#adding-images)

---

## Project Structure

```
sedbm/
├── index.html
├── call-for-paper.html
├── history.html
├── keynote-speakers.html
├── proceedings.html
├── publication.html
├── registration.html
├── scientific-committee.html
├── submission.html
├── programme.html
├── venue.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── images/
    ├── hvtc-logo.png
    ├── slider1.jpg
    ├── slider2.jpg
    ├── slider3.jpg
    ├── gallery1.jpg ~ gallery6.jpg
    ├── partner1.png ~ partner7.png
    └── ...
```

---

## Option 1: Local Development (Live Server)

Cách nhanh nhất để xem website trên máy cục bộ.

### Dùng VS Code + Live Server (khuyên dùng)

1. Cài [Visual Studio Code](https://code.visualstudio.com/)
2. Cài extension **Live Server** (tìm trong Extensions tab, ID: `ritwickdey.LiveServer`)
3. Mở thư mục `sedbm/` trong VS Code
4. Click chuột phải vào `index.html` → **Open with Live Server**
5. Trình duyệt tự mở tại `http://127.0.0.1:5500`

### Dùng Node.js `serve`

```powershell
# Cài Node.js tại https://nodejs.org nếu chưa có
# Kiểm tra:
node -v

# Cài serve toàn cục
npm install -g serve

# Chạy từ thư mục dự án
cd D:\projects\sedbm
serve .
```

Truy cập tại `http://localhost:3000`

### Dùng Python (có sẵn trên nhiều máy)

```powershell
cd D:\projects\sedbm

# Python 3
python -m http.server 8080
```

Truy cập tại `http://localhost:8080`

---

## Option 2: Deploy với IIS (Internet Information Services)

IIS là web server có sẵn trên Windows (Pro/Enterprise). Phù hợp cho môi trường nội bộ hoặc server Windows.

### Bước 1 — Bật IIS

1. Mở **Control Panel** → **Programs** → **Turn Windows features on or off**
2. Tích chọn **Internet Information Services** → **OK**
3. Chờ Windows cài xong, sau đó mở trình duyệt kiểm tra tại `http://localhost`

### Bước 2 — Tạo website trong IIS

1. Mở **IIS Manager** (tìm trong Start Menu: `inetmgr`)
2. Ở cột trái, click chuột phải vào **Sites** → **Add Website**
3. Điền thông tin:
   - **Site name**: `SEDBM2026`
   - **Physical path**: `D:\projects\sedbm`
   - **Port**: `80` (hoặc port khác nếu 80 đã dùng, ví dụ `8080`)
4. Click **OK**

### Bước 3 — Cấu hình quyền thư mục

Mở **PowerShell** với quyền Administrator:

```powershell
icacls "D:\projects\sedbm" /grant "IIS_IUSRS:(OI)(CI)R"
```

### Bước 4 — Truy cập

Mở trình duyệt tại `http://localhost` (hoặc `http://localhost:8080` nếu dùng port khác).

Nếu dùng domain nội bộ, thêm vào file `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1   sedbm2026.local
```

Rồi truy cập `http://sedbm2026.local`

---

## Option 3: Deploy với NGINX trên Windows

### Bước 1 — Tải NGINX

1. Tải NGINX cho Windows tại: https://nginx.org/en/download.html (chọn bản **Stable**)
2. Giải nén vào `C:\nginx`

### Bước 2 — Cấu hình NGINX

Mở file `C:\nginx\conf\nginx.conf`, thay thế toàn bộ block `server { ... }` bằng:

```nginx
server {
    listen       80;
    server_name  localhost;

    root   D:/projects/sedbm;
    index  index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript text/html image/svg+xml;
}
```

### Bước 3 — Chạy NGINX

```powershell
cd C:\nginx
start nginx
```

Kiểm tra trạng thái:
```powershell
tasklist /fi "imagename eq nginx.exe"
```

Reload cấu hình sau khi sửa:
```powershell
cd C:\nginx
nginx -s reload
```

Dừng NGINX:
```powershell
nginx -s stop
```

Truy cập tại `http://localhost`

### Bước 4 — Chạy tự động khi khởi động (tùy chọn)

Tạo file `start-nginx.bat`:
```bat
@echo off
cd /d C:\nginx
start nginx
```

Đặt shortcut file này vào:
`C:\Users\<username>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`

---

## Option 4: Deploy lên GitHub Pages (Miễn phí, khuyên dùng)

Phù hợp để publish website ra Internet hoàn toàn miễn phí.

### Bước 1 — Tạo tài khoản và repository GitHub

1. Đăng ký tại https://github.com nếu chưa có
2. Tạo repository mới: **New repository**
   - Repository name: `sedbm2026` (hoặc `<username>.github.io` để dùng domain gốc)
   - Chọn **Public**
   - Click **Create repository**

### Bước 2 — Cài Git và push code

Tải Git tại https://git-scm.com/download/win, sau đó:

```powershell
cd D:\projects\sedbm

git init
git add .
git commit -m "Initial commit - SEDBM2026 website"
git branch -M main
git remote add origin https://github.com/<username>/sedbm2026.git
git push -u origin main
```

### Bước 3 — Bật GitHub Pages

1. Vào repository trên GitHub → **Settings** → **Pages**
2. Mục **Source**: chọn **Deploy from a branch**
3. **Branch**: chọn `main` → thư mục `/` (root) → **Save**
4. Sau 1-2 phút, website sẽ live tại:
   `https://<username>.github.io/sedbm2026/`

### Cập nhật nội dung

```powershell
cd D:\projects\sedbm
git add .
git commit -m "Update content"
git push
```

GitHub Pages tự động deploy lại sau vài phút.

---

## Option 5: Deploy lên Netlify (Miễn phí, dễ nhất)

### Cách 1 — Kéo thả (không cần Git)

1. Truy cập https://app.netlify.com và đăng ký miễn phí
2. Vào **Sites** → kéo thả toàn bộ thư mục `sedbm/` vào vùng **"drag and drop"**
3. Netlify tự build và cấp URL dạng `https://random-name.netlify.app`

### Cách 2 — Kết nối GitHub (tự động deploy khi push)

1. Đăng nhập Netlify → **Add new site** → **Import an existing project**
2. Chọn **GitHub** → chọn repository `sedbm2026`
3. Cấu hình:
   - **Branch**: `main`
   - **Build command**: *(để trống)*
   - **Publish directory**: `.` (hoặc để trống)
4. Click **Deploy site**

### Đặt domain tùy chỉnh

Vào **Site settings** → **Domain management** → **Add custom domain**, nhập domain của bạn rồi cập nhật DNS theo hướng dẫn.

---

## Option 6: Deploy lên VPS / Shared Hosting qua FTP

### Dùng FileZilla (FTP Client)

1. Tải FileZilla tại https://filezilla-project.org
2. Mở FileZilla, nhập thông tin từ nhà cung cấp hosting:
   - **Host**: `ftp.yourdomain.com`
   - **Username**: tài khoản FTP
   - **Password**: mật khẩu FTP
   - **Port**: `21` (FTP) hoặc `22` (SFTP)
3. Click **Quickconnect**
4. Ở cột phải (Remote site), điều hướng đến thư mục `public_html/` hoặc `www/`
5. Ở cột trái (Local site), điều hướng đến `D:\projects\sedbm`
6. Chọn tất cả file và thư mục → kéo sang cột phải để upload

### Dùng WinSCP (thay thế FileZilla)

1. Tải WinSCP tại https://winscp.net
2. Tạo kết nối mới với thông tin FTP/SFTP từ hosting
3. Kéo thả toàn bộ thư mục `sedbm/` sang server

---

## Adding Images

Các ảnh cần thêm vào thư mục `images/` trước khi deploy:

| File | Mô tả | Kích thước khuyến nghị |
|------|-------|------------------------|
| `slider1.jpg` | Ảnh hero gallery hàng trên | 1200 × 600px |
| `slider2.jpg` | Ảnh hero gallery hàng dưới trái | 600 × 400px |
| `slider3.jpg` | Ảnh hero gallery hàng dưới phải | 600 × 400px |
| `gallery1.jpg` ~ `gallery6.jpg` | Ảnh footer gallery | 300 × 200px |
| `partner1.png` ~ `partner7.png` | Logo đối tác (7 co-organizing institutions) | 200 × 100px (PNG nền trong) |

---

## Ghi chú

- Website là **tĩnh hoàn toàn** (HTML/CSS/JS), không cần backend hay database.
- Mọi link ngoài (Google Fonts, Font Awesome, Google Maps) cần kết nối Internet để tải đúng.
- Để dùng offline hoàn toàn, tải các thư viện về local và thay đổi đường dẫn trong thẻ `<link>` và `<script>`.
