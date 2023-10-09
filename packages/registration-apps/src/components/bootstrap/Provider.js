import { Spinner } from '@openagenda/react-shared';
import ComponentsContext from '../Context';

import StandardRegistrationField from './StandardRegistrationField';
import Select from './Select';
import Button from './Button';
import Form from './Form';
import Input from './Input';
import ListItemPart from './ListItemPart';

const components = {
  StandardRegistrationField,
  Spinner,
  Select,
  Button,
  Form,
  Input,
  ListItemPart,
};

export default function BootstrapComponentsProvider({ children }) {
  return (
    <ComponentsContext.Provider value={components}>
      {children}
    </ComponentsContext.Provider>
  );
}
