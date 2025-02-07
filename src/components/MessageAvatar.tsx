import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

type MessageAvatarProps = {
  isAssistant: boolean;
  isThinking?: boolean;
};

const MessageAvatar = ({ isAssistant, isThinking = false }: MessageAvatarProps) => {
  return (
    <div className="relative w-8 h-8">
      {isAssistant && isThinking && (
        <span className="absolute inset-0 rounded-full animate-ping bg-green-500/50" />
      )}
      <Avatar className={`h-8 w-8 ${isAssistant && isThinking ? 'animate-pulse' : ''}`}>
        <AvatarFallback 
          className={`
            ${isAssistant ? 'bg-green-600' : 'bg-slate-600'}
            ${isAssistant && isThinking ? 'animate-pulse' : ''}
          `}
        >
          {isAssistant ? (
            <Bot className={`h-5 w-5 text-white ${isAssistant && isThinking ? 'animate-bounce' : ''}`} />
          ) : (
            <User className="h-5 w-5 text-white" />
          )}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default MessageAvatar;