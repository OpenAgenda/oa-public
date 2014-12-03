Cibul Templates project readme
==============================


CSS rules
---------

### Page structure

Page structure css is shown and located in the 'structure' folder. All page required page structure are described and tested there.


CSS files
---------

css/base.css - bootstrap css to use everywhere ( embed and site )
css/site.css - base css for main website ( discrete elements displayed here and there in the site )
user/css/menu.css - user dropdown menu ( preloaded by main layout )


Misc
----

partials:
templates which are not meant to be rendered in full web page
they are suffixed with .part.ejs

never run nodemon in parallel in two different terminals on two different projects



Environments ( for scripts ):
-----------------------------

prod: everything live and online
dev:  full running project in dev mode. This is for when templates are used in conjunction with full project in dev mode
tpl: standalone templates


Pagination
----------

There is a partial for that. Use it: /general/pages. Use cases can be found for example in agenda/show ( where it is overriden by an ajax scroll down load ) or in newsletter/admin/contactListShow




test data ( for scripts ):
--------------------------

whenever requests are made to the server, static files should be  fetched by whatever script is running ( environment should be set to 'tpl' ). These files, in json are stored in the server/testdata folder. The content should be fetchable by ajax (not jsonp).