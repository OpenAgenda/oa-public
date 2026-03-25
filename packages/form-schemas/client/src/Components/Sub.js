import classNames from 'classnames';
import ReactMarkdown from 'react-markdown';

export default function Sub({ error, label, warning }) {
  const text = error || warning;

  return (
    <div
      className={classNames({
        sub: true,
        error: !!error,
        'has-warning': !!warning && !error,
      })}
    >
      {text
        || (label ? (
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <>
                  {children}
                  <br />
                </>
              ),
            }}
          >
            {label}
          </ReactMarkdown>
        ) : null)}
    </div>
  );
}
