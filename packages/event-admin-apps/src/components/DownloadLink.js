import React from 'react';

export default function DownloadLink({ children, ...props }) {
  return (
    <a target="_blank" rel="noopener noreferrer" download {...props}>
      {children}
    </a>
  );
}
