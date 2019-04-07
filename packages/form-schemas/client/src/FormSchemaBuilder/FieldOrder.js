import React, { Component } from 'react';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import labels from './lib/labels';

const getLabel = makeLabelGetter( labels );

export default ( { lang, disabled, onStartOrder } ) => <div>
  <label className="padding-top-xs">{getLabel( 'orderTitle', lang)}</label>
  { disabled ?
    <button disabled className="btn btn-link pull-right">{getLabel( 'orderEdit', lang )}</button>
    : <button className="btn btn-link pull-right" onClick={onStartOrder}>{getLabel( 'orderEdit', lang )}</button> }
</div>
