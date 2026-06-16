import React, { Fragment, useState, useEffect } from 'react';
import SwitchModule from 'rc-switch';
import _ from 'lodash';
import { Modal } from '@openagenda/react-shared';

const Switch = SwitchModule.default || SwitchModule;

function roleToString(type) {
  switch (type) {
    case 1:
      return 'Contributeur';
    case 2:
      return 'Administrateur';
    case 3:
      return 'Modérateur';
    // NOTE : la ligne suivante ne sera jamais atteinte car 'case 3' est déjà au-dessus
    case 3:
      return 'Lecteur';
    default:
      return 'Inconnu';
  }
}

export default function Details(props) {
  const {
    limit = 20,
    getQuery,
    agenda,
    members,
    total,
    pageRange,
    getMembersPage,
    displayConfirmDelete,
    setAgenda,
    addMeAsAdmin,
    updateHref
  } = props;

  // On lit la query initiale pour en déduire l'onglet par défaut
  const initialQuery = getQuery();
  const [tab, setTab] = useState(() => (initialQuery && initialQuery.tab) || 'members');
  const [modalVisible, setModalVisible] = useState(false);
  // 'idle' | 'adding' | 'done' | 'already' | 'error'
  const [addMeState, setAddMeState] = useState('idle');

  // Réinitialise le retour visuel quand on change d'agenda sélectionné
  useEffect(() => {
    setAddMeState('idle');
  }, [agenda?.uid]);

  const handleAddMeAsAdmin = async () => {
    if (!agenda || !agenda.uid || addMeState === 'adding') return;
    setAddMeState('adding');
    try {
      const result = await addMeAsAdmin();
      setAddMeState(result && result.alreadyMember ? 'already' : 'done');
    } catch (error) {
      console.error("Erreur lors de l'ajout comme administrateur :", error);
      setAddMeState('error');
    }
  };

  const addMeLabels = {
    idle: "M'ajouter comme admin",
    adding: 'Ajout…',
    done: '✓ Ajouté',
    already: 'Déjà membre',
    error: 'Échec, réessayer',
  };
  const addMeClasses = {
    done: 'btn btn-success',
    error: 'btn btn-danger',
  };
  
  /**
   * Fonction pour gérer la resynchronisation
   */
  const handleResync = async (type) => {
    if (!agenda || !agenda.uid) return;
    setModalVisible(true);
    
    try {
      await fetch(`/api/agendas/${agenda.uid}/settings/resync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([type]),
      });
    } catch (error) {
      console.error(`Erreur lors de la resynchronisation de ${type}:`, error);
      setModalVisible(false);
    }
  };

  /**
   * Sélecteurs d'onglet
   */
  const handleTabChange = (name) => {
    setTab(name);
    updateHref({
      ...(getQuery() || {}),
      tab: name
    });
  };

  /**
   * Switches
   */
  const setOfficial = (checked) => {
    setAgenda({ official: checked });
  };

  const setPrivate = (checked) => {
    setAgenda({ private: checked });
  };

  /**
   * Pagination
   */
  const hasNextPage = () => {
    const lastPage = pageRange[1];
    return lastPage * limit < total;
  };

  const hasPrevPage = () => {
    return pageRange[0] > 1;
  };

  const renderPrev = () => {
    if (!hasPrevPage()) return null;
    return (
      <tr>
        <td colSpan="6" className="text-center">
          <button className="btn btn-default" onClick={() => getMembersPage(false)}>
            Précédent
          </button>
        </td>
      </tr>
    );
  };

  const renderNext = () => {
    if (!hasNextPage()) return null;
    return (
      <tr>
        <td colSpan="6" className="text-center">
          <button className="btn btn-default" onClick={() => getMembersPage(true)}>
            Suivant
          </button>
        </td>
      </tr>
    );
  };

  /**
   * Rendu des membres
   */
  const renderMemberItem = (member) => {
    // Cas : utilisateur supprimé
    if (member.deletedUser) {
      return (
        <tr key={member.id}>
          <td className="text-danger text-center" colSpan={7}>User deleted</td>
        </tr>
      );
    }

    // Cas : invité
    if (member.invited) {
      return (
        <tr key={member.id}>
          <td className="text-info text-center" colSpan={7}>
            Invité (
            {member.custom.contactName ? <Fragment>{member.custom.contactName}: </Fragment> : null}
            {member.custom.email})
          </td>
        </tr>
      );
    }

    // Cas : utilisateur "actif"
    return (
      <tr key={member.id}>
        <td className="text-primary">
          {member.user?.uid ?? `Utilisateur supprimé (${member.userUid})`}
        </td>
        <td>{roleToString(member.role)}</td>
        <td>{member.user?.fullName}</td>
        <td>{member.user?.username}</td>
        <td>{member.user?.email}</td>
        <td>le {member.user?.lastSignin}</td>
        <td>
          <a href={`/admin/users/signin?uid=${member.user?.uid}`}>
            <i className="fa fa-sign-in" aria-hidden="true"></i>
          </a>{' '}
          <a
            disabled={!member.user?.uid}
            href={member.user?.uid ? `/admin/users?userUid=${member.user.uid}` : '#'}
          >
            <i className="fa fa-user" aria-hidden="true"></i>
          </a>
        </td>
      </tr>
    );
  };

  const renderMembersTable = () => {
    return (
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Nom complet</th>
            <th>Nom d'utilisateur</th>
            <th>Email</th>
            <th>Dernière connexion</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {renderPrev()}
          {members?.length ? (
            members.map((m) => renderMemberItem(m))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                Y'a personne !
              </td>
            </tr>
          )}
          {renderNext()}
        </tbody>
      </table>
    );
  };

  /**
   * Header de l'agenda
   */
  const renderAgendaHeader = () => {
    if (!agenda) return null;

    const { network, image, slug, title, description, url, uid, official, private: isPrivate, updatedAt, createdAt } = agenda;
    
    return (
      <header className="agenda-header">
        <div className="container-fluid profile notheme">
          <div className="row">
            <div className="pull-right">
              <button
                type="button"
                onClick={handleAddMeAsAdmin}
                disabled={addMeState === 'adding'}
                className={addMeClasses[addMeState] || 'btn btn-default'}
                style={{ marginRight: '5px' }}
                title="M'ajouter comme administrateur de cet agenda"
              >
                {addMeLabels[addMeState] || addMeLabels.idle}
              </button>
              <button
                type="button"
                onClick={() => handleResync('rebuildSearch')}
                className="btn btn-primary"
                style={{ marginRight: '5px' }}
              >
                Réindexer
              </button>
              <button
                type="button"
                onClick={() => handleResync('resyncInbox')}
                className="btn btn-info"
                style={{ marginRight: '5px' }}
              >
                Réinitialiser la messagerie
              </button>
              <button
                type="button"
                onClick={() => handleResync('rebuildActivities')}
                className="btn btn-success"
                style={{ marginRight: '5px' }}
              >
                Resynchroniser l'historique
              </button>
              <button
                type="button"
                onClick={displayConfirmDelete}
                className="btn btn-danger"
              >
                Supprimer
              </button>
            </div>

            {image ? (
              <div className="col-sm-2 avatar-container">
                <a href={`/${slug}`}>
                  <img className="avatar" src={image} alt={title} />
                </a>
              </div>
            ) : null}

            <div className={image ? 'col-sm-7 title-container' : 'title-container'}>
              <a href={`/${slug}`}>
                {network && (
                  <span>
                    {network.title} ›{' '}
                    <a href={`/admin/networks/${network.uid}`}>config</a> -{' '}
                    <a href={`/admin/networks/${network.uid}/agendas`}>agendas</a>{' '}
                  </span>
                )}
                <h1>{title}</h1>
                <p>{description}</p>
              </a>
              {url && (
                <p>
                  <a target="_blank" rel="noreferrer" href={url}>
                    {url}
                  </a>
                </p>
              )}
              {uid && (
                <>
                  <div>
                    Agenda officiel{' '}
                    <Switch
                      className="rc-switch"
                      checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
                      unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
                      onChange={setOfficial}
                      checked={!!official}
                    />
                  </div>
                  <div>
                    Agenda privé{' '}
                    <Switch
                      className="rc-switch"
                      checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
                      unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
                      onChange={setPrivate}
                      checked={!!isPrivate}
                    />
                  </div>
                  <div>
                    Indexation transverse{' '}
                    <Switch
                      className="rc-switch"
                      checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
                      unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
                      onChange={(checked) =>
                        setAgenda(_.set({}, ['settings', 'index', 'transverse'], checked))
                      }
                      checked={agenda?.settings?.index?.transverse !== false}
                    />
                  </div>
                  <div>Création: {createdAt} - Dernière mise à jour: {updatedAt}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  };

  /**
   * Onglet Features
   */
  const renderFeaturesTab = () => {
    const credentials = _.get(agenda, 'config.credentials', {});
    return (
      <ul className="list-unstyled">
        {_.keys(credentials).map((c) => (
          <li key={c} className="margin-v-sm">
            <Switch
              className="rc-switch"
              checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
              unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
              onChange={(checked) => setAgenda(_.set({}, ['credentials', c], checked))}
              checked={!!agenda.credentials?.[c]}
            />{' '}
            {credentials[c].description}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="col-md-9">
      <div className="row">
        {renderAgendaHeader()}
        
        {/* Modal pour indiquer que l'opération est en cours - affiché uniquement après un clic sur un bouton */}
        {modalVisible && (
          <Modal
            onClose={() => setModalVisible(false)}
            contentLabel="Opération en cours"
          >
            <div className="text-center">
              L'opération est en cours
            </div>
          </Modal>
        )}

        <ul className="nav nav-tabs">
          <li
            role="presentation"
            className={tab === 'members' ? 'active' : ''}
            onClick={() => handleTabChange('members')}
          >
            <a href="#">Member</a>
          </li>
          <li
            role="presentation"
            className={tab === 'features' ? 'active' : ''}
            onClick={() => handleTabChange('features')}
          >
            <a href="#">Features</a>
          </li>
        </ul>

        {tab === 'members' && renderMembersTable()}
        {tab === 'features' && renderFeaturesTab()}
      </div>
    </div>
  );
}
