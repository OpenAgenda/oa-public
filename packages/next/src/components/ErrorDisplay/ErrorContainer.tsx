import { Surface, SystemStyleObject } from '@openagenda/uikit';

// Surface owns the panel look (bg + radius, flat); this only adds the
// error-state layout: a centred, content-width block with generous margins.
const errorContainerStyles: SystemStyleObject = {
  minW: 'xl',
  maxW: 'full',
  w: 'fit-content',
  mx: 'auto',
  mt: '20',
  mb: '16',
  py: '8',
  px: '4',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
};

export default function ErrorContainer({ children, ...rest }) {
  return (
    <Surface {...rest} css={errorContainerStyles}>
      {children}
    </Surface>
  );
}
