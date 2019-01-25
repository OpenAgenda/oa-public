import Stakeholder from '@openagenda/agenda-stakeholders/dist/iso/Stakeholder';

export default function validate( values ) {

  const flatErrors = e => e.reduce( ( prev, next ) => ({ ...prev, [next.field]: next.code }), {} );

  const errors = new Stakeholder( values ).getErrors( true );

  if ( errors.length ) {
    return flatErrors( errors );
  }

  return true;

}
