import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

function LanguageChange() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const languages = [
    { code: "zh", name: "中文" },
    { code: "en", name: "English" },
    { code: "vi", name: "Tiếng Việt" },
    { code: "km", name: "ភាសាខ្មែរ" }
  ];

  // Get current language name
  const getCurrentLanguageName = () => {
    const current = languages.find(lang => lang.code === i18n.language);
    return current ? current.name : "English";
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSelect = (langCode, langName) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 bg-[#282e3c61] text-white px-3 py-2 rounded-full hover:bg-[#282e3c93] transition"
      >
        <span>{getCurrentLanguageName()}</span>
        <ChevronDown 
          size={16} 
          className={`${open ? "rotate-180" : "rotate-0"} transition-transform`} 
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-slate-900 text-white rounded-lg shadow-lg border border-slate-700 z-50 animate-fadeIn">
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => handleSelect(lang.code, lang.name)}
              className={`px-4 py-2 cursor-pointer hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg ${
                i18n.language === lang.code ? "bg-slate-700/60" : ""
              }`}
            >
              {lang.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageChange;