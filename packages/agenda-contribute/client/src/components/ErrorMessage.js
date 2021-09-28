import React from 'react';
import makeLabelGetter from '@openagenda/labels';
import labels from '@openagenda/labels/agenda-contribute/event';
import getEventTitle from '../lib/getEventTitle';

const getLabel = makeLabelGetter(labels);

export default ({
  errors,
  lang,
  event,
  agenda,
  suggestChangeRes,
  onCancel
}) => <div className="error-summary boxed padding-v-md padding-h-md text-left">
  <strong>{getLabel('shareRestrictionInfo', {
    event: getEventTitle(event, lang),
    agenda: agenda.title
  }, lang)}</strong>:
  <ul className="padding-v-md padding-h-md">
    {errors.map(err => <li>
      <strong>{err.fieldLabel}</strong>: {err.codeLabel || err.code}
    </li>)}
  </ul>
  <div className="text-center">
    <a href={suggestChangeRes} className="btn btn-primary margin-h-sm">{getLabel('suggestChange', lang)}</a>
    <button 
      className="btn btn-default margin-h-sm"
      onClick={onCancel}
    >{getLabel('cancelShare', lang)}</button>
  </div>
</div>