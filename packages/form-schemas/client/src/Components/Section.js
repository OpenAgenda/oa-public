import flattenSectionLabels from '../lib/flatten';

export default function Section(props) {
  const {
    lang,
    section,
  } = props;

  const {
    label,
  } = flattenSectionLabels(section, lang);

  return (
    <h3 className="margin-top-sm margin-v-md">{label}</h3>
  );
}
