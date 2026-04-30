import runOnActivation from './runOnActivation.js';

export default function onActivation() {
  return async (context) => {
    if (!context.result) return context;
    await runOnActivation(
      context.services,
      context.result,
      context.params.optionals || {},
    );
    return context;
  };
}
