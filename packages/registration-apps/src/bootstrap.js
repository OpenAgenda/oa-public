import BootstrapComponentsProvider from './components/bootstrap/Provider';
import PassCultureConfirmation from './passCulture/Confirmation';
import App from './App';

const defaultComponent = props => (
  <BootstrapComponentsProvider>
    <App {...props} />
  </BootstrapComponentsProvider>
);

export default Object.assign(defaultComponent, {
  PassCultureConfirmation,
});
