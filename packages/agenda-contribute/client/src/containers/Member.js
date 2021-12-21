import debug from 'debug';
import React from 'react';

import { useQueryClient } from 'react-query';
import { useSelector, useDispatch } from 'react-redux';
import Loading from '../components/Loading';

import MemberForm from '../components/MemberForm';
import CanvasWithStepper from '../components/CanvasWithStepper';
import useAgendaContext from '../hooks/useAgendaContext';
import steps from '../lib/steps';
import contributeReducer from '../reducers/contribute';

const log = debug('Member');

export default function Member({
  agenda
}) {
  log('loading');
  const queryClient = useQueryClient();
  const res = useSelector(state => state.settings.apiRoot + state.res.members);

  const dispatch = useDispatch();

  const {
    agendaContextIsLoading,
    agendaContext
  } = useAgendaContext(agenda.uid, 'Member');

  if (agendaContextIsLoading) {
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
            member={agendaContext.me.member}
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
