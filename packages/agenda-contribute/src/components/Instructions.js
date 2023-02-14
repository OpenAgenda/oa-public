import ReactMarkdown from 'react-markdown';

function Instructions({
  message,
  className,
}) {
  if (!message) {
    return null;
  }

  return (
    <div className={className ?? 'wsq'}>
      <div className="event-instruction padding-all-md padding-bottom-sm boxed">
        <ReactMarkdown linkTarget="_blank">{message}</ReactMarkdown>
      </div>
    </div>
  );
}

export default Instructions;
