import { useState } from 'react';
import { BrowserRouter as Router, Switch, Link, Route } from 'react-router-dom';
import LeaveWarningPrompt from '../src/components/LeaveWarningPrompt.js';
import SimpleCanvas from './decorators/SimpleCanvas.js';
import IntlProvider from './decorators/IntlProvider.js';

// eslint-disable-next-line
import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'LeaveWarningPrompt',
  component: LeaveWarningPrompt,
  decorators: [IntlProvider, SimpleCanvas],
};

function ToggleButtons({ enabled, setEnabled }) {
  return (
    <>
      <button
        type="button"
        disabled={enabled}
        className="btn btn-primary margin-right-sm"
        onClick={() => setEnabled(true)}
      >
        Enable
      </button>
      <button
        type="button"
        disabled={!enabled}
        className="btn btn-default margin-right-sm"
        onClick={() => setEnabled(false)}
      >
        Disable
      </button>
    </>
  );
}

export const PageLeaveWarningOnly = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="col-md-6 col-md-offset-3 col-sm-12 wsq padding-v-sm">
      <p>
        When enabled, a warning prompt appears when user attempts to leave page.
        Storybook uses an iframe, so click on the reload page to test.
      </p>
      <ToggleButtons enabled={enabled} setEnabled={setEnabled} />
      <button
        type="button"
        className="btn btn-default"
        onClick={() => window.location.reload()}
      >
        Reload page
      </button>
      <LeaveWarningPrompt enabled={enabled} />
    </div>
  );
};

export const RouteLeaveWarningOnly = () => {
  // eslint-disable-next-line react/no-unstable-nested-components
  function Main() {
    const [enabled, setEnabled] = useState(false);

    return (
      <div>
        <p>
          Click on other link to leave main app. If WarningPrompt is enabled, a
          confirmation prompt will appear.
        </p>
        <ToggleButtons enabled={enabled} setEnabled={setEnabled} />
        <LeaveWarningPrompt
          enabled={enabled}
          warnBeforePageUnload={false}
          warnBeforeRouteTransition
        />
      </div>
    );
  }

  return (
    <div className="col-md-6 col-md-offset-3 col-sm-12 wsq padding-v-sm">
      <Router>
        <ul className="list-unstyled">
          <li>
            <Link to="/">Main (start here)</Link>
          </li>
          <li>
            <Link to="/other">Other (leave main)</Link>
          </li>
        </ul>
        <Switch>
          <Route path="/" exact>
            <Main />
          </Route>
          <Route path="/other">
            <p>Other</p>
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export const RouteAndPageLeaveWarning = () => {
  // eslint-disable-next-line react/no-unstable-nested-components
  function Main() {
    const [enabled, setEnabled] = useState(false);

    return (
      <div>
        <p>
          Click on other link to leave main app. If WarningPrompt is enabled, a
          confirmation prompt will appear. If page is reloaded, a prompt also
          appears.
        </p>
        <ToggleButtons enabled={enabled} setEnabled={setEnabled} />
        <button
          type="button"
          className="btn btn-default"
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
        <LeaveWarningPrompt
          enabled={enabled}
          warnBeforePageUnload
          warnBeforeRouteTransition
        />
      </div>
    );
  }

  return (
    <div className="col-md-6 col-md-offset-3 col-sm-12 wsq padding-v-sm">
      <Router>
        <ul className="list-unstyled">
          <li>
            <Link to="/">Main (start here)</Link>
          </li>
          <li>
            <Link to="/other">Other (leave main)</Link>
          </li>
        </ul>
        <Switch>
          <Route path="/" exact>
            <Main />
          </Route>
          <Route path="/other">
            <p>Other</p>
          </Route>
        </Switch>
      </Router>
    </div>
  );
};
