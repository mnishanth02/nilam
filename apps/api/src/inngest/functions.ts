import { inngest } from './client.js';

async function runScheduledJobStub(message: string) {
  console.log(message);
}

// Monthly charge generation — runs daily at 12:05am
export const generateMonthlyCharges = inngest.createFunction(
  { id: 'generate-monthly-charges', name: 'Generate Monthly Charges' },
  { cron: '5 0 * * *' },
  async ({ step }) => {
    // TODO: Call charge.service.generateMonthlyCharges()
    await step.run('generate-charges', () =>
      runScheduledJobStub('[inngest] Monthly charge generation — not yet implemented'),
    );
  },
);

// Lease expiry notifications — runs daily at 8am
export const notifyLeaseExpiry = inngest.createFunction(
  { id: 'notify-lease-expiry', name: 'Lease Expiry Notifications' },
  { cron: '0 8 * * *' },
  async ({ step }) => {
    // TODO: Call notification.service.checkLeaseExpiry()
    await step.run('check-lease-expiry', () =>
      runScheduledJobStub('[inngest] Lease expiry check — not yet implemented'),
    );
  },
);

// Rent overdue notifications — runs daily at 9am
export const notifyRentOverdue = inngest.createFunction(
  { id: 'notify-rent-overdue', name: 'Rent Overdue Notifications' },
  { cron: '0 9 * * *' },
  async ({ step }) => {
    // TODO: Call notification.service.checkRentOverdue()
    await step.run('check-rent-overdue', () =>
      runScheduledJobStub('[inngest] Rent overdue check — not yet implemented'),
    );
  },
);

// EC expiry reminders — runs daily at 8:05am
export const remindEcExpiry = inngest.createFunction(
  { id: 'remind-ec-expiry', name: 'EC Expiry Reminders' },
  { cron: '5 8 * * *' },
  async ({ step }) => {
    // TODO: Call notification.service.checkEcExpiry()
    await step.run('check-ec-expiry', () =>
      runScheduledJobStub('[inngest] EC expiry reminder — not yet implemented'),
    );
  },
);

// Property tax reminders — runs daily at 8:10am
export const remindPropertyTax = inngest.createFunction(
  { id: 'remind-property-tax', name: 'Property Tax Reminders' },
  { cron: '10 8 * * *' },
  async ({ step }) => {
    // TODO: Call notification.service.checkPropertyTaxDue()
    await step.run('check-property-tax', () =>
      runScheduledJobStub('[inngest] Property tax reminder — not yet implemented'),
    );
  },
);

// Document expiry reminders — runs daily at 8:15am
export const remindDocumentExpiry = inngest.createFunction(
  { id: 'remind-document-expiry', name: 'Document Expiry Reminders' },
  { cron: '15 8 * * *' },
  async ({ step }) => {
    // TODO: Call notification.service.checkDocumentExpiry()
    await step.run('check-document-expiry', () =>
      runScheduledJobStub('[inngest] Document expiry reminder — not yet implemented'),
    );
  },
);

// Orphaned file cleanup — runs daily at 2am
export const cleanupOrphanedFiles = inngest.createFunction(
  { id: 'cleanup-orphaned-files', name: 'Orphaned File Cleanup' },
  { cron: '0 2 * * *' },
  async ({ step }) => {
    // TODO: Call document.service.cleanupOrphanedFiles()
    await step.run('cleanup-files', () =>
      runScheduledJobStub('[inngest] Orphaned file cleanup — not yet implemented'),
    );
  },
);

export const allFunctions = [
  generateMonthlyCharges,
  notifyLeaseExpiry,
  notifyRentOverdue,
  remindEcExpiry,
  remindPropertyTax,
  remindDocumentExpiry,
  cleanupOrphanedFiles,
];
