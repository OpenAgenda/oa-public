"use strict";

var _jsxFileName = "/home/bertho/oa/packages/agenda-search/components/src/AgendaItem.jsx";

var React = require('react'),
    getLabel = require('@openagenda/labels')(require('@openagenda/labels/agenda-search')),
    PropTypes = require('prop-types'),
    createReactClass = require('create-react-class'),
    url = require('../../service/url');

module.exports = createReactClass({
  displayName: 'AgendaItem',
  propTypes: {
    agenda: PropTypes.object,
    lang: PropTypes.string
  },
  render: function render() {
    return React.createElement("div", {
      className: "agenda-item media",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 24
      },
      __self: this
    }, React.createElement("a", {
      href: url.agenda(this.props.agenda),
      __source: {
        fileName: _jsxFileName,
        lineNumber: 25
      },
      __self: this
    }, React.createElement("div", {
      className: "media-left",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 26
      },
      __self: this
    }, React.createElement("img", {
      className: "media-object ill avatar",
      src: this.props.agenda.image,
      alt: this.props.agenda.title,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 27
      },
      __self: this
    })), React.createElement("div", {
      className: "media-body",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 33
      },
      __self: this
    }, React.createElement("div", {
      className: "title media-heading",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 34
      },
      __self: this
    }, React.createElement("strong", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 35
      },
      __self: this
    }, this.props.agenda.title), this.props.agenda.official ? React.createElement("div", {
      className: "official",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 37
      },
      __self: this
    }, React.createElement("img", {
      src: "//s3.eu-central-1.amazonaws.com/oastatic/official14.png",
      alt: "officiel",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 38
      },
      __self: this
    }), React.createElement("div", {
      className: "tooltip right",
      role: "tooltip",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 39
      },
      __self: this
    }, React.createElement("div", {
      className: "tooltip-arrow",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 40
      },
      __self: this
    }), React.createElement("div", {
      className: "tooltip-inner",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 41
      },
      __self: this
    }, getLabel('official', this.props.lang)))) : null), React.createElement("p", {
      className: "description",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 46
      },
      __self: this
    }, this.props.agenda.description), React.createElement("div", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 47
      },
      __self: this
    }, this.props.agenda.upcomingPublishedEvents === 0 && this.props.agenda.publishedEvents === 1 ? React.createElement("span", {
      className: "badge badge-default",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 48
      },
      __self: this
    }, getLabel('publishedEvent', this.props.lang)) : null, this.props.agenda.upcomingPublishedEvents === 0 && this.props.agenda.publishedEvents > 1 ? React.createElement("span", {
      className: "badge badge-default",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 49
      },
      __self: this
    }, getLabel('publishedEvents', {
      count: this.props.agenda.publishedEvents
    }, this.props.lang)) : null, this.props.agenda.upcomingPublishedEvents === 1 ? React.createElement("span", {
      className: "badge badge-info",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 50
      },
      __self: this
    }, getLabel('upcomingEvent', this.props.lang)) : null, this.props.agenda.upcomingPublishedEvents > 1 ? React.createElement("span", {
      className: "badge badge-info",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 51
      },
      __self: this
    }, getLabel('upcomingEvents', {
      count: this.props.agenda.upcomingPublishedEvents
    }, this.props.lang)) : null))));
  }
});
//# sourceMappingURL=AgendaItem.js.map