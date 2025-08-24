import Invoice, { IInvoice } from '@/models/Invoice';
import dbConnect from '@/lib/db';
import { generateInvoiceNumber, calculateInvoiceStatus } from '@/lib/utils';

export const getInvoices = async (
  userId: string,
  page: number = 1,
  limit: number = 5
): Promise<{
  invoices: any[];
  total: number;
  totalPages: number;
}> => {
  await dbConnect();
  
  const skip = (page - 1) * limit;
  
  const [invoices, total] = await Promise.all([
    Invoice.find({ userId })
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .lean(),
    Invoice.countDocuments({ userId })
  ]);

  return {
    invoices,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

export const getInvoiceById = async (id: string, userId: string): Promise<any | null> => {
  await dbConnect();
  return await Invoice.findOne({ _id: id, userId }).lean();
};

export const createInvoice = async (invoiceData: {
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  dueDate: Date;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
  userId: string;
}): Promise<IInvoice> => {
  await dbConnect();
  
  const invoice = new Invoice({
    ...invoiceData,
    invoiceNumber: generateInvoiceNumber(),
    status: calculateInvoiceStatus(invoiceData.dueDate.toISOString()),
    issueDate: new Date(),
  });

  return await invoice.save();
};

export const updateInvoiceStatus = async (
  id: string,
  userId: string,
  status: 'paid' | 'pending' | 'overdue'
): Promise<any | null> => {
  await dbConnect();
  
  return await Invoice.findOneAndUpdate(
    { _id: id, userId },
    { status, updatedAt: new Date() },
    { new: true }
  ).lean();
};

export const deleteInvoice = async (id: string, userId: string): Promise<boolean> => {
  await dbConnect();
  
  const result = await Invoice.deleteOne({ _id: id, userId });
  return result.deletedCount > 0;
};
