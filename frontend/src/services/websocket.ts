export type WSMessageCallback = (data: any) => void;

export class OrderWebSocket {
  private socket: WebSocket | null = null;
  private url: string;
  private onMessageCallback: WSMessageCallback;
  private reconnectInterval: number = 3000;
  private isExplicitClosed: boolean = false;

  constructor(endpoint: string, onMessage: WSMessageCallback) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.url = `${protocol}//${host}${endpoint}`;
    this.onMessageCallback = onMessage;
    this.connect();
  }

  private connect() {
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('⚡ WebSocket Connected:', this.url);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessageCallback(data);
        } catch (e) {
          console.error('WebSocket parse error:', e);
        }
      };

      this.socket.onclose = () => {
        if (!this.isExplicitClosed) {
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      this.socket.onerror = (err) => {
        console.error('WebSocket Error:', err);
      };
    } catch (err) {
      console.error('WebSocket Connection Failed:', err);
    }
  }

  public close() {
    this.isExplicitClosed = true;
    if (this.socket) {
      this.socket.close();
    }
  }
}
