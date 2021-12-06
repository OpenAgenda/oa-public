import debug from 'debug';
import React from 'react';

import { useQueryClient } from 'react-query';
import { useSelector, useDispatch } from 'react-redux';
import Loading from '../components/Loading';

import MemberForm from '../components/MemberForm';
import CanvasWithStepper from '../components/CanvasWithStepper';
import useMember from '../hooks/useMember';
import steps from '../lib/steps';
import contributeReducer from '../reducers/contribute';

const log = debug('Member');

export default function Member({
  agenda
}) {
  log('loading');
  const queryClient = useQueryClient();
  const res = useSelector(state => state.settings.apiRoot + state.res.member);

  const dispatch = useDispatch();

  const {
    memberIsLoading,
    member
  } = useMember(agenda);

  if (memberIsLoading) {
    return <Loading />;
  }

  return (
    <CanvasWithStepper
      mode="create"
      steps={steps('member')}
    >
      <div className="padding-top-sm">
        <div className="wsq padding-all-md">
          <MemberForm
            member={member}
            res={res.replace(':agendaUid', agenda.uid)}
            onSuccess={() => {
              dispatch(contributeReducer.memberSetSuccess({
                agenda,
                queryClient
              }));
            }}
          />
        </div>
      </div>
    </CanvasWithStepper>
  );
}
