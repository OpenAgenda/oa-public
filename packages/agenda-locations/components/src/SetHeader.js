import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Modal, MoreInfo } from '@openagenda/react-components';

import labels from '@openagenda/labels/agenda-locations/setHeader';
import createLabelGetter from '@openagenda/labels';

const getLabel = createLabelGetter(labels);

module.exports = createReactClass({
  propTypes: {
    lang: PropTypes.text,
    set: PropTypes.object,
  },
  render: function () {
    const { set, lang } = this.props;
    return (
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
  },
});
