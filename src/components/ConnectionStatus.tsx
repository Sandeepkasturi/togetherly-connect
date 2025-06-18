
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RotateCcw, AlertCircle } from 'lucide-react';
import { ConnectionState } from '@/utils/connectionManager';

interface ConnectionStatusProps {
  connectionState: ConnectionState;
  onManualReconnect: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionState,
  onManualReconnect
}) => {
  const getStatusIcon = () => {
    switch (connectionState.status) {
      case 'connected':
        return <Wifi className="h-4 w-4" />;
      case 'connecting':
        return <RotateCcw className="h-4 w-4 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionState.status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionState.status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return connectionState.isManualReconnect ? 'Reconnecting...' : 'Connecting...';
      case 'failed':
        return 'Connection Failed';
      default:
        return 'Disconnected';
    }
  };

  const showRetryButton = connectionState.status === 'failed' || 
    (connectionState.status === 'disconnected' && connectionState.lastError);

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>

      {connectionState.retryCount > 0 && connectionState.status === 'connecting' && (
        <Badge variant="outline" className="text-xs">
          Attempt {connectionState.retryCount}/3
        </Badge>
      )}

      {connectionState.lastError && connectionState.status === 'failed' && (
        <span className="text-xs text-muted-foreground truncate flex-1">
          {connectionState.lastError}
        </span>
      )}

      {showRetryButton && (
        <Button
          size="sm"
          variant="outline"
          onClick={onManualReconnect}
          className="h-7 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
};
