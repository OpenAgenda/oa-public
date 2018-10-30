# Overview

Project for sassing openagenda styles.

To get started, run server.js, a tiny express server to serve rendered styles.

So:

npm install
ln -s node_modules/font-awesome/fonts fonts
cd templates/event-form
ln -s ../tinymce/skins/lightgray/fonts fonts

and then:

npm start

# Final css usage

 * Ensure all wanted style is added in the proper compiled/ scss file and npm run build to get the final css file. Require that where you please.

# Rules

  * Avoid loosely identified general styling rules. If you think a style *may* be useful for other pages in the future, put it in a separate scss file, but keep it in the folder of the project you are working on. When the day comes that the file is effectively used elsewhere, it can be moved at that point

  * the ejs templating engine is used to build template pages for its partial feature. No other feature is used. So .ejs files are basically html files with occasional 'include' statements

  * scss files of each template import all the styles they need.

  * partial scss files start with an underscore

  * partials start with an underscore they often match a corresponding scss file.
