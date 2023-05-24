import { chakra, SystemStyleObject } from '@openagenda/uikit';

const errorContainerStyles: SystemStyleObject = {
  minW: 'xl',
  maxW: 'full',
  w: 'fit-content',
  mx: 'auto',
  mt: '20',
  mb: '16',
  py: '8',
  px: '4',
  bg: 'white',
  borderRadius: 'base',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
};

export default function ErrorContainer({ children, ...rest }) {
  return (
    <chakra.div {...rest} __css={errorContainerStyles}>
      {children}
    </chakra.div>
  );
}
