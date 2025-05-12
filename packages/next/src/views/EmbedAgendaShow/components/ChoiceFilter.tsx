import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
  useChoiceState,
  useFilterTitle,
  Field,
} from '@openagenda/react-filters';
import { getLocaleValue } from '@openagenda/intl';
import { Box, Text, Input, Button } from '@openagenda/uikit';
import {
  Checkbox,
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from '@openagenda/uikit/snippets';
import choiceFilterMessages from '@openagenda/react-filters/messages/choiceFilter';
import { FaIcon } from 'icons';
import { faTableCellsLarge } from 'icons/light';

const subscription = { value: true };

function parseValue(value) {
  if (Array.isArray(value) && !value.length) {
    return undefined;
  }

  return value;
}

function formatValue(value) {
  // if (value !== undefined) {
  //   return [].concat(value);
  // }

  return value;
}

function ChoiceField({ input, getTotal, filter, option, disabled }) {
  const intl = useIntl();
  const total = useMemo(
    () => getTotal?.(filter, option),
    [filter, getTotal, option],
  );

  return (
    <Checkbox
      checked={input.checked}
      disabled={disabled}
      inputProps={input}
      w="full"
      px="3"
      py="1.5"
    >
      {getLocaleValue(option.label, intl.locale) || <>&nbsp;</>}
      {Number.isInteger(total) && total !== 0 ? (
        <Box as="span" ml="2">
          {total}
        </Box>
      ) : null}
    </Checkbox>
  );
}

const ChoiceFilter = React.forwardRef<any, any>(function ChoiceFilter(
  {
    name,
    filter,
    getTotal,
    getOptions,
    disabled,
    inputType = 'checkbox',
    pageSize = 10,
    searchMinSize = 2 * pageSize,
  },
  _ref,
) {
  const intl = useIntl();
  const title = useFilterTitle(name, filter.fieldSchema);

  const {
    options,
    searchValue,
    onSearchChange,
    foundOptions,
    countOptions,
    hasMoreOptions,
    moreOptions,
    lessOptions,
  } = useChoiceState({
    filter,
    getOptions,
    pageSize,
  });

  return (
    <PopoverRoot
      positioning={{
        sameWidth: true,
        gutter: 0,
        overflowPadding: 0,
        fitViewport: true,
      }}
    >
      <PopoverTrigger asChild>
        <Button
          bg="white"
          borderColor="oaGray.300"
          color="blackAlpha.800"
          _hover={{
            bg: 'oaGray.100',
            color: 'blackAlpha.900',
          }}
          borderRadius="none"
          justifyContent="start"
        >
          <FaIcon size="xl" icon={faTableCellsLarge} />
          {title}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        borderTopRadius="0"
        display="flex"
        flexDirection="column"
        width="inherit"
      >
        {options.length > searchMinSize ? (
          <Input
            size="sm"
            m="-1px"
            py="4"
            px="4"
            bg="white"
            borderRadius="base"
            borderBottomRadius="none"
            w="inherit"
            value={searchValue}
            onChange={onSearchChange}
            placeholder={intl.formatMessage(
              choiceFilterMessages.searchPlaceholder,
            )}
          />
        ) : null}

        {foundOptions.length === 0 ? (
          <Text mb="2" mx="2" color="oaGray.500">
            {intl.formatMessage(choiceFilterMessages.noResult)}
          </Text>
        ) : null}

        {foundOptions.map((option, index) =>
          index < countOptions ? (
            <Field
              key={option.id || option.key || option.value}
              name={name}
              subscription={subscription}
              parse={parseValue}
              format={formatValue}
              component={ChoiceField as any}
              type={inputType}
              value={option.value}
              option={option}
              filter={filter}
              getTotal={getTotal}
              disabled={disabled}
            />
          ) : null,
        )}

        {hasMoreOptions ? (
          <Button variant="link" p="2" alignSelf="center" onClick={moreOptions}>
            {intl.formatMessage(choiceFilterMessages.moreOptions)}
          </Button>
        ) : null}

        {!hasMoreOptions && countOptions > pageSize ? (
          <Button variant="link" p="2" alignSelf="center" onClick={lessOptions}>
            {intl.formatMessage(choiceFilterMessages.lessOptions)}
          </Button>
        ) : null}
      </PopoverContent>
    </PopoverRoot>
  );
});

export default ChoiceFilter;
