var cn = require('../../js/lib/common/common.mod.js'),

params = {
  env: 'prod',
  events: {
    mobileCheck: 'mobilecheck'
  },
  timeout: 2000
};

module.exports = function(doc, win, eh, options) {

  cn.extend(params, options?options:{});

  if (params.env=='dev') return;
  
  eh.trigger('mobilecheck', function(isMobile) {

    if (isMobile) return;

    setTimeout(function() {

      win.$zopim||(function(d,s){var z=$zopim=function(c){z._.push(c)},$=z.s=d.createElement(s),e=d.getElementsByTagName(s)[0];z.set=function(o){z.set._.push(o)};z._=[];z.set._=[];$.async=!0;$.setAttribute('charset','utf-8');$.src='//v2.zopim.com/?29LAxcFujTf8BFW59vPUfYdVrAG6W0cl';z.t=+new Date;$.type='text/javascript';e.parentNode.insertBefore($,e)})(doc,'script');

    }, params.timeout);

  });

};