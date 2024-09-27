import { createRoot } from 'react-dom/client';
import Main from './Main';

// if (import.meta.webpackHot) import.meta.webpackHot.accept();

const anchor = document.getElementsByClassName('js_oa_docx_anchor')[0];

const props = {
  locale: anchor.getAttribute('data-locale') || 'fr',
  agendaUid: anchor.getAttribute('data-agenda-uid'),
  labels: anchor.getAttribute('data-labels') || undefined,
  res: anchor.getAttribute('data-res') || '#res',
};

createRoot(anchor).render(<Main {...props} />);
