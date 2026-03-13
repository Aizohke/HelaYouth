import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be at least 1'],
    },
    currency: {
      type: String,
      default: 'KES',
      enum: ['KES', 'USD', 'UGX', 'TZS'],
    },
    type: {
      type: String,
      enum: ['monthly', 'special', 'fine', 'registration'],
      default: 'monthly',
    },
    description: { type: String, trim: true, maxlength: 200 },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contributionDate: {
      type: Date,
      default: Date.now,
    },
    receiptNumber: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// Auto-generate receipt number before save
contributionSchema.pre('save', async function (next) {
  if (!this.receiptNumber) {
    const count = await mongoose.model('Contribution').countDocuments();
    this.receiptNumber = `HELA-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

const Contribution = mongoose.model('Contribution', contributionSchema);
export default Contribution;
