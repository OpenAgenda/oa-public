import BootstrapComponentsProvider from './components/bootstrap/Provider.js';
import PassCultureConfirmation from './passCulture/Confirmation.js';
import App from './App.js';

const defaultComponent = (props) => (
  <BootstrapComponentsProvider>
    <App {...props} />
  </BootstrapComponentsProvider>
);

export default Object.assign(defaultComponent, {
  PassCultureConfirmation,
});
