import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { FormSpy } from 'react-final-form';
import Collapse from 'rc-collapse';
import { shouldUpdate, shallowEqual } from 'recompose';
import { defineMessages, FormattedMessage } from 'react-intl';
import Spinner from '@openagenda/react-components/build/Spinner';
import RuleCheckbox from './RuleCheckbox';
import isIndeterminate from './isIndeterminate';

const Panel = shouldUpdate(
  ( props, nextProps ) => !shallowEqual(
    _.omit( props, 'onItemClick' ),
    _.omit( nextProps, 'onItemClick' )
  )
)( Collapse.Panel );

const descriptionMessages = defineMessages( {
  firstEntityUser: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.firstEntityUser',
    defaultMessage: 'Your global settings:'
  },
  firstEntityContributor: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.firstEntityContributor',
    defaultMessage: 'Your contributor settings:'
  },
  firstEntityAdminmod: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.firstEntityAdminmod',
    defaultMessage: 'Your administrator or moderator settings:'
  },
  childEntityContributor: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.childEntityContributor',
    defaultMessage: 'Contributor settings:'
  },
  childEntityAdminmod: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.childEntityAdminmod',
    defaultMessage: 'Administrator or moderator settings:'
  }
} );

function getEntityTitle( ability ) {
  switch ( ability.entityName ) {
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

class AbilitiesForm extends Component {
  static propTypes = {
    rules: PropTypes.arrayOf( PropTypes.object ),
    form: PropTypes.objectOf( PropTypes.any ),
    entityName: PropTypes.string.isRequired,
    identifier: PropTypes.number.isRequired,
    handleSubmit: PropTypes.func
  };

  static defaultProps = {
    rules: null,
    form: null,
    handleSubmit: null
  };

  componentDidMount() {
    // calculate `indeterminate` props
    const {
      rules, form, entityName, identifier
    } = this.props;

    const {
      mutators: { setFieldData },
      batch
    } = form;
    const formState = form.getState();
    const allValues = formState.values;

    const [ firstEntityRules, otherRules ] = _.partition(
      rules,
      _.matches( {
        entityName,
        identifier
      } )
    );

    batch( () => {
      for ( const rule of firstEntityRules ) {
        const relatedRules = _.filter(
          otherRules,
          _.matches( _.pick( rule, 'actions', 'subject', 'conditions' ) )
        );

        setFieldData( rule.key, {
          indeterminate: isIndeterminate( allValues, rule, relatedRules )
        } );
      }
    } );
  }

  render() {
    const {
      entityName, identifier, rules, handleSubmit, form
    } = this.props;

    const rulesPerEntity = rules.reduce( ( result, rule ) => {
      const entityProps = _.pick( rule, [ 'entityName', 'identifier', 'entity' ] );
      const found = _.find( result, entityProps );

      if ( found ) {
        found.rules.push( rule );
      } else {
        result.push( {
          ...entityProps,
          rules: [ rule ]
        } );
      }

      return result;
    }, [] );

    const firstEntityAbility = _.find( rulesPerEntity, {
      entityName,
      identifier
    } );
    const othersAbilities = _.groupBy(
      _.reject( rulesPerEntity, { entityName, identifier } ),
      'entityName'
    );

    return (
      <form onSubmit={handleSubmit}>
        {firstEntityAbility
        && firstEntityAbility.rules.length
        && firstEntityAbility.rules.length ? (
          <Fragment>
            <div className="margin-bottom-sm">
              {Object.entries( _.groupBy( firstEntityAbility.rules, 'tag' )).map( ([ key, rules ]) => {
                const headerMessage = descriptionMessages[ `firstEntity${_.upperFirst( key )}` ];

                return (
                  <div key={key}>
                    {headerMessage ? (
                      <b>
                        <FormattedMessage {...descriptionMessages[ `firstEntity${_.upperFirst( key )}` ]} />
                      </b>
                    ) : null}

                    {rules.map( rule => (
                      <RuleCheckbox key={rule.key} rule={rule} />
                    ) )}
                  </div>
                );
              } )}
            </div>
          </Fragment>
          ) : null}

        {Object.keys( othersAbilities ).map( name => (
          <Fragment key={name}>
            <Collapse className="margin-bottom-md">
              {Object.values( othersAbilities[ name ] ).map( entityAbility => (
                <Panel
                  key={`${name}.${entityAbility.identifier}`}
                  header={<b>{getEntityTitle( entityAbility )}</b>}
                >
                  {Object.entries( _.groupBy( entityAbility.rules, 'tag' )).map( ([ key, rules ]) => {
                    const headerMessage = descriptionMessages[ `childEntity${_.upperFirst( key )}` ];

                    return (
                      <div key={key}>
                        {headerMessage ? (
                          <b>
                            <FormattedMessage {...descriptionMessages[ `childEntity${_.upperFirst( key )}` ]} />
                          </b>
                        ) : null}

                        {rules.map( rule => (
                          <RuleCheckbox key={rule.key} rule={rule} />
                        ) )}
                      </div>
                    );
                  } )}
                  {/*<div className="margin-bottom-md">*/}
                    {/*{entityAbility.rules.map( rule => (*/}
                      {/*<RuleCheckbox key={rule.key} rule={rule} />*/}
                    {/*) )}*/}
                  {/*</div>*/}
                </Panel>
              ) )}
            </Collapse>
          </Fragment>
        ) )}

        <FormSpy
          subscription={{ pristine: true, submitting: true }}
        >
          {({ submitting, pristine }) => (
            <button type="submit" className="btn btn-primary" disabled={submitting || pristine}>
              <FormattedMessage
                id="Abilities.AbilitiesForm.save"
                defaultMessage="Save"
              />

              {submitting && <span className="margin-h-sm">
                <Spinner mode="inline" />
              </span>}
            </button>
          )}
        </FormSpy>

        <FormSpy
          subscription={{ values: true, data: true }}
          onChange={formState => {
            const {
              mutators: { setFieldData },
              batch,
              getFieldState
            } = form;
            const [ firstEntityRules, otherRules ] = _.partition(
              rules,
              _.matches( {
                entityName,
                identifier
              } )
            );
            const allValues = formState.values;

            // calculate indeterminates
            const indeterminates = firstEntityRules.reduce( ( result, rule ) => {
              const relatedRules = _.filter(
                otherRules,
                _.matches( _.pick( rule, 'actions', 'subject', 'conditions' ) )
              );
              const fieldState = getFieldState( rule.key );
              const indeterminate = isIndeterminate(
                allValues,
                rule,
                relatedRules
              );

              if ( fieldState.data.indeterminate === indeterminate ) {
                return result;
              }

              return {
                ...result,
                [ rule.key ]: indeterminate
              };
            }, {} );

            // set indeterminate prop for each field
            batch( () => {
              _.forEach( indeterminates, ( indeterminate, key ) => setFieldData( key, { indeterminate } ) );
            } );
          }}
        />
      </form>
    );
  }
}

export default AbilitiesForm;
