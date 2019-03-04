import React, { Component } from 'react';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import labels from '../lib/builderLabels';

const getLabel = makeLabelGetter( labels );

export default ( { lang, disabled, onStartOrder } ) => <div>
  <label className="padding-top-sm">{getLabel( 'orderTitle', lang)}</label>
  { disabled ?
    <button disabled className="btn btn-link">{getLabel( 'orderEdit', lang )}</button>
    : <button className="btn btn-link" onClick={onStartOrder}>{getLabel( 'orderEdit', lang )}</button> }
</div>
