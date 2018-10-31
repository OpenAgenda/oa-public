import React from 'react';
import _ from 'lodash';
import { Field } from 'react-final-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import { shouldUpdate, shallowEqual } from 'recompose';

const stateMessages = defineMessages( {
  '-1': {
    id: 'Abilities.RulesCheckbox.states.refused',
    defaultMessage: 'refused'
  },
  0: {
    id: 'Abilities.RulesCheckbox.states.toControl',
    defaultMessage: 'to control'
  },
  1: {
    id: 'Abilities.RulesCheckbox.states.controlled',
    defaultMessage: 'controlled'
  },
  2: {
    id: 'Abilities.RulesCheckbox.states.published',
    defaultMessage: 'published'
  }
} );

const rulesMessages = defineMessages( {
  receiveInvitation: {
    id: 'Abilities.RulesCheckbox.rules.receiveInvitation',
    defaultMessage: 'Receive invitations'
  },
  receiveStateChange: {
    id: 'Abilities.RulesCheckbox.rules.receiveStateChange',
    defaultMessage: 'Receive states changes for {state}'
  },
  receiveNotificationsSummary: {
    id: 'Abilities.RulesCheckbox.rules.receiveNotificationsSummary',
    defaultMessage: 'Receive summaries of notifications'
  },
  receiveEvent: {
    id: 'Abilities.RulesCheckbox.rules.receiveEvent',
    defaultMessage: 'Receive events sent by other users'
  },
  receiveEventCreation: {
    id: 'Abilities.RulesCheckbox.rules.receiveEventCreation',
    defaultMessage: 'Receive event creations'
  },
  receiveEventUpdate: {
    id: 'Abilities.RulesCheckbox.rules.receiveEventUpdate',
    defaultMessage: 'Receive event updates'
  },
  receiveEventAggregation: {
    id: 'Abilities.RulesCheckbox.rules.receiveEventAggregation',
    defaultMessage: 'Receive event aggregations'
  }
} );

const RuleLabel = shouldUpdate(
  ( props, nextProps ) => !shallowEqual( props.rule, nextProps.rule )
)( ( { rule } ) => {
  const values = {};

  if ( rule.actions === 'receive' && rule.subject === 'stateChange' ) {
    values.state = (
      <FormattedMessage {...stateMessages[ rule.conditions.state ]} />
    );
  }

  return (
    <FormattedMessage
      {...rulesMessages[ `${rule.actions}${_.upperFirst( rule.subject )}` ]}
      values={values}
    />
  );
} );

export default ( { rule } ) => (
  <Field
    key={rule.key}
    name={rule.key}
    type="checkbox"
    subscription={{ value: true, data: true }}
    validateFields={[]}
    render={( { input, meta } ) => (
      <div className="checkbox">
        <label htmlFor={rule.key}>
          <input
            type="checkbox"
            id={rule.key}
            ref={ref => {
              if ( ref ) {
                ref.indeterminate = meta.data.indeterminate;
              }
            }}
            {...input}
          />{' '}
          <RuleLabel rule={rule} />
        </label>
      </div>
    )}
  />
);
