import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import HtmlEditor from '@/components/HtmlEditor';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite uma mensagem",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const newMessages = [
        ...messages,
        { role: 'user', content } as const
      ];
      
      setMessages(newMessages);

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages: newMessages }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error: any) {
      console.error('Error in chat:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar mensagem",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <main className="flex-1">
        <ChatHeader />
        
        <div className="flex h-full flex-col pt-[60px] pb-4">
          <div className="w-full max-w-3xl mx-auto px-4">
            <HtmlEditor />
            <div className="mt-8">
              <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </div>
            {messages.length > 0 && (
              <>
                <MessageList messages={messages} isLoading={isLoading} />
                <div className="text-xs text-center text-gray-500 py-2">
                  O GPT pode cometer erros. Verifique informações importantes.
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;