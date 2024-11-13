import Selection from './Selection.js';
import Add from './Add.js';

export default function EventsAdditionalFieldComponent({
  field,
  value,
  lang,
  onChange,
}) {
  return (
    <div>
      <Selection
        res={field.res}
        value={value}
        lang={lang}
        onChange={onChange}
        id={`${field.field}-selection`}
      />
      <Add
        res={field.res}
        value={value}
        lang={lang}
        onChange={onChange}
        id={`${field.field}-add`}
      />
    </div>
  );
}
