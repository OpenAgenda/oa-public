import _ from 'lodash';

import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaBuilder from '@openagenda/form-schemas/client/build/FormSchemaBuilder';
import openRequestForm from '@openagenda/call-to-action/dist/openRequestForm';
import labels from '@openagenda/labels/agenda-admin/agendaSchema';

import getSchemaFieldCount from './lib/getSchemaFieldCount';


if ( module.hot ) module.hot.accept();

class Main extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      currentFieldCount: getSchemaFieldCount( props.schema )
    }

  }

  onUpdate( updatedSchema ) {

    this.setState( { currentFieldCount: getSchemaFieldCount( updatedSchema ) } );

  }

  renderHeadComponent() {

    const { maxFields } = this.props;

    return <div className="padding-all-sm">
      <label>Adaptez la configuration du formulaire événement</label>
      {maxFields === 1 ? <div>
        <p>Vous pouvez ajouter le champ de votre choix au formulaire événement</p>
      </div> : null }
    </div>

  }

  render() {

    const { lang, extensions, schema, agenda, maxFields, editableExtensions } = this.props;

    return <div>

      <FormSchemaBuilder
        lang={lang}
        addEnabled={maxFields > this.state.currentFieldCount}
        settingsEnabled={true}
        editableExtensions={editableExtensions}
        devState={{
          //editedField: 'title'
        }}
        schema={schema}
        extendedFrom={_.keys( extensions )
          .filter( extKey => extensions[ extKey ] )
          .map( extKey => ( {
            schema: extensions[ extKey ],
            info: {
              label: _.get( labels, extKey ),
              detail: _.get( labels, extKey + 'Detail' )
            }
          } ) ) }
        onUpdate={this.onUpdate.bind( this )}
        renderHead={this.renderHeadComponent.bind( this )}
      />

      {maxFields === 1 ? <div>
        <a
          onClick={e => openRequestForm( {
            lang,
            subject: 'agendaSchema',
            agenda
          } )}>Besoin de plus de champs?</a>
      </div> : null }

    </div>

  }

}


const props = JSON.parse(document.getElementById( 'props' ).innerHTML);

render( <Main {...props} />, document.getElementById( 'app' ) );
