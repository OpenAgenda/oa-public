"use strict";

// generate page with layout
module.exports = ( content, data ) => {

  return `<!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
          <div class="container">
            <div class="row">
              <div class="col-sm-offset-2 col-sm-8 margin-top-lg wsq padding-all-md">
                ${content}
              </div>
            </div>
          </div>
        </body>
    </html>`

}
