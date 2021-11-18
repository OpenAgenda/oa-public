import React from 'react';

import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import Loading from '../components/Loading';

import MemberForm from '../components/MemberForm';
import CanvasWithStepper from '../components/CanvasWithStepper';
import useMember from '../hooks/useMember';
import steps from '../lib/steps';

export default function Member({
  agenda,
  history
}) {
  const queryClient = useQueryClient();
  const res = useSelector(state => state.apiRoot + state.res.member);
  const prefix = useSelector(state => state.prefix);

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
              queryClient.removeQueries('member');
              history.push({
                ...history.location,
                pathname: `${prefix}/event`
              });
            }}
          />
        </div>
      </div>
    </CanvasWithStepper>
  );
}
