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
