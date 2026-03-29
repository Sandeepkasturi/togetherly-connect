import { useState, useRef } from 'react';
import { Upload, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFViewerPanelProps {
  pdfUrl: string | null;
  onUpload: (url: string) => void;
  isHost: boolean;
}

const PDFViewerPanel = ({ pdfUrl, onUpload, isHost }: PDFViewerPanelProps) => {
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // For now, create a local URL. In production, upload to Supabase Storage
    const url = URL.createObjectURL(file);
    onUpload(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files[0]?.type === 'application/pdf') {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  if (!pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">No PDF Loaded</h3>
          <p className="text-white/60 mb-6">Upload a PDF to start studying together</p>
        </div>

        {isHost && (
          <>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'w-full max-w-md p-8 rounded-2xl border-2 border-dashed',
                'flex flex-col items-center justify-center gap-4',
                'transition-all duration-200 cursor-pointer',
                isDragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/20 hover:border-white/40 bg-white/5'
              )}
            >
              <Upload className="w-12 h-12 text-white/60" />
              <div className="text-center">
                <p className="font-medium text-white">Drag PDF here</p>
                <p className="text-sm text-white/60">or click to browse</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium',
                  'bg-blue-600 hover:bg-blue-700 text-white',
                  'transition-colors duration-200'
                )}
              >
                Choose File
              </button>
            </div>
          </>
        )}

        {!isHost && (
          <div className="text-center text-white/60">
            <p>Waiting for host to upload a PDF...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPageNum(Math.max(1, pageNum - 1))}
            disabled={pageNum === 1}
            className={cn(
              'p-2 rounded-lg transition-colors',
              pageNum === 1
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'hover:bg-white/10 text-white/60'
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <input
            type="number"
            min="1"
            max={totalPages}
            value={pageNum}
            onChange={(e) => setPageNum(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))}
            className={cn(
              'w-12 px-2 py-1 rounded text-center',
              'bg-white/5 border border-white/10 text-white text-sm',
              'focus:outline-none focus:border-blue-500'
            )}
          />

          <span className="text-white/60 text-sm">/ {totalPages}</span>

          <button
            onClick={() => setPageNum(Math.min(totalPages, pageNum + 1))}
            disabled={pageNum === totalPages}
            className={cn(
              'p-2 rounded-lg transition-colors',
              pageNum === totalPages
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'hover:bg-white/10 text-white/60'
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {isHost && (
          <button
            onClick={() => {
              onUpload('');
              setPageNum(1);
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60"
            title="Clear PDF"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-black/50">
        <div className="max-w-2xl w-full mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center text-white/60">
            <p className="mb-4">PDF Viewer</p>
            <p className="text-sm">
              Page {pageNum} of {totalPages}
            </p>
            <p className="text-xs mt-4 text-white/40">
              Using react-pdf library (implementation in progress)
            </p>
            <p className="text-xs mt-2 text-white/40">
              All participants will see synchronized pages when host navigates
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/10 text-xs text-white/50 text-center">
        PDF synchronization: All users see the same page as the host
      </div>
    </div>
  );
};

export default PDFViewerPanel;
