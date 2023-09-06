export default ({ selectableStep, step, cellHeight }, seconds) => (seconds / selectableStep) * ((cellHeight / step) * selectableStep);
