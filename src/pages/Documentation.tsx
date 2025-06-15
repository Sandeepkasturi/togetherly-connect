
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Download, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Documentation = () => {
  const navigate = useNavigate();

  const handleDownloadHTML = () => {
    // Create a link to download the HTML file
    const link = document.createElement('a');
    link.href = '/docs/SRS-Togetherly.html';
    link.download = 'SRS-Togetherly.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Project Documentation</h1>
            </div>
          </div>
          <Button onClick={handleDownloadHTML} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download HTML
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Software Requirements Specification</h2>
            <p className="text-muted-foreground">
              Comprehensive documentation for the Togetherly synchronized video watching platform.
            </p>
          </div>
          
          {/* Embedded SRS Document */}
          <div className="border rounded-lg overflow-hidden bg-card">
            <iframe
              src="/docs/SRS-Togetherly.html"
              className="w-full h-[800px] border-0"
              title="SRS Documentation"
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Documentation;
