declare module 'http' {
  interface IncomingMessage {
    otelAttributes?: Record<string, any>;
  }

  interface ClientRequest {
    otelAttributes?: Record<string, any>;
  }
}
