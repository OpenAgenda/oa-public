import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MoreInfo } from '@openagenda/react-components';

import labels from '@openagenda/labels/agenda-locations/setHeader';
import createLabelGetter from '@openagenda/labels';

const getLabel = createLabelGetter(labels);


const SetHeader = ({ set, lang }) => (
  <div className="row">
    <div className="col-sm-12 margin-bottom-md">
      <h2>{set.title}</h2>
      <div>
        {getLabel(
          'setSubtitle',
          {
            agendasCount: set.agendasCount,
            locationsCount: set.locationsCount,
          },
          lang
        )}
        <MoreInfo
          className="margin-left-sm"
          id="checkbox-help"
          content={getLabel('help', lang)}
          placement="top"
        />
      </div>
    </div>
  </div>
);

SetHeader.propTypes = {
  lang: PropTypes.string.isRequired,
  set: PropTypes.object.isRequired,
};

export default SetHeader;
