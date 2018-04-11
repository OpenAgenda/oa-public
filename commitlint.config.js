"use strict";

const Repository = require( 'lerna/lib/Repository' );
const PackageUtilities = require( 'lerna/lib/PackageUtilities' );


module.exports = {
  utils: { getPackages },
  rules: {
    'scope-enum': ctx => [ 2, 'always', getPackages( ctx ) ],
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 72],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case']
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test'
      ]
    ]
  }
};

function getPackages( /* context */ ) {
  // const ctx = context || {};
  // const cwd =  ctx.cwd || process.cwd();
  const cwd = __dirname;

  const repository = new Repository( cwd );
  const packages = PackageUtilities.getPackages( {
    packageConfigs: repository.packageConfigs,
    rootPath: cwd
  } );

  return packages
    .map( pkg => pkg.name )
    .map( name => (name.charAt( 0 ) === '@' ? name.split( '/' )[ 1 ] : name) );
}
