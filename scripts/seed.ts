import 'dotenv/config';
import { seedDatabase } from '../lib/seed';

async function main() {
  try {
    console.log('🌱 Starting database seeding...');
    console.log('🔗 MongoDB URI:', process.env.MONGODB_URI);
    await seedDatabase();
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
