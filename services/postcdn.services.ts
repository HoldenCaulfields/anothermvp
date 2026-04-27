import { db } from "@/lib/firebase";
import { collection, doc, getDoc, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

export const checkUserLikedPost = async (postId: string, userId: string) => {
    if (!userId) return false;

    const likeRef = doc(db, 'posts', postId, 'likes', userId);
    const likeDoc = await getDoc(likeRef);

    return likeDoc.exists();
}

export const submitComment = (postId: string, callback: any) => {
    const q = query(
        collection(db, "posts", postId, "comments"),
        orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const comments = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        callback(comments);
    });

    return unsubscribe;
}

export const createComment = async (
    postId: string,
    userId: string,
    displayName: string,
    avatar: string,
    content: string
) => {
    await addDoc(collection(db, "posts", postId, "comments"), {
        userId,
        displayName,
        avatar,
        content,
        createdAt: serverTimestamp(),
    });
};