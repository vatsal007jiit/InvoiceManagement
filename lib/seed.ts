import dbConnect from './db';
import User from '@/models/User';
import Invoice from '@/models/Invoice';

export async function seedDatabase() {
  await dbConnect();

  try {
    // Clear existing data
    await User.deleteMany({});
    await Invoice.deleteMany({});

    console.log('Cleared existing data...');

    // Create demo users
    const adminUser = await User.create({
      email: 'admin@fintech.com',
      password: 'Pass@1234',
      name: 'Admin User',
      role: 'admin'
    });

    const accountantUser = await User.create({
      email: 'accountant@fintech.com',
      password: 'Pass@1234',
      name: 'Accountant User',
      role: 'accountant'
    });

    console.log('Created demo users...');

    // Create demo invoices for admin user
    const demoInvoices = [
      {
        invoiceNumber: 'INV-001-2025',
        clientName: 'Tech Solutions Inc.',
        clientEmail: 'billing@techsolutions.com',
        amount: 2500.00,
        currency: 'INR',
        status: 'paid',
        dueDate: new Date('2025-01-15'),
        issueDate: new Date('2025-01-01'),
        lineItems: [
          {
            description: 'Web Development Services',
            quantity: 40,
            unitPrice: 62.50,
            total: 2500.00
          }
        ],
        notes: 'Payment received on time',
        userId: adminUser._id
      },
      {
        invoiceNumber: 'INV-002-2025',
        clientName: 'Marketing Pro LLC',
        clientEmail: 'accounts@marketingpro.com',
        amount: 1800.00,
        currency: 'INR',
        status: 'pending',
        dueDate: new Date('2025-02-15'),
        issueDate: new Date('2025-01-15'),
        lineItems: [
          {
            description: 'Digital Marketing Campaign',
            quantity: 1,
            unitPrice: 1800.00,
            total: 1800.00
          }
        ],
        notes: 'Campaign completed successfully',
        userId: adminUser._id
      },
      {
        invoiceNumber: 'INV-003-2025',
        clientName: 'Global Consulting Group',
        clientEmail: 'finance@globalconsulting.com',
        amount: 5000.00,
        currency: 'INR',
        status: 'overdue',
        dueDate: new Date('2025-01-10'),
        issueDate: new Date('2025-01-01'),
        lineItems: [
          {
            description: 'Strategic Consulting Services',
            quantity: 50,
            unitPrice: 100.00,
            total: 5000.00
          }
        ],
        notes: 'Follow up required',
        userId: adminUser._id
      },
      {
        invoiceNumber: 'INV-004-2025',
        clientName: 'Startup Ventures',
        clientEmail: 'billing@startupventures.com',
        amount: 3200.00,
        currency: 'INR',
        status: 'paid',
        dueDate: new Date('2025-02-01'),
        issueDate: new Date('2025-01-20'),
        lineItems: [
          {
            description: 'Mobile App Development',
            quantity: 1,
            unitPrice: 3200.00,
            total: 3200.00
          }
        ],
        notes: 'Project delivered on time',
        userId: adminUser._id
      },
      {
        invoiceNumber: 'INV-005-2025',
        clientName: 'E-commerce Solutions',
        clientEmail: 'accounts@ecommercesolutions.com',
        amount: 4200.00,
        currency: 'INR',
        status: 'pending',
        dueDate: new Date('2025-03-01'),
        issueDate: new Date('2025-02-01'),
        lineItems: [
          {
            description: 'E-commerce Platform Development',
            quantity: 1,
            unitPrice: 4200.00,
            total: 4200.00
          }
        ],
        notes: 'Platform under development',
        userId: adminUser._id
      },
      {
        invoiceNumber: 'INV-006-2025',
        clientName: 'Data Analytics Corp',
        clientEmail: 'billing@dataanalytics.com',
        amount: 2800.00,
        currency: 'INR',
        status: 'overdue',
        dueDate: new Date('2025-01-20'),
        issueDate: new Date('2025-01-05'),
        lineItems: [
          {
            description: 'Data Analysis Services',
            quantity: 35,
            unitPrice: 80.00,
            total: 2800.00
          }
        ],
        notes: 'Payment overdue',
        userId: adminUser._id
      },
      {
        invoiceNumber: 'INV-007-2025',
        clientName: 'Cloud Infrastructure Ltd',
        clientEmail: 'finance@cloudinfra.com',
        amount: 6500.00,
        currency: 'INR',
        status: 'paid',
        dueDate: new Date('2025-02-10'),
        issueDate: new Date('2025-01-25'),
        lineItems: [
          {
            description: 'Cloud Infrastructure Setup',
            quantity: 1,
            unitPrice: 6500.00,
            total: 6500.00
          }
        ],
        notes: 'Infrastructure deployed successfully',
        userId: adminUser._id
      },
      {
        invoiceNumber: 'INV-008-2025',
        clientName: 'AI Research Institute',
        clientEmail: 'billing@airesearch.com',
        amount: 7500.00,
        currency: 'INR',
        status: 'pending',
        dueDate: new Date('2025-03-15'),
        issueDate: new Date('2025-02-05'),
        lineItems: [
          {
            description: 'AI Model Development',
            quantity: 1,
            unitPrice: 7500.00,
            total: 7500.00
          }
        ],
        notes: 'Research in progress',
        userId: adminUser._id
      },
      {
        invoiceNumber: 'INV-009-2025',
        clientName: 'Cybersecurity Solutions',
        clientEmail: 'accounts@cybersecurity.com',
        amount: 5500.00,
        currency: 'INR',
        status: 'pending',
        dueDate: new Date('2025-03-01'),
        issueDate: new Date('2025-02-10'),
        lineItems: [
          {
            description: 'Cybersecurity Audit',
            quantity: 1,
            unitPrice: 5500.00,
            total: 5500.00
          }
        ],
        notes: 'Security assessment in progress',
        userId: adminUser._id
      },
      {
        invoiceNumber: 'INV-010-2025',
        clientName: 'AI Development Studio',
        clientEmail: 'billing@aidevstudio.com',
        amount: 8900.00,
        currency: 'INR',
        status: 'pending',
        dueDate: new Date('2025-04-15'),
        issueDate: new Date('2025-02-15'),
        lineItems: [
          {
            description: 'Machine Learning Model Development',
            quantity: 1,
            unitPrice: 8900.00,
            total: 8900.00
          }
        ],
        notes: 'AI model training phase',
        userId: adminUser._id
      }
    ];

    await Invoice.insertMany(demoInvoices);

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Created ${demoInvoices.length} demo invoices`);
    console.log('👥 Demo users:');
    console.log('   - admin@fintech.com (password: Pass@1234)');
    console.log('   - accountant@fintech.com (password: Pass@1234)');
    console.log('\n🎉 You can now login and test the application!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}
