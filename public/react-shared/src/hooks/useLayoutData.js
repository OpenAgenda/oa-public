import { useContext } from 'react';
import { LayoutDataContext } from '../contexts';

export default function useLayoutData() {
  return useContext(LayoutDataContext);
}
