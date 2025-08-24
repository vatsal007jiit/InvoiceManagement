import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/server-utils';
import { getInvoiceById } from '@/controllers/invoiceController';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if the userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(user.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Check if the invoice id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid invoice ID' },
        { status: 400 }
      );
    }

    const invoice = await getInvoiceById(id, user.id);
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Mock PDF generation 
    const pdfContent = `
      INVOICE ${invoice.invoiceNumber}
      
      Client: ${invoice.clientName}
      Email: ${invoice.clientEmail}
      Issue Date: ${invoice.issueDate.toLocaleDateString()}
      Due Date: ${invoice.dueDate.toLocaleDateString()}
      Status: ${invoice.status.toUpperCase()}
      
      Line Items:
      ${invoice.lineItems.map((item: { description: string; quantity: number; unitPrice: number; total: number }) => 
        `${item.description} - Qty: ${item.quantity} - Price: ₹${item.unitPrice} - Total: ₹${item.total}`
      ).join('\n')}
      
      Total Amount: ₹${invoice.amount}
      Currency: INR
      
      ${invoice.notes ? `Notes: ${invoice.notes}` : ''}
    `;

    // Return mock PDF content as text
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.txt"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
