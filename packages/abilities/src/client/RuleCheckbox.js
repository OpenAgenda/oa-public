import React, { PureComponent } from 'react';
import _ from 'lodash';
import { Field } from 'react-final-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import { shouldUpdate, shallowEqual } from 'recompose';

const stateMessages = defineMessages({
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
});

const ruleMessages = defineMessages({
  receiveInvitation: {
    id: 'Abilities.RulesCheckbox.rules.receiveInvitation',
    defaultMessage: 'Receive invitations'
  },
  receiveNotificationsSummary: {
    id: 'Abilities.RulesCheckbox.rules.receiveNotificationsSummary',
    defaultMessage: 'Receive summaries of notifications'
  },
  receiveMemberMessage: {
    id: 'Abilities.RulesCheckbox.rules.receiveMemberMessage',
    defaultMessage: 'Receive messages sent via the "Write to them" feature'
  },
  receiveUserInboxMessage: {
    id: 'Abilities.RulesCheckbox.rules.receiveUserInboxMessage',
    defaultMessage: 'Receive messages from my inbox'
  },
  receiveAgendaInboxMessage: {
    id: 'Abilities.RulesCheckbox.rules.receiveAgendaInboxMessage',
    defaultMessage: 'Receive messages from agenda inbox'
  },
  receiveEvent: {
    id: 'Abilities.RulesCheckbox.rules.receiveEvent',
    defaultMessage: 'Receive events sent by other users'
  },
  receiveMyEventChangeState: {
    id: 'Abilities.RulesCheckbox.rules.receiveMyEventChangeState',
    defaultMessage:
      'Receive notifications when someone change state of my events'
  },
  receiveMyEventUpdate: {
    id: 'Abilities.RulesCheckbox.rules.receiveMyEventUpdate',
    defaultMessage: 'Receive notifications when someone update my events'
  },
  receiveMyEventAggregation: {
    id: 'Abilities.RulesCheckbox.rules.receiveMyEventAggregation',
    defaultMessage: 'Receive notifications when someone aggregate my events'
  },
  receiveEventChangeState: {
    id: 'Abilities.RulesCheckbox.rules.receiveEventChangeState',
    defaultMessage: 'Receive states changes for {state}'
  },
  receiveMyEventCreation: {
    id: 'Abilities.RulesCheckbox.rules.receiveMyEventCreation',
    defaultMessage: 'Receive event creation confirmations'
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
  },
  receiveEventAddition: {
    id: 'Abilities.RulesCheckbox.rules.receiveEventAddition',
    defaultMessage: 'Receive event creations'
  },
  receiveMyEventAddition: {
    id: 'Abilities.RulesCheckbox.rules.receiveMyEventAddition',
    defaultMessage: 'Receive notifications when someone add my events'
  }
});

const RuleLabel = shouldUpdate(
  (props, nextProps) => !shallowEqual(props.rule, nextProps.rule)
)(({ rule }) => {
  const values = {};

  if (rule.actions === 'receive' && rule.subject === 'eventChangeState') {
    values.state = (
      <FormattedMessage {...stateMessages[rule.conditions.state]} />
    );
  }

  const messageKey = `${rule.actions}${_.upperFirst(rule.subject)}`;

  if (!ruleMessages[messageKey]) {
    return messageKey;
  }

  return <FormattedMessage {...ruleMessages[messageKey]} values={values} />;
});

export default class RuleCheckbox extends PureComponent {
  renderField = ({ input, meta }) => {
    const { rule } = this.props;

    return (
      <div className="checkbox">
        <label htmlFor={rule.key}>
          <input
            type="checkbox"
            id={rule.key}
            ref={ref => {
              if (ref) {
                ref.indeterminate = meta.data.indeterminate;
              }
            }}
            {...input}
          />{' '}
          <RuleLabel rule={rule} />
        </label>
      </div>
    );
  };

  render() {
    const { rule } = this.props;

    return (
      <Field
        key={rule.key}
        name={rule.key}
        type="checkbox"
        subscription={{ value: true, data: true }}
        validateFields={[]}
        render={this.renderField}
      />
    );
  }
}
