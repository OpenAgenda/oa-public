import React, { Component } from 'react';
import classNames from 'classnames';

const _ = {
  isArray: require( 'lodash/isArray' )
}

module.exports = class FieldCounter extends Component {

  remaining() {

    const value = _.isArray( this.props.value ) ? this.props.value.join('') : this.props.value;

    if ( !value ) return this.props.max;

    return this.props.max - value.length;

  }

  render() {

    const {
      max,
      value
    } = this.props;

    const remaining = this.remaining();

    return <div className={classNames({ 'field-counter' : true, error: remaining < 0})}>{remaining}</div>

  }

}
