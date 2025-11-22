import { useEffect, useState } from "react";
import MailingSidebar from "./MailingSidebar";
import Mailing from "./Mailing";
import MailView from "./MailView";
import { AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getAllCaseMails } from "../../redux/statSlice";

export default function InternalMailingPage() {
  const dispatch = useDispatch();

  // Redux mails (backend)
  const caseMails = useSelector((state) => state.stat.caseMails || []);

  const [selectedMail, setSelectedMail] = useState(null);
  const [selectedPage, setSelectedPage] = useState("Inbox");
  const [allMails, setAllMails] = useState([]);
  const [mailCounts, setMailCounts] = useState({
    Inbox: 0,
    starred: 0,
    sent: 0,
    draft: 0,
    trash: 0,
  });

  // LOAD BACKEND MAILS
  useEffect(() => {
    dispatch(getAllCaseMails());
  }, [dispatch]);

  // Convert backend mails → UI mail objects
  useEffect(() => {
    if (!Array.isArray(caseMails) || caseMails.length === 0) return;

    const formatted = caseMails.map((mail) => ({
      id: mail._id || Math.random().toString(36).slice(2, 9),
      type: "Inbox",
      originalType: "Inbox",
      starred: false,
      priority: "Normal",
      subject: mail.title || "(No Subject)",
      from: mail.sentBy || "Team Leader",
      to:
        Array.isArray(mail.sentTo) && mail.sentTo.length > 0
          ? mail.sentTo[0]
          : "User",
      date: mail.createdAt
        ? new Date(mail.createdAt).toLocaleString()
        : new Date().toLocaleString(),
      body: mail.content || "",
    }));

    setAllMails(formatted);
  }, [caseMails]);

  const handleSelectMail = (mail) => {
    setSelectedMail(mail.id === selectedMail?.id ? null : mail);
  };

  const closeMailView = () => setSelectedMail(null);

  return (
    <div
      className="grid grid-cols-[220px_1fr] h-screen"
   
    >
      <MailingSidebar
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        mailCounts={mailCounts}
      />

      <div
        className={`grid transition-all duration-300 ${
          selectedMail ? "grid-cols-[1fr_380px]" : "grid-cols-[1fr]"
        }`}
      >
        <Mailing
          selectedPage={selectedPage}
          allMails={allMails}
          setAllMails={setAllMails}
          onSelectMail={handleSelectMail}
          setMailCounts={setMailCounts}
          setSelectedPage={setSelectedPage}
        />

        <AnimatePresence>
          {selectedMail && (
            <MailView mail={selectedMail} onClose={closeMailView} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
