import Selection from './Selection';
import Add from './Add';

export default function EventsAdditionalFieldComponent({ field, value, lang, onChange }) {
  return (
    <div>
      <Selection res={field.res} value={value} lang={lang} onChange={onChange} />
      <Add res={field.res} value={value} lang={lang} onChange={onChange} />
    </div>
  );
}
