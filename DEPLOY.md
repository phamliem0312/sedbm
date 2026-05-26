# Hướng dẫn Deploy SEDBM Website

## Yêu cầu

- Docker >= 20.x
- (Tuỳ chọn) Docker Compose >= 2.x

---

## Build Docker Image

```bash
docker build -t sedbm:latest .
```

Để gắn tag version cụ thể:

```bash
docker build -t sedbm:1.0.0 .
```

---

## Chạy container

### Chạy trực tiếp với Docker

```bash
docker run -d \
  --name sedbm \
  -p 80:80 \
  --restart unless-stopped \
  sedbm:latest
```

Truy cập website tại: http://localhost

Để dùng port khác (ví dụ 8080):

```bash
docker run -d \
  --name sedbm \
  -p 8080:80 \
  --restart unless-stopped \
  sedbm:latest
```

Truy cập tại: http://localhost:8080

---

### Chạy với Docker Compose

Tạo file `docker-compose.yml`:

```yaml
services:
  sedbm:
    image: sedbm:latest
    container_name: sedbm
    ports:
      - "80:80"
    restart: unless-stopped
```

Khởi chạy:

```bash
docker compose up -d
```

---

## Quản lý container

```bash
# Xem trạng thái
docker ps

# Xem logs
docker logs sedbm

# Dừng container
docker stop sedbm

# Xoá container
docker rm sedbm

# Dừng và xoá (Docker Compose)
docker compose down
```

---

## Cập nhật website

```bash
# 1. Build image mới
docker build -t sedbm:latest .

# 2. Dừng và xoá container cũ
docker stop sedbm && docker rm sedbm

# 3. Chạy container mới
docker run -d \
  --name sedbm \
  -p 80:80 \
  --restart unless-stopped \
  sedbm:latest
```

Hoặc với Docker Compose:

```bash
docker compose up -d --build
```

---

## Deploy không dùng Docker

SEDBM là website tĩnh (HTML/CSS/JS), nên có thể deploy trực tiếp mà không cần container.

### Cách 1: Deploy trực tiếp bằng Nginx (Linux)

#### Bước 1: Cài Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

#### Bước 2: Copy source vào thư mục web

```bash
sudo mkdir -p /var/www/sedbm
sudo rsync -av --delete ./ /var/www/sedbm/ \
  --exclude ".git" \
  --exclude ".vscode" \
  --exclude "Dockerfile" \
  --exclude "docker-compose.yml"
```

#### Bước 3: Tạo Virtual Host

Tạo file `/etc/nginx/sites-available/sedbm`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/sedbm;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(css|js|jpg|jpeg|png|gif|svg|webp|ico)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }
}
```

Kích hoạt site và reload:

```bash
sudo ln -s /etc/nginx/sites-available/sedbm /etc/nginx/sites-enabled/sedbm
sudo nginx -t
sudo systemctl reload nginx
```

#### Bước 4: Cập nhật phiên bản mới

```bash
sudo rsync -av --delete ./ /var/www/sedbm/ \
  --exclude ".git" \
  --exclude ".vscode" \
  --exclude "Dockerfile" \
  --exclude "docker-compose.yml"
sudo systemctl reload nginx
```

### Cách 2: Deploy bằng GitHub Pages

1. Push source code lên GitHub repository.
2. Vào `Settings` -> `Pages`.
3. Ở mục `Build and deployment`, chọn:
   - `Source`: Deploy from a branch
   - `Branch`: `main` (hoặc branch bạn dùng), thư mục `/ (root)`
4. Save và chờ GitHub publish.

URL mặc định: `https://<username>.github.io/<repo>/`

### Cách 3: Deploy bằng Netlify

#### Cách nhanh (UI)

- Vào Netlify -> Add new site -> Deploy manually
- Kéo thả toàn bộ thư mục project vào màn hình upload

#### Cách bằng CLI

```bash
npm i -g netlify-cli
netlify login
netlify deploy --dir .
netlify deploy --prod --dir .
```

---

## Deploy lên server

### Bước 1: Push image lên Docker Hub (hoặc registry riêng)

```bash
# Đặt lại tag với tên registry
docker tag sedbm:latest <username>/sedbm:latest

# Đăng nhập và push
docker login
docker push <username>/sedbm:latest
```

### Bước 2: Pull và chạy trên server

```bash
docker pull <username>/sedbm:latest

docker run -d \
  --name sedbm \
  -p 80:80 \
  --restart unless-stopped \
  <username>/sedbm:latest
```

---

## Cấu hình HTTPS với Nginx reverse proxy

Nếu cần HTTPS, đặt Nginx hoặc Traefik phía trước container.

Ví dụ với Nginx trên server:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/your_cert.pem;
    ssl_certificate_key /etc/ssl/private/your_key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
