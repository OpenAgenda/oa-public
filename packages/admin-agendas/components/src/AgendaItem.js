import React from 'react';

const AgendaItem = ({ agenda, onSelect }) => {
  const handleClick = () => {
    onSelect(agenda.uid, 1);
  };

  return (
    <div
      className="agenda-item media cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className="media-body">
        <h4 className="title media-heading">
          {agenda.title}
        </h4>
      </div>
    </div>
  );
};

export default AgendaItem;
