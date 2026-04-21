import { Fragment } from 'react';
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
        || (label
          ? label
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((paragraph, i, arr) => (
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={i}>
                <ReactMarkdown disallowedElements={['p']} unwrapDisallowed>
                  {paragraph}
                </ReactMarkdown>
                {i < arr.length - 1 ? <br /> : null}
              </Fragment>
            ))
          : null)}
    </div>
  );
}
