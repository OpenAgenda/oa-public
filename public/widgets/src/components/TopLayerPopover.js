import { useEffect, useRef } from 'react';

export default function TopLayerPopover({ open, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (open && !el.matches(':popover-open')) el.showPopover();
    if (!open && el.matches(':popover-open')) el.hidePopover();

    const onToggle = () => {
      if (!el.matches(':popover-open')) onClose?.();
    };
    el.addEventListener('toggle', onToggle);
    return () => el.removeEventListener('toggle', onToggle);
  }, [open, onClose]);

  return (
    <div ref={ref} popover="manual">
      {typeof children === 'function' ? children(ref) : children}
    </div>
  );
}
