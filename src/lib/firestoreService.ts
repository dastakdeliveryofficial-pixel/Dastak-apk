import { 
  db, 
  auth, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  FirebaseUser
} from './firebase';
import { 
  User, 
  Restaurant, 
  MenuItem, 
  Order, 
  Rider, 
  Category, 
  BannerPromo, 
  PlatformSettings,
  OrderStatus,
  Address,
  UserRole,
  FirestoreNotification
} from '../types';
import { 
  INITIAL_RESTAURANTS, 
  INITIAL_MENU_ITEMS, 
  INITIAL_ORDERS, 
  INITIAL_RIDERS, 
  CATEGORIES, 
  BANNER_PROMOS, 
  INITIAL_SETTINGS 
} from '../data/mockData';

// Collection References
const USERS_COLLECTION = 'users';
const RESTAURANTS_COLLECTION = 'restaurants';
const MENU_ITEMS_COLLECTION = 'menuItems';
const ORDERS_COLLECTION = 'orders';
const RIDERS_COLLECTION = 'riders';
const SETTINGS_COLLECTION = 'settings';
const PROMOS_COLLECTION = 'promos';
const CATEGORIES_COLLECTION = 'categories';
const NOTIFICATIONS_COLLECTION = 'notifications';

// 1. Initial Seed to Firestore if database is empty
export async function seedInitialFirestoreData() {
  try {
    const settingsDoc = await getDoc(doc(db, SETTINGS_COLLECTION, 'main_config'));
    if (!settingsDoc.exists()) {
      console.log('Seeding initial platform settings...');
      await setDoc(doc(db, SETTINGS_COLLECTION, 'main_config'), INITIAL_SETTINGS);

      console.log('Seeding initial categories...');
      for (const c of CATEGORIES) {
        await setDoc(doc(db, CATEGORIES_COLLECTION, c.id), c);
      }

      console.log('Seeding promos...');
      for (const p of BANNER_PROMOS) {
        await setDoc(doc(db, PROMOS_COLLECTION, p.id), p);
      }
    }

    // Check if restaurants are seeded
    const restSnap = await getDocs(collection(db, RESTAURANTS_COLLECTION));
    if (restSnap.empty && INITIAL_RESTAURANTS.length > 0) {
      console.log('Seeding Dastak restaurants & catalog to Firestore...');
      for (const r of INITIAL_RESTAURANTS) {
        await setDoc(doc(db, RESTAURANTS_COLLECTION, r.id), r);
      }
      for (const m of INITIAL_MENU_ITEMS) {
        await setDoc(doc(db, MENU_ITEMS_COLLECTION, m.id), m);
      }
    }
  } catch (err) {
    console.error('Firestore seeding note:', err);
  }
}

// Clear all restaurants and menu items from Firestore for fresh start
export async function clearAllRestaurantsAndMenuFromFirestore() {
  try {
    const restSnap = await getDocs(collection(db, RESTAURANTS_COLLECTION));
    for (const docSnap of restSnap.docs) {
      await deleteDoc(doc(db, RESTAURANTS_COLLECTION, docSnap.id));
    }
    const menuSnap = await getDocs(collection(db, MENU_ITEMS_COLLECTION));
    for (const docSnap of menuSnap.docs) {
      await deleteDoc(doc(db, MENU_ITEMS_COLLECTION, docSnap.id));
    }
    console.log('Successfully cleared all restaurants and menu items from Firestore');
  } catch (err) {
    console.error('Error clearing restaurants from Firestore:', err);
  }
}

// 2. Authentication Methods
export async function registerFirebaseUser(
  email: string, 
  pass: string, 
  userData: {
    name: string;
    phone: string;
    role: UserRole;
    addresses?: Address[];
    restaurantId?: string;
    riderId?: string;
  }
): Promise<{ user: User; firebaseUser: FirebaseUser | null }> {
  const cleanEmail = email.trim().toLowerCase();
  let uid = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  let firebaseUser: FirebaseUser | null = null;

  try {
    const credential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    uid = credential.user.uid;
    firebaseUser = credential.user;
  } catch (err: any) {
    console.warn('Firebase Auth registration fallback:', err?.message || err);
  }

  const newUserDoc: User = {
    id: uid,
    name: userData.name.trim(),
    email: cleanEmail,
    phone: userData.phone.trim(),
    role: userData.role,
    addresses: userData.addresses || [],
    isBlocked: false,
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, USERS_COLLECTION, uid), newUserDoc);
  } catch (dbErr) {
    console.warn('Firestore user save note:', dbErr);
  }

  return { user: newUserDoc, firebaseUser };
}

export async function loginFirebaseUser(email: string, pass: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  let uid = '';

  try {
    const credential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    uid = credential.user.uid;
  } catch (err: any) {
    console.warn('Firebase Auth login fallback:', err?.message || err);
  }

  if (uid) {
    try {
      const userDocRef = doc(db, USERS_COLLECTION, uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return userDocSnap.data() as User;
      }
    } catch (e) {}
  }

  // Lookup in Firestore by email or phone
  try {
    const qEmail = query(collection(db, USERS_COLLECTION), where('email', '==', cleanEmail));
    const snap = await getDocs(qEmail);
    if (!snap.empty) {
      return snap.docs[0].data() as User;
    }
  } catch (e) {}

  // Fallback user profile creation
  const fallbackUid = uid || ('usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
  const fallbackUser: User = {
    id: fallbackUid,
    name: cleanEmail.split('@')[0],
    email: cleanEmail,
    phone: '0300-1234567',
    role: (cleanEmail.includes('admin') ? 'admin' : cleanEmail.includes('vendor') ? 'vendor' : cleanEmail.includes('rider') ? 'rider' : 'customer') as UserRole,
    addresses: [],
    isBlocked: false,
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, USERS_COLLECTION, fallbackUid), fallbackUser);
  } catch (e) {}

  return fallbackUser;
}

export async function resetFirebasePassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

export async function logoutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
}

// 3. Realtime Orders Listeners & Actions
export function subscribeToOrders(onUpdate: (orders: Order[]) => void) {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q, 
    (snapshot) => {
      const ordersList: Order[] = [];
      snapshot.forEach((docSnap) => {
        ordersList.push({ ...(docSnap.data() as Order), id: docSnap.id });
      });
      onUpdate(ordersList);
    }, 
    (err) => {
      handleFirestoreError(err, OperationType.LIST, ORDERS_COLLECTION);
    }
  );
}

export async function createFirestoreOrder(orderData: Omit<Order, 'id'>): Promise<Order> {
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return {
      ...orderData,
      id: docRef.id
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, ORDERS_COLLECTION);
    throw err;
  }
}

export async function updateFirestoreOrderStatus(
  orderId: string, 
  status: OrderStatus, 
  riderId?: string, 
  riderName?: string, 
  riderPhone?: string,
  cancelReason?: string
) {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const updates: Partial<Order> = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (riderId) updates.riderId = riderId;
    if (riderName) updates.riderName = riderName;
    if (riderPhone) updates.riderPhone = riderPhone;
    if (cancelReason) updates.cancelReason = cancelReason;

    await updateDoc(orderRef, updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
    throw err;
  }
}

// 4. Realtime Restaurants, Menu, & Riders
export function subscribeToRestaurants(onUpdate: (restaurants: Restaurant[]) => void) {
  return onSnapshot(
    collection(db, RESTAURANTS_COLLECTION), 
    (snapshot) => {
      const list: Restaurant[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as Restaurant), id: docSnap.id });
      });
      onUpdate(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, RESTAURANTS_COLLECTION);
    }
  );
}

export function subscribeToMenuItems(onUpdate: (items: MenuItem[]) => void) {
  return onSnapshot(
    collection(db, MENU_ITEMS_COLLECTION), 
    (snapshot) => {
      const list: MenuItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as MenuItem), id: docSnap.id });
      });
      onUpdate(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, MENU_ITEMS_COLLECTION);
    }
  );
}

export function subscribeToRiders(onUpdate: (riders: Rider[]) => void) {
  return onSnapshot(
    collection(db, RIDERS_COLLECTION), 
    (snapshot) => {
      const list: Rider[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as Rider), id: docSnap.id });
      });
      onUpdate(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, RIDERS_COLLECTION);
    }
  );
}

export function subscribeToUsers(onUpdate: (users: User[]) => void) {
  return onSnapshot(
    collection(db, USERS_COLLECTION), 
    (snapshot) => {
      const list: User[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as User), id: docSnap.id });
      });
      onUpdate(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, USERS_COLLECTION);
    }
  );
}

// 5. Real-time Notifications Collection (for Admin & Rider live alerts)
export async function createFirestoreNotification(data: {
  orderId: string;
  orderNumber?: string;
  customerName: string;
  customerPhone?: string;
  restaurantName?: string;
  items: string;
  total?: number;
  time?: string;
  createdAt?: string;
  read?: boolean;
  targetRole?: 'admin' | 'rider' | 'vendor' | 'customer' | 'all';
}): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      orderId: data.orderId,
      orderNumber: data.orderNumber || '',
      customerName: data.customerName || 'Customer',
      customerPhone: data.customerPhone || '',
      restaurantName: data.restaurantName || '',
      items: data.items || '',
      total: data.total || 0,
      time: data.time || new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
      createdAt: data.createdAt || new Date().toISOString(),
      read: false,
      targetRole: data.targetRole || 'admin'
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, NOTIFICATIONS_COLLECTION);
    throw err;
  }
}

export function subscribeToNotifications(
  onUpdate: (notifications: FirestoreNotification[]) => void,
  onNewDoc?: (notification: FirestoreNotification) => void
) {
  let isInitialSnapshot = true;
  return onSnapshot(
    collection(db, NOTIFICATIONS_COLLECTION),
    (snapshot) => {
      const list: FirestoreNotification[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          orderId: d.orderId || '',
          orderNumber: d.orderNumber,
          customerName: d.customerName || 'Customer',
          customerPhone: d.customerPhone,
          restaurantName: d.restaurantName,
          items: d.items || '',
          total: d.total,
          time: d.time || '',
          createdAt: d.createdAt || '',
          read: !!d.read,
          targetRole: d.targetRole || 'admin'
        });
      });

      // Sort newest first
      list.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime() || 0;
        const timeB = new Date(b.createdAt).getTime() || 0;
        return timeB - timeA;
      });

      // Check for freshly added notifications after initial load
      if (!isInitialSnapshot && onNewDoc) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const d = change.doc.data();
            const newNotif: FirestoreNotification = {
              id: change.doc.id,
              orderId: d.orderId || '',
              orderNumber: d.orderNumber,
              customerName: d.customerName || 'Customer',
              customerPhone: d.customerPhone,
              restaurantName: d.restaurantName,
              items: d.items || '',
              total: d.total,
              time: d.time || '',
              createdAt: d.createdAt || '',
              read: !!d.read,
              targetRole: d.targetRole || 'admin'
            };
            onNewDoc(newNotif);
          }
        });
      }

      isInitialSnapshot = false;
      onUpdate(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, NOTIFICATIONS_COLLECTION);
    }
  );
}

export async function markNotificationReadInFirestore(notificationId: string): Promise<void> {
  try {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(docRef, { read: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${NOTIFICATIONS_COLLECTION}/${notificationId}`);
  }
}

export async function markAllNotificationsReadInFirestore(notificationIds: string[]): Promise<void> {
  try {
    await Promise.all(
      notificationIds.map(id => updateDoc(doc(db, NOTIFICATIONS_COLLECTION, id), { read: true }))
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, NOTIFICATIONS_COLLECTION);
  }
}
