export default function ListItemPart({ children, type }) {
  return (
    <span
      className={`margin-right-xs ${type === 'danger' ? 'text-danger' : ''}`}
    >{ children }
    </span>
  );
}
