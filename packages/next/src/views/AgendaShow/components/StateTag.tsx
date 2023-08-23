import { Tag } from '@openagenda/uikit';

function getColor(state) {
  switch (state.toString()) {
    case '-1':
    case 'refused':
      return 'states.refused';
    case '0':
    case 'toControl':
      return 'states.toControl';
    case '1':
    case 'controlled':
      return 'states.controlled';
    case '2':
    case 'published':
      return 'states.published';
    case 'draft':
      return 'black';
    default:
      return 'black'; // default, does not exist
  }
}

export default function StateTag({ state, ...props }) {
  return (
    <Tag
      borderRadius="full"
      variant="solid"
      bg={getColor(state)}
      borderWidth="1px"
      borderColor="white"
      {...props}
    />
  );
}
