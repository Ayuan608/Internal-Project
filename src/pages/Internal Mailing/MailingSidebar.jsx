import { Mail, Send, FileText, Trash2, ChevronDown, Plus, Archive } from "lucide-react";
import { useState } from "react";

export default function MailingSidebar({ mailCounts, selectedPage, setSelectedPage }) {
  const [showTeams, setShowTeams] = useState(true);

  const itemStyle =
    "grid grid-cols-[1fr_auto] items-center px-3 py-2 rounded-md cursor-pointer transition";

  const menuItems = [
    { key: "Inbox", icon: Mail, count: mailCounts.inbox },
    { key: "Sent", icon: Send, count: mailCounts.sent },
    { key: "Drafts", icon: FileText, count: mailCounts.drafts },
    { key: "Archived", icon: Archive, count: mailCounts.archived },
    { key: "Trash", icon: Trash2, count: mailCounts.trash },
  ];

  return (
    <div className="border-r border-[#9E9FA74D] p-4 grid grid-rows-[auto_1fr] gap-4 min-h-screen h-full max-w-[250px]">
      <div className="grid gap-2 auto-rows-max">
        
        {/* Dynamic Menu Items */}
        {menuItems.map(({ key, icon: Icon, count }) => (
          <div
            key={key}
            onClick={() => setSelectedPage(key)}
            className={`
              ${itemStyle}
              ${
                selectedPage === key
                  ? "bg-blue-500/20 border-l-2 border-blue-500 text-white font-semibold"
                  : "text-gray-300 hover:bg-gray-800"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <Icon
                size={18}
                className={selectedPage === key ? "text-blue-400" : "text-gray-400"}
              />
              <span className="text-sm">{key}</span>
            </div>

            <span
              className={`text-[10px] px-2 py-[2px] rounded-full ${
                selectedPage === key
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {count}
            </span>
          </div>
        ))}

        <hr className="border-gray-700 my-2" />

        {/* Team Mailboxes */}
        <div className="grid gap-2">
          <div
            className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-800 rounded-md"
            onClick={() => setShowTeams(!showTeams)}
          >
            <h3 className="text-sm font-medium text-gray-300">Team Mailboxes</h3>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${
                showTeams ? "rotate-0" : "-rotate-180"
              }`}
            />
          </div>

          {showTeams && (
            <div className="grid gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer bg-gray-800 hover:bg-gray-750 text-gray-300">
                <Plus size={16} />
                <span className="text-sm">New team Mailbox</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
