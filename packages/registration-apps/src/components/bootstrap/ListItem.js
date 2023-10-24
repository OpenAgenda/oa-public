export default function ListItem({ children, key }) {
  return (
    <li className="margin-v-xs" key={key}>
      {children}
    </li>
  );
}