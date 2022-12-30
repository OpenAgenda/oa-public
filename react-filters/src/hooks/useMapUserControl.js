import { useCallback, useState } from 'react';
import { useField } from 'react-final-form';

export default function useMapUserControl(name, searchWithMap) {
  const { input } = useField(name, { subscription: { value: true } });

  const [userControlled, setUserControlled] = useState(
    () => (typeof searchWithMap === 'boolean' ? searchWithMap : !!input.value),
  );

  const toggleUserControlled = useCallback(
    e => setUserControlled(e.target.checked),
    [],
  );

  return [
    userControlled,
    setUserControlled,
    toggleUserControlled,
  ];
}
