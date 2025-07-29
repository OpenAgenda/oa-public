import { useEffect } from 'react';
declare const window: {
  $crisp: any[];
  CRISP_WEBSITE_ID: string;
} & Window;

function addCrispTracker(crispID: string) {
  window.$crisp = [];
  window.CRISP_WEBSITE_ID = crispID;

  (function () {
    const d = document;
    const s = d.createElement('script');
    s.src = 'https://client.crisp.chat/l.js';

    s.async = true;

    d.getElementsByTagName('head')[0].appendChild(s);
  })();
}

export default function useCrispClient() {
  const crispID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
  useEffect(() => {
    if (!crispID) return;

    addCrispTracker(crispID);
  }, [crispID]);
}
