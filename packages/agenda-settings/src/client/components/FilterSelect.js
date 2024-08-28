import { useCallback, useMemo } from 'react';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';
import Select, { components } from 'react-select';
import { useIntl } from 'react-intl';

import { defaultSelectStyles } from '@openagenda/react-shared';

import getFilterOptions from '../utils/getFilterOptions';

function arrayMove(arr, from, to) {
  const slicedArray = arr.slice();
  slicedArray.splice(
    to < 0 ? arr.length + to : to,
    0,
    slicedArray.splice(from, 1)[0],
  );
  return slicedArray;
}

const onMouseDown = e => {
  e.preventDefault();
  e.stopPropagation();
};

const SortableMultiValue = SortableElement(props => (
  <components.MultiValue
    {...props}
    innerProps={{ ...props.innerProps, onMouseDown }}
  />
));

const SortableMultiValueLabel = SortableHandle(props => (
  <components.MultiValueLabel {...props} />
));

const SortableSelect = SortableContainer(Select);

const styles = {
  ...defaultSelectStyles,
  multiValue: provided => ({
    ...provided,
    margin: '1px',
    padding: '0px',
    borderRadius: '2px',
    overflow: 'hidden',
    cursor: 'grab',
  }),
};

export default function FilterSelect({
  value,
  onChange,
  sub,
  disabled,
  exclude,
  schema,
}) {
  const intl = useIntl();

  const filterOptions = useMemo(
    () => getFilterOptions(intl, schema, exclude),
    [intl, schema, exclude],
  );
  const selectedOptions = useMemo(
    () =>
      value
        .map(name => filterOptions.find(o => o.value === name))
        .filter(v => !!v),
    [value, filterOptions],
  );

  const onSortEnd = useCallback(
    ({ oldIndex, newIndex }) => {
      onChange(
        arrayMove(selectedOptions, oldIndex, newIndex).map(o => o.value),
      );
    },
    [selectedOptions, onChange],
  );

  return (
    <>
      <SortableSelect
        useDragHandle
        axis="xy"
        onSortEnd={onSortEnd}
        distance={4}
        getHelperDimensions={({ node }) => node.getBoundingClientRect()}
        isMulti
        options={filterOptions}
        value={selectedOptions}
        onChange={update => {
          onChange(update.map(o => o.value));
        }}
        components={{
          MultiValue: SortableMultiValue,
          MultiValueLabel: SortableMultiValueLabel,
        }}
        closeMenuOnSelect
        styles={styles}
        isDisabled={disabled}
      />
      {sub ? <span>{sub}</span> : null}
    </>
  );
}
