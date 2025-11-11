// src/i18n.js
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: "en",

    // ✅ Detect language from localStorage or browser automatically
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
      bindI18n: "languageChanged loaded", // re-render on change
      bindI18nStore: "added removed",
    },

    resources: {
      en: {
        translation: {
          greeting: "Hello, Welcome",
          dashboard: "Dashboard",
          home: "Home",
          users: "Users",
          Settings: "Settings",
          logout: "Logout",
          profile: "Profile",

          "Dashboard": "Dashboard",
          "Department": "Department",
          "Quota Settings": "Quota Settings",
          "Directory": "Directory",
          "Announcements": "Announcements",
          "Reports": "Reports",
          "Overall Attendance": "Overall Attendance",
          "Login Credentials": "Login Credentials",
          "Storage": "Storage",
          "Emp of Month": "Employee of the Month",
          "Activity Logs": "Activity Logs",
          "IP-Whitelist": "IP Whitelist",
          "User Dashboard": "User Dashboard",
          "Admin Dashboard": "Admin Dashboard",
          "Super-Admin Dashboard": "Super Admin Dashboard",
          "Team-Leader Dashboard": "Team Leader Dashboard",
          "Checker Dashboard": "Checker Dashboard",

          attendance: "Attendance",
          dailyTimeRecord: "Daily Time Record",
          announcement: "Announcement",
          report: "Report",

          search: "Search",
          notifications: "Notifications",
          save: "Save",
          cancel: "Cancel",
          edit: "Edit",
          delete: "Delete",
          view: "View All",
          bindGoogle: "Bind Google",
          draftTemplate: "Draft Template",
        },
      },

      zh: {
        translation: {
          greeting: "你好，欢迎",
          dashboard: "仪表板",
          home: "主页",
          users: "用户",
          Settings: "设置",
          logout: "登出",
          profile: "个人资料",

          "Dashboard": "仪表板",
          "Department": "部门",
          "Quota Settings": "配额设置",
          "Directory": "目录",
          "Announcements": "公告",
          "Reports": "报告",
          "Overall Attendance": "整体考勤",
          "Login Credentials": "登录凭据",
          "Storage": "存储",
          "Emp of Month": "本月员工",
          "Activity Logs": "活动日志",
          "IP-Whitelist": "IP白名单",

          "User Dashboard": "用户仪表板",
          "Admin Dashboard": "管理员仪表板",
          "Super-Admin Dashboard": "超级管理员仪表板",
          "Team-Leader Dashboard": "团队领导仪表板",
          "Checker Dashboard": "检查员仪表板",

          attendance: "考勤",
          dailyTimeRecord: "每日时间记录",
          announcement: "公告",
          report: "报告",

          search: "搜索",
          notifications: "通知",
          save: "保存",
          cancel: "取消",
          edit: "编辑",
          delete: "删除",
          view: "查看全部",
          bindGoogle: "绑定谷歌",
          draftTemplate: "草稿模板",
        },
      },

      vi: {
        translation: {
          greeting: "Xin chào, Chào mừng",
          dashboard: "Bảng điều khiển",
          home: "Trang chủ",
          users: "Người dùng",
          Settings: "Cài đặt",
          logout: "Đăng xuất",
          profile: "Hồ sơ",

          "Dashboard": "Bảng điều khiển",
          "Department": "Phòng ban",
          "Quota Settings": "Cài đặt hạn ngạch",
          "Directory": "Thư mục",
          "Announcements": "Thông báo",
          "Reports": "Báo cáo",
          "Overall Attendance": "Điểm danh tổng thể",
          "Login Credentials": "Thông tin đăng nhập",
          "Storage": "Lưu trữ",
          "Emp of Month": "Nhân viên của tháng",
          "Activity Logs": "Nhật ký hoạt động",
          "IP-Whitelist": "Danh sách trắng IP",
          "User Dashboard": "Bảng điều khiển người dùng",
          "Admin Dashboard": "Bảng điều khiển quản trị",
          "Super-Admin Dashboard": "Bảng điều khiển quản trị viên",
          "Team-Leader Dashboard": "Bảng điều khiển trưởng nhóm",
          "Checker Dashboard": "Bảng điều khiển kiểm tra",

          attendance: "Điểm danh",
          dailyTimeRecord: "Bản ghi thời gian hàng ngày",
          announcement: "Thông báo",
          report: "Báo cáo",

          search: "Tìm kiếm",
          notifications: "Thông báo",
          save: "Lưu",
          cancel: "Hủy",
          edit: "Chỉnh sửa",
          delete: "Xóa",
          view: "Xem tất cả",
          bindGoogle: "Liên kết Google",
          draftTemplate: "Mẫu nháp",
        },
      },

      km: {
        translation: {
          greeting: "សួស្តី, សូមស្វាគមន៍",
          dashboard: "ផ្ទាំងគ្រប់គ្រង",
          home: "ទំព័រដើម",
          users: "អ្នកប្រើប្រាស់",
          Settings: "ការកំណត់",
          logout: "ចាកចេញ",
          profile: "ប្រវត្តិរូប",

          "Dashboard": "ផ្ទាំងគ្រប់គ្រង",
          "Department": "នាយកដ្ឋាន",
          "Quota Settings": "ការកំណត់កូតា",
          "Directory": "ថត",
          "Announcements": "ប្រកាស",
          "Reports": "របាយការណ៍",
          "Overall Attendance": "វត្តមានទូទៅ",
          "Login Credentials": "ព័ត៌មានចូល",
          "Storage": "ការផ្ទុក",
          "Emp of Month": "បុគ្គលិកនៃខែ",
          "Activity Logs": "កំណត់ហេតុសកម្មភាព",
          "IP-Whitelist": "បញ្ជីសIP",

          "User Dashboard": "ផ្ទាំងគ្រប់គ្រងអ្នកប្រើប្រាស់",
          "Admin Dashboard": "ផ្ទាំងគ្រប់គ្រងអ្នកគ្រប់គ្រង",
          "Super-Admin Dashboard": "ផ្ទាំងគ្រប់គ្រងអ្នកគ្រប់គ្រងកំពូល",
          "Team-Leader Dashboard": "ផ្ទាំងគ្រប់គ្រងប្រធានក្រុម",
          "Checker Dashboard": "ផ្ទាំងគ្រប់គ្រងអ្នកពិនិត្យ",

          attendance: "វត្តមាន",
          dailyTimeRecord: "កំណត់ត្រាពេលវេលាប្រចាំថ្ងៃ",
          announcement: "ប្រកាស",
          report: "របាយការណ៍",

          search: "ស្វែងរក",
          notifications: "ការជូនដំណឹង",
          save: "រក្សាទុក",
          cancel: "បោះបង់",
          edit: "កែសម្រួល",
          delete: "លុប",
          view: "មើលទាំងអស់",
          bindGoogle: "ភ្ជាប់ Google",
          draftTemplate: "គំរូព្រាង",
        },
      },
    },
  });

export default i18n;
