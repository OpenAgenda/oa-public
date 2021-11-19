import React from 'react';
import debug from 'debug';
import {
  useDispatch
} from 'react-redux';

import CanvasWithStepper from '../components/CanvasWithStepper';
import ClosedMessage from '../components/ClosedMessage';
import EventNewForm from '../components/EventNewForm';
import Loading from '../components/Loading';
import Instructions from '../components/Instructions';

import steps from '../lib/steps';
import useEventFormConfig from '../hooks/useEventFormConfig';
import useMember from '../hooks/useMember';
import usePrefix from '../hooks/usePrefix';

import contributeReducer from '../reducers/contribute';

import utils from '../lib/utils';

const {
  isMemberDataComplete,
  isMemberDataRequired,
  isContributionType,
  isMemberRole
} = utils;

const log = debug('EventNew');

export default function EventNew({ agenda, history }) {
  const {
    memberIsLoading,
    memberIsFresh,
    member
  } = useMember(agenda);

  const dispatch = useDispatch();
  const prefix = usePrefix(agenda);
  const { config, configIsLoading } = useEventFormConfig(agenda);

  if (configIsLoading || memberIsLoading) {
    return <Loading />;
  }

  if (
    isContributionType(agenda, ['OPEN', 'MEMBERS_ONLY'])
    && isMemberRole(member, 'contributor')
    && isMemberDataRequired(agenda)
    && (!isMemberDataComplete(member) || !memberIsFresh)
  ) {
    log('  Contributor is %s on an agenda requiring data. Redirecting to member form', memberIsFresh ? 'not fresh' : 'incomplete');
    history.replace({
      ...history.location,
      pathname: `${prefix}/member`
    });
    return <Loading />;
  }

  return (
    <CanvasWithStepper
      mode="create"
      steps={steps('event')}
      onSelectStep={step => history.push(`${prefix}/${step}`)}
    >
      {isContributionType(agenda, 'CLOSED') ? <ClosedMessage memberRole={member.role} className="margin-bottom-md" /> : null}
      <Instructions
        message={agenda?.settings?.contribution?.messages?.instructions}
        className="margin-bottom-lg"
      />
      <EventNewForm
        history={history}
        config={config}
        onSuccess={(event, response) => {
          dispatch(contributeReducer.eventCreateSuccess({
            agenda,
            response
          }));
        }}
        memberRole={member.role}
        onDraftDelete={() => {}}
      />
    </CanvasWithStepper>
  );
}
