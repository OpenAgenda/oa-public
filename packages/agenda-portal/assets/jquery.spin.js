/*! jQuery Spin - v0.0.1 - 2013-05-14
* https://github.com/tdoherty/jQuery.SpinJS
* Copyright (c) 2013 tdoherty; Licensed MIT */
(function (i) {
  typeof define === 'function' && define.amd ? define(['jquery', 'spin'], i) : i(jQuery, Spinner);
}((i, o) => {
  i.fn.spin = function (t) {
    const e = {};
    return this.each(function () {
      const n = i(this);


      const s = n.data();
      if (s.spinner && (s.spinner.stop(),
      delete s.spinner,
      n.find('.loadingBG').remove()),
      t !== !1) {
        t = t || {},
        t = i.extend({}, e, t);
        const a = i('<div>');
        a.addClass('loadingBG'),
        a.css({
          display: 'none',
          filter: `alpha(opacity=${10 * t.opacity})`,
          opacity: t.opacity / 10,
          '-ms-filter': `progid:DXImageTransform.Microsoft.Alpha(opacity=${10 * t.opacity})`,
          position: 'absolute',
          'z-index': 9999,
          top: n.css('position') === 'absolute' ? 0 : n.position().top - 1,
          left: n.css('position') === 'absolute' ? 0 : n.position().left,
          'background-color': `${t.bgColor}`,
          width: n.outerWidth(),
          height: n.outerHeight() === 0 ? '100%' : n.outerHeight() + 1,
          marginTop: n.css('marginTop'),
          marginRight: n.css('marginRight'),
          marginBottom: n.css('marginBottom'),
          marginLeft: n.css('marginLeft')
        }),
        delete t.bgColor,
        delete t.opacity,
        s.spinner = new o(t).spin(this),
        a.prependTo(n).show();
      }
    }),
    this;
  };
}));
