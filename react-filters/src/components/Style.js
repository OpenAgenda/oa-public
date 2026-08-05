// Component stylesheet: React hoists it into <head>, deduplicates it by `href`
// and emits it server-side too, so consumers have nothing to import.
//
// React keeps the first content it sees for a given `href` and never removes
// the sheet, so name each one after its own module and only put rules here that
// stay harmless once their component unmounts.
export default function Style({ name, children }) {
  return (
    <style href={`@openagenda/react-filters/${name}`} precedence="default">
      {children}
    </style>
  );
}
