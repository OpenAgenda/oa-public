import React from 'react';
import EventItem from '../src/components/EventItem';
import SimplePageDecorator from './decorators/SimplePage';
import ProvidersDecorator from './decorators/Providers';

import aggregatedEvent from './fixtures/aggregated.event.json';
import contributedEvent from './fixtures/contributed.event.json';
import sharedEvent from './fixtures/shared.event.json';
import anonymouslyContributedEvent from './fixtures/anonymouslyContributed.event.json';
import memberlessSharedEvent from './fixtures/memberlessShared.event.json';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Event item component',
  decorators: [SimplePageDecorator, ProvidersDecorator],
};

const agenda = {
  title: 'Métropole Européenne de Lille',
};

export function AnonymouslyContributedEvent() {
  return (
    <div className="list-unstyled">
      <p>The member name is not available</p>
      <EventItem
        key={3}
        agenda={agenda}
        event={anonymouslyContributedEvent}
        openRemoveModal={() => {}}
        selected={false}
        selectEvent={() => {}}
        query={{}}
        page={1}
        index={0}
        isFirst={false}
        isLast={false}
        redirectURL="redirectURL"
      />
    </div>
  );
}

export function AnonymouslyContributedEventWithNoRole() {
  return (
    <div className="list-unstyled">
      <p className="margin-v-sm">
        The role is not available in the member dataset
      </p>
      <EventItem
        key={3}
        agenda={agenda}
        event={{
          ...anonymouslyContributedEvent,
          member: {
            uid: 123,
          },
        }}
        openRemoveModal={() => {}}
        selected={false}
        selectEvent={() => {}}
        query={{}}
        page={1}
        index={0}
        isFirst={false}
        isLast={false}
        redirectURL="redirectURL"
      />
    </div>
  );
}

export function SharedEventItem() {
  return (
    <div className="list-unstyled">
      <EventItem
        key={3}
        agenda={agenda}
        event={sharedEvent}
        openRemoveModal={() => {}}
        selected={false}
        selectEvent={() => {}}
        query={{}}
        page={1}
        index={0}
        isFirst={false}
        isLast={false}
        redirectURL="redirectURL"
      />
    </div>
  );
}

export function ContributedEventItem() {
  return (
    <div className="list-unstyled">
      <EventItem
        key={2}
        agenda={agenda}
        event={contributedEvent}
        openRemoveModal={() => {}}
        selected={false}
        selectEvent={() => {}}
        query={{}}
        page={1}
        index={0}
        isFirst={false}
        isLast={false}
        redirectURL="redirectURL"
      />
    </div>
  );
}

export function AggregatedEventItem() {
  return (
    <div className="list-unstyled">
      <EventItem
        key={1}
        agenda={agenda}
        event={aggregatedEvent}
        openRemoveModal={() => {}}
        selected={false}
        selectEvent={() => {}}
        query={{}}
        page={1}
        index={0}
        isFirst={false}
        isLast={false}
        redirectURL="redirectURL"
      />
    </div>
  );
}

export function SharedEventItemWithoutOrigin() {
  return (
    <div className="list-unstyled">
      <EventItem
        key={1}
        agenda={agenda}
        event={{ ...sharedEvent, originAgenda: undefined }}
        openRemoveModal={() => {}}
        selected={false}
        selectEvent={() => {}}
        query={{}}
        page={1}
        index={0}
        isFirst={false}
        isLast={false}
        redirectURL="redirectURL"
      />
    </div>
  );
}

export function SharedEventItemByAnonymous() {
  return (
    <div className="list-unstyled">
      <EventItem
        key={1}
        agenda={agenda}
        event={{ ...sharedEvent, member: { role: 2, uid: 123 } }}
        openRemoveModal={() => {}}
        selected={false}
        selectEvent={() => {}}
        query={{}}
        page={1}
        index={0}
        isFirst={false}
        isLast={false}
        redirectURL="redirectURL"
      />
    </div>
  );
}

export function MemberlessSharedEventItem() {
  return (
    <div className="list-unstyled">
      <p>The member is no longer available and is not associated with event</p>
      <EventItem
        key={1}
        agenda={agenda}
        event={memberlessSharedEvent}
        openRemoveModal={() => {}}
        selected={false}
        selectEvent={() => {}}
        query={{}}
        page={1}
        index={0}
        isFirst={false}
        isLast={false}
        redirectURL="redirectURL"
      />
    </div>
  );
}
