import { useEffect, useRef } from 'react';
import Message from './Message';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type MessageListProps = {
  messages: Message[];
  isLoading?: boolean;
};

const MessageList = ({ messages, isLoading = false }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto px-4">
        {messages.map((message, index) => (
          <Message 
            key={index} 
            {...message} 
            isLoading={isLoading && index === messages.length - 1} 
          />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <Message
            role="assistant"
            content=""
            isLoading={true}
          />
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;