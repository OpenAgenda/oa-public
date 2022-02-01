export default function steps(current, { agenda }) {
  return (agenda.settings.contribution.useFields ? [
    'member',
    'event',
    'confirmation'
  ] : [
    'event',
    'confirmation'
  ]).reduce((carry, stepSlug) => {
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
