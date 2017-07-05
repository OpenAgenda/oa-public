import du from 'dom-utils';
import app from '../../react/dist';
import openRequestForm from '../../react/dist/openRequestForm';


window.onload = () => {

  openRequestForm( { subject: 'invitationMessage', agenda: 'test' } );

  app();

  du.addEvent( du.el( '#raw-call-to-action' ), 'click', openRequestForm );

};
