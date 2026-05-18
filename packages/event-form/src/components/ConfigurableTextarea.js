import TextField from '@openagenda/form-schemas/client/build/Components/TextField.mjs';
import MarkdownField from '@openagenda/form-schemas/client/build/Components/MarkdownField.mjs';

const ConfigurableTextarea = (props) => {
  const { field } = props;
  if (field.mode === 'textarea') {
    return <TextField {...props} field={{ ...field, fieldType: 'textarea' }} />;
  }
  return (
    <MarkdownField {...props} field={{ ...field, fieldType: 'textarea' }} />
  );
};
export default ConfigurableTextarea;
