# 🌿 Cargill Lucky Draw — Year End Party 2025

Hệ thống quay thưởng web cho sự kiện Year End Party 2025 của Cargill Vietnam.

🔗 **Live demo:** _(sẽ cập nhật sau khi bật GitHub Pages)_

---

## ✨ Tính năng

- 📊 **Upload file Excel** danh sách nhân viên và giải thưởng (kéo & thả)
- 🎰 **Slot machine** hiệu ứng tên nhảy nhanh — tăng tính kích thích
- 🎁 **Quản lý giải thưởng**: chọn giải để quay, tự inactive khi quay xong
- 🏆 **Winner Circle real-time**: hiển thị người trúng theo nhóm giải, có STT, ID, Dept, Location
- 🔍 **Slicer filter**: lọc winner list theo giải đã quay
- 📊 **Thống kê cross-filter**: dashboard tương tác — click vào Location/Department/Nhóm giải để xem chi tiết
- ⚖️ **Phân bổ đều**: thuật toán round-robin theo Location → Department đảm bảo công bằng
- 📥 **Xuất Excel** danh sách trúng thưởng theo từng giải
- 🎨 Giao diện theo nhận diện thương hiệu Cargill (xanh #008544)

## 📋 Cấu trúc file Excel

File Excel cần có **2 sheet**:

### Sheet `List_User`
| Draw_ID | Draw_Name | Draw_Dept | Draw_Location | Draw_Prize |
|---------|-----------|-----------|---------------|------------|
| mtnguyen | Nguyen Thi Minh Ha | SC | GO Office | _(để trống)_ |
| ... | ... | ... | ... | ... |

> Cột `Draw_Prize` để trống. Nếu đã có giá trị (vd: đã trúng từ trước), người đó sẽ bị loại khỏi danh sách quay.

### Sheet `LIst_Prize`
| Tên giải | Số lượng | Giá trị |
|----------|----------|---------|
| Giải khuyến khích - Lần 1/4 | 40 | 500K |
| Giải Ba - Lần 1/2 | 25 | 1.000K |
| Giải Nhất - Lần 1/2 | 1 | 10.000K |

## 🚀 Cách sử dụng

1. Mở `index.html` trên trình duyệt (hoặc truy cập GitHub Pages link)
2. Kéo & thả file Excel danh sách vào màn hình upload
3. Chọn giải ở cột bên phải → nhấn **SPIN NOW**
4. Xem winner ở cột trái, thống kê chi tiết ở nút "📊 Xem Thống kê"
5. Xuất kết quả ra Excel khi cần

## 🛠️ Kỹ thuật

- Single-page HTML, **không cần server**
- Thư viện: [SheetJS](https://sheetjs.com) (đọc/ghi Excel), [canvas-confetti](https://github.com/catdad/canvas-confetti) (hiệu ứng)
- Fonts: Playfair Display + Be Vietnam Pro (Google Fonts)
- 100% chạy trên trình duyệt, không gửi dữ liệu lên server

## 📝 License

Internal use only — Cargill Vietnam.
