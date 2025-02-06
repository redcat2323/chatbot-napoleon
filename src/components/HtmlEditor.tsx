import React, { useState } from 'react';
import { Button } from './ui/button';
import { Eye, Code } from 'lucide-react';

const HtmlEditor = () => {
  const [htmlCode, setHtmlCode] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlCode(e.target.value);
  };

  return (
    <div className="w-full h-[500px] bg-[#1E1E1E] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-[#2D2D2D] border-b border-gray-700">
        <h3 className="text-white font-medium">Editor HTML</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="text-white hover:bg-gray-700"
        >
          {showPreview ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="ml-2">{showPreview ? 'Código' : 'Preview'}</span>
        </Button>
      </div>
      
      <div className="flex h-[calc(100%-48px)]">
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} h-full`}>
          <textarea
            value={htmlCode}
            onChange={handleCodeChange}
            className="w-full h-full bg-[#1E1E1E] text-white p-4 font-mono text-sm resize-none focus:outline-none"
            placeholder="Digite seu código HTML aqui..."
            spellCheck={false}
          />
        </div>
        
        {showPreview && (
          <div className="w-1/2 h-full border-l border-gray-700">
            <div className="w-full h-full bg-white">
              <iframe
                title="HTML Preview"
                srcDoc={htmlCode}
                className="w-full h-full"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HtmlEditor;