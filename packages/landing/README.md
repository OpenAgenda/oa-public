# Overview

Project to speed up configuration of corpo static pages

# Prepare a new page

Pages are listed in the pages folder and are described by json files. They have head and layout configuration followed by a list of segments.

To create a new page, simply create a new json file in the pages folder and define its keys ( internationalized url ), head ( title and description metas ), layout template and layout variables.

# Segments



# Templates

These are pug files in the templates folder. Any content description file ( segments or pages ) require templates; the page file needs a template for its layout, the segments need template to send their content to.