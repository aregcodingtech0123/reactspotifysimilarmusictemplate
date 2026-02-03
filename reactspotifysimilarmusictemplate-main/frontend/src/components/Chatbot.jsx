import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, MessageCircle } from "lucide-react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleSendMessage = (event) => {
    event.preventDefault();
    const userInput = event.target.elements.message;
    if (userInput.value.trim()) {
      setMessages([...messages, userInput.value]);
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
      }
      userInput.value = "";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex items-center z-50">
      {/* Hover Tooltip */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="bg-black text-white text-sm px-2 py-1 rounded-lg mr-2"
        >
          Ask to AI
        </motion.div>
      )}
      
      {/* Chatbot Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-blue-600 text-white p-3 my-8 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        <MessageCircle size={24} />
      </button>
      
      {/* Chatbot Modal */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 bg-white shadow-xl rounded-lg w-80 h-96 flex flex-col">
          {/* Modal Header */}
          <div className="flex justify-between items-center bg-blue-600 text-white p-3 rounded-t-lg">
            <span>AI Chatbot</span>
            <button onClick={() => setIsOpen(false)} className="p-1">
              <X size={20} />
            </button>
          </div>
          {/* Chat Content */}
          <div className="flex-grow p-4 overflow-auto">
            {!hasUserInteracted ? (
              <p className="text-gray-600 text-center">Hi! I'm ready to help with any specific requests or emotional support you might need.</p>
            ) : (
              messages.map((msg, index) => (
                <p key={index} className="text-gray-600 bg-gray-100 p-2 rounded my-1">{msg}</p>
              ))
            )}
          </div>
          {/* Input Field */}
          <form onSubmit={handleSendMessage} className="p-3 border-t flex">
            <input
              type="text"
              name="message"
              placeholder="Type a message..."
              className="flex-grow p-2 border rounded-l-lg outline-none"
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-r-lg">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
