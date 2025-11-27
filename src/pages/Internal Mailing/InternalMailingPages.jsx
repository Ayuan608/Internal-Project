import { useEffect, useState } from "react";
import MailingSidebar from "./MailingSidebar";
import Mailing from "./Mailing";
import MailView from "./MailView";
import { AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getAllCaseMails, softDeleteMail, replyToMail, toggleArchiveMail, deleteMailPermanently } from "../../redux/statSlice";

export default function InternalMailingPage() {
  const dispatch = useDispatch();

  // Redux mails (backend)
  const caseMails = useSelector((state) => state.stat.caseMails || []);
  const loading = useSelector((state) => state.stat.loading);
  const currentUser = useSelector((state) => state.auth.data);
  console.log(currentUser)

  const [selectedMail, setSelectedMail] = useState(null);
  const [selectedPage, setSelectedPage] = useState("Inbox");
  const [allMails, setAllMails] = useState([]);
  const [mailCounts, setMailCounts] = useState({
    inbox: 0,
    sent: 0,
    drafts: 0,
    trash: 0,
    archived: 0,
  });

  // LOAD BACKEND MAILS
  useEffect(() => {
    dispatch(getAllCaseMails());
  }, [dispatch]);

  // Convert backend mails → UI mail objects with proper type classification
  useEffect(() => {
    if (!Array.isArray(caseMails) || caseMails.length === 0) {
      setAllMails([]);
      return;
    }

    console.log("Raw caseMails:", caseMails);
    console.log("Current User:", currentUser);

    const formatted = caseMails.map((mail) => {
      // CORRECT LOGIC: Check if current user is sender OR receiver
      const isSentByCurrentUser =
        mail.sentBy?.toLowerCase() === currentUser?.FullName?.toLowerCase();

      const isReceivedByCurrentUser =
        Array.isArray(mail.sentTo) &&
        mail.sentTo.some(email =>
          email?.toLowerCase() === currentUser?.email?.toLowerCase()
        );

      console.log("Mail:", mail.title);
      console.log("Sent by current user:", isSentByCurrentUser);
      console.log("Received by current user:", isReceivedByCurrentUser);


      let mailType = "Inbox";

      // Trash
      if (mail.isDeleted) {
        mailType = "Trash";
      }

      // Archived
      else if (Array.isArray(mail.archived) && mail.archived.includes(currentUser?._id)) {
        mailType = "Archived";
      }

      // Sent (sender)
      else if (mail.sentBy?.toLowerCase() === currentUser?.FullName?.toLowerCase()) {
        mailType = "Sent";
      }

      // Inbox = ALL mails (except deleted/archived/sent)
      else {
        mailType = "Inbox";
      }



      return {
        id: mail._id,
        type: mailType,
        priority: mail.priority || "Normal",
        subject: mail.title || "(No Subject)",
        from: mail.sentBy || "Unknown",
        to: Array.isArray(mail.sentTo) && mail.sentTo.length > 0 ? mail.sentTo.join(', ') : "User",
        date: mail.createdAt ? new Date(mail.createdAt).toLocaleString() : new Date().toLocaleString(),
        body: mail.content || "",
        replies: mail.replies || [],
        seenBy: mail.seenBy || [],
        labels: mail.labels || [],
        isDeleted: mail.isDeleted || false,
        archived: mail.archived || false,
        nature: mail.nature || "",
        recipientType: mail.recipientType || "",
        // Backend data for reference
        _raw: mail
      };
    }).filter(mail => mail !== null); // Remove null entries

    console.log("Formatted mails:", formatted);
    setAllMails(formatted);
  }, [caseMails, currentUser]);

  // Update mail counts
  useEffect(() => {
    const counts = {
      inbox: allMails.filter(m => !m.isDeleted && (!m.archived || m.archived.length === 0)).length,
      sent: allMails.filter(m => m.type === "Sent" && !m.isDeleted).length,
      drafts: 0,
      trash: allMails.filter(m => m.isDeleted).length,
      archived: allMails.filter(m => m.archived && m.archived.length > 0).length,
    };

    console.log("Final mail counts:", counts);
    setMailCounts(counts);
  }, [allMails]);

  const handleSelectMail = (mail) => {
    setSelectedMail(mail.id === selectedMail?.id ? null : mail);
  };
  const handleArchive = async (mailId) => {
    try {
      await dispatch(toggleArchiveMail(mailId)).unwrap(); // API call
      dispatch(getAllCaseMails()); // refresh mails
    } catch (error) {
      console.error("Failed to archive mail:", error);
    }
  };

  const closeMailView = () => setSelectedMail(null);

  // Handle delete with backend sync
  const handleDelete = async (mailId) => {
    try {
      await dispatch(softDeleteMail(mailId)).unwrap();
      dispatch(getAllCaseMails());
    } catch (error) {
      console.error("Failed to delete mail:", error);
    }
  };

  // Handle reply with backend sync
  const handleReply = async (mailId, content) => {
    try {
      await dispatch(replyToMail({ mailId, content })).unwrap();
      dispatch(getAllCaseMails());
    } catch (error) {
      console.error("Failed to send reply:", error);
    }
  };
  const handlePermanentDelete = async (mailId) => {
    try {
      await dispatch(deleteMailPermanently(mailId)).unwrap();
      dispatch(getAllCaseMails());
    } catch (error) {
      console.error("Failed to permanently delete:", error);
    }
  };
  return (
    <div className="grid grid-cols-[220px_1fr] h-screen ">
      <MailingSidebar
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        mailCounts={mailCounts}
      />

      <div className={`grid transition-all duration-300 ${selectedMail ? "grid-cols-[1fr_400px]" : "grid-cols-[1fr]"
        }`}>
        <Mailing
          selectedPage={selectedPage}
          allMails={allMails}
          setAllMails={setAllMails}
          onSelectMail={handleSelectMail}
          setMailCounts={setMailCounts}
          setSelectedPage={setSelectedPage}
          onDelete={handleDelete}
          onArchive={handleArchive}
          loading={loading}
          onPermanentDelete={handlePermanentDelete}
        />

        <AnimatePresence>
          {selectedMail && (
            <MailView
              mail={selectedMail}
              onClose={closeMailView}
              onReply={handleReply}
              currentUser={currentUser}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}