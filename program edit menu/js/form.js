var handleAgendaForm = function(params) {

  params = extend({
    selectors: {
      moderated: '.js_moderated_input'
      draft: '.js_draft_input'
    },
    classes: {
      disabled: 'inactive'
    }
  }, params);

  var draftEnabled,

  moderatedInput = el(el(params.selectors.moderated), 'input'),
  draftSection = el(params.selectors.draft),
  draftInput = el(draftSection, 'input'),

  run = function() {

    // initialize according to state of moderated input state
    draftEnabled = moderatedInput.value?true:false;

    console.log(moderatedInput.value);
    
  },

  run();

}