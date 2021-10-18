import React from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import CanvasComponent from '../client/src/components/Canvas';
import CanvasComponentWithStepper from '../client/src/components/CanvasWithStepper';
import ProvidersDecorator from './decorators/Providers';

export default {
  title: 'Components - Canvas',
  decorators: [ProvidersDecorator]
};

export const Canvas = () => (
  <CanvasComponent
    mode="edit"
    lang="fr"
    event={{
      title: {
        fr: 'Samedi du cinéma allemand'
      }
    }}
    onDidMount={mode => {
      // eslint-disable-next-line no-console
      console.log('onDidMount', mode);
    }}
  >
    <div className="wsq padding-all-md">Body</div>
  </CanvasComponent>
);

export const CanvasWithStepper = () => (
  <CanvasComponentWithStepper
    mode="create"
    lang="fr"
    steps={[{
      display: true,
      activable: true,
      step: 'member'
    }, {
      display: true,
      activable: true,
      active: true,
      step: 'event'
    }, {
      display: true,
      activable: false,
      step: 'confirmation'
    }]}
    onDidMount={mode => {
      // eslint-disable-next-line no-console
      console.log('onDidMount', mode);
    }}
  >
    <div className="wsq padding-all-md">Body</div>
  </CanvasComponentWithStepper>
);
