

// File: src/components/mailing/Mailing.jsx
import { useState, useEffect } from "react";
import { Star, Mail, Search, Trash2, Reply, Archive } from "lucide-react";
import NewInternalMessage from "./NewMail";

function Mailing({ setMailCounts, selectedPage, allMails, setAllMails, onSelectMail, setSelectedPage }) {
 const iconLabels = ["Reply", "Star", "Archive", "Delete"];
  const [starredMails, setStarredMails] = useState({});
  const [active, setActive] = useState("Unread");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", showModal);
  }, [showModal]);


  // NOTE: Removed defaultMail. Use backend-provided allMails only.
  useEffect(() => {
    // if allMails is undefined, ensure it's an array to avoid runtime errors
    if (!Array.isArray(allMails)) setAllMails([]);
  }, [allMails, setAllMails]);

  const emails = Array.isArray(allMails) ? allMails : [];

  const filteredEmails = emails.filter((mail) => {
    if (selectedPage === "Inbox") return mail.type === "Inbox" && !mail.starred;
    if (selectedPage === "Starred") return mail.type === "Starred" || mail.starred;
    if (selectedPage === "Sent") return mail.type === "Sent";
    if (selectedPage === "Drafts") return mail.type === "Drafts";
    if (selectedPage === "Trash") return mail.type === "Trash";
    return true;
  });

  const filters = ["Unread", "With attachments"];

  useEffect(() => {
    const list = Array.isArray(allMails) ? allMails : [];

    const counts = {
      inbox: list.filter((m) => m.type === "Inbox").length,
      starred: list.filter((m) => !!m.starred).length,
      sent: list.filter((m) => m.type === "Sent").length,
      drafts: list.filter((m) => m.type === "Drafts").length,
      trash: list.filter((m) => m.type === "Trash").length,
    };

    if (typeof setMailCounts === "function") {
      setMailCounts(counts);
    }
  }, [allMails, setMailCounts]);

  return (
    <div
      className="w-full h-full p-6 font-sans grid grid-rows-[auto_auto_1fr] gap-6 border-r bg-[2B323F] text-white border-white/10"
    >
      {/* Search + New */}
      <div className="flex items-center gap-4 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-full h-10 pl-10 pr-4 text-sm focus:outline-none bg-white/5 text-white placeholder-gray-400"
          />
        </div>
        <NewInternalMessage />

      </div>


      {/* Filter Buttons */}
      <div className="flex items-center justify-between w-full">
        <div className="inline-flex items-center gap-0 rounded-full bg-white/5 p-1">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`px-4 py-[6px] text-xs rounded-full transition ${active === item ? "bg-white/8 text-white" : "text-gray-300 "}`}
            >
              {item}
            </button>
          ))}
        </div>

        <button className="px-4 py-2 rounded-full text-xs flex items-center gap-2 transition bg-[#131A2A] hover:bg-blue-500">
          Labels <Star className="w-4 h-4" />
        </button>
      </div>

      {/* Mail List */}
      <div className=" h-full overflow-x-visible ">
        <h1 className="text-lg font-semibold">Inbox</h1>
        {filteredEmails.length === 0 ? (
          <p className="text-gray-500 text-center mt-20 flex items-center
           justify-center gap-2"> <span><Mail size={22} /></span>No mails found.</p>
        ) : (
          filteredEmails.map((mail) => (
            <div
              key={mail.id}
              className="p-4 rounded-xl shadow-lg transition cursor-pointer w-full min-h-[100px] mt-2 flex flex-col justify-between relative overflow-visible bg-white/5 hover:bg-white/8"
              onClick={() => onSelectMail?.(mail)}
            >
              <div className="flex items-start justify-between w-full">
                {/* Checkbox + Subject */}
                <div className="flex items-start gap-3 max-w-[70%]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button className="px-2 py-1 rounded-full text-sm border transition flex items-center gap-2 border-white/10 hover:bg-[#25304a]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 6v6l4 2" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      {mail.priority}
                    </button>

                    <h2 className="text-lg font-semibold break-words leading-tight">{mail.subject}</h2>
                  </div>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-3 pr-1 shrink-0">
                  {[Reply, Star, Archive, Trash2].map((Icon, i) => (
                    <div
                      key={i}
                      className={`relative group p-1 rounded-md`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (Icon === Star) {
                          setAllMails((prev) => {
                            const list = Array.isArray(prev) ? prev : [];

                            return list.map((m) => {
                              if (m.id === mail.id) {
                                const newStarValue = !m.starred;
                                return {
                                  ...m,
                                  starred: newStarValue,
                                  originalType: m.originalType || m.type,
                                  type: newStarValue ? "Starred" : m.originalType || "Inbox",
                                };
                              }
                              return m;
                            });
                          });

                          setStarredMails((prev) => ({
                            ...prev,
                            [mail.id]: !prev[mail.id],
                          }));
                        }
                        if (Icon === Trash2) {
                          setAllMails((prev) => {
                            const list = Array.isArray(prev) ? prev : [];

                            return list.map((m) => {
                              if (m.id === mail.id) {
                                if (m.type === "Trash") {
                                  return {
                                    ...m,
                                    type: m.originalType || "Inbox",
                                    starred: false,
                                  };
                                }

                                return {
                                  ...m,
                                  originalType: m.originalType || m.type,
                                  type: "Trash",
                                  starred: false,
                                };
                              }

                              return m;
                            });
                          });

                          setMailCounts((prev) => ({
                            ...prev,
                            inbox: prev.inbox - (mail.type === "Inbox" ? 1 : 0),
                            starred: prev.starred - (mail.type === "Starred" ? 1 : 0),
                            sent: prev.sent - (mail.type === "Sent" ? 1 : 0),
                            draft: prev.draft - (mail.type === "Draft" ? 1 : 0),
                            trash: prev.trash + 1,
                          }));

                          if (selectedPage !== "Trash") setSelectedPage("Trash");
                        }
                      }}
                    >
                      <div className={`p-1 rounded-md transition ${Icon === Star && starredMails[mail.id] ? "bg-white/20" : ""}`}>
                        <Icon className={`w-5 h-5 cursor-pointer transition ${Icon === Star && mail.starred ? "text-yellow-400" : "text-gray-300 hover:text-white"}`} />
                      </div>
                      <span className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition bg-black text-white`}>{iconLabels[i]}</span>
                    </div>

                  ))}
                </div>
              </div>

              <p className="text-[11px] mt-1 truncate text-gray-400 "><span className="
              capitalize">{mail.from}</span> → {mail.to} · {mail.date}</p>

              <p className="text-xs mt-2 leading-relaxed line-clamp-2 text-gray-300">{mail.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Mailing;
