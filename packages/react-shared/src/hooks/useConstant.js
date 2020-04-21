import { useRef } from 'react';

export default function useConstant(init) {
  const initiated = useRef(false);
  const ref = useRef(undefined);

  if (!initiated.current) {
    initiated.current = true;
    ref.current = init();
  }

  return ref.current;
}
