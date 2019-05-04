import _ from 'lodash';
import React, { Component } from 'react';

export default props => {

  const { children } = props;

  return <div className="wsq padding-all-sm margin-bottom-md">
    <div className={_.get( props, 'className', '' )}>
      {children}
    </div>
  </div>

}
