// Global namespace for our iframe communication (parentIFrame is frozen)
declare global {
  interface Window {
    oaIFrame?: {
      /**
       * Call a method on the parent page asynchronously.
       * Returns a promise that resolves with the parent's response.
       */
      callParent?: <TResult = any>(
        action: string,
        payload?: any,
      ) => Promise<TResult>;
    };
  }
}

export {};
