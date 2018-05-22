"use strict";

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import classNames from 'classnames';

export default class MenuItem extends Component {

  render() {

    const { active, linkTo } = this.props;

    if ( active ) {

      return <li className="active">
        <h2>{this.props.children}</h2>
      </li>

    }

    return <li>
      <Link to={linkTo}>{this.props.children}</Link>
    </li>

  }

}