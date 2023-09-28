export default function Form({ children, type }) {
  return (
    <form className={type === 'inline' ? 'form-inline' : ''}>
      {children}
    </form>
  );
}
