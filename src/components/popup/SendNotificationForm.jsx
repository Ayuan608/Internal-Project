import React, { useState } from "react";
import { useSendNotificationMutation, useSendNotificationToAllMutation } from "../../features/notifications/notificationApi";
import { useSelector } from "react-redux";

export default function SendNotificationForm() {
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [nature, setNature] = useState("");
  const [attachment, setAttachment] = useState("");

  const [sendNotification] = useSendNotificationMutation();
  const [sendToAll] = useSendNotificationToAllMutation();
const userId = useSelector((state)=>state.auth.data._id)

const SenderId = "68ef90b8b72f9f147f4a996b"
console.log(userId,"ud")
  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await sendNotification({
        recipient : userId,
        sender: SenderId, // usually from Redux auth.user._id
        title,
        nature,
        message,
        attachment,
      }).unwrap();
      alert("✅ Notification sent!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send");
    }
  };

  const handleSendAll = async () => {
    await sendToAll({
      sender: "YOUR_ADMIN_USER_ID",
      title,
      nature,
      message,
      attachment,
    });
    alert("✅ Sent to all users!");
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-xl max-w-md">
      <h2 className="text-xl font-bold mb-2">Send Notification</h2>
      <form onSubmit={handleSend} className="flex flex-col gap-2">
        <input
          value={userId}
          onChange={(e) => setSender(e.target.value)}
          placeholder="sender user ID"
          className="p-2 rounded bg-gray-700 border border-gray-600"
        />
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Recipient user ID"
          className="p-2 rounded bg-gray-700 border border-gray-600"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="p-2 rounded bg-gray-700 border border-gray-600"
        />
        <input
          value={nature}
          onChange={(e) => setNature(e.target.value)}
          placeholder="Nature (optional)"
          className="p-2 rounded bg-gray-700 border border-gray-600"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
          className="p-2 rounded bg-gray-700 border border-gray-600"
        />
        <input
          value={attachment}
          onChange={(e) => setAttachment(e.target.value)}
          placeholder="Attachment URL (optional)"
          className="p-2 rounded bg-gray-700 border border-gray-600"
        />
        <div className="flex gap-2 mt-2">
          <button type="submit" className="bg-blue-600 px-4 py-2 rounded">
            Send
          </button>
          <button
            type="button"
            onClick={handleSendAll}
            className="bg-green-600 px-4 py-2 rounded"
          >
            Send to All
          </button>
        </div>
      </form>
    </div>
  );
}
