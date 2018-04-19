var handleAgendaForm = function(params) {

  params = extend({
    selectors: {
      moderated: '.js_moderated_input',
      extended: '.js_extended_input',
      draft: '.js_draft_input'
    },
    classes: {
      disabled: 'inactive'
    },
    messages: {
      moderationDeactivate: false, // message to display when a review loses moderation rights
      extendedDeactivate: false // message to display when a review loses extended rights
    }
  }, params);

  var moderatedInput = el(el(params.selectors.moderated), 'input'),
  extendedRightsInput = el(el(params.selectors.extended), 'input'),
  draftSection = el(params.selectors.draft),
  draftInput = el(draftSection, 'input'),

  run = function() {

    if (moderatedInput && extendedRightsInput) {
      addEvent(moderatedInput, 'click', _toggleDraftEnabled);
      addEvent(extendedRightsInput, 'click', _toggleDraftEnabled);
    }

    if (moderatedInput.checked) _handleMessage(moderatedInput, params.messages.moderationDeactivate);

    if (extendedRightsInput.checked) _handleMessage(extendedRightsInput, params.messages.extendedDeactivate);

  },

  _handleMessage = function(inputField, message) {

    addEvent(inputField, 'click', function(e) {

      if (!inputField.checked) lightbox({ message: message, classes: {frame: 'wsq lightbox-frame', canvas: 'lightbox-canvas', buttonBox: 'lightbox-buttons', button: 'small button'} });

    });

  },

  _toggleDraftEnabled = function() {

    if (moderatedInput.checked && extendedRightsInput.checked) {

      draftInput.removeAttribute('disabled');
      removeClass(draftSection, params.classes.disabled);

    } else {

      draftInput.setAttribute('disabled', 'disabled');
      addClass(draftSection, params.classes.disabled);

    }

  }

  run();

}