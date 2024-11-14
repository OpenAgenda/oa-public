import { useIntl } from 'react-intl';
import { chakra, Link, NoBreak, useTheme } from '@openagenda/uikit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck , faSquare } from '@fortawesome/pro-solid-svg-icons';
import { keyCDNLoader } from 'utils/imageLoader';
import Image from 'components/Image';
import LockIcon from 'components/LockIcon';
import EventItems from 'components/EventItems';
import { additionalFields as messages } from '../messages';

const IMAGE_PREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX;
const DEV_IMAGE_PREFIX = process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX;

function Label({ field }) {
  const intl = useIntl();
  const theme = useTheme();
  const grayColor = theme.colors.oaGray[500];

  return (
    <div>
      {typeof field.value === 'boolean' && (
        <chakra.span mr="2">
          {field.value ? (
            <FontAwesomeIcon icon={faSquareCheck} />
          ) : (
            <FontAwesomeIcon icon={faSquare} color={grayColor} />
          )}
        </chakra.span>
      )}
      <chakra.span fontWeight="bold">{field.label}</chakra.span>
      {field.isRestricted ? (
        <NoBreak>
          <LockIcon
            label={intl.formatMessage(messages.restrictedInformation)}
            ml="2"
            tooltipProps={{
              bg: 'black',
              color: 'white',
            }}
          />
        </NoBreak>
      ) : null}
    </div>
  );
}

function LinkField({ field }) {
  const intl = useIntl();

  const prefix = {
    phone: 'tel:',
    link: '',
    email: 'mailto:',
  }[field.fieldType];

  return field.value ? (
    <Link isExternal href={`${prefix}${field.value}`} color="primary.500">
      {field.value}
    </Link>
  ) : (
    <chakra.em color="oaGray.500">
      {intl.formatMessage(messages.noInput)}
    </chakra.em>
  );
}

function ImageField({ field, updatedAt }) {
  const intl = useIntl();

  const { value } = field;

  const suffix = updatedAt ? `?__ts=${updatedAt}` : '';

  return value ? (
    <Image
      src={
        process.env.NODE_ENV === 'development'
          ? `${DEV_IMAGE_PREFIX}${value.filename}${suffix}`
          : `${IMAGE_PREFIX}${value.filename}${suffix}`
      }
      fallbackSrc={
        process.env.NODE_ENV === 'development'
          ? `${IMAGE_PREFIX}${value.filename}${suffix}`
          : undefined
      }
      fill
      sizes="(max-width: 992px) 100vw, 60vw"
      // @ts-ignore https://github.com/chakra-ui/chakra-ui/issues/7211
      pos="unset !important"
      w="auto !important"
      h="auto !important"
      loader={keyCDNLoader}
      alt=""
    />
  ) : (
    <chakra.em color="oaGray.500">
      {intl.formatMessage(messages.noImage)}
    </chakra.em>
  );
}

function FileField({ field }) {
  const intl = useIntl();
  const { value } = field;

  return value ? (
    <Link
      isExternal
      href={value.link}
      color="primary.500"
      download={value.originalName}
    >
      {value.originalName}
    </Link>
  ) : (
    <chakra.em color="oaGray.500">
      {intl.formatMessage(messages.noFile)}
    </chakra.em>
  );
}

function HtmlField({ field }) {
  const intl = useIntl();

  return field.value ? (
    <div dangerouslySetInnerHTML={{ __html: field.value }} />
  ) : (
    <chakra.em color="oaGray.500">
      {intl.formatMessage(messages.noInput)}
    </chakra.em>
  );
}

function BooleanField({ field }) {
  const intl = useIntl();
  const { value } = field;

  if (value === true || value === false) {
    return null;
  }

  return (
    value || (
      <chakra.em color="oaGray.500">
        {intl.formatMessage(messages.noInput)}
      </chakra.em>
    )
  );
}

function OptionedField({ field }) {
  const intl = useIntl();

  return field.value?.length ? (
    <>{intl.formatList(field.value, { style: 'narrow' })}</>
  ) : (
    <chakra.em color="oaGray.500">
      {intl.formatMessage(messages.noSelection)}
    </chakra.em>
  );
}

function DefaultField({ field }) {
  const intl = useIntl();

  return field.value ? 
    field.value
   : (
    <chakra.em color="oaGray.500">
      {intl.formatMessage(messages.noInput)}
    </chakra.em>
  );
}

function Field({ field, updatedAt, agenda }) {
  switch (field.fieldType) {
    case 'link':
    case 'phone':
    case 'email':
      return <LinkField field={field} />;
    case 'image':
      return <ImageField field={field} updatedAt={updatedAt} />;
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

export default function AdditionalFields({
  additionalFields,
  updatedAt: updatedAtStrDate,
  agenda,
}) {
  const updatedAt = new Date(updatedAtStrDate).getTime();

  return additionalFields.map((field) => (
    <div key={field.key}>
      <Label field={field} />
      <Field field={field} updatedAt={updatedAt} agenda={agenda} />
    </div>
  ));
}
