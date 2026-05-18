// Fix for Collapse children (something like https://github.com/chakra-ui/chakra-ui/discussions/9038)
import { ReactNode } from 'react';
declare module '@openagenda/uikit' {
  interface CollapseProps {
    children?: ReactNode;
    id?: string;
  }
}
