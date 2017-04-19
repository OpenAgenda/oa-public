"use strict";

var _redboxReact2 = require("redbox-react");

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require("react");

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require("react-transform-catch-errors");

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  Details: {
    displayName: "Details"
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: "components/src/Details.jsx",
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var React = require("react"),
    List = require('react-components/build/List'),
    Switch = require('rc-switch');

module.exports = _wrapComponent("Details")(React.createClass({

  displayName: 'Details',

  propTypes: {
    agenda: React.PropTypes.object,
    stakeholders: React.PropTypes.array,
    pageRange: React.PropTypes.array,
    total: React.PropTypes.number,
    getStakeholdersPage: React.PropTypes.func,
    setAgenda: React.PropTypes.func,
    limit: React.PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {

    return {
      limit: 20
    };
  },
  getInitialState: function getInitialState() {

    var query = this.props.getQuery();

    return {
      tab: query && query.tab || 'stakeholders'
    };
  },
  setOfficial: function setOfficial(checked) {

    this.props.setAgenda({ official: checked });
  },
  setPrivate: function setPrivate(checked) {

    this.props.setAgenda({ private: checked });
  },
  renderAgendaHeader: function renderAgendaHeader() {
    var setAgenda = this.props.setAgenda;


    return React.createElement(
      "header",
      { className: "agenda-header" },
      React.createElement(
        "div",
        { className: "container-fluid profile notheme" },
        React.createElement(
          "div",
          { className: "row" },
          this.props.agenda.image ? React.createElement(
            "div",
            { className: "col-sm-2 avatar-container" },
            React.createElement(
              "a",
              { href: '/' + this.props.agenda.slug },
              " ",
              React.createElement("img", { className: "avatar",
                src: 'https://cibul.s3.amazonaws.com/' + this.props.agenda.image,
                alt: this.props.agenda.title }),
              " "
            )
          ) : null,
          React.createElement(
            "div",
            { className: this.props.agenda.image ? 'col-sm-7 title-container' : 'title-container' },
            React.createElement(
              "a",
              { href: '/' + this.props.agenda.slug },
              React.createElement(
                "h1",
                null,
                this.props.agenda.title
              ),
              React.createElement(
                "p",
                null,
                this.props.agenda.description
              )
            ),
            " ",
            this.props.agenda.url ? React.createElement(
              "p",
              null,
              React.createElement(
                "a",
                { target: "_blank", href: this.props.agenda.url },
                this.props.agenda.url
              )
            ) : null,
            this.props.agenda.uid ? React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                null,
                "Agenda officiel ",
                React.createElement(Switch, {
                  ref: "switch",
                  className: "rc-switch",
                  checkedChildren: React.createElement("i", { className: "fa fa-check", "aria-hidden": "true" }),
                  unCheckedChildren: React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" }),
                  onChange: this.setOfficial,
                  checked: !!this.props.agenda.official
                })
              ),
              React.createElement(
                "div",
                null,
                "Agenda priv\xE9 ",
                React.createElement(Switch, {
                  ref: "switch",
                  className: "rc-switch",
                  checkedChildren: React.createElement("i", { className: "fa fa-check", "aria-hidden": "true" }),
                  unCheckedChildren: React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" }),
                  onChange: this.setPrivate,
                  checked: !!this.props.agenda.private
                })
              )
            ) : null
          )
        )
      )
    );
  },
  renderStakeholdersTable: function renderStakeholdersTable() {

    return React.createElement(
      "table",
      { className: "table table-striped table-hover" },
      React.createElement(
        "thead",
        null,
        React.createElement(
          "tr",
          null,
          React.createElement(
            "th",
            null,
            "#"
          ),
          React.createElement(
            "th",
            null,
            "Type"
          ),
          React.createElement(
            "th",
            null,
            "Nom complet"
          ),
          React.createElement(
            "th",
            null,
            "Nom d'utilisateur"
          ),
          React.createElement(
            "th",
            null,
            "Email"
          ),
          React.createElement(
            "th",
            null,
            "Depuis"
          ),
          React.createElement(
            "th",
            null,
            "Actions"
          )
        )
      ),
      React.createElement(List, {
        items: this.props.stakeholders || [],
        renderItem: this.renderStakeholderItem,
        renderEmpty: function renderEmpty() {
          return React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              { colSpan: "7", className: "text-center" },
              "Y'a personne !"
            )
          );
        },
        renderPrev: this.renderPrev,
        renderNext: this.renderNext,
        getPage: function getPage() {
          return null;
        },
        wrapTag: "tbody"
      })
    );
  },
  renderStakeholderItem: function renderStakeholderItem(stakeholder) {

    if (!stakeholder.user) {
      return React.createElement(
        "tr",
        { key: stakeholder.id },
        React.createElement(
          "td",
          { className: "text-danger text-center", colSpan: 6 },
          "User deleted"
        )
      );
    }

    return React.createElement(
      "tr",
      { key: stakeholder.id },
      React.createElement(
        "td",
        { className: "text-primary" },
        stakeholder.user.uid
      ),
      React.createElement(
        "td",
        null,
        credentialsToString(stakeholder.credential)
      ),
      React.createElement(
        "td",
        null,
        stakeholder.user.full_name
      ),
      React.createElement(
        "td",
        null,
        stakeholder.user.username
      ),
      React.createElement(
        "td",
        null,
        stakeholder.user.email
      ),
      React.createElement(
        "td",
        null,
        "le ",
        stakeholder.user.created_at
      ),
      React.createElement(
        "td",
        null,
        React.createElement(
          "a",
          { href: '/admin/users/signin?uid=' + stakeholder.user.uid },
          React.createElement("i", { className: "fa fa-sign-in", "aria-hidden": "true" })
        )
      )
    );
  },
  renderPrev: function renderPrev() {

    if (this.hasPrevPage()) {
      return React.createElement(
        "tr",
        null,
        React.createElement(
          "td",
          { colSpan: "6", className: "text-center" },
          React.createElement(
            "button",
            { className: "btn btn-default",
              onClick: this.props.getStakeholdersPage.bind(null, false) },
            "Pr\xE9c\xE9dent"
          )
        )
      );
    }
  },
  renderNext: function renderNext() {

    if (this.hasNextPage()) {
      return React.createElement(
        "tr",
        null,
        React.createElement(
          "td",
          { colSpan: "6", className: "text-center" },
          React.createElement(
            "button",
            { className: "btn btn-default",
              onClick: this.props.getStakeholdersPage.bind(null, true) },
            "Suivant"
          )
        )
      );
    }
  },
  hasNextPage: function hasNextPage() {

    var lastPage = this.props.pageRange[1];

    return lastPage * this.props.limit < this.props.total;
  },
  hasPrevPage: function hasPrevPage() {

    return this.props.pageRange[0] > 1;
  },
  renderFeaturesTab: function renderFeaturesTab() {
    var _props = this.props,
        agenda = _props.agenda,
        setAgenda = _props.setAgenda;


    return agenda.credentials && React.createElement(
      "div",
      null,
      React.createElement("p", null),
      React.createElement(
        "p",
        null,
        React.createElement(Switch, {
          className: "rc-switch",
          checkedChildren: React.createElement("i", { className: "fa fa-check", "aria-hidden": "true" }),
          unCheckedChildren: React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { moderators: checked } });
          },
          checked: !!agenda.credentials.moderators
        }),
        " Moderators"
      ),
      React.createElement(
        "p",
        null,
        React.createElement(Switch, {
          className: "rc-switch",
          checkedChildren: React.createElement("i", { className: "fa fa-check", "aria-hidden": "true" }),
          unCheckedChildren: React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { aggregator: checked } });
          },
          checked: !!agenda.credentials.aggregator
        }),
        " Aggregator"
      ),
      React.createElement(
        "p",
        null,
        React.createElement(Switch, {
          className: "rc-switch",
          checkedChildren: React.createElement("i", { className: "fa fa-check", "aria-hidden": "true" }),
          unCheckedChildren: React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { tags: checked } });
          },
          checked: !!agenda.credentials.tags
        }),
        " Agenda tags"
      ),
      React.createElement(
        "p",
        null,
        React.createElement(Switch, {
          className: "rc-switch",
          checkedChildren: React.createElement("i", { className: "fa fa-check", "aria-hidden": "true" }),
          unCheckedChildren: React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { embedsHead: checked } });
          },
          checked: !!agenda.credentials.embedsHead
        }),
        " Add lines inside embed ",
        '<head>'
      ),
      React.createElement(
        "p",
        null,
        React.createElement(Switch, {
          className: "rc-switch",
          checkedChildren: React.createElement("i", { className: "fa fa-check", "aria-hidden": "true" }),
          unCheckedChildren: React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { embedsTemplates: checked } });
          },
          checked: !!agenda.credentials.embedsTemplates
        }),
        " Customize embed templates"
      ),
      React.createElement(
        "p",
        null,
        React.createElement(Switch, {
          className: "rc-switch",
          checkedChildren: React.createElement("i", { className: "fa fa-check", "aria-hidden": "true" }),
          unCheckedChildren: React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { indesign: checked } });
          },
          checked: !!agenda.credentials.indesign
        }),
        " Old indesign tab"
      ),
      React.createElement(
        "p",
        null,
        React.createElement(Switch, {
          className: "rc-switch",
          checkedChildren: React.createElement("i", { className: "fa fa-check", "aria-hidden": "true" }),
          unCheckedChildren: React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { activatingInvitations: checked } });
          },
          checked: !!agenda.credentials.activatingInvitations
        }),
        " Invitations that trigger instant account verification ( no activation email required )"
      ),
      React.createElement(
        "p",
        null,
        React.createElement(Switch, {
          className: "rc-switch",
          checkedChildren: React.createElement("i", { className: "fa fa-check", "aria-hidden": "true" }),
          unCheckedChildren: React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { emailstrategie: checked } });
          },
          checked: !!agenda.credentials.emailstrategie
        }),
        " Emailstrategie tab"
      ),
      React.createElement(
        "p",
        null,
        React.createElement(Switch, {
          className: "rc-switch",
          checkedChildren: React.createElement("i", { className: "fa fa-check", "aria-hidden": "true" }),
          unCheckedChildren: React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { invitationMessage: checked } });
          },
          checked: !!agenda.credentials.invitationMessage
        }),
        " Invitation message"
      )
    );
  },
  setTab: function setTab(name) {
    this.setState({ tab: name });
    this.props.updateHref(Object.assign(this.props.getQuery() || {}, { tab: name }));
  },
  render: function render() {
    var _this = this;

    var tab = this.state.tab;


    return React.createElement(
      "div",
      { className: "col-md-9" },
      React.createElement(
        "div",
        { className: "row" },
        this.props.agenda ? this.renderAgendaHeader() : '',
        React.createElement(
          "div",
          { className: "nav nav-tabs" },
          React.createElement(
            "li",
            { role: "presentation", className: tab == 'stakeholders' ? 'active' : '',
              onClick: function onClick() {
                return _this.setTab('stakeholders');
              } },
            React.createElement(
              "a",
              { href: "#" },
              "Stakeholders"
            )
          ),
          React.createElement(
            "li",
            { role: "presentation", className: tab == 'features' ? 'active' : '',
              onClick: function onClick() {
                return _this.setTab('features');
              } },
            React.createElement(
              "a",
              { href: "#" },
              "Features"
            )
          )
        ),
        tab == 'stakeholders' && this.renderStakeholdersTable(),
        tab == 'features' && this.renderFeaturesTab()
      )
    );
  }
}));

function credentialsToString(type) {
  switch (type) {
    case 1:
      return 'Contributeur';
    case 2:
      return 'Administrateur';
    case 3:
      return 'Modérateur';
    default:
      'Inconnu';
  }
}