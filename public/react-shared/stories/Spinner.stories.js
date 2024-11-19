import Spinner from '../src/components/Spinner.js';
import AdminCanvas from './decorators/AdminCanvas.js';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Spinner',
  component: Spinner,
  decorators: [AdminCanvas],
};

export const Simple = () => (
  <>
    <p style={{ flexBasis: '60%' }}>Spinner simple.</p>
    <div style={{ alignSelf: 'center' }}>
      <Spinner />
    </div>
  </>
);

export const Inline = () => (
  <>
    <p style={{ flexBasis: '60%' }}>Version inline du spinner.</p>
    <div style={{ alignSelf: 'center' }}>
      <Spinner mode="inline" message="this is an inline spinner" />
    </div>
  </>
);

export const Message = () => (
  <>
    <p style={{ flexBasis: '60%' }}>On peut y attacher un message.</p>
    <div style={{ alignSelf: 'center' }}>
      <div style={{ height: '200px', width: '50%' }}>
        <Spinner message="Look ma', I'm spinning! Weeee!" />
      </div>
    </div>
  </>
);

export const Page = () => (
  <>
    <p style={{ flexBasis: '60%' }}>Le spinner peut prendre toute la page.</p>
    <div style={{ alignSelf: 'center' }}>
      <Spinner page message="this will close soon" />
    </div>
  </>
);
