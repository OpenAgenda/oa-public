setLinks is a small function that will take a string and convert any links or emails it finds to markup.

For example, if you give it this string: `'Here is some random url: http://fr.wikipedia.org/wiki/Lard'` it will return `'Here is some random url: <a href="http://fr.wikipedia.org/wiki/Lard">http://fr.wikipedia.org/wiki/Lard</a>'`.

Emails will also be processed and converted to 'mailto' links.

setLinksElems wraps setLinks and will do the same to the content of lists of elements.

Check the examples.
