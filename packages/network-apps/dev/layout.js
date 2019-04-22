"use strict";

// generate page with layout
module.exports = ( content, data ) => {

  return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
          <div class="container margin-top-lg">
            ${content}
          </div>
        </body>
    </html>`

}
