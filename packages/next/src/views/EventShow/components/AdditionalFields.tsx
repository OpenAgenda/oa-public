import { defineMessages, useIntl } from 'react-intl';
import { chakra, VStack, Link, NoBreak } from '@openagenda/uikit';
import keyCDNLoader from 'utils/keyCDNLoader';
import Image from 'components/Image';
import LockIcon from 'components/LockIcon';

const IMAGE_PREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX;
const DEV_IMAGE_PREFIX = process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX;

const messages = defineMessages({
  restrictedInformation: {
    id: 'next.views.AgendaShow.AdditionalFields.restrictedInformation',
    defaultMessage: 'Restricted information',
  },
  noSelection: {
    id: 'next.views.AgendaShow.AdditionalFields.noSelection',
    defaultMessage: 'No selection',
  },
  noInput: {
    id: 'next.views.AgendaShow.AdditionalFields.noInput',
    defaultMessage: 'No input',
  },
  noImage: {
    id: 'next.views.AgendaShow.AdditionalFields.noImage',
    defaultMessage: 'No image is loaded',
  },
  noFile: {
    id: 'next.views.AgendaShow.AdditionalFields.noFile',
    defaultMessage: 'No file is loaded',
  },
});

function Label({ field }) {
  const intl = useIntl();

  return (
    <div>
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

  return (
    <div>
      <Label field={field} />
      {field.value ? (
        <Link
          isExternal
          href={`${prefix}${field.value}`}
          color="primary.500"
        >
          {field.value}
        </Link>
      ) : (
        <chakra.em color="oaGray.500">{intl.formatMessage(messages.noInput)}</chakra.em>
      )}
    </div>
  );
}

function ImageField({ field, updatedAt }) {
  const intl = useIntl();

  const suffix = updatedAt ? `?__ts=${updatedAt}` : '';

  return (
    <div>
      <Label field={field} />
      {field.value ? (
        <Image
          src={process.env.NODE_ENV === 'development'
            ? `${DEV_IMAGE_PREFIX}${field.value.filename}${suffix}`
            : `${IMAGE_PREFIX}${field.value.filename}${suffix}`}
          fallbackSrc={process.env.NODE_ENV === 'development'
            ? `${IMAGE_PREFIX}${field.value.filename}${suffix}`
            : undefined}
          fallbackStrategy="onError"
          fill
          // @ts-ignore https://github.com/chakra-ui/chakra-ui/issues/7211
          pos="unset !important"
          w="full !important"
          h="auto !important"
          loader={keyCDNLoader}
          alt=""
          m="auto"
          priority
        />
      ) : (
        <chakra.em color="oaGray.500">{intl.formatMessage(messages.noImage)}</chakra.em>
      )}
    </div>
  );
}

function FileField({ field }) {
  const intl = useIntl();

  return (
    <div>
      <Label field={field} />
      {field.value ? (
        <Link
          isExternal
          href={field.value.link}
          color="primary.500"
          download={field.value.originalName}
        >
          {field.value.originalName}
        </Link>
      ) : (
        <chakra.em color="oaGray.500">{intl.formatMessage(messages.noFile)}</chakra.em>
      )}
    </div>
  );
}

function HtmlField({ field }) {
  const intl = useIntl();

  return (
    <div>
      <Label field={field} />
      {field.value ? (
        <div dangerouslySetInnerHTML={{ __html: field.value }} />
      ) : (
        <chakra.em color="oaGray.500">{intl.formatMessage(messages.noInput)}</chakra.em>
      )}
    </div>
  );
}

function OptionedField({ field }) {
  const intl = useIntl();

  return (
    <div>
      <Label field={field} />
      {field.value?.length ? intl.formatList(field.value, { style: 'narrow' }) : (
        <chakra.em color="oaGray.500">{intl.formatMessage(messages.noSelection)}</chakra.em>
      )}
    </div>
  );
}

function DefaultField({ field }) {
  const intl = useIntl();

  return (
    <div>
      <Label field={field} />
      {field.value !== undefined ? field.value : (
        <chakra.em color="oaGray.500">{intl.formatMessage(messages.noInput)}</chakra.em>
      )}
    </div>
  );
}

function Field({ field, updatedAt }) {
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
    default:
      return field.isOptioned ? <OptionedField field={field} /> : <DefaultField field={field} />;
  }
}

export default function AdditionalFields({ additionalFields, updatedAt: updatedAtStrDate }) {
  const updatedAt = new Date(updatedAtStrDate).getTime();

  return additionalFields.map(field => (
    <VStack key={field.key} gap="4" align="start">
      <Field field={field} updatedAt={updatedAt} />
    </VStack>
  ));
}
