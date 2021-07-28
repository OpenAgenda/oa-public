import React from 'react';
import classNames from 'classnames';

export default function Sub({ error, label }) {
  return (
    <div
      className={classNames({
        sub: true,
        error: !!error
      })}
    >
      {error || label }
    </div>
  );
}
