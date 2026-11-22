# BÁO CÁO PHÂN TÍCH THIẾT KẾ GIAO DIỆN MOCKUP (MOCKUP ANALYSIS SPECIFICATION)
## Dự án: U&I Logistics Customer Portal & TMS Dispatcher System (PWA)

---

## 1. TỔNG QUAN HỆ THỐNG MOCKUP

Bộ mockup thiết kế chuẩn cho U&I Logistics Customer Portal được lưu trữ tại thư mục `Mockuo/` bao gồm 6 màn hình nghiệp vụ chính và 1 màn hình tổng quan (Showcase):
1. **Screen 1 - Login Screen**: `Mockuo/U&I Logistics Customer Portal Login.png` (Độ phân giải gốc: 1672 x 941 px, tỷ lệ Desktop / Tablet / Mobile responsive).
2. **Screen 2 - Customer Home Dashboard**: `Mockuo/U&I Logistics Customer Portal Dashboard.png` (Độ phân giải gốc: 887 x 1774 px, viewport di động chuẩn iPhone).
3. **Screen 3 - Transport Request Form**: `Mockuo/U&I Logistics Transport Request Form.png` (Độ phân giải gốc: 1024 x 1536 px, form tạo yêu cầu vận chuyển đa bước).
4. **Screen 4 - Time Change Proposal UI**: `Mockuo/Vietnamese Logistics Time Change Proposal UI.png` (Độ phân giải gốc: 1024 x 1536 px, đề xuất thay đổi lịch trình vận tải).
5. **Screen 5 - Logistics Tracking Progress Dashboard**: `Mockuo/Logistics Tracking Progress Dashboard.png` (Độ phân giải gốc: 1024 x 1536 px, timeline thời gian thực 7 giai đoạn vận chuyển).
6. **Screen 6 - Company Profile & Shipping Defaults**: `Mockuo/U&I Logistics Company Profile Edit.png` (Độ phân giải gốc: 1024 x 1536 px, hồ sơ doanh nghiệp và cấu hình tự động điền form).
7. **System Overview - Showcase**: `Mockuo/U&I Logistics Customer Portal Showcase.png` (Độ phân giải gốc: 1672 x 941 px, mô tả kiến trúc đa thiết bị và điểm nổi bật).

---

## 2. PHÂN TÍCH CHI TIẾT TỪNG MÀN HÌNH MOCKUP

### 2.1. SCREEN 1: MÀN HÌNH ĐĂNG NHẬP (CUSTOMER PORTAL LOGIN)
- **Tệp nguồn**: `Mockuo/U&I Logistics Customer Portal Login.png`
- **Tỷ lệ & Kích thước**: 1672 x 941 px (Tỷ lệ 16:9 Desktop với layout Card nổi trên nền chụp thực tế kho vận).
- **Hệ màu chủ đạo (Color Palette)**:
  - Deep Navy Blue (Brand Primary): `#004ba0`
  - Dark Blue (Background Gradient): `#00224b` đến `#003c7a`
  - Vibrant Industrial Orange (Brand Accent / Swoosh): `#f37021`
  - Pure White (Card surface): `#ffffff`
  - Neutral Slate Text: `#1e293b` (tiêu đề), `#64748b` (phụ đề, placeholder)
  - Interactive Action Blue: `#0066cc` (hover `#0052a3`)
- **Phần hình ảnh thương hiệu (Left Brand Section)**:
  - Background ảnh chụp thực tế trung tâm phân phối kho ngoại quan U&I Logistics với xe đầu kéo container mang nhận diện thương hiệu "U&I Logistics®", cổng xuất nhập hàng dock 01, 02, 03, xe nâng (forklift) và kiện hàng pallet.
  - Đường lượn sóng nhận diện thương hiệu U&I (Brand Swoosh) màu cam `#f37021` phân tách mềm mại giữa phần ảnh và nền trời.
  - Logo U&I Logistics® màu trắng kèm chữ nổi: "Customer Portal (PWA)".
  - Dòng định vị tính năng: `🖥 Gửi yêu cầu • Đề xuất thay đổi thời gian • Theo dõi tiến độ`.
- **Thẻ đăng nhập (Login Card Component)**:
  - Card bo tròn góc lớn (`rounded-3xl` ~ 24px), viền mờ bóng đổ sâu (`shadow-2xl shadow-blue-900/30`).
  - Biểu tượng User Avatar hình tròn màu xanh `#0066cc` viền trắng.
  - Tiêu đề: `Đăng nhập`, phụ đề: `Cổng thông tin khách hàng U&I Logistics`.
  - Input `Email / Tên đăng nhập`: Icon thư điện tử, border xám nhạt `border-slate-300`, placeholder rõ ràng.
  - Input `Mật khẩu`: Icon ổ khóa bên trái, icon con mắt (toggle show/hide password) bên phải.
  - Checkbox `Ghi nhớ đăng nhập` (Remember me) bên trái; Link `Quên mật khẩu?` màu xanh thương hiệu bên phải.
  - Nút bấm chính `Đăng nhập` (Primary CTA): Nền xanh `#0066cc`, bo góc lớn (`rounded-xl`), biểu tượng đăng nhập `->`.
  - Divider phân cách: `Hoặc đăng nhập bằng`.
  - Nút SSO Doanh nghiệp: `Tài khoản Microsoft (nếu được cấp)` kèm logo 4 ô vuông Microsoft.
  - Nút cài đặt PWA: Tag `PWA` màu xanh, nhãn `Cài đặt ứng dụng (Thêm vào màn hình chính)` kèm icon tải xuống.

---

### 2.2. SCREEN 2: BẢNG ĐIỀU KHIỂN KHÁCH HÀNG (CUSTOMER HOME DASHBOARD)
- **Tệp nguồn**: `Mockuo/U&I Logistics Customer Portal Dashboard.png`
- **Tỷ lệ & Kích thước**: 887 x 1774 px (Tỷ lệ 9:19.5 chuẩn iPhone 14/15 Pro Max PWA).
- **Thanh trạng thái & App Header**:
  - iOS Status Bar: 9:41, biểu tượng sóng di động, wifi, phần trăm pin.
  - AppHeader: Nút menu điều hướng (Hamburger icon), Logo U&I Logistics® ở giữa, Chuông thông báo (kèm chấm đỏ alert), Avatar tài khoản người dùng.
- **Hero Banner Chào mừng (Greeting Section)**:
  - Ảnh nền kho hàng và xe container U&I Logistics kết hợp dải sóng cam nhận diện thương hiệu.
  - Lời chào cá nhân hóa: `Xin chào, Công ty ABC Trading 👋`
  - Thông điệp định hướng: `Quản lý yêu cầu vận chuyển và theo dõi tiến độ cùng U&I Logistics`.
- **3 Thẻ Hành Động Nhanh (Quick Action Cards)**:
  1. **Thẻ 1 (Blue Theme)**:
     - Biểu tượng tài liệu cộng `[+]` nền xanh nhạt.
     - Tiêu đề: `Tạo yêu cầu vận chuyển`
     - Mô tả: `Gửi yêu cầu vận chuyển, điều xe, container`
     - Mũi tên điều hướng `>` màu xanh.
  2. **Thẻ 2 (Orange Theme)**:
     - Biểu tượng lịch chỉnh sửa nền cam nhạt.
     - Tiêu đề: `Đề xuất sửa thời gian`
     - Mô tả: `Đề nghị thay đổi thời gian lấy hàng, đóng hàng hoặc giao hàng`
     - Mũi tên điều hướng `>` màu cam.
  3. **Thẻ 3 (Purple Theme)**:
     - Biểu tượng xe tải giao hàng nền tím nhạt.
     - Tiêu đề: `Theo dõi tiến độ`
     - Mô tả: `Xem trạng thái xử lý và vận chuyển theo thời gian thực`
     - Mũi tên điều hướng `>` màu tím.
- **Khối Tổng quan yêu cầu (Request Metrics Overview - 30 ngày gần nhất)**:
  - Chia 4 cột thống kê trực quan với màu sắc trạng thái tương ứng:
    1. `12` | Icon Clipboard xanh | `Tổng yêu cầu`
    2. `7` | Icon Tích xanh lá | `Đang thực hiện`
    3. `3` | Icon Đồng hồ cam | `Chờ xử lý`
    4. `2` | Icon Cảnh báo đỏ | `Thay đổi lịch`
- **Danh sách Yêu cầu gần đây (Recent Requests List)**:
  - Header: `Yêu cầu gần đây` kèm liên kết `Xem tất cả >`.
  - Item 1:
    - Mã yêu cầu: `REQ-250828-001`
    - Icon xe tải xanh.
    - Tuyến đường: `Kho U&I Bình Dương → Cảng Cát Lái`
    - Thời gian: `📅 29/08/2025 08:00`
    - Huy hiệu trạng thái (Badge): `🟢 Đang thực hiện` (Nền xanh nhạt, chữ xanh đậm).
  - Item 2:
    - Mã yêu cầu: `REQ-250827-015`
    - Icon lịch cam.
    - Tuyến đường: `Kho U&I HCM → Cảng Cái Mép`
    - Thời gian cập nhật: `📅 29/08/2025 14:00 → 29/08/2025 10:00`
    - Huy hiệu trạng thái: `🟠 Chờ phê duyệt` (Nền cam nhạt, chữ cam đậm).
- **Thanh điều hướng đáy (Bottom Navigation Bar)**:
  - 4 tab cố định: `Trang chủ` (active icon với nền capsule xanh nhạt), `Tạo yêu cầu`, `Theo dõi`, `Lịch sử`.

---

### 2.3. SCREEN 3: BIỂU MẪU TẠO YÊU CẦU VẬN CHUYỂN (TRANSPORT REQUEST FORM)
- **Tệp nguồn**: `Mockuo/U&I Logistics Transport Request Form.png`
- **Tỷ lệ & Kích thước**: 1024 x 1536 px (Mobile Stepper Form).
- **Thanh tiến trình 3 bước (Stepper Header)**:
  - Nút quay lại `<` (Back button).
  - Tiêu đề: `Tạo yêu cầu vận chuyển` - `Gửi yêu cầu điều xe, vận chuyển container`.
  - 3 bước quy trình:
    - Bước 1: `Nhập thông tin` (Đang chọn - Vòng tròn số 1 xanh dương đậm, line nối xanh).
    - Bước 2: `Xác nhận` (Số 2 xám).
    - Bước 3: `Gửi yêu cầu` (Số 3 xám).
- **Nhóm 1: Thông tin chung (General Information)**:
  - `Loại yêu cầu *`: Dropdown chọn loại dịch vụ (Mặc định: `Vận chuyển container xuất khẩu`).
  - `Mã đơn hàng / Booking *`: Input kèm icon barcode mã vạch (Giá trị mẫu: `BK250828-001`).
- **Nhóm 2: Thông tin vận chuyển (Transport & Route Logistics)**:
  - `Điểm lấy hàng (Kho) *`: Dropdown chọn kho đóng hàng (Ví dụ: `Kho U&I Bình Dương`).
  - `Điểm giao hàng *`: Dropdown chọn cảng hạ hàng / bãi ICD (Ví dụ: `Cảng Cát Lái`).
  - `Thời gian lấy hàng dự kiến *`: Trường kép gồm ngày `29/08/2025` và giờ `08:00`.
  - `Thời gian giao dự kiến *`: Trường kép gồm ngày `29/08/2025` và giờ `14:00`.
  - `Số lượng container *`: Bộ điều khiển tăng giảm số nguyên `[-] 2 [+]`.
  - `Loại container *`: Dropdown phân loại (`40'HC`, hỗ trợ thêm `20' thường`, `40' thường`, `40' cao`).
- **Nhóm 3: Thông tin bổ sung (Notes & Attachments)**:
  - `Ghi chú yêu cầu đặc biệt (nếu có)`: Khung văn bản nhiều dòng kèm bộ đếm ký tự `0 / 500`.
  - `Đính kèm tài liệu (Booking, Packing list, ...)`: Khu vực tải tệp tin, hiển thị trạng thái `Đã chọn 1 file`.
- **Thanh tác vụ cố định phía dưới (Sticky Actions)**:
  - Nút phụ: `Hủy` (Nền trắng viền xanh).
  - Nút chính: `Gửi yêu cầu` (Nền xanh `#0066cc`, icon máy bay giấy gửi đi).
  - Tích hợp thêm nghiệp vụ TMS: `Lưu bản nháp (DRAFT)` và bảng chi tiết danh sách container theo yêu cầu của hệ thống vận hành.

---

### 2.4. SCREEN 4: ĐỀ XUẤT SỬA THỜI GIAN (TIME CHANGE PROPOSAL UI)
- **Tệp nguồn**: `Mockuo/Vietnamese Logistics Time Change Proposal UI.png`
- **Tỷ lệ & Kích thước**: 1024 x 1536 px.
- **Tiêu đề & Tiến trình (Stepper)**:
  - Header: Icon lịch cam, tiêu đề `Đề xuất sửa thời gian`, mô tả: `Đề nghị thay đổi thời gian lấy hàng, đóng hàng hoặc giao hàng`.
  - 3 bước đề xuất: `1. Chọn yêu cầu` -> `2. Nhập thay đổi` -> `3. Gửi đề xuất`.
- **Card thông tin yêu cầu hiện tại (Current Booking Reference Card)**:
  - Nền xám xanh nổi bật thông tin:
    - Mã yêu cầu: `REQ-250828-001` kèm Badge trạng thái `🟢 Đang thực hiện`.
    - Tuyến vận chuyển: `Kho U&I Bình Dương → Cảng Cát Lái`.
    - Thời gian lấy hàng gốc: `29/08/2025 08:00`.
    - Thời gian giao hàng gốc: `29/08/2025 14:00`.
    - Số lượng container: `2 (40'HC)`.
- **Nhóm thông tin thay đổi đề xuất (Proposed Schedule Inputs)**:
  - `Loại thay đổi *`: Checkbox đa lựa chọn:
    - `[✓] Thời gian lấy hàng`
    - `[ ] Thời gian giao hàng`
    - `[ ] Cả hai`
  - `Thời gian lấy hàng mới *`: Ngày `30/08/2025` + Giờ `10:00`.
  - `Thời gian giao hàng mới`: Ngày `30/08/2025` + Giờ `16:00` (ở chế độ disable nếu chỉ chọn lấy hàng).
  - `Lý do thay đổi *`: Textarea nhập lý do điều chỉnh (`Khách hàng thay đổi kế hoạch đóng hàng, lùi thời gian lấy hàng 1 ngày.`, đếm ký tự `70 / 500`).
- **Nhóm tệp đính kèm**:
  - Hiển thị danh sách file biên bản xác nhận: `📄 Lịch đóng hàng cập nhật.pdf (350 KB)` kèm nút xóa `✕`.
  - Nút thêm tệp: `⊕ Thêm file`.
- **Nút tác vụ**:
  - `Hủy` (Secondary) và `Gửi đề xuất` (Primary Blue Button).

---

### 2.5. SCREEN 5: THEO DÕI TIẾN ĐỘ THỜI GIAN THỰC (TRACKING DASHBOARD)
- **Tệp nguồn**: `Mockuo/Logistics Tracking Progress Dashboard.png`
- **Tỷ lệ & Kích thước**: 1024 x 1536 px.
- **Bộ lọc & Tìm kiếm nhanh**:
  - Ô tìm kiếm: `🔍 Nhập mã yêu cầu, booking, container...`
  - Nút icon lọc nâng cao.
- **Thẻ tóm tắt yêu cầu được chọn**:
  - Mã: `REQ-250828-001`
  - Tuyến: `Kho U&I Bình Dương → Cảng Cát Lái`
  - Trạng thái: `🟢 Đang vận chuyển`
- **Hệ thống Tab chức năng**:
  - Tab 1: `Tiến độ` (Active, icon chìa khóa/hành trình, gạch chân xanh dương).
  - Tab 2: `Thông tin chi tiết` (Icon văn bản).
  - Tab 3: `Lịch sử thay đổi` (Icon đồng hồ lịch sử).
- **Trục tiến độ dọc 5 mốc chính (Vertical Logistics Timeline)**:
  1. `Mốc 1: Đã tiếp nhận yêu cầu` - Icon tích xanh tròn, thời gian: `28/08/2025 08:15`.
  2. `Mốc 2: Đã xác nhận & lập kế hoạch` - Icon tích xanh tròn, thời gian: `28/08/2025 09:00`.
  3. `Mốc 3: Đang đóng hàng tại kho` - Icon tích xanh tròn, thời gian: `29/08/2025 08:10 – 09:30`.
  4. `Mốc 4: Đang vận chuyển` (Giai đoạn đang diễn ra - Highlight Card):
     - Chấm xanh dương phát sáng / viền đậm.
     - Thời gian xuất phát: `29/08/2025 09:45`.
     - Nhãn dự kiến đến: `📍 Dự kiến đến: 14:00`.
  5. `Mốc 5: Hoàn tất tại cảng` - Mốc kế tiếp đang chờ (Vòng tròn xám outline), ghi chú: `Dự kiến: 29/08/2025 14:00`.
- **Thông số điều vận thực tế (Dispatch Execution Box)**:
  - Khung thông tin 3 trường:
    - `Số container`: `2 (40'HC)`
    - `Biển số xe`: `51D-123.45`
    - `Tài xế`: `Nguyễn Văn Minh` kèm nút gọi điện thoại trực tiếp `📞`.
- **Khung thông báo ghi chú của tài xế / điều phối viên**:
  - Icon thông tin `ⓘ Ghi chú`: `Xe đang di chuyển đến Cảng Cát Lái. Dự kiến đến đúng lịch.`

---

### 2.6. SCREEN 6: HỒ SƠ DOANH NGHIỆP & CẤU HÌNH TỰ ĐỘNG ĐIỀN (COMPANY PROFILE EDIT)
- **Tệp nguồn**: `Mockuo/U&I Logistics Company Profile Edit.png`
- **Tỷ lệ & Kích thước**: 1024 x 1536 px.
- **Thẻ danh tính doanh nghiệp (Header Profile Card)**:
  - Biểu tượng tòa nhà văn phòng trong hình tròn xanh.
  - Tên doanh nghiệp: `Công ty ABC Trading`
  - Mã khách hàng hệ thống: `Mã khách hàng: CUS-000123`
  - Huy hiệu bảo chứng: `✓ Đã xác thực` (Green verified badge).
- **Hệ thống Tab điều hướng hồ sơ (Profile Tabs)**:
  - Tab 1: `Thông tin công ty` (Active).
  - Tab 2: `Địa chỉ & Kho`.
  - Tab 3: `Người liên hệ`.
  - Tab 4: `Tùy chọn`.
- **Phần 1: Thông tin pháp lý công ty**:
  - Chú thích: `ⓘ Thông tin này sẽ được tự động điền khi bạn tạo yêu cầu vận chuyển.`
  - Cột 1: `Tên công ty *` -> Giá trị: `Công ty ABC Trading`.
  - Cột 2: `Mã số thuế *` -> Giá trị: `0312345678`.
  - Cột 3: `Email nhận thông báo *` -> Giá trị: `logistics@abctrading.com`.
  - Cột 4: `Số điện thoại *` -> Giá trị: `028 3999 8888`.
- **Phần 2: Thông tin mặc định cho yêu cầu vận chuyển (Shipping Defaults Auto-fill)**:
  - Chú thích: `ⓘ Các thông tin thường dùng sẽ được tự động gợi ý khi tạo yêu cầu mới.`
  - Dropdown `Loại container mặc định`: `40'HC`.
  - Dropdown `Điểm lấy hàng (kho mặc định)`: `Kho U&I Bình Dương`.
  - Dropdown `Điểm giao hàng (mặc định)`: `Cảng Cát Lái`.
  - Dropdown `Loại yêu cầu mặc định`: `Vận chuyển container xuất khẩu`.
- **Phần 3: Thông tin bổ sung mặc định**:
  - Textarea: `Ghi chú mặc định (nếu có, ví dụ: yêu cầu chứng từ, quy định đóng hàng, ...)` với bộ đếm `0 / 500`.
- **Tác vụ lưu**:
  - Nút phụ: `Hủy`.
  - Nút chính: `Lưu thay đổi` (Icon đĩa mềm lưu dữ liệu `💾`).

---

## 3. BẢNG TỔNG HỢP THÔNG SỐ THIẾT KẾ & QUY CHUẨN ĐỒ HỌA (DESIGN TOKENS)

| Thành phần | Mã màu / Kích thước chuẩn | Ứng dụng cụ thể trong hệ thống |
| :--- | :--- | :--- |
| **Brand Primary Blue** | `#004ba0` / RGB(0, 75, 160) | Header, AppBar, Logo, Viền thẻ chính |
| **Brand Deep Navy** | `#00224b` đến `#003366` | Nền gradient màn hình Login, Footer nền tối |
| **Brand Accent Blue** | `#0066cc` | Primary Button (CTA), Radio active, Stepper active |
| **Brand Accent Orange** | `#f37021` | Brand swoosh wave, Thẻ đề xuất đổi giờ, Cảnh báo |
| **Status Green (Success)** | `#16a34a` / Nền `#dcfce7` | Đang thực hiện, Đã duyệt, Đã hoàn tất, Đã xác thực |
| **Status Amber (Pending)**| `#d97706` / Nền `#fef3c7` | Chờ xử lý, Chờ phê duyệt, Đề xuất mới |
| **Status Red (Urgent)**   | `#dc2626` / Nền `#fee2e2` | Thay đổi lịch, Từ chối yêu cầu, Lỗi biểu mẫu |
| **Font chữ chuẩn**        | `Inter, -apple-system, sans-serif` | Toàn bộ giao diện Web, PWA Mobile & Desktop |
| **Bán kính bo góc (Radius)**| `12px` (inputs), `16px` (cards), `24px` (modal/containers) | Đảm bảo tính hiện đại, mềm mại của ứng dụng PWA |
| **Khoảng cách (Spacing)** | 4px, 8px, 12px, 16px, 20px, 24px | Hệ thống lưới Tailwind 4-base grid đồng bộ |
