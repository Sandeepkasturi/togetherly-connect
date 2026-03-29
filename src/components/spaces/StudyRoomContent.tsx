import { useState } from 'react';
import { Upload, FileText, Clock } from 'lucide-react';
import PDFViewerPanel from './study/PDFViewerPanel';
import NotesPanel from './study/NotesPanel';
import PomodoroTimer from './study/PomodoroTimer';
import { cn } from '@/lib/utils';

type ActiveTool = 'pdf' | 'notes' | 'timer' | 'call' | null;

interface StudyRoomContentProps {
  spaceId: string;
  activeTool: ActiveTool;
  isHost: boolean;
}

const StudyRoomContent = ({
  spaceId,
  activeTool,
  isHost,
}: StudyRoomContentProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const renderContent = () => {
    switch (activeTool) {
      case 'pdf':
        return (
          <PDFViewerPanel
            pdfUrl={pdfUrl}
            onUpload={(url) => setPdfUrl(url)}
            isHost={isHost}
          />
        );
      case 'notes':
        return <NotesPanel spaceId={spaceId} />;
      case 'timer':
        return <PomodoroTimer spaceId={spaceId} isHost={isHost} />;
      case 'call':
        return (
          <div className="flex items-center justify-center h-full text-white/50">
            Video call interface coming soon
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white/50">
              <p className="text-lg mb-2">Select a tool from the toolbar</p>
              <p className="text-sm">PDF, Notes, Timer, or Call</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default StudyRoomContent;
