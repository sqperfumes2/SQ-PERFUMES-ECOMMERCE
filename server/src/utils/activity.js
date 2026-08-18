const ActivityLog = require('../models/ActivityLog');

async function logActivity({ actorType, actorId, actorName, action, target, meta = {} }) {
  try {
    await ActivityLog.create({
      actorType,
      actorId,
      actorName,
      action,
      target,
      meta,
    });
  } catch (error) {
    console.error('Failed to write activity log:', error.message);
  }
}

module.exports = { logActivity };
