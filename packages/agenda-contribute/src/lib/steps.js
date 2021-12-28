export default function steps(current) {
  return [
    'member',
    'event',
    'confirmation'
  ].reduce((carry, stepSlug) => {
    const isCurrent = stepSlug === current;
    return {
      steps: carry.steps.concat({
        display: true,
        activable: !carry.currentWasUsed,
        active: isCurrent,
        step: stepSlug
      }),
      currentWasUsed: carry.currentWasUsed || isCurrent
    };
  }, {
    currentWasUsed: false,
    steps: []
  }).steps;
}
