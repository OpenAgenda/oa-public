import { useContext } from 'react';
import { useSelector } from 'react-redux';
import cn from 'classnames';
import MenuItem from '../components/MenuItem';
import I18nContext from '../contexts/I18nContext';

export default function Wrapper({ className, tab, children }) {
  const { getLabel } = useContext(I18nContext);
  const prefix = useSelector(state => state.settings.prefix);

  return (
    <div className={cn('container top-margined home', className)}>
      <div className="col-sm-8 col-sm-offset-2">
        {tab ? (
          <ul className="home-nav list-inline">
            <MenuItem linkTo={prefix || '/'} active={tab === 'agendas'}>
              {getLabel('myAgendas')}
            </MenuItem>
            <MenuItem linkTo={`${prefix}/events`} active={tab === 'events'}>
              {getLabel('myEvents')}
            </MenuItem>
          </ul>
        ) : null}

        <div className="row wsq">{children}</div>
      </div>
    </div>
  );
}
