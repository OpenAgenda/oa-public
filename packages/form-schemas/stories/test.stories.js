import React, { useState } from 'react';
import SimplePageDecorator from './decorators/SimplePage';

export default {
  title: 'test component',
  decorators: [SimplePageDecorator],
};

export function TestStory() {
  return (
    <div>
      <p>Test Story</p>
    </div>
  );
}