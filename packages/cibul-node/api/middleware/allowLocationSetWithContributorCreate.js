import { NotAuthenticated } from '@openagenda/verror';

// Custom middleware for location set operations with contributor create permissions
export default (core) => async (req, res, next) => {
  const { members } = req.app.services;

  if (!req.user) {
    return next(new NotAuthenticated('User is not authenticated'));
  }

  // Load member information
  req.member = await members.get({
    agendaUid: req.agenda.uid,
    userUid: req.user.uid,
  });

  if (!req.member) {
    return res.status(403).json({
      error: 'Not authorized for non-members',
    });
  }

  req.access = members.utils.getRoleSlug(req.member.role);

  // Check if location exists using the same logic as set.js
  const { agendaLocations } = core.services;
  const { agenda } = req;

  if (!req.locationIdentifier?.extId) {
    return res.status(400).json({
      error: 'extId identifier is required for set operation',
    });
  }

  const endpoints = agenda.locationSetUid
    ? agendaLocations.sets(agenda.locationSetUid).locations
    : agendaLocations(agenda.uid);

  let location;
  try {
    location = await endpoints.get(req.locationIdentifier, {
      throwOnNotFound: false,
      context: { agendaUid: agenda.uid },
    });
  } catch (error) {
    // If there's an error getting the location, assume it doesn't exist
    location = null;
  }

  // Apply conditional permissions based on create vs update
  if (!location) {
    // CREATE operation - allow contributor, moderator, administrator
    if (['contributor', 'moderator', 'administrator'].includes(req.access)) {
      return next();
    }
  } else if (['moderator', 'administrator'].includes(req.access)) {
    // UPDATE operation - only allow moderator, administrator
    return next();
  }

  // Deny access
  return res.status(403).json({
    error: 'user is not authorized to perform this operation',
    agendaUid: req.params.agendaUid,
    operation: location ? 'update' : 'create',
    userRole: req.access,
  });
};
