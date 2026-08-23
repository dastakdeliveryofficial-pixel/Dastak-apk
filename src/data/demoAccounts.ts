import { UserRole } from '../types';

export interface DemoAccount {
  role: UserRole;
  title: string;
  titleUrdu: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  restaurantId?: string;
  riderId?: string;
  description: string;
  badge: string;
  color: string;
  destination: string;
}

export const DEMO_ACCOUNTS: Record<UserRole, DemoAccount> = {
  customer: {
    role: 'customer',
    title: 'Customer / گاہک',
    titleUrdu: 'کسٹمر پورٹل',
    name: 'Zahid Ali (Demo Customer)',
    email: 'customer@dastak.pk',
    phone: '0300-1234567',
    password: 'customer123',
    description: 'Browse restaurants, add items to cart, order via WhatsApp / Cash on Delivery & track delivery live in Matli.',
    badge: 'Food Ordering & Cart',
    color: 'from-pink-500 to-rose-600',
    destination: 'Customer Food Ordering App'
  },
  vendor: {
    role: 'vendor',
    title: 'Vendor / دکاندار',
    titleUrdu: 'شاپ / ہوٹل پینل',
    name: 'Al-Madina Biryani & Fast Food',
    email: 'vendor@dastak.pk',
    phone: '0300-9876543',
    password: 'vendor123',
    restaurantId: 'rest-1',
    description: 'Manage menu items, toggle food availability, receive live orders, sound alerts & update shop settings.',
    badge: 'Hotel & Kitchen Portal',
    color: 'from-amber-500 to-amber-700',
    destination: 'Vendor Control Panel'
  },
  rider: {
    role: 'rider',
    title: 'Rider / ڈلیوری بوائے',
    titleUrdu: 'رائیڈر پورٹل',
    name: 'Tariq Mehmood (Demo Rider)',
    email: 'rider@dastak.pk',
    phone: '0300-5555555',
    password: 'rider123',
    riderId: 'rider-1',
    description: 'Accept Matli food orders, view customer location, navigate with map, call customer & complete deliveries.',
    badge: 'Fleet & Earnings App',
    color: 'from-emerald-600 to-teal-800',
    destination: 'Rider Delivery App'
  },
  admin: {
    role: 'admin',
    title: 'Super Admin / ایڈمن',
    titleUrdu: 'ماسٹر کنٹرول روم',
    name: 'Super Admin (Matli Operations)',
    email: 'admin@dastak.pk',
    phone: '0300-0000000',
    password: 'admin123',
    description: 'Full control: GMV analytics, commission rates, register restaurants, approve vendors, manage rider fleet & privacy.',
    badge: 'Master Control Console',
    color: 'from-purple-700 to-indigo-900',
    destination: 'Super Admin Dashboard'
  }
};
