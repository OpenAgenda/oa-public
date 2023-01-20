import flattenSectionLabels from '../lib/flatten';

export default function Section(props) {
  const {
    lang,
    section,
  } = props;

  const {
    label,
  } = flattenSectionLabels(section, lang);

  if (!section.display) return;

  if (!label) {
    return <div className="divider margin-bottom-lg margin-top-sm" />;
  }

  return (
    <h3 className="margin-v-md">{label}</h3>
  );
}
