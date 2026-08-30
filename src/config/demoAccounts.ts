import { DemoAccount } from '@/types/auth';

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    id: 'user_thejas_demo',
    name: 'Thejas',
    email: 'thejas.student@university.edu',
    role: 'Computer Science Major',
    avatarColor: 'sage',
  },
  {
    id: 'user_alex_demo',
    name: 'Alex Rivera',
    email: 'alex.rivera@university.edu',
    role: 'Electrical Engineering Major',
    avatarColor: 'blue',
  },
] as const;

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
