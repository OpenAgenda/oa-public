import React from 'react';
import { Link } from 'react-router-dom';

function Logo({ user }) {
  return user ? (
    <Link to="/home" className="navbar-brand">
      <img src="/images/openagenda.png" width="125" alt="OpenAgenda" />
    </Link>
  ) : (
    <a className="navbar-brand" href="/">
      <img src="/images/openagenda.png" width="125" alt="OpenAgenda" />
    </a>
  );
}

export default React.memo(Logo);
