declare module '@openagenda/activity-apps/*';
declare module '@openagenda/common-labels/*';
declare module '@openagenda/intl/*';
declare module '@openagenda/mails/*';
declare module '@openagenda/react-shared/*';
declare module '@openagenda/sdk-js';
declare module '@openagenda/sessions/*';
declare module '@openagenda/verror';
declare module '@openagenda/leaflet-gesture-handling';

// Fix for Collapse children (something like https://github.com/chakra-ui/chakra-ui/discussions/9038)
import { ReactNode } from 'react';
declare module '@openagenda/uikit' {
  interface CollapseProps {
    children?: ReactNode;
    id?: string;
  }
}
