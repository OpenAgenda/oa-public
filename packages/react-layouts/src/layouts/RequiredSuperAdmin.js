import { useHistory } from 'react-router-dom';
import ChildLayouts from '../components/ChildLayouts';
import Loading from '../components/Loading';

function RequiredSuperAdmin({ childLayouts, children, extraProps, fallback }) {
  const history = useHistory();
  if (!extraProps.user.isSuperAdmin) {
    history.replace('/home');

    return <Loading />;
  }

  return (
    <ChildLayouts
      layouts={childLayouts}
      extraProps={extraProps}
      fallback={fallback}
    >
      {children}
    </ChildLayouts>
  );
}

RequiredSuperAdmin.layoutName = 'RequiredSuperAdmin';

export default RequiredSuperAdmin;
