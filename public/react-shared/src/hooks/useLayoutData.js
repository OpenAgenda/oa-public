import { useContext } from 'react';
import { LayoutDataContext } from '../contexts/index.js';

export default function useLayoutData() {
  return useContext(LayoutDataContext) || {};
}
