import TextFieldComponent from '@openagenda/form-schemas/client/build/Components/TextField';

export default function EmailsComponent(props) {
  const { field } = props;
  return (
    <TextFieldComponent
      {...props}
      field={{ ...field, fieldType: 'textarea' }}
    />
  );
}
