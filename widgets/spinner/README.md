#The spinner widget

This widget shows a spin.js spinner when the agenda is initializing or processing a request.

See https://fgnass.github.io/spin.js

Configuration goes in the associated element data-cbctl attribute. Configuration is a list of strings separated by a | character. In order:

1. the identifier of the embed ( agenda uid followed by the embed uid )

2. an optional spin.js configuration in json ( escaped for inline html integration )

Default spin.js config for widget:

    {
      width: 2,
      radius: 20,
      length: 10,
      color: '#666'
    }

The css of the wrapper element can be customized as well, just remove the .oaSpinner class from the widget element and style it as you wish.

Always keep the cbpg-prefixed class in the widget element!

An example:

    <div class="cbpgsp oaSpinner" data-cbctl="youragendauid/yourembeduid|{&quot;width&quot;:2,&quot;length&quot;:10,&quot;radius&quot;:20,&quot;color&quot;:&quot;#666&quot;}"></div>
    <script type="text/javascript" src="//openagenda.com/js/embed/oaSpinnerWidget.js"></script>