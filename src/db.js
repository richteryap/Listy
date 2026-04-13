import Dexie from 'dexie';

// Initialize the database
export const db = new Dexie('ListyLocalDB');

// Define the store (table) and its schema
db.version(1).stores({
  notes: 'id, user_id, title, isTrashed, isArchived, isPinned' 
});