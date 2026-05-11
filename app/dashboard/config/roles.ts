import { User, Home, Sparkles, Car, Calendar, MessageSquare, Package, Star, TrendingUp } from 'lucide-react';
import { RoleMeta } from '../types/dashboard';

export const ROLE_META: Record<string, RoleMeta> = {
  customer: {
    label: "Customer", color: "#f5ab20", icon: User,
    greeting: "What are you looking for today?",
    statCards: [
      { label: "Saved Listings", value: "3",  icon: Home,     delta: "+1 new" },
      { label: "Bookings",       value: "1",  icon: Calendar },
      { label: "Orders",         value: "2",  icon: Package },
      { label: "Reviews Left",   value: "1",  icon: Star,     delta: "4.8★ avg" },
    ],
    recentItems: [
      { title: "2-Bed Flat, Area 47 Lilongwe",   sub: "Viewed 2 days ago",   badge: "Rental",  badgeColor: "#1b4f6a" },
      { title: "Grace Nails Studio – Manicure",  sub: "Appointment tomorrow", badge: "Booked",  badgeColor: "#10b981" },
      { title: "Toyota Vitz Side Mirror",         sub: "Quote received",       badge: "Spare",   badgeColor: "#f5ab20" },
    ],
  },
  landlord: {
    label: "Landlord", color: "#f5ab20", icon: Home,
    greeting: "Manage your properties and enquiries.",
    statCards: [
      { label: "Active Listings", value: "4",     icon: Home,          delta: "2 available" },
      { label: "Enquiries",       value: "7",     icon: MessageSquare, delta: "+3 today" },
      { label: "Occupancy",       value: "75%",   icon: TrendingUp },
      { label: "Revenue",         value: "K180K", icon: Package,       delta: "this month" },
    ],
    recentItems: [
      { title: "3-Bed House, Area 47",         sub: "2 new enquiries",        badge: "Available", badgeColor: "#10b981" },
      { title: "Studio Apt, Area 3",             sub: "Occupied · Lease ends Jun", badge: "Occupied", badgeColor: "#8ca5bc" },
      { title: "Student Hostel Room, Chichiri",  sub: "1 new enquiry",          badge: "Available", badgeColor: "#10b981" },
    ],
  },
  beautyProvider: {
    label: "Beauty Provider", color: "#f5ab20", icon: Sparkles,
    greeting: "Your bookings and portfolio are looking great!",
    statCards: [
      { label: "Bookings Today",  value: "3",    icon: Calendar },
      { label: "Total Reviews",   value: "28",   icon: Star,       delta: "4.9★" },
      { label: "Profile Views",   value: "142",  icon: TrendingUp, delta: "+24 this week" },
      { label: "Revenue",         value: "K35K", icon: Package,    delta: "this month" },
    ],
    recentItems: [
      { title: "Hair Braiding – Thandiwe M.", sub: "Today, 10:00 AM",   badge: "Confirmed", badgeColor: "#10b981" },
      { title: "Nail Art – Chisomo B.",       sub: "Today, 2:00 PM",    badge: "Pending",   badgeColor: "#f5ab20" },
      { title: "Makeup – Wedding client",     sub: "Tomorrow, 8:00 AM", badge: "Confirmed", badgeColor: "#10b981" },
    ],
  },
  spareSeller: {
    label: "Spare Parts Seller", color: "#f5ab20", icon: Car,
    greeting: "Parts listed. Drivers are searching near you.",
    statCards: [
      { label: "Active Listings", value: "12",   icon: Package,      delta: "+2 this week" },
      { label: "Enquiries",       value: "5",    icon: MessageSquare, delta: "+2 today" },
      { label: "Profile Views",   value: "89",   icon: TrendingUp,   delta: "this week" },
      { label: "Sales",           value: "K92K", icon: Car,          delta: "this month" },
    ],
    recentItems: [
      { title: "Toyota Hiace Side Mirror x2",  sub: "Enquiry from Blantyre",  badge: "In Stock",  badgeColor: "#10b981" },
      { title: "Nissan Wingroad Brake Pads",   sub: "Sold · awaiting pickup", badge: "Sold",      badgeColor: "#8ca5bc" },
      { title: "Mazda Familia Oil Filter x5",  sub: "Low stock alert",        badge: "Low Stock", badgeColor: "#ef4444" },
    ],
  },
};
