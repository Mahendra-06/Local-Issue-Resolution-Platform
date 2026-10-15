import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    actorName: {
      type: String,
      default: 'System',
    },
    actorRole: {
      type: String,
      default: 'system',
    },
    notes: {
      type: String,
      default: '',
    },
    evidenceUrls: {
      type: [String],
      default: [],
    },
  },
  { _id: true }
);

const incidentSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Incident description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    categoryId: {
      type: String,
      required: [true, 'Category identifier is required'],
      index: true,
    },
    category: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'reported',
        'under_review',
        'assigned',
        'in_progress',
        'pending_verification',
        'resolved',
        'rejected',
        'reopened',
        'overdue',
      ],
      default: 'reported',
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Street address or location is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    photoUrl: {
      type: String,
      default: null,
    },
    photos: {
      type: [String],
      default: [],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reporterName: {
      type: String,
      default: '',
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true,
    },
    departmentName: {
      type: String,
      default: '',
    },
    assignedStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedStaffName: {
      type: String,
      default: '',
    },
    currentAssignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    timeline: [timelineEventSchema],
    resolvedAt: {
      type: Date,
      default: null,
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

incidentSchema.index({ location: '2dsphere' });
incidentSchema.index({ createdAt: -1 });

export const Incident = mongoose.model('Incident', incidentSchema);
