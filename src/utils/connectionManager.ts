
export interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'failed';
  peerId: string | null;
  retryCount: number;
  lastError: string | null;
  isManualReconnect: boolean;
}

export class ConnectionManager {
  private static instance: ConnectionManager;
  private state: ConnectionState = {
    status: 'disconnected',
    peerId: null,
    retryCount: 0,
    lastError: null,
    isManualReconnect: false
  };
  private listeners: ((state: ConnectionState) => void)[] = [];
  private retryTimeout: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  getState(): ConnectionState {
    return { ...this.state };
  }

  subscribe(listener: (state: ConnectionState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private updateState(update: Partial<ConnectionState>) {
    this.state = { ...this.state, ...update };
    this.listeners.forEach(listener => listener(this.getState()));
  }

  setConnecting(peerId: string) {
    this.clearTimeouts();
    this.updateState({ 
      status: 'connecting', 
      peerId,
      lastError: null
    });

    // Set connection timeout
    this.connectionTimeout = setTimeout(() => {
      if (this.state.status === 'connecting') {
        this.setFailed('Connection timeout after 10 seconds');
      }
    }, 10000);
  }

  setConnected(peerId: string) {
    this.clearTimeouts();
    this.updateState({ 
      status: 'connected', 
      peerId,
      retryCount: 0,
      lastError: null,
      isManualReconnect: false
    });
  }

  setDisconnected(error?: string) {
    this.clearTimeouts();
    this.updateState({ 
      status: 'disconnected',
      lastError: error || null
    });
  }

  setFailed(error: string) {
    this.clearTimeouts();
    this.updateState({ 
      status: 'failed',
      lastError: error
    });
  }

  shouldRetry(): boolean {
    return this.state.retryCount < 3 && this.state.status !== 'connected';
  }

  getRetryDelay(): number {
    const delays = [1000, 3000, 5000]; // 1s, 3s, 5s
    return delays[Math.min(this.state.retryCount, delays.length - 1)];
  }

  scheduleRetry(retryFn: () => void) {
    if (!this.shouldRetry()) {
      this.setFailed(`Failed to connect after ${this.state.retryCount} attempts`);
      return;
    }

    this.updateState({ retryCount: this.state.retryCount + 1 });
    const delay = this.getRetryDelay();
    
    console.log(`Network error, retrying in ${delay}ms... (${this.state.retryCount}/3)`);
    
    this.retryTimeout = setTimeout(() => {
      if (this.state.status !== 'connected') {
        retryFn();
      }
    }, delay);
  }

  manualRetry(retryFn: () => void) {
    this.clearTimeouts();
    this.updateState({ 
      retryCount: 0, 
      isManualReconnect: true,
      lastError: null 
    });
    retryFn();
  }

  reset() {
    this.clearTimeouts();
    this.updateState({
      status: 'disconnected',
      peerId: null,
      retryCount: 0,
      lastError: null,
      isManualReconnect: false
    });
  }

  private clearTimeouts() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }
}
