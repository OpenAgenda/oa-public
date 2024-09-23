export default ({ value }) =>
  (value ? (
    <div className="margin-bottom-xs">
      {value.split('\n').map((line, index) => (
        /* eslint-disable-next-line react/no-array-index-key */
        <div key={`line-${index}`}>{line}</div>
      ))}
    </div>
  ) : null);
