const mdStyle = {
  ul: {
    ps: '40px',
    mb: '10px',
  },
  p: {
    mb: '10px',
    _lastChild: {
      mb: '0',
    },
  },
  '& > div': {
    mb: '10px',
    _lastChild: {
      mb: '0',
    },
  },
  a: {
    color: 'primary.500',
    _hover: {
      color: 'primary.600',
      textDecoration: 'underline',
    },
  },
  h1: {
    fontSize: '3xl',
  },
  h2: {
    fontSize: '2xl',
  },
  h3: {
    fontSize: 'xl',
  },
  h4: {
    fontSize: 'lg',
  },
  h5: {
    fontSize: 'md',
  },
  h6: {
    fontSize: 'sm',
  },
};

export default mdStyle;
