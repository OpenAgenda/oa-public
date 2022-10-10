import { extendTheme } from '@chakra-ui/react';
import { components } from './components';
import { styles } from './styles';
import { foundations } from './foundations';

const theme = extendTheme({
  ...foundations,
  components,
  styles,
  config: {
    cssVarPrefix: 'oa',
  },
});

export type Theme = typeof theme;

export default theme;
