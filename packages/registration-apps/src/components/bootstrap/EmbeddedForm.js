export default function EmbeddedForm({ children, title }) {
  return (
    <div className="panel panel-default padding-top-xs padding-h-sm margin-v-sm padding-bottom-sm">
      <div className="margin-bottom-sm">
        <b>{title}</b>
      </div>
      {children}
    </div>
  );
}
