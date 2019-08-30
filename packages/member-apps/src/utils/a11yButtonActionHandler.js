export default function a11yButtonActionHandler(fn) {
  if (typeof fn !== 'function') {
    throw new Error(
      `@a11yButtonActionHandler decorator can only be applied to function, not '${typeof fn}'`
    );
  }

  return function actionHandler(...args) {
    const [event] = args;

    if (
      !event
      || event.type === 'click'
      || (['keydown', 'keypress'].includes(event.type)
        && ['Enter', ' '].includes(event.key))
    ) {
      fn.call(this, ...args);
    }
  };
}
