import React from 'react';
import { render } from 'react-dom';
import Main from './Main';

if (module.hot) module.hot.accept();

const anchor = document.getElementsByClassName('js_oa_docx_anchor')[0];

const props = {
  locale: anchor.getAttribute('data-locale') || 'fr',
  agendaUid: anchor.getAttribute('data-agenda-uid'),
  labels: anchor.getAttribute('data-labels') || undefined,
  res: anchor.getAttribute('data-res') || '#res'
};

render(<Main {...props} />, anchor);
