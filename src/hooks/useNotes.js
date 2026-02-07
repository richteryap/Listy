import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export const useNotes = (filterType) => {
    const [user] = useAuthState(auth);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setNotes([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        let q = query(
            collection(db, "notes"),
            where("userId", "==", user.uid),
            orderBy("isPinned", "desc"),
            orderBy("createdAt", "desc")
        );

        if (filterType === 'trash') {
            q = query(q, where("isTrashed", "==", true), where("isArchived", "==", false));
        } else if (filterType === 'archive') {
            q = query(q, where("isArchived", "==", true), where("isTrashed", "==", false));
        } else {
            q = query(q, where("isTrashed", "==", false), where("isArchived", "==", false));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotes(notesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notes:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user, filterType]);

    return { notes, loading };
};