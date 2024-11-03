import { Paperclip } from "lucide-react";
import { useState } from "react";

const ChatInput = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="relative w-full max-w-4xl">
        <textarea
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message ChatGPT"
          className="w-full resize-none rounded-full bg-[#2F2F2F] px-4 py-3 pr-12 focus:outline-none"
          style={{ maxHeight: "200px" }}
        />
        <button className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-white">
          <Paperclip className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;