module.exports = function hasHelp(field) {
  return field.help || field.helpLink || field.helpContent;
};
