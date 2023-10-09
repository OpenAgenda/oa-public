import BootstrapComponentsProvider from './components/bootstrap/Provider';
import App from './App';

export default props => (
  <BootstrapComponentsProvider>
    <App {...props} />
  </BootstrapComponentsProvider>
);
