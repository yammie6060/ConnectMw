import {
  LayoutGrid, Home, Calendar, Package, MessageSquare, Star,
  Settings, Inbox, BarChart2, Clock, Sparkles, PlusCircle,
  Car, User
} from 'lucide-react';
import { NavItem } from '../types/dashboard';

export const ROLE_NAV: Record<string, NavItem[]> = {
  customer: [
    { id: "overview",  label: "Overview",  icon: LayoutGrid },
    { id: "rentals",   label: "Rentals",   icon: Home },
    { id: "bookings",  label: "Bookings",  icon: Calendar, badge: 1 },
    { id: "orders",    label: "Orders",    icon: Package },
    { id: "messages",  label: "Messages",  icon: MessageSquare, badge: 3 },
    { id: "reviews",   label: "Reviews",   icon: Star },
    { id: "settings",  label: "Settings",  icon: Settings },
  ],
  landlord: [
    { id: "overview",   label: "Overview",   icon: LayoutGrid },
    { id: "listings",   label: "Listings",   icon: Home },
    { id: "enquiries",  label: "Enquiries",  icon: Inbox, badge: 7 },
    { id: "calendar",   label: "Calendar",   icon: Calendar },
    { id: "analytics",  label: "Analytics",  icon: BarChart2 },
    { id: "messages",   label: "Messages",   icon: MessageSquare, badge: 2 },
    { id: "settings",   label: "Settings",   icon: Settings },
  ],
  beautyProvider: [
    { id: "overview",   label: "Overview",  icon: LayoutGrid },
    { id: "schedule",   label: "Schedule",  icon: Clock, badge: 3 },
    { id: "portfolio",  label: "Portfolio", icon: Sparkles },
    { id: "analytics",  label: "Analytics", icon: BarChart2 },
    { id: "messages",   label: "Messages",  icon: MessageSquare, badge: 5 },
    { id: "reviews",    label: "Reviews",   icon: Star },
    { id: "settings",   label: "Settings",  icon: Settings },
  ],
  spareSeller: [
    { id: "overview",   label: "Overview",   icon: LayoutGrid },
    { id: "inventory",  label: "Inventory",  icon: Package },
    { id: "enquiries",  label: "Enquiries",  icon: Inbox, badge: 5 },
    { id: "add",        label: "Add Part",   icon: PlusCircle },
    { id: "analytics",  label: "Analytics",  icon: BarChart2 },
    { id: "messages",   label: "Messages",   icon: MessageSquare },
    { id: "settings",   label: "Settings",   icon: Settings },
  ],
};