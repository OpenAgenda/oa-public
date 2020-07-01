import React from 'react';

export default function BorderBox({ className, children }) {
  return (
    <div
      css={{
        border: '#eee dashed 2px',
        borderRadius: '10px'
      }}
      className={className}
    >
      {children}
    </div>
  );
}
