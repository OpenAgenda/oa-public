function shutdown(element, { handleModalClick, handleReferenceClick }) {
  element.removeEventListener('click', handleModalClick);
  document.removeEventListener('click', handleReferenceClick);
}

export default function ClickListener(element, { onOutsideClick }) {
  let modalClickFlag = false;

  if (!document) {
    return { shutdown: () => {} };
  }

  const handleModalClick = () => {
    modalClickFlag = true;
  };

  const handleReferenceClick = () => {
    if (!modalClickFlag) {
      onOutsideClick();
    }
    modalClickFlag = false;
  };

  element.addEventListener('click', handleModalClick);

  setImmediate(() => {
    document.addEventListener('click', handleReferenceClick);
  });

  return {
    shutdown: shutdown.bind(null, element, {
      handleModalClick,
      handleReferenceClick,
    }),
  };
}
