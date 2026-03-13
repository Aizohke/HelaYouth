import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 1000 },
    targetAmount: { type: Number, required: true, min: 0 },
    raisedAmount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'KES' },
    status: {
      type: String,
      enum: ['planning', 'ongoing', 'completed', 'paused'],
      default: 'planning',
    },
    startDate: { type: Date },
    endDate: { type: Date },
    coverImage: { type: String },
    category: {
      type: String,
      enum: ['investment', 'welfare', 'education', 'community', 'other'],
      default: 'other',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublic: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

projectSchema.virtual('progressPercentage').get(function () {
  if (!this.targetAmount || this.targetAmount === 0) return 0;
  return Math.min(Math.round((this.raisedAmount / this.targetAmount) * 100), 100);
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
