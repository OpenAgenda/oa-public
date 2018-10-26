import _ from 'lodash';
import createDecorator from 'final-form-calculate';

export default function ( {
  entityName,
  identifier,
  getRules
} ) {
  return form => {
    const { mutators: { setFieldData }, getFieldState } = form;
    const rules = getRules();
    const [ firstEntityRules, otherRules ] = _.partition( rules, _.matches( {
      entityName,
      identifier
    } ) );

    return createDecorator( {
      field: /rule\d+/,
      updates: ( value, field, allValues ) => {
        const concernedRule = rules.find( v => v.key === field );
        const relatedRules = _.filter(
          otherRules,
          _.matches( _.pick( concernedRule, 'actions', 'subject', 'conditions' ) )
        );

        const fieldState = getFieldState( field );

        if ( _.isMatch( concernedRule, { entityName, identifier } ) ) {
          if ( fieldState.data.indeterminate ) { // when UNcheck an indeterminate checkbox
            return relatedRules.reduce( ( result, rule ) => {
              if ( allValues[ rule.key ] === false ) {
                return result;
              }

              return {
                ...result,
                [ rule.key ]: false
              };
            }, { [ field ]: false } );
          }

          if ( value ) {
            return relatedRules.reduce( ( result, rule ) => {
              if ( allValues[ rule.key ] === true ) {
                return result;
              }

              return {
                ...result,
                [ rule.key ]: true
              };
            }, {} );
          }

          return {};
        }

        const relatedFirstRule = _.find(
          firstEntityRules,
          _.matches( _.pick( concernedRule, 'actions', 'subject', 'conditions' ) )
        );

        if ( relatedFirstRule && allValues[ relatedFirstRule.key ] ) {
          setFieldData( relatedFirstRule.key, { indeterminate: true } );
        }

        return {};
      }
    } )( form );
  };
};
