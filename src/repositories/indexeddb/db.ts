import { APP_CONFIG } from '@/config/constants';

const DB_NAME = APP_CONFIG.DB_NAME;
const DB_VERSION = APP_CONFIG.DB_VERSION;

export const STORES = {
  SUBJECTS: 'subjects',
  NOTES: 'notes',
  FILES: 'files',
  USERS: 'users',
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

export class StorageError extends Error {
  constructor(message: string, public readonly code: 'QUOTA_EXCEEDED' | 'UNAVAILABLE' | 'TRANSACTION_FAILED' | 'CORRUPTED') {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Initializes and returns the IndexedDB database instance.
 */
export async function getDatabase(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new StorageError(
      'IndexedDB is not supported or is disabled in your browser.',
      'UNAVAILABLE'
    );
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store: subjects
        if (!db.objectStoreNames.contains(STORES.SUBJECTS)) {
          const subjectStore = db.createObjectStore(STORES.SUBJECTS, { keyPath: 'id' });
          subjectStore.createIndex('userId', 'userId', { unique: false });
          subjectStore.createIndex('name', 'name', { unique: false });
        }

        // Store: notes
        if (!db.objectStoreNames.contains(STORES.NOTES)) {
          const noteStore = db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
          noteStore.createIndex('userId', 'userId', { unique: false });
          noteStore.createIndex('subjectId', 'subjectId', { unique: false });
          noteStore.createIndex('userId_subjectId', ['userId', 'subjectId'], { unique: false });
          noteStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Store: files (stores binary PDF Blobs)
        if (!db.objectStoreNames.contains(STORES.FILES)) {
          const fileStore = db.createObjectStore(STORES.FILES, { keyPath: 'id' });
          fileStore.createIndex('userId', 'userId', { unique: false });
        }

        // Store: users (for demo auth state)
        if (!db.objectStoreNames.contains(STORES.USERS)) {
          const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        dbPromise = null;
        reject(
          new StorageError(
            'Failed to open NoteNest local database. Browser storage may be blocked in private mode.',
            'UNAVAILABLE'
          )
        );
      };

      request.onblocked = () => {
        dbPromise = null;
        reject(
          new StorageError(
            'Database upgrade blocked. Please close other open NoteNest tabs and refresh.',
            'TRANSACTION_FAILED'
          )
        );
      };
    } catch (err) {
      dbPromise = null;
      reject(
        new StorageError(
          `Storage initialization error: ${err instanceof Error ? err.message : 'Unknown'}`,
          'UNAVAILABLE'
        )
      );
    }
  });

  return dbPromise;
}

/**
 * Safely executes a transaction with standardized error mapping.
 */
export async function withTransaction<T>(
  storeNames: (keyof typeof STORES | string)[],
  mode: IDBTransactionMode,
  operation: (transaction: IDBTransaction) => Promise<T>
): Promise<T> {
  const db = await getDatabase();

  return new Promise<T>((resolve, reject) => {
    try {
      const tx = db.transaction(storeNames, mode);

      let operationResult: T;
      let hasError = false;

      tx.oncomplete = () => {
        if (!hasError) {
          resolve(operationResult);
        }
      };

      tx.onerror = () => {
        hasError = true;
        const error = tx.error;
        if (error && error.name === 'QuotaExceededError') {
          reject(
            new StorageError(
              'Your browser does not have enough available storage to save this PDF note.',
              'QUOTA_EXCEEDED'
            )
          );
        } else {
          reject(
            new StorageError(
              `Storage operation failed: ${error ? error.message : 'Unknown transaction error'}`,
              'TRANSACTION_FAILED'
            )
          );
        }
      };

      tx.onabort = () => {
        if (!hasError) {
          reject(new StorageError('Storage transaction was aborted.', 'TRANSACTION_FAILED'));
        }
      };

      operation(tx)
        .then((result) => {
          operationResult = result;
        })
        .catch((err) => {
          hasError = true;
          try {
            tx.abort();
          } catch {
            // Ignore abort errors
          }
          reject(err);
        });
    } catch (err) {
      reject(
        new StorageError(
          `Failed to initiate storage transaction: ${err instanceof Error ? err.message : 'Unknown'}`,
          'TRANSACTION_FAILED'
        )
      );
    }
  });
}
