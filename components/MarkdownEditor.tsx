'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Code, Maximize2, Minimize2 } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start typing your markdown content...',
  minHeight = '400px',
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50 bg-white' : ''}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('edit')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'edit'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Code className="h-4 w-4 inline mr-1" />
            Edit
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Split
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'preview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Eye className="h-4 w-4 inline mr-1" />
            Preview
          </button>
        </div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1 text-gray-600 hover:text-gray-900 rounded"
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Editor/Preview Area */}
      <div className="flex" style={{ minHeight }}>
        {/* Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2 border-r border-gray-200' : 'w-full'}`}>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full h-full p-4 font-mono text-sm border-0 focus:ring-0 resize-none outline-none"
              style={{ minHeight }}
            />
          </div>
        )}

        {/* Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            } overflow-y-auto p-4 bg-white`}
            style={{ minHeight }}
          >
            {value ? (
              <div className="markdown-content">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                >
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-gray-400 italic">{placeholder}</div>
            )}
          </div>
        )}
      </div>

      {/* Markdown Help */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-600">
        <strong>Markdown Tips:</strong> Use **bold**, *italic*, `code`, # Headings, - Lists, [Links](url), ![Images](url)
      </div>
    </div>
  );
}

