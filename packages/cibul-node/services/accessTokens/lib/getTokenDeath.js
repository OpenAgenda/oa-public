'use strict';

module.exports = ({
  created_at,
  lifespan
}) => new Date((new Date(created_at)).getTime() + lifespan * 1000)
