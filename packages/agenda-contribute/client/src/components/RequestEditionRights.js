import React from 'react';
import { MoreInfo } from '@openagenda/react-components';

import labels from '@openagenda/labels/agenda-contribute/event';
import makeLabelGetter from '@openagenda/labels';

const getLabel = makeLabelGetter(labels);

export default ({ lang, agenda, event, hasAdditionalFields }) => <div className="margin-h-md padding-top-md">
  <p>
    <span>{getLabel('noEditionRights', lang)} </span> {hasAdditionalFields ? <span>{getLabel('onlyAdditionalFieldsCanBeEdited', lang)}</span> : null}
    <span><MoreInfo id="noEditionRights" content={getLabel(
      'onlyAdditionalFieldsCanBeEditedInfo',
      { agenda: agenda.title },
      lang
    )}/></span>
  </p>
  <p>
    <a
      className="margin-right-xs"
      href={`/${agenda.slug}/admin/events/${event.slug}/edition-request`}
    >{getLabel('requestEditionRights', lang)}</a>
    <MoreInfo id="requestEditionRights" content={getLabel('requestEditionRightsInfo', lang)}/>
  </p>
</div>