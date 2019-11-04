import React from 'react';
import { Link } from 'react-router-dom';

export default function MenuItem({ children, active, linkTo, onClick }) {
  return active ? (
    <li className="active">
      <h2>{children}</h2>
    </li>
  ) :(
    <li>
      <Link to={linkTo} onClick={onClick}>{children}</Link>
    </li>
  );
}
