
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Download, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import docHtml from '../../docs/SRS-Togetherly.html?raw';

const Documentation = () => {
  const navigate = useNavigate();

  const handleDownloadHTML = () => {
    const blob = new Blob([docHtml], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'SRS-Togetherly.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Mobile Optimized */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 lg:gap-4 min-w-0 flex-1">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="shrink-0">
              <ArrowLeft className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" />
              <h1 className="text-sm lg:text-lg font-semibold truncate">
                <span className="hidden sm:inline">Project Documentation</span>
                <span className="sm:hidden">Docs</span>
              </h1>
            </div>
          </div>
          <Button onClick={handleDownloadHTML} variant="outline" size="sm" className="shrink-0 ml-2">
            <Download className="h-4 w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Download HTML</span>
            <span className="sm:hidden">Download</span>
          </Button>
        </div>
      </header>

      {/* Content - Mobile Responsive */}
      <main className="container py-4 lg:py-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-4 lg:mb-6">
            <h2 className="text-xl lg:text-2xl font-bold mb-2">Software Requirements Specification</h2>
            <p className="text-sm lg:text-base text-muted-foreground">
              Comprehensive documentation for the Togetherly synchronized video watching platform.
            </p>
          </div>
          
          {/* Embedded SRS Document - Mobile Responsive */}
          <div className="border rounded-lg overflow-hidden bg-card">
            <iframe
              srcDoc={docHtml}
              className="w-full h-[60vh] sm:h-[70vh] lg:h-[800px] border-0"
              title="SRS Documentation"
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Documentation;
