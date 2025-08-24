import mongoose from 'mongoose';

export interface ILineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: Date;
  issueDate: Date;
  lineItems: ILineItem[];
  notes?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const lineItemSchema = new mongoose.Schema<ILineItem>({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const invoiceSchema = new mongoose.Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lineItems: [lineItemSchema],
    notes: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// No duplicate indexes needed - Mongoose handles this automatically

// Pre-save middleware to calculate line item totals
invoiceSchema.pre('save', function(next) {
  if (this.lineItems && this.lineItems.length > 0) {
    this.lineItems.forEach(item => {
      item.total = item.quantity * item.unitPrice;
    });
  }
  next();
});

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', invoiceSchema);
