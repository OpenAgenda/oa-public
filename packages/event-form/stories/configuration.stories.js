import EnabledRanges from '../src/components/configuration/EnabledRanges.js';
import Providers from './decorators/Providers.js';
import StandardCanvas from './decorators/StandardCanvas.js';

export default {
  title: 'Configuration Components',
  decorators: [Providers, StandardCanvas],
};

export const Timings = () => (
  <div className="wsq padding-h-sm padding-v-xs">
    <div className="margin-v-sm">Timings configuration component</div>
    <EnabledRanges
      field="enabledRanges"
      value={{
        begin: '2021-07-03T07:00',
        end: '2021-07-04T06:00',
      }}
      onChange={(v) => console.log(v)}
    />
  </div>
);
