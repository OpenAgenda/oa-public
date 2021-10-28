import React from 'react';

import { useSelector } from 'react-redux';
import Loading from '../components/Loading';

import MemberForm from '../components/MemberForm';
import CanvasWithStepper from '../components/CanvasWithStepper';
import useMember from '../lib/useMember';
import steps from '../lib/steps';

export default function Member() {
  const res = useSelector(state => state.res);

  const {
    memberIsLoading,
    member
  } = useMember(res);

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
            res={res.member}
            onSuccess={(/* member */) => {

            }}
          />
        </div>
      </div>
    </CanvasWithStepper>
  );
}
