# Overview

To start working on a new template, create a folder in the templates folder, create your html & scss file in it, import what you need from any other folder and launch the command:

npm run-script watch

And start editing your file. The css equivalent of your scss will be generated in the same folder, so reference it directly in your html template

# Using scss

In any template folder, edit an scss file. When the watch script is running, a css file with the same name will be generated in the folder as changes are saved. Reference the css file in the template.

Import any style required to have a fully rendered template


# Using partials

To avoid repetition when building html templates, the partial feature of the ejs templating engine is used as such:

  * Any partial file begins with _
  * Work should be done on .ejs files which will compile into .html file. Only ejs & scss files are tracked by git
  * Use the ejs 'include' statement to add partial to a template
  * When the watch script is running any non partial ejs file is saved, an html render is generated