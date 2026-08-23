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
  UserRole
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

// 1. Initial Seed to Firestore if database is empty
export async function seedInitialFirestoreData() {
  try {
    // Check if restaurants collection already has items
    const restSnap = await getDocs(collection(db, RESTAURANTS_COLLECTION));
    if (restSnap.empty) {
      console.log('Seeding initial Matli restaurants to Firestore...');
      for (const r of INITIAL_RESTAURANTS) {
        await setDoc(doc(db, RESTAURANTS_COLLECTION, r.id), r);
      }

      console.log('Seeding initial menu items...');
      for (const m of INITIAL_MENU_ITEMS) {
        await setDoc(doc(db, MENU_ITEMS_COLLECTION, m.id), m);
      }

      console.log('Seeding initial categories...');
      for (const c of CATEGORIES) {
        await setDoc(doc(db, CATEGORIES_COLLECTION, c.id), c);
      }

      console.log('Seeding promos...');
      for (const p of BANNER_PROMOS) {
        await setDoc(doc(db, PROMOS_COLLECTION, p.id), p);
      }

      console.log('Seeding initial riders...');
      for (const rd of INITIAL_RIDERS) {
        await setDoc(doc(db, RIDERS_COLLECTION, rd.id), rd);
      }

      console.log('Seeding initial platform settings...');
      await setDoc(doc(db, SETTINGS_COLLECTION, 'main_config'), INITIAL_SETTINGS);
    }
  } catch (err) {
    console.error('Firestore seeding note:', err);
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
): Promise<{ user: User; firebaseUser: FirebaseUser }> {
  const cleanEmail = email.trim().toLowerCase();
  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
  const uid = credential.user.uid;

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

  await setDoc(doc(db, USERS_COLLECTION, uid), newUserDoc);
  return { user: newUserDoc, firebaseUser: credential.user };
}

export async function loginFirebaseUser(email: string, pass: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const credential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
  const uid = credential.user.uid;

  const userDocRef = doc(db, USERS_COLLECTION, uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data() as User;
  }

  // If user profile doc missing, create fallback
  const fallbackUser: User = {
    id: uid,
    name: cleanEmail.split('@')[0],
    email: cleanEmail,
    phone: '0300-1234567',
    role: cleanEmail.includes('admin') ? 'admin' : 'customer',
    addresses: [],
    isBlocked: false,
    createdAt: new Date().toISOString()
  };
  await setDoc(userDocRef, fallbackUser);
  return fallbackUser;
}

export async function resetFirebasePassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

export async function logoutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

// 3. Realtime Orders Listeners & Actions
export function subscribeToOrders(onUpdate: (orders: Order[]) => void) {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const ordersList: Order[] = [];
    snapshot.forEach((docSnap) => {
      ordersList.push({ ...(docSnap.data() as Order), id: docSnap.id });
    });
    onUpdate(ordersList);
  }, (err) => {
    console.error('Firestore order subscription error:', err);
  });
}

export async function createFirestoreOrder(orderData: Omit<Order, 'id'>): Promise<Order> {
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...orderData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return {
    ...orderData,
    id: docRef.id
  };
}

export async function updateFirestoreOrderStatus(
  orderId: string, 
  status: OrderStatus, 
  riderId?: string, 
  riderName?: string, 
  riderPhone?: string,
  cancelReason?: string
) {
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
}

// 4. Realtime Restaurants, Menu, & Riders
export function subscribeToRestaurants(onUpdate: (restaurants: Restaurant[]) => void) {
  return onSnapshot(collection(db, RESTAURANTS_COLLECTION), (snapshot) => {
    const list: Restaurant[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ ...(docSnap.data() as Restaurant), id: docSnap.id });
    });
    onUpdate(list);
  });
}

export function subscribeToMenuItems(onUpdate: (items: MenuItem[]) => void) {
  return onSnapshot(collection(db, MENU_ITEMS_COLLECTION), (snapshot) => {
    const list: MenuItem[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ ...(docSnap.data() as MenuItem), id: docSnap.id });
    });
    onUpdate(list);
  });
}

export function subscribeToRiders(onUpdate: (riders: Rider[]) => void) {
  return onSnapshot(collection(db, RIDERS_COLLECTION), (snapshot) => {
    const list: Rider[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ ...(docSnap.data() as Rider), id: docSnap.id });
    });
    onUpdate(list);
  });
}

export function subscribeToUsers(onUpdate: (users: User[]) => void) {
  return onSnapshot(collection(db, USERS_COLLECTION), (snapshot) => {
    const list: User[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ ...(docSnap.data() as User), id: docSnap.id });
    });
    onUpdate(list);
  });
}
