# HƯỚNG DẪN TRIỂN KHAI DỰ ÁN U&I LOGISTICS CUSTOMER PORTAL LÊN RENDER

Tài liệu này hướng dẫn chi tiết quy trình chuẩn bị, đẩy mã nguồn lên GitHub và triển khai ứng dụng **U&I Logistics Customer Portal (Full-Stack PWA + PocketBase)** lên nền tảng **Render** một cách an toàn, chuẩn hóa DevOps và sẵn sàng production.

---

## A. KIẾN TRÚC DỰ ÁN HIỆN TẠI

Dự án áp dụng mô hình phân tách độc lập (Decoupled Architecture) gồm 2 thành phần chính:

```
┌────────────────────────────────────────────────────────┐
│                   NGƯỜI DÙNG TRUY CẬP                   │
│        (Mobile PWA / Laptop / Desktop Browser)         │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS
                           ▼
┌────────────────────────────────────────────────────────┐
│  1. FRONTEND: RENDER STATIC SITE                       │
│  - Công nghệ: React 18, TypeScript, Vite 5, Tailwind   │
│  - PWA: Service Worker, Web Manifest, Auto-update      │
│  - SPA Routing: Client-side routing via React Router   │
│  - URL mẫu: https://u-and-i-portal.onrender.com        │
└──────────────────────────┬─────────────────────────────┘
                           │ REST API / SSE / HTTPS
                           ▼
┌────────────────────────────────────────────────────────┐
│  2. BACKEND: RENDER WEB SERVICE (DOCKER)               │
│  - Công nghệ: PocketBase v0.22.21 (Golang + SQLite)    │
│  - Quản lý dữ liệu: pb_migrations/ tự động apply schema│
│  - Health Check: GET /api/health                       │
│  - URL mẫu: https://u-and-i-backend.onrender.com       │
└────────────────────────────────────────────────────────┘
```

---

## B. BẢNG BIẾN MÔI TRƯỜNG (ENVIRONMENT VARIABLES)

### 1. Dành cho Frontend (Render Static Site)

| Tên biến | Bắt buộc | Giá trị mẫu | Mô tả |
| :--- | :---: | :--- | :--- |
| `VITE_POCKETBASE_URL` | **CÓ** | `https://u-and-i-backend.onrender.com` | URL public của backend PocketBase để frontend gọi API. |

> [!IMPORTANT]
> - Các biến có tiền tố `VITE_*` sẽ được đóng gói công khai vào file JavaScript bundle ở phía client.
> - **TUYỆT ĐỐI KHÔNG** đặt API secret, admin token hay mật khẩu cơ sở dữ liệu vào biến `VITE_*`.

### 2. Dành cho Backend (Render Web Service - Docker)

| Tên biến | Bắt buộc | Giá trị mẫu | Mô tả |
| :--- | :---: | :--- | :--- |
| `PORT` | **CÓ** | `8090` (Render tự gán động) | Cổng lắng nghe của container PocketBase. |
| `PB_DATA_DIR` | Không | `/pb/pb_data` | Đường dẫn thư mục lưu SQLite DB và file upload. |
| `PB_ADMIN_EMAIL` | Tùy chọn | `admin@demo.local` | Email Superuser Admin tự khởi tạo lần đầu. |
| `PB_ADMIN_PASSWORD` | Tùy chọn | `Admin@123456` | Mật khẩu Superuser Admin (tối thiểu 10 ký tự). |

---

## C. HƯỚNG DẪN PUSH CODE LÊN GITHUB

### Bước 1: Kiểm tra trạng thái Git và `.gitignore`
Mã nguồn đã được tạo sẵn file [.gitignore](file:///.gitignore) chuẩn, tự động loại trừ `node_modules/`, `dist/`, các file `.env` chứa mật khẩu và thư mục runtime `backend/pb_data/`.

Mở terminal tại thư mục gốc dự án:
```powershell
# 1. Khởi tạo Git repository (nếu chưa có)
git init

# 2. Kiểm tra các file sẽ được commit
git status
```

### Bước 2: Commit và Push lên GitHub
```powershell
# 3. Thêm toàn bộ source code sạch vào staging
git add .

# 4. Commit với thông điệp rõ ràng
git commit -m "feat: prepare U&I Logistics portal for Render deployment"

# 5. Đổi tên branch chính thành main
git branch -M main

# 6. Liên kết với repository trên GitHub của bạn
# (Thay thế <username> và <repo-name> bằng link thực tế của bạn)
git remote add origin https://github.com/<username>/<repo-name>.git

# 7. Đẩy mã nguồn lên GitHub
git push -u origin main
```

---

## D. KẾT NỐI GITHUB VỚI RENDER

1. Truy cập [dashboard.render.com](https://dashboard.render.com) và đăng nhập (bằng tài khoản GitHub).
2. Nhấn nút **New +** ở góc trên cùng bên phải.
3. Chọn **Blueprint** (để triển khai tự động cả Frontend & Backend) HOẶC tạo thủ công từng dịch vụ theo Mục E và F dưới đây.

---

## E. TRIỂN KHAI TỰ ĐỘNG BẰNG RENDER BLUEPRINT (`render.yaml`)

Dự án đã tích hợp sẵn file cấu hình chuẩn [render.yaml](file:///render.yaml).

1. Tại Render Dashboard, chọn **New +** -> **Blueprint**.
2. Chọn repository GitHub vừa push (`<username>/<repo-name>`).
3. Render sẽ tự động đọc file `render.yaml` và phát hiện 2 dịch vụ:
   - `u-and-i-backend`: Docker Web Service.
   - `u-and-i-frontend`: React Static Site.
4. Nhấn **Apply**. Render sẽ tự động khởi tạo hạ tầng, build backend và inject biến `VITE_POCKETBASE_URL` sang frontend.

---

## F. HƯỚNG DẪN TRIỂN KHAI THỦ CÔNG TỪNG DỊCH VỤ (NẾU KHÔNG DÙNG BLUEPRINT)

### Bước 1: Triển khai Backend trước (Render Web Service)
1. Tại Dashboard, nhấn **New +** -> **Web Service**.
2. Chọn repository GitHub của bạn.
3. Cấu hình thông tin Backend:
   - **Name**: `u-and-i-backend`
   - **Region**: `Singapore` (hoặc khu vực gần bạn nhất)
   - **Language / Runtime**: `Docker`
   - **Docker Context Directory**: `backend` (hoặc `./backend`)
   - **Dockerfile Path**: `backend/Dockerfile` (hoặc `./backend/Dockerfile`)
   - **Instance Type**: `Free`
4. Mở mục **Advanced** -> Thêm các biến môi trường (Environment Variables):
   - `PORT`: `8090`
   - `PB_ADMIN_EMAIL`: `admin@demo.local`
   - `PB_ADMIN_PASSWORD`: `<mat-khau-admin-an-toan-cua-ban>`
5. Cấu hình Health Check:
   - **Health Check Path**: `/api/health`
6. Nhấn **Create Web Service**. Chờ quá trình build hoàn tất.
7. Sau khi deploy thành công, sao chép URL backend (Ví dụ: `https://u-and-i-backend.onrender.com`).

---

### Bước 2: Triển khai Frontend (Render Static Site)
1. Tại Dashboard, nhấn **New +** -> **Static Site**.
2. Chọn repository GitHub của bạn.
3. Cấu hình thông tin Frontend:
   - **Name**: `u-and-i-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Cấu hình Biến môi trường:
   - Mở **Environment Variables** -> Thêm:
     - Key: `VITE_POCKETBASE_URL`
     - Value: `https://u-and-i-backend.onrender.com` (URL backend lấy từ Bước 1).
5. **CẤU HÌNH SPA REWRITE (BẮT BUỘC)**:
   - Mở tab **Redirects / Rewrites** trong cài đặt của Static Site.
   - Nhấn **Add Rule**:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
   - Nhấn **Save Changes**. *(Quy tắc này đảm bảo khi người dùng tải lại trang tại `/booking/new`, `/profile` hoặc `/admin` sẽ không bị lỗi 404)*.
6. Nhấn **Create Static Site**.

---

## G. CÁCH KIỂM TRA DEPLOYMENT THÀNH CÔNG

1. **Kiểm tra Backend**:
   - Truy cập `https://<backend-url>/api/health`. Trình duyệt trả về:
     ```json
     {"code":200,"message":"API is healthy.","data":{}}
     ```
   - Truy cập giao diện quản trị PocketBase: `https://<backend-url>/_/`
   - Đăng nhập bằng tài khoản Superuser (`PB_ADMIN_EMAIL` và `PB_ADMIN_PASSWORD`) để xem toàn bộ danh mục collections đã được tự động áp dụng qua `pb_migrations`.
2. **Kiểm tra Frontend**:
   - Truy cập `https://<frontend-url>`.
   - Mở DevTools (`F12`) -> Tab Console: Đảm bảo không có lỗi kết nối CORS hoặc thiếu `VITE_POCKETBASE_URL`.
   - Đăng nhập tài khoản Demo:
     - Khách hàng: `customer@demo.local` / `Demo@123456`
     - Điều phối viên: `dispatcher@demo.local` / `Demo@123456`
     - Quản trị viên: `admin@demo.local` / `Admin@123456`
   - Thử nghiệm gửi 1 yêu cầu Booking mới, chuyển tab qua Điều phối viên duyệt và kiểm tra cập nhật tiến độ theo thời gian thực.
   - Thử nghiệm refresh trang (`F5`) tại đường dẫn `/profile` để xác nhận SPA Rewrite hoạt động hoàn hảo.

---

## H. CÁC RỦI RO CẦN LƯU Ý VÀ GIẢI PHÁP

### 1. Gói Render Free Tier & Hiện tượng Cold Start
- **Hiện tượng**: Trên gói Free, Render Web Service sẽ tự động "ngủ" (spin down) sau 15 phút không nhận được lưu lượng truy cập.
- **Tác động**: Lần truy cập đầu tiên sau khi ngủ sẽ mất khoảng 30 - 50 giây để container khởi động lại (Cold Start). Sau khi thức, hệ thống phản hồi cực nhanh.
- **Giải pháp**: Nếu phục vụ thuyết trình đánh giá hoặc chấm điểm môn học, hãy truy cập website trước 2 phút hoặc dùng công cụ ping định kỳ miễn phí (như UptimeRobot hoặc Cron-job) để giữ máy chủ luôn hoạt động.

### 2. Bộ nhớ tạm thời (Ephemeral Disk) trên Render Free vs Lưu trữ bền vững
- **Hiện tượng**: Gói Render Free không hỗ trợ Persistent Disk (ổ cứng bền vững). Mọi dữ liệu SQLite ghi vào container và file upload trong `/pb/pb_data` sẽ bị xóa và reset về trạng thái ban đầu khi service restart hoặc deploy phiên bản mới.
- **Giải pháp**:
  - Đối với dự án trình diễn / đồ án đại học: Các tệp migration trong `backend/pb_migrations` tự động tạo mới toàn bộ cấu trúc bảng và schema chuẩn khi container khởi động lại. Bạn có thể chạy script `node scripts/seed.js` để nạp lại dữ liệu mẫu tức thì.
  - Đối với môi trường Production thực tế: Nâng cấp Web Service lên gói Starter ($7/tháng) và gắn thêm Render Persistent Disk ($0.25/GB/tháng) gắn vào mount path `/pb/pb_data`, HOẶC cấu hình PocketBase đẩy file đính kèm sang AWS S3 / Cloudflare R2 miễn phí (hỗ trợ sẵn trong mục PocketBase Admin Settings > Files storage).

---

## I. QUY TRÌNH ROLLBACK KHI GẶP SỰ CỐ

1. Truy cập [dashboard.render.com](https://dashboard.render.com).
2. Chọn dịch vụ bị lỗi (`u-and-i-frontend` hoặc `u-and-i-backend`).
3. Chọn tab **Events** hoặc **Deploys**.
4. Tìm bản build gần nhất hoạt động ổn định (có trạng thái `Live`).
5. Nhấn vào biểu tượng menu ba chấm `...` cạnh bản deploy đó và chọn **Rollback to this deploy**.
6. Render sẽ kích hoạt lại bản build đã chọn trong vòng chưa đầy 30 giây.
