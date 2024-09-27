import _ from 'lodash';
import ReactDOM from 'react-dom';
import createApp from '@openagenda/inbox-apps/src/app';
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

  ReactDOM.render(wrapApp(
    createApp({ initialState }),
    { extraProps }),
    document.querySelector('.js_canvas')
  );
});
