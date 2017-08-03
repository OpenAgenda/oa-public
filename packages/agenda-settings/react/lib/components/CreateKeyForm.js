'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reduxForm = require('redux-form');

var _inputs = require('../utils/inputs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  CreateKeyForm: {
    displayName: 'CreateKeyForm'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/CreateKeyForm.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var displayInputError = function displayInputError(_ref) {
  var dirty = _ref.dirty,
      touched = _ref.touched;
  return touched && dirty;
};

var CreateKeyForm = _wrapComponent('CreateKeyForm')((_dec = (0, _reduxForm.reduxForm)({}), _dec(_class = (_temp = _class2 = function (_Component) {
  _inherits(CreateKeyForm, _Component);

  function CreateKeyForm() {
    _classCallCheck(this, CreateKeyForm);

    var _this = _possibleConstructorReturn(this, (CreateKeyForm.__proto__ || Object.getPrototypeOf(CreateKeyForm)).call(this));

    _this.renderField = _inputs.renderField.bind(_this);
    _this.renderInput = _inputs.renderInput.bind(_this);
    _this.renderTextarea = _inputs.renderTextarea.bind(_this);
    _this.renderInputGroup = _inputs.renderInputGroup.bind(_this);
    return _this;
  }

  /* componentWillMount() {
    this.props.initialize( { label: this.getDefautKeyName() } )
  }
   getDefautKeyName() {
    const { keys } = this.props;
    const { getLabel } = this.context;
     const nbr = keys.reduce( ( result, item ) => {
      const match = item.label.match( new RegExp( getLabel( 'keyNbr', { nbr: '(\\d)' } ), 'i' ) );
      return match && match[ 1 ] > result ? parseInt( match[ 1 ] ) + 1 : result;
    }, 1 );
     return getLabel( 'keyNbr', { nbr } );
  } */

  _createClass(CreateKeyForm, [{
    key: 'render',
    value: function render() {
      var handleSubmit = this.props.handleSubmit;
      var getLabel = this.context.getLabel;


      return _react3.default.createElement(
        'form',
        { onSubmit: handleSubmit },
        _react3.default.createElement(_reduxForm.Field, { name: 'label', type: 'hidden' }),
        _react3.default.createElement(
          'button',
          { type: 'submit', className: 'btn btn-default' },
          getLabel('generateKey')
        )
      );
    }
  }]);

  return CreateKeyForm;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _propTypes2.default.func,
  lang: _propTypes2.default.string
}, _temp)) || _class));

exports.default = CreateKeyForm;
module.exports = exports['default'];
//# sourceMappingURL=CreateKeyForm.js.map