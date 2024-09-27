import { useContext, Fragment } from 'react';
import { useHistory } from 'react-router-dom';
import { useUIDSeed } from 'react-uid';
import cn from 'classnames';
import I18nContext from '../contexts/I18nContext';
import LinkContainer from './LinkContainer';

function Breadcrumb({ breadParts, disableFirstPartLink, agenda, hideTitle }) {
  const history = useHistory();
  const { getLabel } = useContext(I18nContext);
  const seed = useUIDSeed();

  const noParts = !breadParts || !breadParts.length;

  const homePart = disableFirstPartLink || noParts
    ? getLabel('inbox')
    : (
      <LinkContainer to="/" agenda={agenda}>
        {(path) => (
          <button
            type="button"
            className="btn btn-link btn-link-inline"
            onClick={() =>
              history.push({ pathname: path, state: { showListAllowed: true } })}
          >
            {getLabel('inbox')}
          </button>
        )}
      </LinkContainer>
    );

  return (
    <h3 className="inbox-breadcrumbs">
      {!hideTitle ? homePart : null}
      {breadParts?.length
        ? breadParts.map((breadPart, i) => (
          <Fragment key={seed(breadPart)}>
            {!(hideTitle && i === 0) ? (
              <i className="fa fa-angle-right" />
            ) : null}
            {typeof breadPart.component === 'string' ? (
              <span
                className={cn(breadPart.className)}
                dangerouslySetInnerHTML={{ __html: breadPart.component }}
              />
            ) : (
              <span className={cn(breadPart.className)}>
                {breadPart.component}
              </span>
            )}
          </Fragment>
        ))
        : null}
    </h3>
  );
}

export default Breadcrumb;
