import { useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const useTrashCleanup = (userId) => {
    useEffect(() => {
        if (!userId) return;
        
        const cleanupTrash = async () => {
            try {
                const notesRef = collection(db, 'notes');
                const q = query(notesRef,
                    where("isTrashed", "==", true),
                    where("userId", "==", userId)
                );
                const snapshot = await getDocs(q);

                const now = new Date();
                const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

                snapshot.forEach(async (docSnapshot) => {
                    const note = docSnapshot.data();
                    
                    if (note.trashedAt) {
                        const trashedDate = note.trashedAt.toDate();
                        const timeDiff = now - trashedDate;

                        if (timeDiff > THIRTY_DAYS_IN_MS) {
                            await deleteDoc(doc(db, 'notes', docSnapshot.id));
                            console.log(`Auto-deleted expired note: ${docSnapshot.id}`);
                        }
                    }
                });
            } catch (error) {
                console.error("Error cleaning up trash:", error);
            }
        };

        cleanupTrash();
    }, []);
};