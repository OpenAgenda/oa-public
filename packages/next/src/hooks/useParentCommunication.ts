import { useCallback, useRef, useEffect } from 'react';

export default function useParentCommunication() {
  const pendingRequests = useRef<
    Map<string, { resolve: Function; reject: Function }>
  >(new Map());

  const generateRequestId = useCallback(() => {
    return `child_request_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }, []);

  const handleParentResponse = useCallback((message: any) => {
    if (message?.type === 'childResponse' && message.id) {
      const request = pendingRequests.current.get(message.id);
      if (request) {
        pendingRequests.current.delete(message.id);

        if (message.error) {
          request.reject(new Error(message.error));
        } else {
          request.resolve(message.result);
        }
      }
    }
  }, []);

  const callParent = useCallback(
    <TResult = any>(action: string, payload?: any): Promise<TResult> => {
      return new Promise((resolve, reject) => {
        if (!('parentIFrame' in window)) {
          reject(new Error('parentIFrame is not available'));
          return;
        }

        const id = generateRequestId();

        pendingRequests.current.set(id, {
          resolve,
          reject,
        });

        window.parentIFrame.sendMessage({
          type: 'childRequest',
          id,
          action,
          payload,
        });
      });
    },
    [generateRequestId],
  );

  // Attach callParent to window.oaIFrame (parentIFrame is frozen)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.oaIFrame) window.oaIFrame = {};
      window.oaIFrame.callParent = callParent;
    }
  }, [callParent]);

  return {
    handleParentResponse,
    pendingRequestsCount: () => pendingRequests.current.size,
  };
}
