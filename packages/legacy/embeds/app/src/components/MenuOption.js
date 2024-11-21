export default function TableRow({
  value,
  head,
  summary,
  selection,
  onSelect,
}) {
  return (
    <div className="radio margin-v-md">
      <label htmlFor={value}>
        <input
          id={value}
          name="embed-option"
          type="radio"
          checked={selection === value}
          className="padding-right-xs"
          onChange={onSelect.bind(null, value)}
        />
        {head}
        <div className="text-muted">{summary}</div>
      </label>
    </div>
  );
}
