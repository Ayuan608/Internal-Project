import { useState, useEffect } from "react";
import { Mail, Search, Trash2, Reply, Archive } from "lucide-react";
import NewInternalMessage from "./NewMail";

function Mailing({
  setMailCounts,
  selectedPage,
  allMails,
  setAllMails,
  onSelectMail,
  onDelete,
  onArchive,
  onPermanentDelete,
  loading
}) {
  const iconLabels = ["Reply", "Archive", "Delete"];
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!Array.isArray(allMails)) setAllMails([]);
  }, [allMails, setAllMails]);

  const emails = Array.isArray(allMails) ? allMails : [];

  // Dynamic filtering based on selected page
  const filteredEmails = emails.filter((mail) => {
    const searchMatch = mail.subject?.toLowerCase().includes(search.toLowerCase()) ||
      mail.body?.toLowerCase().includes(search.toLowerCase()) ||
      mail.from?.toLowerCase().includes(search.toLowerCase()) ||
      mail.nature?.toLowerCase().includes(search.toLowerCase());

    if (!searchMatch && search) return false;

    switch (selectedPage) {
      case "Inbox":
        return mail.type === "Inbox" && !mail.isDeleted;
      case "Sent":
        return mail.type === "Sent" && !mail.isDeleted;
      case "Drafts":
        return mail.type === "Drafts" && !mail.isDeleted;
      case "Trash":
        return mail.isDeleted;
      case "Archived":
        return mail.archived && !mail.isDeleted;
      default:
        return true;
    }
  });

  const filters = ["All", "Unread", "Important"];

  // Dynamic mail counts
  useEffect(() => {
    const list = Array.isArray(allMails) ? allMails : [];

    const counts = {
      inbox: list.filter(m => m.type === "Inbox" && !m.isDeleted).length,
      sent: list.filter(m => m.type === "Sent" && !m.isDeleted).length,
      drafts: list.filter(m => m.type === "Drafts" && !m.isDeleted).length,
      trash: list.filter(m => m.isDeleted).length,
      archived: list.filter(m => m.archived && !m.isDeleted).length,
    };

    if (typeof setMailCounts === "function") {
      setMailCounts(counts);
    }
  }, [allMails, setMailCounts]);

  const handleDeleteClick = (e, mail) => {
    e.stopPropagation();
    onDelete(mail.id);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "text-red-400 border-red-400";
      case "Medium": return "text-yellow-400 border-yellow-400";
      case "Low": return "text-green-400 border-green-400";
      default: return "text-blue-400 border-blue-400";
    }
  };

  const getNatureBadge = (nature) => {
    if (!nature) return null;

    const natureColors = {
      "Warning": "bg-yellow-500/20 text-yellow-300",
      "Violation": "bg-red-500/20 text-red-300",
      "Inquiry": "bg-blue-500/20 text-blue-300",
      "Notice": "bg-green-500/20 text-green-300",
      "Disciplinary Action": "bg-purple-500/20 text-purple-300",
      "Compliance Issue": "bg-orange-500/20 text-orange-300",
      "Performance Review": "bg-indigo-500/20 text-indigo-300",
      "Other": "bg-gray-500/20 text-gray-300"
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${natureColors[nature] || natureColors.Other}`}>
        {nature}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-full p-6 font-sans flex items-center justify-center ">
        <div className="text-white">Loading mails...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 font-sans grid grid-rows-[auto_auto_1fr] gap-6 border-r border-[#9E9FA74D] text-white">
      {/* Search + New */}
      <div className="flex items-center gap-4 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emails..."
            className="w-full rounded-full h-10 pl-10 pr-4 text-sm focus:outline-none bg-white/5 text-white placeholder-gray-400  focus:border-blue-500"
          />
        </div>
        <NewInternalMessage />
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center justify-between w-full">
        <div className="inline-flex items-center gap-0 rounded-full bg-white/8 p-1">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`px-4 py-2 text-xs rounded-full transition ${active === item ? "bg-blue-500 text-white" : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-400">
          {filteredEmails.length} {filteredEmails.length === 1 ? 'mail' : 'mails'}
        </div>
      </div>

      {/* Mail List */}
      <div className="h-full overflow-x-visible overflow-y-auto">
        <h1 className="text-lg font-semibold mb-4 capitalize text-white">{selectedPage}</h1>
        {filteredEmails.length === 0 ? (
          <div className="text-gray-500 text-center mt-20 flex items-center justify-center gap-2">
            <Mail size={22} />
            <span>No {selectedPage.toLowerCase()} mails found.</span>
          </div>
        ) : (
          filteredEmails.map((mail) => (
            <div
              key={mail.id}
              className="p-4 rounded-lg transition cursor-pointer w-full min-h-[200px] mt-2 flex flex-col justify-between relative overflow-visible  hover:bg-gray-750 border border-[#9E9FA74D]"
              onClick={() => onSelectMail?.(mail)}
            >
              <div className="flex items-start justify-between w-full">
                {/* Mail Content */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex flex-col gap-2 flex-1">
                    {/* Subject and Nature */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-sm border flex items-center gap-2 ${getPriorityColor(mail.priority)}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 6v6l4 2" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        {mail.priority}
                      </span>

                      {getNatureBadge(mail.nature)}

                      <h2 className="text-lg font-semibold break-words leading-tight text-white">
                        {mail.subject}
                        {mail.replies && mail.replies.length > 0 && (
                          <span className="ml-2 text-xs text-blue-400">
                            ({mail.replies.length} {mail.replies.length === 1 ? 'reply' : 'replies'})
                          </span>
                        )}
                      </h2>
                    </div>

                    {/* Sender and Date */}
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-300 font-medium">{mail.from}</span>
                      {mail.type === "Sent" && " → "}
                      {mail.type === "Sent" && <span className="text-gray-300">{mail.to}</span>}
                      {" · "}{mail.date}
                    </p>

                    {/* Preview */}
                    <p className="text-sm mt-1 leading-relaxed line-clamp-2 text-gray-300">
                      {mail.body}
                    </p>
                  </div>
                </div>

                {/* Action Icons */}
                <div className="flex items-center gap-1 pl-2 shrink-0">
                  {[Reply, Archive, Trash2].map((Icon, i) => (
                    <div
                      key={i}
                      className="relative group p-2 rounded-md hover:bg-gray-700 transition"
                      onClick={(e) => {
                        e.stopPropagation();

                        // DELETE
                        // DELETE
                        if (Icon === Trash2) {
                          if (selectedPage === "Trash") {
                            // permanent delete
                            onPermanentDelete(mail.id);
                          } else {
                            // soft delete (move to trash)
                            onDelete(mail.id);
                          }
                        }

                        // REPLY
                        if (Icon === Reply) {
                          onSelectMail(mail);       // mail open
                          // open reply modal? → NewInternalMessage bana sakte ho
                          // setReplyMode(mail);
                        }

                        // ARCHIVE
                        if (Icon === Archive) {
                          if (typeof onArchive === "function") {
                            onArchive(mail.id);     // backend/Redux call
                          } else {
                            console.warn("onArchive function not passed");
                          }
                        }
                      }}
                    >
                      <Icon className="w-4 h-4 cursor-pointer transition text-gray-400 hover:text-white" />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition bg-black text-white z-10">
                        {iconLabels[i]}
                      </span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Labels */}
              {mail.labels && mail.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {mail.labels.map((label, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Mailing;