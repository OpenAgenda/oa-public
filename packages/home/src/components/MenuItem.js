import React from 'react';
import { Link } from 'react-router-dom';

export default React.memo( function MenuItem ( { children, active, linkTo, onClick } ) {
  if ( active ) {
    return (
      <li className="active">
        <h2>{children}</h2>
      </li>
    );
  }

  return (
    <li>
      <Link to={linkTo} onClick={onClick}>{children}</Link>
    </li>
  );
} )
