import React, { useState } from "react";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Chat = () => {
  const rooms = useSelector((state) => state.chat.rooms);
  const messages = useSelector((state) => state.chat.messages);
  const activeRoom = useSelector((state) => state.chat.activeRoom);
  const [newMessage, setNewMessage] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const sendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage);
      setNewMessage(""); // Clear input field
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h3>Rooms</h3>
        <ul>
          {rooms.map((room, index) => (
            <li key={index} style={styles.room}>
              {room.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Window */}
      <div style={styles.chatWindow}>
        <h3>{activeRoom ? `Room: ${activeRoom.name}` : "Select a Room"}</h3>
        <div style={styles.messages}>
          {messages.map((msg, index) => (
            <p key={index} style={styles.message}>
              {msg}
            </p>
          ))}
        </div>
        <div style={styles.inputContainer}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={styles.input}
          />

<div className="chat-container">
      <Sidebar setSelectedRoom={setSelectedRoom} />
      {selectedRoom ? <ChatWindow selectedRoom={selectedRoom} /> : <p>Select a room to start chatting</p>}
    </div>
          <button onClick={sendMessage} style={styles.sendButton}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", height: "100vh" },
  sidebar: { width: "250px", backgroundColor: "#2c3e50", color: "#fff", padding: "20px" },
  chatWindow: { flex: 1, padding: "20px", backgroundColor: "#ecf0f1" },
  messages: { height: "70vh", overflowY: "auto", padding: "10px", backgroundColor: "#fff", borderRadius: "5px" },
  message: { backgroundColor: "#0078D4", color: "#fff", padding: "10px", borderRadius: "5px", marginBottom: "5px" },
  inputContainer: { display: "flex", marginTop: "10px" },
  input: { flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  sendButton: { padding: "10px", backgroundColor: "#0078D4", color: "#fff", border: "none", borderRadius: "5px", marginLeft: "10px" },
  room: { padding: "10px", cursor: "pointer", backgroundColor: "#34495e", borderRadius: "5px", marginBottom: "5px" },
};

export default Chat;
