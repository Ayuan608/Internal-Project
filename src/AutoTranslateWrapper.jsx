import React, { useEffect } from "react";
import i18n from "./services/i18n";

const AutoTranslateWrapper = ({ children }) => {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const elements = document.querySelectorAll("body *:not(script):not(style)");
      elements.forEach((el) => {
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
          const text = el.innerText?.trim();
          if (text && !text.startsWith("{") && !text.includes("{{")) {
            const translated = i18n.t(text);
            if (translated !== text) el.innerText = translated;
          }
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
};

export default AutoTranslateWrapper;
