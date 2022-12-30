import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useChoiceState, useFilterTitle, Field } from '@openagenda/react-filters';
import { getLocaleValue } from '@openagenda/intl';
import { Stack, Checkbox, Box, Text, Input, Button } from '@openagenda/uikit';
import choiceFilterMessages from '@openagenda/react-filters/messages/choiceFilter';

const subscription = { value: true };

// function parseValue(value) {
//   if (Array.isArray(value) && !value.length) {
//     return undefined;
//   }
//
//   return value;
// }
//
// function formatValue(value) {
//   return value;
// }

function ChoiceField({
  input,
  getTotal,
  filter,
  option,
  disabled,
}) {
  const intl = useIntl();
  const total = useMemo(() => getTotal?.(filter, option), [
    filter,
    getTotal,
    option,
  ]);

  return (
    <Checkbox
      isChecked={input.checked}
      isDisabled={disabled}
      inputProps={input}
      w="fit-content"
    >
      {getLocaleValue(option.label, intl.locale) || <>&nbsp;</>}
      {Number.isInteger(total) && total !== 0 ? (
        <Box as="span" ml="2">{total}</Box>
      ) : null}
    </Checkbox>
  );
}

const ChoiceFilter = React.forwardRef<any, any>(function ChoiceFilter({
  name,
  filter,
  getTotal,
  getOptions,
  disabled,
  inputType = 'checkbox',
  pageSize = 10,
  searchMinSize = 2 * pageSize,
}, _ref) {
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
    <div>
      <Text mb="3" fontSize="md" fontWeight="bold">
        {title}
      </Text>

      {options.length > searchMinSize ? (
        <Input
          size="sm"
          mb="2"
          bg="white"
          borderRadius="base"
          w="auto"
          value={searchValue}
          onChange={onSearchChange}
          placeholder={intl.formatMessage(choiceFilterMessages.searchPlaceholder)}
        />
      ) : null}

      {foundOptions.length === 0 ? (
        <Text mb="2" color="oaGray.500">
          {intl.formatMessage(choiceFilterMessages.noResult)}
        </Text>
      ) : null}

      <Stack spacing="1" mb="2">
        {foundOptions.map((option, index) => (index < countOptions ? (
          <Field
            // key={seed(option)}
            key={option.id || option.key}
            name={name}
            subscription={subscription}
            // parse={parseValue}
            // format={formatValue}
            component={ChoiceField as any}
            type={inputType}
            value={option.value}
            option={option}
            filter={filter}
            getTotal={getTotal}
            disabled={disabled}
          />
        ) : null))}
      </Stack>

      {hasMoreOptions ? (
        <Button
          variant="link"
          colorScheme="primary"
          ml="6"
          onClick={moreOptions}
        >
          {intl.formatMessage(choiceFilterMessages.moreOptions)}
        </Button>
      ) : null}

      {!hasMoreOptions && countOptions > pageSize ? (
        <Button
          variant="link"
          colorScheme="primary"
          ml="6"
          onClick={lessOptions}
        >
          {intl.formatMessage(choiceFilterMessages.lessOptions)}
        </Button>
      ) : null}
    </div>
  );
});

export default ChoiceFilter;
