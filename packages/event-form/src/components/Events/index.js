import Selection from './Selection';
import Add from './Add';

export default function EventsAdditionalFieldComponent({ field, value, lang, onChange }) {
  return (
    <div>
      <Selection res={field.res} value={value} lang={lang} onChange={onChange} id={`${field.field}-selection`} />
      <Add res={field.res} value={value} lang={lang} onChange={onChange} id={`${field.field}-add`} />
    </div>
  );
}
