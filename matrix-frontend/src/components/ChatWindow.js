import React, { useEffect, useState } from "react";
import  matrixService  from "../services/matrixService";

const ChatWindow = ({ selectedRoom }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const msgs = await matrixService.getMessages(selectedRoom);
        setMessages(msgs);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    if (selectedRoom) {
      fetchMessages();
    }
  }, [selectedRoom]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await matrixService.sendMessage(selectedRoom, newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Message send failed:", error);
    }
  };

  return (
    <div className="chat-window">
      <h2>Chat</h2>
      <div className="messages">
        {messages.map((msg, index) => (
          <p key={index}>{msg.event.content.body}</p>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default ChatWindow;
