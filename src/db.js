import Dexie from 'dexie';

// Initialize the database
export const db = new Dexie('ListyLocalDB');

// Define the store (table) and its schema
db.version(2).stores({
  notes: 'id, user_id, sync_status, title, isTrashed, isArchived, isPinned'
});