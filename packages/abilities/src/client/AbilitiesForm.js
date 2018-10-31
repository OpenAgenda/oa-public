import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { FormSpy } from 'react-final-form';
import { FormattedMessage } from 'react-intl';
import Collapse from 'rc-collapse';
import { shouldUpdate, shallowEqual } from 'recompose';
import RuleCheckbox from './RuleCheckbox';
import isIndeterminate from './isIndeterminate';


const Panel = shouldUpdate(
  ( props, nextProps ) => !shallowEqual( _.omit( props, 'onItemClick' ), _.omit( nextProps, 'onItemClick' ) )
)( Collapse.Panel );


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
  componentDidMount() {
    // calculate `indeterminate` props
    const {
      rules,
      form,
      entityName,
      identifier
    } = this.props;

    const { mutators: { setFieldData }, batch } = form;
    const formState = form.getState();
    const allValues = formState.values;

    const [ firstEntityRules, otherRules ] = _.partition( rules, _.matches( {
      entityName,
      identifier
    } ) );

    batch( () => {
      for ( const rule of firstEntityRules ) {
        const relatedRules = _.filter( otherRules, _.matches( _.pick( rule, 'actions', 'subject', 'conditions' ) ) );

        setFieldData( rule.key, {
          indeterminate: isIndeterminate( allValues, rule, relatedRules )
        } );
      }
    } );
  }

  render() {
    const {
      entityName,
      identifier,
      rules,
      handleSubmit,
      form
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

    const firstEntityAbility = _.find( rulesPerEntity, { entityName, identifier } );
    const othersAbilities = _.groupBy( _.reject( rulesPerEntity, { entityName, identifier } ), 'entityName' );

    return (
      <form onSubmit={handleSubmit}>
        {firstEntityAbility && firstEntityAbility.rules.length && firstEntityAbility.rules.length
          ? (
            <Fragment>
              <div className="margin-bottom-sm">
                {firstEntityAbility.rules.map( rule => (
                  <RuleCheckbox
                    key={rule.key}
                    rule={rule}
                  />
                ) )}
              </div>
            </Fragment>
          )
          : null}

        {Object.keys( othersAbilities ).map( name => (
          <Fragment key={name}>
            <Collapse className="margin-bottom-md">
              {Object.values( othersAbilities[ name ] ).map( entityAbility => (
                <Panel
                  key={`${name}.${entityAbility.identifier}`}
                  header={<b>{getEntityTitle( entityAbility )}</b>}
                >
                  <div className="margin-bottom-md">
                    {entityAbility.rules.map( rule => (
                      <RuleCheckbox
                        key={rule.key}
                        rule={rule}
                      />
                    ) )}
                  </div>
                </Panel>
              ) )}
            </Collapse>
          </Fragment>
        ) )}

        <button type="submit" className="btn btn-primary">
          <FormattedMessage
            id="Abilities.AbilitiesForm.save"
            defaultMessage="Save"
          />
        </button>

        <FormSpy
          subscription={{ values: true, data: true }}
          onChange={formState => {
            const { mutators: { setFieldData }, batch, getFieldState } = form;
            const [ firstEntityRules, otherRules ] = _.partition( rules, _.matches( {
              entityName,
              identifier
            } ) );
            const allValues = formState.values;

            // calculate indeterminates
            const indeterminates = firstEntityRules.reduce( ( result, rule ) => {
              const relatedRules = _.filter( otherRules, _.matches( _.pick( rule, 'actions', 'subject', 'conditions' ) ) );
              const fieldState = getFieldState( rule.key );
              const indeterminate = isIndeterminate( allValues, rule, relatedRules );

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
              _.forEach(
                indeterminates,
                ( indeterminate, key ) => setFieldData( key, { indeterminate } )
              );
            } )
          }}
        />
      </form>
    );
  }
}

export default AbilitiesForm;
