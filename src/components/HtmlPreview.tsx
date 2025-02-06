import { useState } from 'react';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type HtmlPreviewProps = {
  content: string;
};

const HtmlPreview = ({ content }: HtmlPreviewProps) => {
  const [showPreview, setShowPreview] = useState(true);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        description: "Código copiado para a área de transferência",
        duration: 2000,
        className: "bg-[#9b87f5] text-white border-none",
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
    <div className="rounded-lg overflow-hidden border border-gray-700 bg-[#1e1e1e]">
      <div className="flex items-center justify-between p-2 bg-[#2d2d2d] border-b border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1 rounded text-sm ${
              showPreview ? 'bg-[#1e1e1e] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Prévia
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1 rounded text-sm ${
              !showPreview ? 'bg-[#1e1e1e] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Código
          </button>
        </div>
        <button
          onClick={handleCopy}
          className="p-1 text-gray-400 hover:text-white transition-colors"
          title="Copiar código"
        >
          <Copy className="h-4 w-4" />
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
          <pre className="p-4 text-white overflow-x-auto">
            <code className="language-html">{content}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

export default HtmlPreview;