import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _set from "lodash/set.js";
import _keys from "lodash/keys.js";
import _get from "lodash/get.js";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/admin-agendas/components/src/Details.js";
import "core-js/modules/es.symbol.description.js";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/es.promise.js";
import "core-js/modules/web.dom-collections.iterator.js";
import React, { Fragment, useState } from 'react';
import SwitchModule from 'rc-switch';
import { Modal } from '@openagenda/react-shared';
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
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
    updateHref
  } = props;

  // On lit la query initiale pour en déduire l'onglet par défaut
  const initialQuery = getQuery();
  const [tab, setTab] = useState(() => initialQuery && initialQuery.tab || 'members');
  const [modalVisible, setModalVisible] = useState(false);

  /**
   * Fonction pour gérer la resynchronisation
   */
  const handleResync = async type => {
    if (!agenda || !agenda.uid) return;
    setModalVisible(true);
    try {
      await fetch("/api/agendas/".concat(agenda.uid, "/settings/resync"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([type])
      });
    } catch (error) {
      console.error("Erreur lors de la resynchronisation de ".concat(type, ":"), error);
      setModalVisible(false);
    }
  };

  /**
   * Sélecteurs d'onglet
   */
  const handleTabChange = name => {
    setTab(name);
    updateHref(_objectSpread(_objectSpread({}, getQuery() || {}), {}, {
      tab: name
    }));
  };

  /**
   * Switches
   */
  const setOfficial = checked => {
    setAgenda({
      official: checked
    });
  };
  const setPrivate = checked => {
    setAgenda({
      private: checked
    });
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
    return /*#__PURE__*/_jsxDEV("tr", {
      children: /*#__PURE__*/_jsxDEV("td", {
        colSpan: "6",
        className: "text-center",
        children: /*#__PURE__*/_jsxDEV("button", {
          className: "btn btn-default",
          onClick: () => getMembersPage(false),
          children: "Pr\xE9c\xE9dent"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 103,
          columnNumber: 11
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 102,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 101,
      columnNumber: 7
    }, this);
  };
  const renderNext = () => {
    if (!hasNextPage()) return null;
    return /*#__PURE__*/_jsxDEV("tr", {
      children: /*#__PURE__*/_jsxDEV("td", {
        colSpan: "6",
        className: "text-center",
        children: /*#__PURE__*/_jsxDEV("button", {
          className: "btn btn-default",
          onClick: () => getMembersPage(true),
          children: "Suivant"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 116,
          columnNumber: 11
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 115,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 114,
      columnNumber: 7
    }, this);
  };

  /**
   * Rendu des membres
   */
  const renderMemberItem = member => {
    var _member$user$uid, _member$user, _member$user2, _member$user3, _member$user4, _member$user5, _member$user6, _member$user7, _member$user8;
    // Cas : utilisateur supprimé
    if (member.deletedUser) {
      return /*#__PURE__*/_jsxDEV("tr", {
        children: /*#__PURE__*/_jsxDEV("td", {
          className: "text-danger text-center",
          colSpan: 7,
          children: "User deleted"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 132,
          columnNumber: 11
        }, this)
      }, member.id, false, {
        fileName: _jsxFileName,
        lineNumber: 131,
        columnNumber: 9
      }, this);
    }

    // Cas : invité
    if (member.invited) {
      return /*#__PURE__*/_jsxDEV("tr", {
        children: /*#__PURE__*/_jsxDEV("td", {
          className: "text-info text-center",
          colSpan: 7,
          children: ["User invited (", member.custom.contactName ? /*#__PURE__*/_jsxDEV(Fragment, {
            children: [member.custom.contactName, ": "]
          }, void 0, true, {
            fileName: _jsxFileName,
            lineNumber: 143,
            columnNumber: 42
          }, this) : null, member.custom.email, ")"]
        }, void 0, true, {
          fileName: _jsxFileName,
          lineNumber: 141,
          columnNumber: 11
        }, this)
      }, member.id, false, {
        fileName: _jsxFileName,
        lineNumber: 140,
        columnNumber: 9
      }, this);
    }

    // Cas : utilisateur "actif"
    return /*#__PURE__*/_jsxDEV("tr", {
      children: [/*#__PURE__*/_jsxDEV("td", {
        className: "text-primary",
        children: (_member$user$uid = (_member$user = member.user) === null || _member$user === void 0 ? void 0 : _member$user.uid) !== null && _member$user$uid !== void 0 ? _member$user$uid : "Utilisateur supprim\xE9 (".concat(member.userUid, ")")
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 153,
        columnNumber: 9
      }, this), /*#__PURE__*/_jsxDEV("td", {
        children: roleToString(member.role)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 156,
        columnNumber: 9
      }, this), /*#__PURE__*/_jsxDEV("td", {
        children: (_member$user2 = member.user) === null || _member$user2 === void 0 ? void 0 : _member$user2.fullName
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 157,
        columnNumber: 9
      }, this), /*#__PURE__*/_jsxDEV("td", {
        children: (_member$user3 = member.user) === null || _member$user3 === void 0 ? void 0 : _member$user3.username
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 158,
        columnNumber: 9
      }, this), /*#__PURE__*/_jsxDEV("td", {
        children: (_member$user4 = member.user) === null || _member$user4 === void 0 ? void 0 : _member$user4.email
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 159,
        columnNumber: 9
      }, this), /*#__PURE__*/_jsxDEV("td", {
        children: ["le ", (_member$user5 = member.user) === null || _member$user5 === void 0 ? void 0 : _member$user5.createdAt]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 160,
        columnNumber: 9
      }, this), /*#__PURE__*/_jsxDEV("td", {
        children: [/*#__PURE__*/_jsxDEV("a", {
          href: "/admin/users/signin?uid=".concat((_member$user6 = member.user) === null || _member$user6 === void 0 ? void 0 : _member$user6.uid),
          children: /*#__PURE__*/_jsxDEV("i", {
            className: "fa fa-sign-in",
            "aria-hidden": "true"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 163,
            columnNumber: 13
          }, this)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 162,
          columnNumber: 11
        }, this), ' ', /*#__PURE__*/_jsxDEV("a", {
          disabled: !((_member$user7 = member.user) !== null && _member$user7 !== void 0 && _member$user7.uid),
          href: (_member$user8 = member.user) !== null && _member$user8 !== void 0 && _member$user8.uid ? "/admin/users?userUid=".concat(member.user.uid) : '#',
          children: /*#__PURE__*/_jsxDEV("i", {
            className: "fa fa-user",
            "aria-hidden": "true"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 169,
            columnNumber: 13
          }, this)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 165,
          columnNumber: 11
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 161,
        columnNumber: 9
      }, this)]
    }, member.id, true, {
      fileName: _jsxFileName,
      lineNumber: 152,
      columnNumber: 7
    }, this);
  };
  const renderMembersTable = () => {
    return /*#__PURE__*/_jsxDEV("table", {
      className: "table table-striped table-hover",
      children: [/*#__PURE__*/_jsxDEV("thead", {
        children: /*#__PURE__*/_jsxDEV("tr", {
          children: [/*#__PURE__*/_jsxDEV("th", {
            children: "#"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 181,
            columnNumber: 13
          }, this), /*#__PURE__*/_jsxDEV("th", {
            children: "Type"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 182,
            columnNumber: 13
          }, this), /*#__PURE__*/_jsxDEV("th", {
            children: "Nom complet"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 183,
            columnNumber: 13
          }, this), /*#__PURE__*/_jsxDEV("th", {
            children: "Nom d'utilisateur"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 184,
            columnNumber: 13
          }, this), /*#__PURE__*/_jsxDEV("th", {
            children: "Email"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 185,
            columnNumber: 13
          }, this), /*#__PURE__*/_jsxDEV("th", {
            children: "Depuis"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 186,
            columnNumber: 13
          }, this), /*#__PURE__*/_jsxDEV("th", {
            children: "Actions"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 187,
            columnNumber: 13
          }, this)]
        }, void 0, true, {
          fileName: _jsxFileName,
          lineNumber: 180,
          columnNumber: 11
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 179,
        columnNumber: 9
      }, this), /*#__PURE__*/_jsxDEV("tbody", {
        children: [renderPrev(), members !== null && members !== void 0 && members.length ? members.map(m => renderMemberItem(m)) : /*#__PURE__*/_jsxDEV("tr", {
          children: /*#__PURE__*/_jsxDEV("td", {
            colSpan: "7",
            className: "text-center",
            children: "Y'a personne !"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 196,
            columnNumber: 15
          }, this)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 195,
          columnNumber: 13
        }, this), renderNext()]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 190,
        columnNumber: 9
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 178,
      columnNumber: 7
    }, this);
  };

  /**
   * Header de l'agenda
   */
  const renderAgendaHeader = () => {
    if (!agenda) return null;
    const {
      network,
      image,
      slug,
      title,
      description,
      url,
      uid,
      official,
      private: isPrivate,
      updatedAt,
      createdAt
    } = agenda;
    return /*#__PURE__*/_jsxDEV("header", {
      className: "agenda-header",
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "container-fluid profile notheme",
        children: /*#__PURE__*/_jsxDEV("div", {
          className: "row",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "pull-right",
            children: [/*#__PURE__*/_jsxDEV("button", {
              type: "button",
              onClick: () => handleResync('rebuildSearch'),
              className: "btn btn-primary",
              style: {
                marginRight: '5px'
              },
              children: "R\xE9indexer"
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 220,
              columnNumber: 15
            }, this), /*#__PURE__*/_jsxDEV("button", {
              type: "button",
              onClick: () => handleResync('resyncInbox'),
              className: "btn btn-info",
              style: {
                marginRight: '5px'
              },
              children: "R\xE9initialiser la messagerie"
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 228,
              columnNumber: 15
            }, this), /*#__PURE__*/_jsxDEV("button", {
              type: "button",
              onClick: () => handleResync('rebuildActivities'),
              className: "btn btn-success",
              style: {
                marginRight: '5px'
              },
              children: "Resynchroniser l'historique"
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 236,
              columnNumber: 15
            }, this), /*#__PURE__*/_jsxDEV("button", {
              type: "button",
              onClick: displayConfirmDelete,
              className: "btn btn-danger",
              children: "Supprimer"
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 244,
              columnNumber: 15
            }, this)]
          }, void 0, true, {
            fileName: _jsxFileName,
            lineNumber: 219,
            columnNumber: 13
          }, this), image ? /*#__PURE__*/_jsxDEV("div", {
            className: "col-sm-2 avatar-container",
            children: /*#__PURE__*/_jsxDEV("a", {
              href: "/".concat(slug),
              children: /*#__PURE__*/_jsxDEV("img", {
                className: "avatar",
                src: image,
                alt: title
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 256,
                columnNumber: 19
              }, this)
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 255,
              columnNumber: 17
            }, this)
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 254,
            columnNumber: 15
          }, this) : null, /*#__PURE__*/_jsxDEV("div", {
            className: image ? 'col-sm-7 title-container' : 'title-container',
            children: [/*#__PURE__*/_jsxDEV("a", {
              href: "/".concat(slug),
              children: [network && /*#__PURE__*/_jsxDEV("span", {
                children: [network.title, " \u203A", ' ', /*#__PURE__*/_jsxDEV("a", {
                  href: "/admin/networks/".concat(network.uid),
                  children: "config"
                }, void 0, false, {
                  fileName: _jsxFileName,
                  lineNumber: 266,
                  columnNumber: 21
                }, this), " -", ' ', /*#__PURE__*/_jsxDEV("a", {
                  href: "/admin/networks/".concat(network.uid, "/agendas"),
                  children: "agendas"
                }, void 0, false, {
                  fileName: _jsxFileName,
                  lineNumber: 267,
                  columnNumber: 21
                }, this), ' ']
              }, void 0, true, {
                fileName: _jsxFileName,
                lineNumber: 264,
                columnNumber: 19
              }, this), /*#__PURE__*/_jsxDEV("h1", {
                children: title
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 270,
                columnNumber: 17
              }, this), /*#__PURE__*/_jsxDEV("p", {
                children: description
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 271,
                columnNumber: 17
              }, this)]
            }, void 0, true, {
              fileName: _jsxFileName,
              lineNumber: 262,
              columnNumber: 15
            }, this), url && /*#__PURE__*/_jsxDEV("p", {
              children: /*#__PURE__*/_jsxDEV("a", {
                target: "_blank",
                rel: "noreferrer",
                href: url,
                children: url
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 275,
                columnNumber: 19
              }, this)
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 274,
              columnNumber: 17
            }, this), uid && /*#__PURE__*/_jsxDEV(_Fragment, {
              children: [/*#__PURE__*/_jsxDEV("div", {
                children: ["Agenda officiel", ' ', /*#__PURE__*/_jsxDEV(Switch, {
                  className: "rc-switch",
                  checkedChildren: /*#__PURE__*/_jsxDEV("i", {
                    className: "fa fa-check",
                    "aria-hidden": "true"
                  }, void 0, false, {
                    fileName: _jsxFileName,
                    lineNumber: 286,
                    columnNumber: 40
                  }, this),
                  unCheckedChildren: /*#__PURE__*/_jsxDEV("i", {
                    className: "fa fa-times",
                    "aria-hidden": "true"
                  }, void 0, false, {
                    fileName: _jsxFileName,
                    lineNumber: 287,
                    columnNumber: 42
                  }, this),
                  onChange: setOfficial,
                  checked: !!official
                }, void 0, false, {
                  fileName: _jsxFileName,
                  lineNumber: 284,
                  columnNumber: 21
                }, this)]
              }, void 0, true, {
                fileName: _jsxFileName,
                lineNumber: 282,
                columnNumber: 19
              }, this), /*#__PURE__*/_jsxDEV("div", {
                children: ["Agenda priv\xE9", ' ', /*#__PURE__*/_jsxDEV(Switch, {
                  className: "rc-switch",
                  checkedChildren: /*#__PURE__*/_jsxDEV("i", {
                    className: "fa fa-check",
                    "aria-hidden": "true"
                  }, void 0, false, {
                    fileName: _jsxFileName,
                    lineNumber: 296,
                    columnNumber: 40
                  }, this),
                  unCheckedChildren: /*#__PURE__*/_jsxDEV("i", {
                    className: "fa fa-times",
                    "aria-hidden": "true"
                  }, void 0, false, {
                    fileName: _jsxFileName,
                    lineNumber: 297,
                    columnNumber: 42
                  }, this),
                  onChange: setPrivate,
                  checked: !!isPrivate
                }, void 0, false, {
                  fileName: _jsxFileName,
                  lineNumber: 294,
                  columnNumber: 21
                }, this)]
              }, void 0, true, {
                fileName: _jsxFileName,
                lineNumber: 292,
                columnNumber: 19
              }, this), /*#__PURE__*/_jsxDEV("div", {
                children: ["Cr\xE9ation: ", createdAt, " - Derni\xE8re mise \xE0 jour: ", updatedAt]
              }, void 0, true, {
                fileName: _jsxFileName,
                lineNumber: 302,
                columnNumber: 19
              }, this)]
            }, void 0, true)]
          }, void 0, true, {
            fileName: _jsxFileName,
            lineNumber: 261,
            columnNumber: 13
          }, this)]
        }, void 0, true, {
          fileName: _jsxFileName,
          lineNumber: 218,
          columnNumber: 11
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 217,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 216,
      columnNumber: 7
    }, this);
  };

  /**
   * Onglet Features
   */
  const renderFeaturesTab = () => {
    const credentials = _get(agenda, 'config.credentials', {});
    return /*#__PURE__*/_jsxDEV("ul", {
      className: "list-unstyled",
      children: _keys(credentials).map(c => {
        var _agenda$credentials;
        return /*#__PURE__*/_jsxDEV("li", {
          className: "margin-v-sm",
          children: [/*#__PURE__*/_jsxDEV(Switch, {
            className: "rc-switch",
            checkedChildren: /*#__PURE__*/_jsxDEV("i", {
              className: "fa fa-check",
              "aria-hidden": "true"
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 323,
              columnNumber: 32
            }, this),
            unCheckedChildren: /*#__PURE__*/_jsxDEV("i", {
              className: "fa fa-times",
              "aria-hidden": "true"
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 324,
              columnNumber: 34
            }, this),
            onChange: checked => setAgenda(_set({}, ['credentials', c], checked)),
            checked: !!((_agenda$credentials = agenda.credentials) !== null && _agenda$credentials !== void 0 && _agenda$credentials[c])
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 321,
            columnNumber: 13
          }, this), ' ', credentials[c].description]
        }, c, true, {
          fileName: _jsxFileName,
          lineNumber: 320,
          columnNumber: 11
        }, this);
      })
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 318,
      columnNumber: 7
    }, this);
  };
  return /*#__PURE__*/_jsxDEV("div", {
    className: "col-md-9",
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "row",
      children: [renderAgendaHeader(), modalVisible && /*#__PURE__*/_jsxDEV(Modal, {
        onClose: () => setModalVisible(false),
        contentLabel: "Op\xE9ration en cours",
        children: /*#__PURE__*/_jsxDEV("div", {
          className: "text-center",
          children: "L'op\xE9ration est en cours"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 346,
          columnNumber: 13
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 342,
        columnNumber: 11
      }, this), /*#__PURE__*/_jsxDEV("ul", {
        className: "nav nav-tabs",
        children: [/*#__PURE__*/_jsxDEV("li", {
          role: "presentation",
          className: tab === 'members' ? 'active' : '',
          onClick: () => handleTabChange('members'),
          children: /*#__PURE__*/_jsxDEV("a", {
            href: "#",
            children: "Member"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 358,
            columnNumber: 13
          }, this)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 353,
          columnNumber: 11
        }, this), /*#__PURE__*/_jsxDEV("li", {
          role: "presentation",
          className: tab === 'features' ? 'active' : '',
          onClick: () => handleTabChange('features'),
          children: /*#__PURE__*/_jsxDEV("a", {
            href: "#",
            children: "Features"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 365,
            columnNumber: 13
          }, this)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 360,
          columnNumber: 11
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 352,
        columnNumber: 9
      }, this), tab === 'members' && renderMembersTable(), tab === 'features' && renderFeaturesTab()]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 337,
      columnNumber: 7
    }, this)
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 336,
    columnNumber: 5
  }, this);
}
//# sourceMappingURL=Details.js.map