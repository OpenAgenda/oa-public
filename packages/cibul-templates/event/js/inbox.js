import _ from 'lodash';
import { createRoot } from 'react-dom/client';
import createApp from '@openagenda/inbox-apps';
import { wrapApp } from '@openagenda/react-shared';

const defaults = {
  initialState: {
    settings: {
      prefix: '',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20
    }
  }
};

window.hook(options => {
  const { initialState } = _.merge({}, defaults, options);
  const extraProps = {
    user: initialState.user,
    agenda: initialState.agenda,
    ...options.extraProps
  };

  const root = createRoot(document.querySelector('.js_canvas'));
  root.render(wrapApp(
    createApp({ initialState }),
    { extraProps }),
  );
});
