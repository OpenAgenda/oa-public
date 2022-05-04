import React, { useState } from 'react';
import validator from '../../groupTagsValidator';

const GroupTagSelector = ({
  name,
  set,
  value,
  tagBottom,
  disabledTagIds = [],
  onChange
}) => {
  const [userHasTyped, setUserHasTyped] = useState([]);

  const addUniqueItem = (item, groupIndex) => {
    const groupTags = set.groups[groupIndex].tags.map(e => e.id);
    const newSelection = value.filter(v => !groupTags.includes(v.id));
    setUserHasTyped(userHasTyped.concat([groupIndex]));
    onChange(name, newSelection.concat(item));
  };

  const addItem = (item, groupIndex) => {
    setUserHasTyped(userHasTyped.concat([groupIndex]));
    onChange(name, value.concat(item));
  };

  const removeItem = (item, groupIndex) => {
    const newSelection = value.filter(vItem => item.id !== vItem.id);
    setUserHasTyped(userHasTyped.concat([groupIndex]));
    onChange(name, newSelection);
  };

  const renderItem = (item, groupIndex, itemIndex) => {
    const checked = value.map(v => v.id).indexOf(item.id) !== -1;
    const isDisabled = disabledTagIds.indexOf(item.id) !== -1;
    return (
      <div
        className={isDisabled ? 'checkbox disabled' : 'checkbox'}
        key={item.id}
        onClick={(checked ? removeItem : addItem).bind(null, item, groupIndex)}
      >
        <label htmlFor="item">
          <input type="checkbox" checked={checked} />
          {item.label}
        </label>
        {tagBottom ? tagBottom(item, groupIndex, itemIndex) : null}
      </div>
    );
  };

  const renderUniqueItem = (item, groupIndex, itemIndex) => {
    const checked = value.map(v => v.id).indexOf(item.id) !== -1;
    const isDisabled = disabledTagIds.indexOf(item.id) !== -1;
    return (
      <div
        className={isDisabled ? 'radio disabled' : 'radio'}
        key={item.id}
        onClick={(checked ? removeItem : addUniqueItem).bind(null, item, groupIndex)}
      >
        <label htmlFor="item">
          <input type="radio" checked={checked} />
          {item.label}
        </label>
        {tagBottom ? tagBottom(item, groupIndex, itemIndex) : null}
      </div>
    );
  };

  const renderGroupHead = (group, i) => {
    let errors = [];
    let displayError = false;
    try {
      validator(set)(value, i);
    } catch (err) {
      errors = err;
    }
    if (errors.length && userHasTyped.indexOf(i) !== -1) displayError = true;
    return (
      <div className="gt-head">
        <label htmlFor="group-head" className={displayError ? 'error' : ''}>{group.name}{group.required ? ' (*)' : ''}</label>
        {group.info ? <p>{group.info}</p> : null}
      </div>
    );
  };

  const renderGroup = (group, i) => {
    const groupIsDisabled = !group.tags.filter(t => disabledTagIds.indexOf(t.id) === -1).length;
    return (
      <div className={groupIsDisabled ? 'gt-group disabled' : 'gt-group'} key={i}>
        {renderGroupHead(group, i)}
        <div className="list-unstyled gt-selector-items">{group.tags.map((t, ti) => (group?.unique ? renderUniqueItem(t, i, ti) : renderItem(t, i, ti)))}</div>
      </div>
    );
  };

  return (
    <div className="gt-selector">
      {set.groups.map(renderGroup)}
    </div>
  );
};

export default GroupTagSelector;
