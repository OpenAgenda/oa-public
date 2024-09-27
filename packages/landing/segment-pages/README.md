#Overview

Makes a features page renderer capable of rendering several versions of the same features page, variating according to pre-defined themes. A theme is what the user is looking for when has clicked on a features page link; The features renderer can shift the description of a given feature to best fit that theme.

# Creating the renderer

Two main objects are needed for this library to create a generator: first a full list of features with their associated template names and variables and second a list of themes with for each theme the features to be displayed with eventual variations to be applied over the base feature definition.

Here is a little illustration:

const features = require( 'features' );

// generate the renderer
let renderer = features( {
templates: {
'basic': fs.readFileSync( \_\_dirname + '/basic.pug', 'utf-8' )
},
features: [ {
key: 'agenda-contribution',
template: 'basic',
illustration: 'https://image.path.jpg',
title: 'Customize the contribution rules of your agenda'
} ]
themes: [ {
key: 'configuration',
features: [ 'agenda-contribution', 'iframe' ]
} ]
} );

// use it by providing the theme to render
let renderedTheme = renderer( 'configuration' );
