import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { OrderRecord } from '../types';

export async function createOrderInFirestore(order: OrderRecord): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeUserOrders(
  userId: string,
  onUpdate: (orders: OrderRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const collectionPath = 'orders';
  const q = query(collection(db, collectionPath), where('userId', '==', userId));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const orders: OrderRecord[] = [];
      snapshot.forEach((docSnap) => {
        orders.push(docSnap.data() as OrderRecord);
      });
      // Sort newest first
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(orders);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );

  return unsubscribe;
}

export function subscribeAllOrdersForAdmin(
  onUpdate: (orders: OrderRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const collectionPath = 'orders';
  const q = query(collection(db, collectionPath));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const orders: OrderRecord[] = [];
      snapshot.forEach((docSnap) => {
        orders.push(docSnap.data() as OrderRecord);
      });
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(orders);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );

  return unsubscribe;
}

export async function updateOrderStatusInFirestore(
  orderId: string, 
  status: OrderRecord['status']
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
