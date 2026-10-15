import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    incidentTitle: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    staffName: {
      type: String,
      default: '',
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedByName: {
      type: String,
      default: '',
    },
    instructions: {
      type: String,
      required: [true, 'Assignment instructions are required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'pending_verification', 'resolved', 'reopened'],
      default: 'assigned',
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    evidenceUrls: {
      type: [String],
      default: [],
    },
    completionNotes: {
      type: String,
      default: '',
    },
    completionTime: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedByName: {
      type: String,
      default: '',
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    verificationTime: {
      type: Date,
      default: null,
    },
    reopenReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

assignmentSchema.index({ createdAt: -1 });

export const Assignment = mongoose.model('Assignment', assignmentSchema);
