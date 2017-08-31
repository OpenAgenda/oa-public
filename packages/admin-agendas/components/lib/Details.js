"use strict";

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _List = require('react-components/build/List');

var _List2 = _interopRequireDefault(_List);

var _rcSwitch = require('rc-switch');

var _rcSwitch2 = _interopRequireDefault(_rcSwitch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _createReactClass2.default)({

  displayName: 'Details',

  propTypes: {
    agenda: _propTypes2.default.object,
    stakeholders: _propTypes2.default.array,
    pageRange: _propTypes2.default.array,
    total: _propTypes2.default.number,
    getStakeholdersPage: _propTypes2.default.func,
    setAgenda: _propTypes2.default.func,
    limit: _propTypes2.default.number
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


    return _react2.default.createElement(
      'header',
      { className: 'agenda-header' },
      _react2.default.createElement(
        'div',
        { className: 'container-fluid profile notheme' },
        _react2.default.createElement(
          'div',
          { className: 'row' },
          this.props.agenda.image ? _react2.default.createElement(
            'div',
            { className: 'col-sm-2 avatar-container' },
            _react2.default.createElement(
              'a',
              { href: '/' + this.props.agenda.slug },
              ' ',
              _react2.default.createElement('img', { className: 'avatar',
                src: 'https://cibul.s3.amazonaws.com/' + this.props.agenda.image,
                alt: this.props.agenda.title }),
              ' '
            )
          ) : null,
          _react2.default.createElement(
            'div',
            { className: this.props.agenda.image ? 'col-sm-7 title-container' : 'title-container' },
            _react2.default.createElement(
              'a',
              { href: '/' + this.props.agenda.slug },
              _react2.default.createElement(
                'h1',
                null,
                this.props.agenda.title
              ),
              _react2.default.createElement(
                'p',
                null,
                this.props.agenda.description
              )
            ),
            ' ',
            this.props.agenda.url ? _react2.default.createElement(
              'p',
              null,
              _react2.default.createElement(
                'a',
                { target: '_blank', href: this.props.agenda.url },
                this.props.agenda.url
              )
            ) : null,
            this.props.agenda.uid ? _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                'div',
                null,
                'Agenda officiel ',
                _react2.default.createElement(_rcSwitch2.default, {
                  className: 'rc-switch',
                  checkedChildren: _react2.default.createElement('i', { className: 'fa fa-check', 'aria-hidden': 'true' }),
                  unCheckedChildren: _react2.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' }),
                  onChange: this.setOfficial,
                  checked: !!this.props.agenda.official
                })
              ),
              _react2.default.createElement(
                'div',
                null,
                'Agenda priv\xE9 ',
                _react2.default.createElement(_rcSwitch2.default, {
                  className: 'rc-switch',
                  checkedChildren: _react2.default.createElement('i', { className: 'fa fa-check', 'aria-hidden': 'true' }),
                  unCheckedChildren: _react2.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' }),
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

    return _react2.default.createElement(
      'table',
      { className: 'table table-striped table-hover' },
      _react2.default.createElement(
        'thead',
        null,
        _react2.default.createElement(
          'tr',
          null,
          _react2.default.createElement(
            'th',
            null,
            '#'
          ),
          _react2.default.createElement(
            'th',
            null,
            'Type'
          ),
          _react2.default.createElement(
            'th',
            null,
            'Nom complet'
          ),
          _react2.default.createElement(
            'th',
            null,
            'Nom d\'utilisateur'
          ),
          _react2.default.createElement(
            'th',
            null,
            'Email'
          ),
          _react2.default.createElement(
            'th',
            null,
            'Depuis'
          ),
          _react2.default.createElement(
            'th',
            null,
            'Actions'
          )
        )
      ),
      _react2.default.createElement(_List2.default, {
        items: this.props.stakeholders || [],
        renderItem: this.renderStakeholderItem,
        renderEmpty: function renderEmpty() {
          return _react2.default.createElement(
            'tr',
            null,
            _react2.default.createElement(
              'td',
              { colSpan: '7', className: 'text-center' },
              'Y\'a personne !'
            )
          );
        },
        renderPrev: this.renderPrev,
        renderNext: this.renderNext,
        getPage: function getPage() {
          return null;
        },
        wrapTag: 'tbody'
      })
    );
  },
  renderStakeholderItem: function renderStakeholderItem(stakeholder) {

    if (!stakeholder.user) {
      return _react2.default.createElement(
        'tr',
        { key: stakeholder.id },
        _react2.default.createElement(
          'td',
          { className: 'text-danger text-center', colSpan: 6 },
          'User deleted'
        )
      );
    }

    return _react2.default.createElement(
      'tr',
      { key: stakeholder.id },
      _react2.default.createElement(
        'td',
        { className: 'text-primary' },
        stakeholder.user.uid
      ),
      _react2.default.createElement(
        'td',
        null,
        credentialsToString(stakeholder.credential)
      ),
      _react2.default.createElement(
        'td',
        null,
        stakeholder.user.full_name
      ),
      _react2.default.createElement(
        'td',
        null,
        stakeholder.user.username
      ),
      _react2.default.createElement(
        'td',
        null,
        stakeholder.user.email
      ),
      _react2.default.createElement(
        'td',
        null,
        'le ',
        stakeholder.user.created_at
      ),
      _react2.default.createElement(
        'td',
        null,
        _react2.default.createElement(
          'a',
          { href: '/admin/users/signin?uid=' + stakeholder.user.uid },
          _react2.default.createElement('i', { className: 'fa fa-sign-in', 'aria-hidden': 'true' })
        )
      )
    );
  },
  renderPrev: function renderPrev() {

    if (this.hasPrevPage()) {
      return _react2.default.createElement(
        'tr',
        null,
        _react2.default.createElement(
          'td',
          { colSpan: '6', className: 'text-center' },
          _react2.default.createElement(
            'button',
            { className: 'btn btn-default',
              onClick: this.props.getStakeholdersPage.bind(null, false) },
            'Pr\xE9c\xE9dent'
          )
        )
      );
    }
  },
  renderNext: function renderNext() {

    if (this.hasNextPage()) {
      return _react2.default.createElement(
        'tr',
        null,
        _react2.default.createElement(
          'td',
          { colSpan: '6', className: 'text-center' },
          _react2.default.createElement(
            'button',
            { className: 'btn btn-default',
              onClick: this.props.getStakeholdersPage.bind(null, true) },
            'Suivant'
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


    return agenda.credentials && _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement('p', null),
      _react2.default.createElement(
        'p',
        null,
        _react2.default.createElement(_rcSwitch2.default, {
          className: 'rc-switch',
          checkedChildren: _react2.default.createElement('i', { className: 'fa fa-check', 'aria-hidden': 'true' }),
          unCheckedChildren: _react2.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { moderators: checked } });
          },
          checked: !!agenda.credentials.moderators
        }),
        ' Moderators'
      ),
      _react2.default.createElement(
        'p',
        null,
        _react2.default.createElement(_rcSwitch2.default, {
          className: 'rc-switch',
          checkedChildren: _react2.default.createElement('i', { className: 'fa fa-check', 'aria-hidden': 'true' }),
          unCheckedChildren: _react2.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { aggregator: checked } });
          },
          checked: !!agenda.credentials.aggregator
        }),
        ' Aggregator'
      ),
      _react2.default.createElement(
        'p',
        null,
        _react2.default.createElement(_rcSwitch2.default, {
          className: 'rc-switch',
          checkedChildren: _react2.default.createElement('i', { className: 'fa fa-check', 'aria-hidden': 'true' }),
          unCheckedChildren: _react2.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { tags: checked } });
          },
          checked: !!agenda.credentials.tags
        }),
        ' Agenda tags'
      ),
      _react2.default.createElement(
        'p',
        null,
        _react2.default.createElement(_rcSwitch2.default, {
          className: 'rc-switch',
          checkedChildren: _react2.default.createElement('i', { className: 'fa fa-check', 'aria-hidden': 'true' }),
          unCheckedChildren: _react2.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { embedsHead: checked } });
          },
          checked: !!agenda.credentials.embedsHead
        }),
        ' Add lines inside embed ',
        '<head>'
      ),
      _react2.default.createElement(
        'p',
        null,
        _react2.default.createElement(_rcSwitch2.default, {
          className: 'rc-switch',
          checkedChildren: _react2.default.createElement('i', { className: 'fa fa-check', 'aria-hidden': 'true' }),
          unCheckedChildren: _react2.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { embedsTemplates: checked } });
          },
          checked: !!agenda.credentials.embedsTemplates
        }),
        ' Customize embed templates'
      ),
      _react2.default.createElement(
        'p',
        null,
        _react2.default.createElement(_rcSwitch2.default, {
          className: 'rc-switch',
          checkedChildren: _react2.default.createElement('i', { className: 'fa fa-check', 'aria-hidden': 'true' }),
          unCheckedChildren: _react2.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { indesign: checked } });
          },
          checked: !!agenda.credentials.indesign
        }),
        ' Old indesign tab'
      ),
      _react2.default.createElement(
        'p',
        null,
        _react2.default.createElement(_rcSwitch2.default, {
          className: 'rc-switch',
          checkedChildren: _react2.default.createElement('i', { className: 'fa fa-check', 'aria-hidden': 'true' }),
          unCheckedChildren: _react2.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { activatingInvitations: checked } });
          },
          checked: !!agenda.credentials.activatingInvitations
        }),
        ' Invitations that trigger instant account verification ( no activation email required )'
      ),
      _react2.default.createElement(
        'p',
        null,
        _react2.default.createElement(_rcSwitch2.default, {
          className: 'rc-switch',
          checkedChildren: _react2.default.createElement('i', { className: 'fa fa-check', 'aria-hidden': 'true' }),
          unCheckedChildren: _react2.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { emailstrategie: checked } });
          },
          checked: !!agenda.credentials.emailstrategie
        }),
        ' Emailstrategie tab'
      ),
      _react2.default.createElement(
        'p',
        null,
        _react2.default.createElement(_rcSwitch2.default, {
          className: 'rc-switch',
          checkedChildren: _react2.default.createElement('i', { className: 'fa fa-check', 'aria-hidden': 'true' }),
          unCheckedChildren: _react2.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' }),
          onChange: function onChange(checked) {
            return setAgenda({ credentials: { invitationMessage: checked } });
          },
          checked: !!agenda.credentials.invitationMessage
        }),
        ' Invitation message'
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


    return _react2.default.createElement(
      'div',
      { className: 'col-md-9' },
      _react2.default.createElement(
        'div',
        { className: 'row' },
        this.props.agenda ? this.renderAgendaHeader() : '',
        _react2.default.createElement(
          'div',
          { className: 'nav nav-tabs' },
          _react2.default.createElement(
            'li',
            { role: 'presentation', className: tab == 'stakeholders' ? 'active' : '',
              onClick: function onClick() {
                return _this.setTab('stakeholders');
              } },
            _react2.default.createElement(
              'a',
              { href: '#' },
              'Stakeholders'
            )
          ),
          _react2.default.createElement(
            'li',
            { role: 'presentation', className: tab == 'features' ? 'active' : '',
              onClick: function onClick() {
                return _this.setTab('features');
              } },
            _react2.default.createElement(
              'a',
              { href: '#' },
              'Features'
            )
          )
        ),
        tab == 'stakeholders' && this.renderStakeholdersTable(),
        tab == 'features' && this.renderFeaturesTab()
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