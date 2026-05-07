// Single source of truth for approved-tester emails.
// Anyone NOT in this list is routed to the waitlist instead of getting an account.

export const ADMIN_EMAILS = [
  'kunaivlogsdaily@gmail.com',
  // add more approved testers here
];

export const isAdminEmail = (email: string | null | undefined): boolean =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase().trim());
