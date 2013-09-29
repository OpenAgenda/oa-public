var handleEventAdmin = function(params) {

  var isEditor = false
    , isOwner = false
    , defaultLinks = {
        edit: {cred: 'editor', html: '<a><i class="icon-cog admin"></i><span>edit</span></a>', link: '#edit'},
        remove: {cred: 'owner', html: '<a><i class="icon-remove admin"></i><span>delete</span></a>', link: '#remove', confirm: true, message: 'Are you sure?' },
        editors: {cred: 'owner', html: '<a><i class="icon-group admin"></i><span>editors</span></a>', type: 'ajax', link: '#editors'},
        email: {cred: 'editor', html: '<a><i class="icon-envelope admin"></i><span>send to my email</span></a>', link: '#email', type: 'ajax' },
        csv: {cred: 'editor', html: '<a><i class="icon-table admin"></i><span>csv</span></a>', link: '#csv'},
      };

  params = extend({
    labels: { edition: 'Edition' },
    published: true,
    canvas: false,
    loggedUid: false,
    ownerUid: false,
    editors: [], // list of editor uids
    /*publish: {
      html: '<p>This event is not published yet. <a href="#">Publish it now</a></p>',
      canvas: false // where the publish action goes
    }*/
    publish: false
  }, params);

  if (!params.links) params.links = {};

  for (name in defaultLinks) 
    params.links[name] = extend(defaultLinks[name], (typeof params.links[name] == 'undefined'?{}:params.links[name]));

  var init = function() {

    if (!params.loggedUid) return;

    isEditor = contains(params.editors, params.loggedUid)?true:false;
    isOwner = params.ownerUid==params.loggedUid;

    if (!isEditor && !isOwner) return;

    params.canvas.insertAdjacentHTML('beforeend', '<li class="section"><h2>' + params.labels.edition + '</h2></li>');

    for (name in params.links) _processLink(params.links[name]);

    if (params.publish) params.publish.canvas.insertAdjacentHTML('afterbegin', params.publish.html);

  },

  _processLink = function(link) {

    if (link.cred=='owner' && !isOwner) return;

    var li = document.createElement('li');

    li.innerHTML = link.html;

    if (link.link) el(li, 'a').href = link.link;

    addEvent(li, 'click', link.click?link.click:function(e) { preventDefault(e); window.location.href = link.link; });

    action(li, link);

    params.canvas.appendChild(li);

  };

  init();

};