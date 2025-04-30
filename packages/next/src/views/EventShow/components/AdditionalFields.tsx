import { useIntl } from 'react-intl';
import { chakra, Box, Link, NoBreak } from '@openagenda/uikit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck } from '@fortawesome/pro-solid-svg-icons';
import { faSquare } from '@fortawesome/pro-regular-svg-icons';
import defaultStyle from 'utils/defaultStyle';
import defaultSize from 'utils/defaultSize';
import { thumborLoader } from 'utils/imageLoader';
import Image from 'components/Image';
import LockIcon from 'components/LockIcon';
import EventItems from 'components/EventItems';
import { additionalFields as messages } from '../messages';

const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;
const DEV_S3_BUCKET = process.env.NEXT_PUBLIC_DEV_S3_BUCKET;

function Label({ field }) {
  const intl = useIntl();

  return (
    <div>
      {typeof field.value === 'boolean' && (
        <chakra.span mr="2">
          {field.value ? (
            <FontAwesomeIcon icon={faSquareCheck} />
          ) : (
            <Box asChild color="oaGray.500">
              <FontAwesomeIcon icon={faSquare} />
            </Box>
          )}
        </chakra.span>
      )}
      <chakra.span fontSize={defaultSize} fontWeight="bold">
        {field.label}
      </chakra.span>
      {field.isRestricted ? (
        <NoBreak>
          <LockIcon
            label={intl.formatMessage(messages.restrictedInformation)}
            ml="2"
            tooltipProps={{
              contentProps: {
                css: { '--tooltip-bg': 'black' },
                color: 'white',
              },
            }}
          />
        </NoBreak>
      ) : null}
    </div>
  );
}

function NoInput({ message = 'noInput' }) {
  return (
    <chakra.em color="oaGray.500" fontSize={defaultSize}>
      {useIntl().formatMessage(messages[message])}
    </chakra.em>
  );
}

function LinkField({ field }) {
  const prefix = {
    phone: 'tel:',
    link: '',
    email: 'mailto:',
  }[field.fieldType];

  return field.value ? (
    <Link
      href={`${prefix}${field.value}`}
      target="_blank"
      rel="noopener nofollow"
      color="primary.500"
    >
      {field.value}
    </Link>
  ) : (
    <NoInput />
  );
}

function ImageField({ field }) {
  const { value } = field;

  return value ? (
    <Box asChild pos="unset !important" w="auto !important" h="auto !important">
      <Image
        src={
          process.env.NODE_ENV === 'development'
            ? `${DEV_S3_BUCKET}/${value.filename}`
            : `${S3_BUCKET}/${value.filename}`
        }
        fallbackSrc={
          process.env.NODE_ENV === 'development'
            ? `${S3_BUCKET}/${value.filename}`
            : undefined
        }
        fill
        // Difficult to size because AdditionalFields
        // is displayed on different parts
        sizes="(max-width: 992px) 100vw, 66.67vw"
        loader={thumborLoader}
        alt=""
      />
    </Box>
  ) : (
    <NoInput message="noImage" />
  );
}

function FileField({ field }) {
  const { value } = field;

  return value ? (
    <Link
      href={value.link}
      target="_blank"
      rel="noopener nofollow"
      color="primary.500"
      download={value.originalName}
    >
      {value.originalName}
    </Link>
  ) : (
    <NoInput message="noFile" />
  );
}

function HtmlField({ field }) {
  return field.value ? (
    <chakra.div
      css={defaultStyle}
      dangerouslySetInnerHTML={{ __html: field.value }}
    />
  ) : (
    <NoInput />
  );
}

function BooleanField({ field }) {
  const { value } = field;

  if (value === true || value === false) {
    return null;
  }

  return value || <NoInput />;
}

function OptionedField({ field }) {
  const intl = useIntl();
  return field.value?.length ? (
    <chakra.div css={defaultStyle}>
      {intl.formatList(field.value, { style: 'narrow' })}
    </chakra.div>
  ) : (
    <NoInput message="noSelection" />
  );
}

function DefaultField({ field }) {
  return field.value ? (
    <chakra.div css={defaultStyle}>{field.value}</chakra.div>
  ) : (
    <NoInput />
  );
}

function Field({ field, agenda }) {
  switch (field.fieldType) {
    case 'link':
    case 'phone':
    case 'email':
      return <LinkField field={field} />;
    case 'image':
      return <ImageField field={field} />;
    case 'file':
      return <FileField field={field} />;
    case 'markdown':
    case 'html':
      return <HtmlField field={field} />;
    case 'events':
      return <EventItems py="2" field={field} agenda={agenda} />;
    case 'boolean':
      return <BooleanField field={field} />;
    default:
      return field.isOptioned ? (
        <OptionedField field={field} />
      ) : (
        <DefaultField field={field} />
      );
  }
}

export default function AdditionalFields({ additionalFields, agenda }) {
  return additionalFields.map((field) => (
    <div key={field.key}>
      <Label field={field} />
      <Field field={field} agenda={agenda} />
    </div>
  ));
}
