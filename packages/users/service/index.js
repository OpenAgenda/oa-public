"use strict";

const { init } = require( '../config' );
const validators = require( './lib/validators' );
const list = require( './list' );
const get = require( './get' );
const set = require( './set' );
const update = require( './update' );
const updateProfile = require( './updateProfile' );
const changePassword = require( './changePassword' );
const verifyPassword = require( './verifyPassword' );
const requestChangeEmail = require( './requestChangeEmail' );
const confirmChangeEmail = require( './confirmChangeEmail' );
const generateApiKey = require( './generateApiKey' );
const remove = require( './remove' );
const setNewFlag = require( './setNewFlag' );


module.exports = {
  init,
  validators,
  list,
  get,
  set,
  update,
  updateProfile,
  changePassword,
  verifyPassword,
  requestChangeEmail,
  confirmChangeEmail,
  generateApiKey,
  remove,
  setNewFlag
};
