import React from 'react';
import { Spinner } from '@openagenda/react-shared';

const style = {
  minHeight: 300,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const options = {
  scale: 1,
  width: 1,
};

export default function Loading() {
  return (
    <div className="text-center margin-top-lg" style={style}>
      <Spinner mode="inline" options={options} />
    </div>
  );
}
