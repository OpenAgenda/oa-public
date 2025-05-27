import { SystemStyleObject } from '@openagenda/uikit';

const mdStyle: SystemStyleObject = {
  // '& ul': {
  //   ps: '40px',
  //   mb: '10px',
  // },
  '& p': {
    mb: '10px',
    '&:last-child': {
      mb: '0',
    },
  },
  '& > div': {
    mb: '10px',
    '&:last-child': {
      mb: '0',
    },
  },
  '& a': {
    color: 'primary.500',
    _hover: {
      color: 'primary.600',
      textDecoration: 'underline',
      textUnderlineOffset: '3px',
      textDecorationColor: 'currentColor/20',
    },
  },
  '& h1': {
    fontSize: '3xl',
  },
  '& h2': {
    fontSize: '2xl',
  },
  '& h3': {
    fontSize: 'xl',
  },
  '& h4': {
    fontSize: 'lg',
  },
  '& h5': {
    fontSize: 'md',
  },
  '& h6': {
    fontSize: 'sm',
  },
  '& em': {
    fontStyle: 'italic',
  },
  '& strong': {
    fontWeight: 'bold',
  },
  '& ul': {
    marginTop: '1em',
    marginBottom: '1em',
    paddingInlineStart: '1.5em',
  },
  '& li': {
    marginTop: '0.285em',
    marginBottom: '0.285em',
  },
  '& ol > li': {
    paddingInlineStart: '0.4em',
    listStyleType: 'decimal',
    '&::marker': {
      color: 'fg',
    },
  },
  '& ul > li': {
    paddingInlineStart: '0.4em',
    listStyleType: 'disc',
    '&::marker': {
      color: 'fg  ',
    },
  },
  '& > ul > li p': {
    marginTop: '0.5em',
    marginBottom: '0.5em',
  },
  '& > ul > li > p:first-of-type': {
    marginTop: '1em',
  },
  '& > ul > li > p:last-of-type': {
    marginBottom: '1em',
  },
  '& > ol > li > p:first-of-type': {
    marginTop: '1em',
  },
  '& > ol > li > p:last-of-type': {
    marginBottom: '1em',
  },
  '& ul ul, ul ol, ol ul, ol ol': {
    marginTop: '0.5em',
    marginBottom: '0.5em',
  },
};

export default mdStyle;
