import { io, Socket } from "socket.io-client";

const BACKEND_URL = "http://localhost:8000";

type SocketEventMap = {
  connection_ack: (data: { status: string }) => void;
  listening_ack: (data: { status: string }) => void;
  backend_status: (data: { active: boolean }) => void;
  audio_received: (data: { chunkIndex: number }) => void;
};

class SocketService {
  private socket: Socket | null = null;
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  connect(): Socket {
    if (this.socket?.connected) return this.socket;

    this.socket = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }

  emit(event: string, data?: unknown) {
    this.socket?.emit(event, data ?? {});
  }

  on<K extends keyof SocketEventMap>(event: K, handler: SocketEventMap[K]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as any)?.on(event, handler);
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.listeners.get(event)!.add(handler as (...args: any[]) => void);
  }

  off<K extends keyof SocketEventMap>(event: K, handler: SocketEventMap[K]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as any)?.off(event, handler);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.listeners.get(event)?.delete(handler as (...args: any[]) => void);
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
