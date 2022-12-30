import { useContext } from 'react';
import context from 'contexts/dateFnsLocale';

export default function useDateFnsLocale() {
  return useContext(context);
}
