import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

function LanguageChange() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "zh", name: "中文" },
    { code: "vi", name: "Tiếng Việt" },
    { code: "km", name: "ភាសាខ្មែរ" },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setOpen(false);
  };

  const current = languages.find((l) => i18n.language.startsWith(l.code)) || languages[0];

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 bg-[#282e3c61] text-white px-3 py-2 rounded-full hover:bg-[#282e3c93] transition"
      >
        <span>{current.name}</span>
        <ChevronDown
          size={16}
          className={`${open ? "rotate-180" : "rotate-0"} transition-transform`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-slate-900 text-white rounded-lg shadow-lg border border-slate-700 z-50">
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`px-4 py-2 cursor-pointer hover:bg-slate-700 ${
                i18n.language.startsWith(lang.code) ? "bg-slate-700/60" : ""
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
