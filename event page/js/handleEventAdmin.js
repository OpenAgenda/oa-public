var handleEventAdmin = function(params) {

  var isEditor = false,
  isOwner = false,
  defaultLinks = {
    edit: {cred: 'editor', html: '<a><i class="icon-cog admin"></i><span>edit</span></a>', link: '#edit', force: false},
    remove: {cred: 'owner', html: '<a><i class="icon-remove admin"></i><span>delete</span></a>', link: '#remove', confirm: true, message: 'Are you sure?', labels: { ok: 'Ok', cancel: 'Cancel'} },
    editors: {cred: 'owner', html: '<a><i class="icon-group admin"></i><span>editors</span></a>', link: '#editors'},
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

  for (var name in defaultLinks)
    params.links[name] = extend(defaultLinks[name], (typeof params.links[name] == 'undefined'?{}:params.links[name]));

  var init = function() {

    isOwner = params.ownerUid==params.loggedUid;
    isEditor = contains(params.editors, params.loggedUid)||isOwner?true:false;
    
    var links = [];

    for (var name in params.links) {
      var link = _processLink(params.links[name]);

      if (link) links.push(link);
    }

    if (links.length) {
      params.canvas.insertAdjacentHTML('beforeend', '<li class="section"><h2>' + params.labels.edition + '</h2></li>');

      forEach(links, function(link) {
        params.canvas.appendChild(link);
      });
    }

    if (params.publish) params.publish.canvas.insertAdjacentHTML('afterbegin', params.publish.html);

  },

  _processLink = function(link) {

    if (link.cred=='owner' && !isOwner && !link.force) return false;

    if (link.cred=='editor' && !isEditor &&!isOwner && !link.force) return false;

    var li = document.createElement('li');

    li.innerHTML = link.html;

    if (link.link) el(li, 'a').href = link.link;

    action(li, link);

    return li;

  };

  init();

};