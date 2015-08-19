# OA templates

## Layouts

Layouts wrap pages with whatever you put in them. They are specified in your templateName.config.json file. They are built in much of the same way as a regular template. Examples of layouts and templates where they are used:

* layout/main : this is the legacy base layout for the website. It adds the header and any general page script ( session loader, header scripts .. ).

* bsLayout : this is the bootstrap version of the main website layout. An example of use is the agenda/show or event/show templates.

* embedLayout : layout used for any website-embedded view. It is a bare-bone layout that loads only the necessary for making embedded view. Used in agenda/embedShow