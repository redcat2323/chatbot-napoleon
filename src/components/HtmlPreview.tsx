import { useState } from 'react';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type HtmlPreviewProps = {
  content: string;
};

const HtmlPreview = ({ content }: HtmlPreviewProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        description: "Código copiado para a área de transferência",
        duration: 2000,
        className: "bg-white text-black border-none",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Erro ao copiar código",
        duration: 2000,
      });
    }
  };

  return (
    <div className="rounded-[5px] overflow-hidden border border-gray-700 bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d]">
        <span className="text-gray-400">html</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors"
          title="Copiar código"
        >
          <Copy className="h-4 w-4" />
          Copiar
        </button>
      </div>
      
      <div className="relative">
        {showPreview ? (
          <div className="bg-white p-4">
            <iframe
              srcDoc={content}
              className="w-full min-h-[300px] border-0"
              title="HTML Preview"
              sandbox="allow-scripts"
            />
          </div>
        ) : (
          <pre className="p-4 text-white">
            <code className="text-[#569CD6] break-words whitespace-pre-wrap">{content.split('\n').map((line, i) => {
              // Highlight HTML tags
              const highlightedLine = line
                .replace(/(&lt;[^&]*&gt;)/g, '<span class="text-[#569CD6]">$1</span>')
                .replace(/("[^"]*")/g, '<span class="text-[#CE9178]">$1</span>')
                .replace(/(=[^"]*")/g, '<span class="text-[#9CDCFE]">$1</span>');
              
              return (
                <div key={i} className="whitespace-pre-wrap">
                  <span className="text-gray-600 select-none w-8 inline-block text-right pr-4">{i + 1}</span>
                  <span dangerouslySetInnerHTML={{ __html: highlightedLine }} />
                </div>
              );
            })}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

export default HtmlPreview;