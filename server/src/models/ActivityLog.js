const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    actorType: { type: String, enum: ['admin', 'customer', 'system'], default: 'admin' },
    actorId: { type: mongoose.Schema.Types.ObjectId, default: null },
    actorName: { type: String, default: 'System' },
    action: { type: String, required: true },
    target: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
