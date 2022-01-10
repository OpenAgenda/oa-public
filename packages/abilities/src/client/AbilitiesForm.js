import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import * as RRF from 'react-final-form';
import Collapse from 'rc-collapse';
import { shouldUpdate, shallowEqual } from 'recompose';
import { defineMessages, FormattedMessage } from 'react-intl';
import cn from 'classnames';
import Fuse from 'fuse.js';
import { Spinner } from '@openagenda/react-shared';
import RuleCheckbox from './RuleCheckbox';
import isIndeterminate from './isIndeterminate';

const MINLEN_REQUIRED_FOR_SEARCH = 8;

const FormSpy = shouldUpdate(
  (props, nextProps) => !shallowEqual(
    _.omit(props, 'subscription'),
    _.omit(nextProps, 'subscription')
  )
)(RRF.FormSpy);

const descriptionMessages = defineMessages({
  firstEntityUser: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.firstEntityUser',
    defaultMessage: 'Your global settings:',
  },
  firstEntityContributor: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.firstEntityContributor',
    defaultMessage: 'Your contributor settings:',
  },
  firstEntityAdminmod: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.firstEntityAdminmod',
    defaultMessage: 'Your administrator or moderator settings:',
  },
  childEntityContributor: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.childEntityContributor',
    defaultMessage: 'Contributor settings:',
  },
  childEntityAdminmod: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.childEntityAdminmod',
    defaultMessage: 'Administrator or moderator settings:',
  },
});

function getEntityTitle(ability) {
  switch (ability.entityName) {
    case 'user':
      return ability.entity.fullName;
    case 'agenda':
      return ability.entity.title;
    case 'member':
      return ability.entity.agendaTitle;
    default:
      return ability.identifier;
  }
}

const FilterInput = ({ value, onChange, placeholder }) => (
  <div className="form-group search">
    <div className="input-icon-right">
      <input
        name="filter"
        type="text"
        className="form-control"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button type="submit" className="btn">
        <i className="fa fa-search" aria-hidden="true" />
      </button>
    </div>
  </div>
);

const SaveButton = ({
  form, submitting, pristine, submitSucceeded
}) => (
  <button
    type="submit"
    onClick={form.submit}
    className={cn('btn', {
      'btn-primary': !submitSucceeded,
      'btn-success': submitSucceeded,
    })}
    disabled={submitting || pristine}
  >
    <FormattedMessage id="Abilities.AbilitiesForm.save" defaultMessage="Save" />

    {submitting && (
      <span className="margin-h-sm">
        <Spinner mode="inline" />
      </span>
    )}
  </button>
);

const FirstEntityRule = ({ ruleName, rules }) => {
  const headerMessage = descriptionMessages[`firstEntity${_.upperFirst(ruleName)}`];

  return (
    <div>
      {headerMessage ? (
        <b>
          <FormattedMessage {...headerMessage} />
        </b>
      ) : null}

      {rules.map(rule => (
        <RuleCheckbox key={rule.key} rule={rule} />
      ))}
    </div>
  );
};

const ChildEntityRule = ({ ruleName, rules }) => {
  const headerMessage = descriptionMessages[`childEntity${_.upperFirst(ruleName)}`];

  return (
    <div>
      {headerMessage ? (
        <b>
          <FormattedMessage {...headerMessage} />
        </b>
      ) : null}

      {rules.map(rule => (
        <RuleCheckbox key={rule.key} rule={rule} />
      ))}
    </div>
  );
};

export default class AbilitiesForm extends Component {
  static propTypes = {
    form: PropTypes.objectOf(PropTypes.any),
    rules: PropTypes.arrayOf(PropTypes.object),
    entityName: PropTypes.string.isRequired,
    identifier: PropTypes.number.isRequired,
    handleSubmit: PropTypes.func,
    HeaderComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    searchChildKey: PropTypes.string,
    filterInputPlaceholder: PropTypes.string,
  };

  static defaultProps = {
    rules: null,
    form: null,
    handleSubmit: null,
    HeaderComponent: null,
    searchChildKey: null,
    filterInputPlaceholder: '',
  };

  debouncedSearch = _.debounce(value => {
    this.setState({ debouncedSearch: value });
  }, 500);

  constructor(props) {
    super(props);

    this.state = {
      ruleKeys: null,
      firstEntityAbility: null,
      childAbilities: null,
      search: '',
      debouncedSearch: '',
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      entityName, identifier, rules, searchChildKey
    } = nextProps;
    const ruleKeys = rules.map(rule => rule.key);

    if (!_.isEqual(prevState.ruleKeys, ruleKeys)) {
      const rulesPerEntity = rules.reduce((result, rule) => {
        const entityProps = _.pick(rule, [
          'entityName',
          'identifier',
          'entity',
        ]);
        const found = _.find(result, entityProps);

        if (found) {
          found.rules.push(rule);
        } else {
          result.push({
            ...entityProps,
            rules: [rule],
          });
        }

        return result;
      }, []);

      const firstEntityAbility = _.find(rulesPerEntity, {
        entityName,
        identifier,
      });
      const childAbilities = _.groupBy(
        _.reject(rulesPerEntity, { entityName, identifier }),
        'entityName'
      );

      const fuseChildAbilities = searchChildKey
        ? _.mapValues(
          childAbilities,
          childAbility => new Fuse(childAbility, {
            shouldSort: true,
            threshold: 0.3,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: [searchChildKey],
          })
        )
        : null;

      return {
        ruleKeys,
        firstEntityAbility,
        childAbilities,
        fuseChildAbilities,
      };
    }

    return null;
  }

  componentDidMount() {
    // calculate `indeterminate` props
    const {
      rules, form, entityName, identifier
    } = this.props;

    const {
      mutators: { setFieldData },
      batch,
    } = form;
    const formState = form.getState();
    const allValues = formState.values;

    const [firstEntityRules, otherRules] = _.partition(
      rules,
      _.matches({
        entityName,
        identifier,
      })
    );

    batch(() => {
      for (const rule of firstEntityRules) {
        const relatedRules = _.filter(
          otherRules,
          _.matches(_.pick(rule, 'actions', 'subject', 'conditions'))
        );

        setFieldData(rule.key, {
          indeterminate: isIndeterminate(allValues, rule, relatedRules),
        });
      }
    });
  }

  handleSearchChange = e => {
    const { value } = e.target;

    this.setState({ search: value });
    this.debouncedSearch(value);
  };

  onFormValueChange = formState => {
    const {
      entityName, identifier, rules, form
    } = this.props;
    const {
      mutators: { setFieldData },
      batch,
      getFieldState,
    } = form;
    const [firstEntityRules, otherRules] = _.partition(
      rules,
      _.matches({
        entityName,
        identifier,
      })
    );

    // calculate indeterminates
    const indeterminates = firstEntityRules.reduce((result, rule) => {
      const relatedRules = _.remove(
        otherRules,
        _.matches(_.pick(rule, 'actions', 'subject', 'conditions'))
      );
      const fieldState = getFieldState(rule.key);
      const indeterminate = isIndeterminate(
        formState.values,
        rule,
        relatedRules
      );

      if (!!fieldState.data.indeterminate !== !!indeterminate) {
        result[rule.key] = indeterminate;
      }

      return result;
    }, {});

    // set indeterminate prop for each field
    batch(() => {
      _.forEach(indeterminates, (indeterminate, key) => setFieldData(key, { indeterminate }));
    });
  };

  render() {
    const {
      handleSubmit,
      HeaderComponent,
      searchChildKey,
      filterInputPlaceholder,
    } = this.props;
    const {
      firstEntityAbility,
      childAbilities,
      fuseChildAbilities,
      search,
      debouncedSearch,
    } = this.state;

    const saveButton = (
      <FormSpy
        subscription={{
          submitting: true,
          pristine: true,
          submitSucceeded: true,
        }}
        component={SaveButton}
      />
    );

    const childAbilitiesLength = _.reduce(
      childAbilities,
      (result, value) => result + value.length,
      0
    );

    return (
      <>
        {HeaderComponent
          ? React.createElement(HeaderComponent, { saveButton })
          : null}

        <form onSubmit={handleSubmit}>
          {firstEntityAbility && firstEntityAbility.rules.length ? (
            <div className="margin-bottom-sm">
              {Object.entries(_.groupBy(firstEntityAbility.rules, 'tag')).map(
                ([key, rules]) => (
                  <FirstEntityRule key={key} ruleName={key} rules={rules} />
                )
              )}
            </div>
          ) : null}

          {searchChildKey
          && childAbilitiesLength >= MINLEN_REQUIRED_FOR_SEARCH ? (
            <div className="margin-v-md">
              <FilterInput
                value={search}
                onChange={this.handleSearchChange}
                placeholder={filterInputPlaceholder}
              />
            </div>
            ) : null}

          {Object.keys(childAbilities).map(name => {
            const abilities = fuseChildAbilities && debouncedSearch
              ? fuseChildAbilities[name].search(debouncedSearch)
              : childAbilities[name];

            return (
              <Collapse
                key={name}
                className="margin-bottom-md"
                abilities={abilities}
              >
                {abilities.map(entityAbility => (
                  <Collapse.Panel
                    rules={entityAbility.rules}
                    key={`${name}.${entityAbility.identifier}`}
                    header={<b>{getEntityTitle(entityAbility)}</b>}
                  >
                    {Object.entries(_.groupBy(entityAbility.rules, 'tag')).map(
                      ([key, rules]) => (
                        <ChildEntityRule
                          key={key}
                          ruleName={key}
                          rules={rules}
                        />
                      )
                    )}
                  </Collapse.Panel>
                ))}
              </Collapse>
            );
          })}

          {saveButton}

          <FormSpy
            subscription={{ values: true, data: true }}
            onChange={this.onFormValueChange}
          />
        </form>
      </>
    );
  }
}
