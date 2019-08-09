import React from 'react';
import { storiesOf } from '@storybook/react';
import createReactClass from 'create-react-class';
import AdminApp from '../components/src/AgendaAdminLocations';
import SelectorApp from '../components/src/LocationSelector';
import TermApp from '../components/src/TermSelector';
import TermPickerApp from '../components/src/TermSelectorPicker';

const agendaTestSettings = JSON.parse(
  '{"eventForm":{"detailed":true},"translation":{"enabled":true,"options":"eyJ1c2VyIjoiQ1VMVFVSRSIsInBhc3N3b3JkIjoiclU3elQ3cWhhIn0=","service":"reverso","sets":[{"source":"fr","checked":["it","es"],"target":["it","es","de"]}],"source":"fr"},"labels":{"translationInfo":{"fr":"C\'est pour traduire automatiquement","en":"Translate au-to-ma-ti-ca-lly"},"name":{"en":"Name of the location of the event","fr":"Saisissez le nom du lieu de l’événement"},"namePlaceholder":{"fr":"Ex : Ministère de la Culture","en":"Ex : Ministry of culture"},"addressInfo":{"en":"Indicate the number, name of the street, the name and postal code of the city","fr":"Indiquez le numéro, le nom de la voie, le nom et le code postal de la commune. Une fois le champ « Adresse » complété, vérifiez sur la carte ci-dessous que le pointeur est correctement situé. Vous pouvez le déplacer manuellement si nécessaire."},"addressPlaceholder":{"en":"Ex : 03 rue de Valois 75001 Paris","fr":"Ex : 03 rue de Valois 75001 Paris"},"imageCredits":{"en":"Image credits","fr":"Crédits de l’image"},"imageCreditsInfo":{"en":"Indicate the owner of the image. If the image is under an open license, please specify which.","fr":"Indiquez le propriétaire de l\'image. Si l\'image est sous licence libre, merci de le préciser."},"descriptionInfo":{"en":"Describe your garden (its history, particularities, the type of offered activities, etc).","fr":"Présentez votre jardin (son histoire, ses particularités, le type d’activités proposé, etc)."},"descriptionPlaceholder":{"en":"a custom placeholder","fr":"un placeholder"},"accessInfo":{"en":"Indicate the access conditions to your location","fr":"Indiquez les conditions d’accès à votre lieu (transports à proximité, présence de parkings, aménagements spécifiques, etc)."},"phoneInfo":{"en":"Indicate a contact phone number for the public","fr":"Indiquez un numéro de téléphone pour les demandes du public (standard, tél. fixe)."},"websiteInfo":{"en":"indicate the website of the location if any","fr":"Indiquez l’adresse de votre site Internet, si existant (inclure le http://)."},"create":{"info":{"fr":"Info custo","en":"Custom info"}}},"tagSet":{"groups":[{"name":"Label","info":null,"tags":[{"id":40,"label":"Musée de France"},{"id":38,"label":"Jardin Remarquable"},{"id":34,"label":"Patrimoine"},{"id":35,"label":"Patrimoine européen"},{"id":36,"label":"Villes et pays art/histoire"},{"id":37,"label":"Patrimoine unesco"},{"id":39,"label":"Tourisme et handicap"},{"id":41,"label":"\\"Maison illustre"}]},{"name":"Particularité","required":true,"info":null,"tags":[{"id":33,"label":"Première participation"},{"id":32,"label":"Ouverture exceptionnelle"}]},{"name":"Types de lieu","info":null,"tags":[{"id":16,"label":"Edifice commémoratif"},{"id":3,"label":"Édifice religieux"},{"id":1,"label":"Personne Célebre"},{"id":2,"label":"Château, hôtel urbain, palais, manoir"},{"id":4,"label":"Édifice hospitalier"},{"id":5,"label":"Édifice maritime"},{"id":6,"label":"Édifice militaire"},{"id":7,"label":"Archive"},{"id":8,"label":"Édifice industriel"},{"id":9,"label":"Édifice rural"},{"id":10,"label":"Édifice scolaire"},{"id":11,"label":"Édifice naturel"},{"id":12,"label":"Mémoire"},{"id":13,"label":"Un truc pas vide"},{"id":14,"label":"Pouvoir"},{"id":15,"label":"Musée"},{"id":17,"label":"Beaux-Art"},{"id":18,"label":"Art contemporain"},{"id":19,"label":"Arts décoratifs"},{"id":20,"label":"Sciences et Techniques"},{"id":21,"label":"Insolites"},{"id":22,"label":"Société et civilisation"},{"id":23,"label":"Jardin d\'inspiration médiévale"},{"id":24,"label":"Jardin régulier (à la française)"},{"id":25,"label":"Parc paysager (à l\'anglaise)"},{"id":26,"label":"Jardin XXe siècle"},{"id":27,"label":"Jardin de création récente"},{"id":28,"label":"Jardin de collection (botanique, arboretum...)"},{"id":29,"label":"Jardin vivrier (potager, verger, jardins familiaux, jardin de simples...)"},{"id":30,"label":"Jardin privé"},{"id":31,"label":"Jardin public"}]}]}}' );

import '../components/src/verifiedLocationsCounter';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const apiRoot = `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}`;

const Wrapper = createReactClass( {

  getInitialState: function () {

    return {
      lang: 'fr',
      location: undefined,
      initSelectorMode: 'create',
      mode: 'show',
      term: '',
      pickedTerm: {
        region: 'Champagne-Ardenne',
        department: 'Aube'
      },
      allowCreate: true,
      //enableGeocode: true
    }

  },

  getDefaultProps: function () {

    return {
      res: {
        index: `${apiRoot}/`,
        geocode: `${apiRoot}/geocode`,
        reverseGeocode: `${apiRoot}/geocode/reverse`,
        insee: `${apiRoot}/insee`,
        get: `${apiRoot}/:locationUid`,
        set: `${apiRoot}/`,
        getStakeholder: `${apiRoot}/stakeholders/:stakeholderId`,
        remove: `${apiRoot}/remove`,
        merge: `${apiRoot}/merge`,
        csv: '#csv',
        removeSuggestion: `${apiRoot}/:locationUid/suggestion/remove`,
        image: {
          upload: `${apiRoot}/:locationUid/image`,
          remove: `${apiRoot}/:locationUid/image/remove`,
          newUpload: `${apiRoot}/image`,
          newRemove: `${apiRoot}/image/remove`
        },
        seeEvents: `${apiRoot}/:agendaSlug/admin?locationUid=:locationUid`
      }
    }

  },

  onChangeTerm: function ( t ) {

    this.setState( { term: t } );

  },

  onChangePickedTerm: function ( t ) {

    this.setState( {
      pickedTerm: t
    } );

  },

  onLocationChange: function ( l, newMode ) {

    this.setState( {
      location: l,
      mode: newMode
    } );

  },

  onChangeLocationMode: function ( newMode, initLocation ) {

    this.setState( {
      mode: newMode,
      location: initLocation
    } );

  },

  renderSelector: function () {

    return <SelectorApp
      settings={agendaTestSettings}
      location={this.state.location}
      requestChangeMode={this.onRequestChangeMode}
      mode={this.state.mode}
      lang={this.state.lang}
      allowCreate={this.state.allowCreate}
      res={this.props.res}
      enableGeocode={this.state.enableGeocode}
      onChange={this.onLocationChange}
      onChangeMode={this.onChangeLocationMode}
      disableChange={false}
    />

  },

  renderTermSelector: function () {

    return <div>

      <TermApp
        lang={this.state.lang}
        field="region,country"
        res={`${apiRoot}/terms`}
        value={this.state.term}
        onChange={this.onChangeTerm}
      />

      <div className="separator" style={{ marginTop: '1em', marginBottom: '1em' }}></div>

      <TermPickerApp
        lang={this.state.lang}
        fields={{
          region: 'region,country',
          department: 'department,region',
          city: 'city,region'
        }}
        res={`${apiRoot}/terms`}
        value={this.state.pickedTerm}
        labels={{
          region: { fr: 'région', en: 'region' },
          department: { fr: 'département', en: 'department' },
          city: { fr: 'ville', en: 'city' }
        }}
        onChange={this.onChangePickedTerm}
      />

    </div>

  },

  renderAdmin: function () {

    return <div className="top-margined col-sm-8 col-sm-offset-2 wsq content">
      <AdminApp
        agenda={{
          slug: 'theagendaslug'
        }}
        detailedInfo={true}
        settings={agendaTestSettings}
        lang={this.state.lang}
        enableGeocode={this.state.enableGeocode}
        res={this.props.res}
      />
    </div>

  },

  render: function () {

    var self = this;

    return <div style={{ marginTop: '2em' }}>
      <div className="js_locations_counter" data-res={`${apiRoot}/toverify`}></div>

      {function () {

        switch ( self.props.display ) {

          case 'admin':
            return self.renderAdmin();

          case 'selector':
            return self.renderSelector();

          case 'term':
            return self.renderTermSelector();

        }

      }()}

    </div>

  }

} );


storiesOf( 'App', module )
  .add( 'admin', () => <Wrapper display="admin" /> )
  .add( 'selector', () => <Wrapper display="selector" /> )
  .add( 'term', () => <Wrapper display="term" /> );
