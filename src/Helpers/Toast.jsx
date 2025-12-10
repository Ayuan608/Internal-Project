import React from "react";

import PunchInPopup from "./PunchInPopup";
import PunchOutConfirmModal from "./PunchOutConfirmModal";
import SmokeBreakModal from "./SmokeBreakModal"; 
import WCBreakModal from "./WCBreakModal";
import LunchBreakModal from "./LunchBreakModal";

const PopupManager = ({ popupType, setPopupType, extra }) => {
  if (!popupType) return null;

  const close = () => setPopupType(null);

  return (
    <>
      {popupType === "punch-in" && (
        <PunchInPopup onClose={close} timestamp={extra} />
      )}

      {popupType === "punch-out" && (
        <PunchOutConfirmModal
          onClose={close}
          onConfirm={extra?.onConfirm}
        />
      )}

      {popupType === "break-smoke" && (
        <SmokeBreakModal onClose={close} />
      )}

      {popupType === "break-wc" && <WCBreakModal onClose={close} />}

      {popupType === "break-lunch" && <LunchBreakModal onClose={close} />}
    </>
  );
};

export default PopupManager;
