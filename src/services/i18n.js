import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false, // Set to false to remove console warnings
    fallbackLng: 'en',
    lng: localStorage.getItem('language') || 'en',
    
    // This is important - add interpolation config
    interpolation: {
      escapeValue: false
    },
    
    resources: {
      en: {
        translation: {
          // Navigation & Common
          greeting: "Hello, Welcome",
          dashboard: "Dashboard",
          home: "Home",
          users: "Users",
          settings: "Settings",
          logout: "Logout",
          profile: "Profile",
          
          // Super Admin Menu Items (exactly matching Helper.js labels)
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
          
          // User Menu
          attendance: "Attendance",
          dailyTimeRecord: "Daily Time Record",
          announcement: "Announcement",
          report: "Report",
          
          // Actions
          search: "Search",
          notifications: "Notifications",
          save: "Save",
          cancel: "Cancel",
          edit: "Edit",
          delete: "Delete",
          view: "View All",
          bindGoogle: "Bind Google",
          draftTemplate: "Draft Template",
        }
      },
      
      zh: {
        translation: {
          // Navigation & Common
          greeting: "你好，欢迎",
          dashboard: "仪表板",
          home: "主页",
          users: "用户",
          settings: "设置",
          logout: "登出",
          profile: "个人资料",
          
          // Super Admin Menu Items (exactly matching Helper.js labels)
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
          
          // User Menu
          attendance: "考勤",
          dailyTimeRecord: "每日时间记录",
          announcement: "公告",
          report: "报告",
          
          // Actions
          search: "搜索",
          notifications: "通知",
          save: "保存",
          cancel: "取消",
          edit: "编辑",
          delete: "删除",
          view: "查看全部",
          bindGoogle: "绑定谷歌",
          draftTemplate: "草稿模板",
        }
      },
      
      vi: {
        translation: {
          // Navigation & Common
          greeting: "Xin chào, Chào mừng",
          dashboard: "Bảng điều khiển",
          home: "Trang chủ",
          users: "Người dùng",
          settings: "Cài đặt",
          logout: "Đăng xuất",
          profile: "Hồ sơ",
          
          // Super Admin Menu Items (exactly matching Helper.js labels)
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
          
          // User Menu
          attendance: "Điểm danh",
          dailyTimeRecord: "Bản ghi thời gian hàng ngày",
          announcement: "Thông báo",
          report: "Báo cáo",
          
          // Actions
          search: "Tìm kiếm",
          notifications: "Thông báo",
          save: "Lưu",
          cancel: "Hủy",
          edit: "Chỉnh sửa",
          delete: "Xóa",
          view: "Xem tất cả",
          bindGoogle: "Liên kết Google",
          draftTemplate: "Mẫu nháp",
        }
      },
      
      km: {
        translation: {
          // Navigation & Common
          greeting: "សួស្តី, សូមស្វាគមន៍",
          dashboard: "ផ្ទាំងគ្រប់គ្រង",
          home: "ទំព័រដើម",
          users: "អ្នកប្រើប្រាស់",
          settings: "ការកំណត់",
          logout: "ចាកចេញ",
          profile: "ប្រវត្តិរូប",
          
          // Super Admin Menu Items (exactly matching Helper.js labels)
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
          
          // User Menu
          attendance: "វត្តមាន",
          dailyTimeRecord: "កំណត់ត្រាពេលវេលាប្រចាំថ្ងៃ",
          announcement: "ប្រកាស",
          report: "របាយការណ៍",
          
          // Actions
          search: "ស្វែងរក",
          notifications: "ការជូនដំណឹង",
          save: "រក្សាទុក",
          cancel: "បោះបង់",
          edit: "កែសម្រួល",
          delete: "លុប",
          view: "មើលទាំងអស់",
          bindGoogle: "ភ្ជាប់ Google",
          draftTemplate: "គំរូព្រាង",
        }
      }
    }
  });

export default i18n;

