import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

function Temporary({ agenda }) {
  const history = useHistory();
  const message = useSelector((state) => state.settings.message ?? 'Bif bof');
  const prefix = useSelector((state) => state.settings.prefix);
  return (
    <>
      <div>
        {message} {agenda.title}
      </div>
      <button type="button" onClick={() => history.replace(prefix)}>
        Push
      </button>
    </>
  );
}

export default Temporary;
