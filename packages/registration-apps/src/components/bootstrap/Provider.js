import { Spinner } from '@openagenda/react-shared';
import ComponentsContext from '../Context.js';

import StandardRegistrationField from './StandardRegistrationField.js';
import Select from './Select.js';
import Badge from './Badge.js';
import Button from './Button.js';
import Section from './Section.js';
import Form from './Form.js';
import Input from './Input.js';
import List from './List.js';
import ListItem from './ListItem.js';
import ListItemPart from './ListItemPart.js';
import ListItemLine from './ListItemLine.js';
import EmbeddedForm from './EmbeddedForm.js';
import MoreInfo from './MoreInfo.js';
import Checkbox from './Checkbox.js';
import Textarea from './Textarea.js';

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
  Checkbox,
  Textarea,
};

export default function BootstrapComponentsProvider({ children }) {
  return (
    <ComponentsContext.Provider value={components}>
      {children}
    </ComponentsContext.Provider>
  );
}
