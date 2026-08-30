import { User } from '@/types/auth';
import { IAuthRepository } from '@/types/repository';

const ACTIVE_USER_KEY = 'notenest_active_user';
const USERS_LIST_KEY = 'notenest_users_list';

export class LocalDemoAuthRepository implements IAuthRepository {
  async getCurrentUser(): Promise<User | null> {
    try {
      const raw = localStorage.getItem(ACTIVE_USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  async saveCurrentUser(user: User | null): Promise<void> {
    try {
      if (user) {
        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(ACTIVE_USER_KEY);
      }
    } catch {
      // Ignore localStorage errors in edge environments
    }
  }

  async listUsers(): Promise<User[]> {
    try {
      const raw = localStorage.getItem(USERS_LIST_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as User[];
    } catch {
      return [];
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      const users = await this.listUsers();
      const existingIdx = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
      if (existingIdx >= 0) {
        users[existingIdx] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
    } catch {
      // Ignore localStorage errors
    }
  }
}
