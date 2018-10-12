import React, { Component } from 'react';
import _ from 'lodash';
import axios from 'axios';
import { shouldUpdate, shallowEqual } from 'recompose';
import withFetcher from './withFetcher';

// preload abilities from API

@withFetcher(
  'abilities',
  async ( { res, entityName, identifier } ) => axios.get( res.getFormIndex, {
    params: {
      entityName,
      identifier
    }
  } )
    .then( ( { data } ) => data ),
  { fetchOnMount: true }
)
@shouldUpdate(
  ( props, nextProps ) => (
    !shallowEqual(
      _.pick( props, [ 'entityName', 'identifier' ] ),
      _.pick( nextProps, [ 'entityName', 'identifier' ] )
    )
    || !shallowEqual( props.abilitiesFetcher, nextProps.abilitiesFetcher )
  )
)
class AbilitiesForm extends Component {
  render() {
    const { entityName, identifier, abilitiesFetcher: { loading, data, error } } = this.props;

    console.log( {
      entityName,
      identifier,
      loading,
      data,
      error
    } );

    if ( loading ) {
      return (
        <p>Chargement en cours...</p>
      );
    }

    if ( error ) {
      return (
        <p>Il y a eu une erreur</p>
      );
    }

    const entityRules = _.find( data, { entityName, identifier } );

    console.log(
      data.reduce( ( result, rule ) => {
        const entityProps = _.pick( rule, [ 'entityName', 'identifier' ] );
        const found = _.find( result, entityProps );

        if ( found ) {
          found.rules.push( rule );
        } else {
          result.push( { ...entityProps, rules: [ rule ] } );
        }

        return result;
      }, [] )
    );

    if ( entityRules.length ) {
      return data.map( rule => (
        <p key={rule.index}>{JSON.stringify( rule )}</p>
      ) );
    }

    return (
      <div className="container">
        <p>
          error: {JSON.stringify( error )}
        </p>
        <p>
          loading: {JSON.stringify( loading )}
        </p>
        <dl>
          {_.entries( data )
            .map( ( [ key, value ] ) => (
              <React.Fragment key={key}>
                <dt>{key}</dt>
                <dd>{JSON.stringify( value )}</dd>
              </React.Fragment>
            ) )}
        </dl>
      </div>
    );
  }
}

export default AbilitiesForm;
