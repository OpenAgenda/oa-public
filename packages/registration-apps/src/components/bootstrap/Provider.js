import { Spinner } from '@openagenda/react-shared';
import ComponentsContext from '../Context';

import StandardRegistrationField from './StandardRegistrationField';
import Select from './Select';
import Badge from './Badge';
import Button from './Button';
import Section from './Section';
import Form from './Form';
import Input from './Input';
import List from './List';
import ListItem from './ListItem';
import ListItemPart from './ListItemPart';
import ListItemLine from './ListItemLine';
import EmbeddedForm from './EmbeddedForm';
import MoreInfo from './MoreInfo';

const components = {
  StandardRegistrationField,
  Spinner,
  Select,
  Section,
  Button,
  Badge,
  Form,
  Input,
  List,
  ListItem,
  ListItemLine,
  ListItemPart,
  EmbeddedForm,
  MoreInfo,
};

export default function BootstrapComponentsProvider({ children }) {
  return (
    <ComponentsContext.Provider value={components}>
      {children}
    </ComponentsContext.Provider>
  );
}
