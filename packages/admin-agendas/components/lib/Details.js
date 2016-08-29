"use strict";

var React = require("react"),
    List = require('react-components/build/List'),
    Switch = require('rc-switch');

module.exports = React.createClass({

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
  setOfficial: function setOfficial(checked) {

    this.props.setAgenda({ official: checked });
  },
  renderAgendaHeader: function renderAgendaHeader() {
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
              { href: this.props.agenda.slug },
              " ",
              React.createElement("img", { className: "avatar", src: 'https://cibul.s3.amazonaws.com/' + this.props.agenda.image,
                alt: this.props.agenda.title }),
              " "
            )
          ) : null,
          React.createElement(
            "div",
            { className: this.props.agenda.image ? 'col-sm-7 title-container' : 'title-container' },
            React.createElement(
              "a",
              { href: this.props.agenda.slug },
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
            React.createElement(
              "p",
              null,
              this.props.agenda.uid ? React.createElement(
                "span",
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
              ) : null
            )
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
        items: this.props.stakeholders,
        renderItem: this.renderStakeholderItem,
        renderEmpty: function renderEmpty() {
          return React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              { colSpan: "6", className: "text-center" },
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
          React.createElement("i", { className: "fa fa-sign-in",
            "aria-hidden": "true" })
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
            "Précédent"
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
  render: function render() {

    return React.createElement(
      "div",
      { className: "col-md-9" },
      React.createElement(
        "div",
        { className: "row" },
        this.props.agenda ? this.renderAgendaHeader() : '',
        this.props.stakeholders ? this.renderStakeholdersTable() : ''
      )
    );
  }
});

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