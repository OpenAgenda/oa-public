import { useRef } from 'react';
export default function useConstant(init) {
  var initiated = useRef(false);
  var ref = useRef(undefined);

  if (!initiated.current) {
    initiated.current = true;
    ref.current = init();
  }

  return ref.current;
}
//# sourceMappingURL=useConstant.js.map