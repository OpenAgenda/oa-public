const buttonClass = shape => {
  if (shape === 'primary') {
    return 'btn-primary';
  }
  if (shape === 'link') {
    return 'btn-link padding-v-z';
  }
  if (shape === 'danger-link') {
    return 'btn-link text-danger padding-v-z';
  }
  if (shape === 'unpadded-link') {
    return 'btn-link padding-left-z padding-top-z';
  }
  return 'btn-default';
};

export default function Button({
  type = 'button',
  disabled,
  onClick,
  label,
  shape,
}) {
  return (
    <button
      type={type === 'button' ? 'button' : 'submit'}
      className={`btn ${buttonClass(shape)} margin-right-xs`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
