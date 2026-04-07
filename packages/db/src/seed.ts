// Nilam domain seed data — populated during product implementation
// Run with: pnpm db:seed
export {};

async function main() {
  console.log('🌱 Seeding database...');
  // Domain seed data will be added during implementation phases
  console.log('✅ Seed complete (no data to seed yet)');
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
