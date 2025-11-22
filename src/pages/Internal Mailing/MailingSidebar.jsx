import { Mail, Star, Send, FileText, Trash2, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";

export default function MailingSidebar({ mailCounts, selectedPage, setSelectedPage }) {
  const [showTeams, setShowTeams] = useState(true);


  const itemStyle =
    "grid grid-cols-[1fr_auto] items-center px-3 py-2 rounded-md cursor-pointer transition";

  return (
    <div
      className="
        border-r border-slate-700  p-4
        grid grid-rows-[auto_1fr] gap-4 min-h-screen h-full max-w-[250px]
      "
    >

      <div className="grid gap-2 auto-rows-max">

        {/* INBOX */}
        <div
          onClick={() => setSelectedPage("Inbox")}
          className={`
            ${itemStyle}
            ${selectedPage === "Inbox"
              ? "bg-white/5 border-l-2 border-white text-white shadow-lg font-semibold text-base"
              : "text-gray-300 hover:bg-white/10 text-sm"}
            }
          `}
        >
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-gray-300" />
            <span className="text-sm">Inbox</span>
          </div>
          <span className="bg-[#3b82f6] text-[10px] px-2 py-[2px] rounded-full">
            {mailCounts.inbox}
          </span>
        </div>

        <div
          onClick={() => setSelectedPage("Starred")}
          className={`
            ${itemStyle}
            ${selectedPage === "Starred"
              ? "bg-[#1f293d] text-white shadow-md"
              : "text-gray-300 hover:bg-white/10"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <Star size={18} className="text-gray-400" />
            <span className="text-sm">Starred</span>
          </div>
          <span className="text-gray-400 text-[10px]">{mailCounts.starred}</span>
        </div>

        <div
          onClick={() => setSelectedPage("Sent")}
          className={`
            ${itemStyle}
            ${selectedPage === "Sent"
              ? "bg-[#1f293d] text-white shadow-md"
              : "text-gray-300 hover:bg-white/10"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <Send size={18} className="text-gray-400" />
            <span className="text-sm">Sent</span>
          </div>
          <span className="text-gray-400 text-[10px]">{mailCounts.sent}</span>
        </div>

        <div
          onClick={() => setSelectedPage("Drafts")}
          className={`
            ${itemStyle}
            ${selectedPage === "Drafts"
              ? "bg-[#1f293d] text-white shadow-md"
              : "text-gray-300 hover:bg-white/10"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-gray-400" />
            <span className="text-sm">Drafts</span>
          </div>
          <span className="text-gray-400 text-[10px]">{mailCounts.draft}</span>
        </div>

        <div
          onClick={() => setSelectedPage("Trash")}
          className={`
            ${itemStyle}
            ${selectedPage === "Trash"
              ? "bg-[#1f293d] text-white shadow-md"
              : "text-gray-300 hover:bg-white/10"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <Trash2 size={18} className="text-gray-400" />
            <span className="text-sm">Trash</span>
          </div>
          <span className="text-gray-400 text-[10px]">{mailCounts.trash}</span>
        </div>

        <hr className="border-white/10 my-2" />

        <div className="grid gap-2">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowTeams(!showTeams)}
          >
            <h3 className="text-sm font-medium">Team Mailboxes</h3>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${showTeams ? "rotate-0" : "-rotate-180"
                }`}
            />
          </div>

          {showTeams && (
            <div className="grid gap-2">

              <div className="flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer bg-white/8 hover:bg-white/10 text-gray-300">
                <Plus size={16} />
                <span className="text-sm">New team Mailbox</span>
              </div>


            </div>
          )}
        </div>


        {/* LABELS */}

      </div>
    </div>
  );
}
