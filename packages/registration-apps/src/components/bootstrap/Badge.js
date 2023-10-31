export default function Badge({ type, children }) {
  return (
    <span className={`badge ${type === 'danger' ? 'badge-danger' : 'badge-default'}`}>
      {children}
    </span>
  );
}