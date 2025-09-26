declare module 'sockjs-client' {
  class SockJS {
    constructor(url: string, _reserved?: unknown, options?: unknown);

    send(data: string): void;
    close(code?: number, reason?: string): void;

    onopen?: (event?: Event) => void;
    onmessage?: (event: MessageEvent) => void;
    onclose?: (event?: CloseEvent) => void;

    readonly readyState: number;
  }

  export = SockJS;
}
