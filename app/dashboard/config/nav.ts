import {
  LayoutGrid, Home, Calendar, Package, MessageSquare, Star,
  Settings, Inbox, BarChart2, Clock, Sparkles, PlusCircle,
  ShoppingBag, Heart, Wrench, Camera,
} from 'lucide-react';
import { NavItem } from '../types/dashboard';

export const ROLE_NAV: Record<string, NavItem[]> = {
  customer: [
    { id: "overview",  label: "Overview",  icon: LayoutGrid },
    { id: "browse",    label: "Browse",    icon: ShoppingBag },   
    { id: "bookings",  label: "Bookings",  icon: Calendar, badge: 1 },
    { id: "orders",    label: "Orders",    icon: Package },        
    { id: "saved",     label: "Saved",     icon: Heart },          
    { id: "messages",  label: "Messages",  icon: MessageSquare, badge: 3 },
    { id: "settings",  label: "Settings",  icon: Settings },
  ],
  landlord: [
    { id: "overview",   label: "Overview",   icon: LayoutGrid },
    { id: "listings",   label: "Listings",   icon: Home },          
    { id: "upload",     label: "Add Property", icon: PlusCircle },
    { id: "enquiries",  label: "Enquiries",  icon: Inbox, badge: 7 },
    { id: "calendar",   label: "Calendar",   icon: Calendar },
    { id: "analytics",  label: "Analytics",  icon: BarChart2 },
    { id: "messages",   label: "Messages",   icon: MessageSquare, badge: 2 },
    { id: "settings",   label: "Settings",   icon: Settings },
  ],
  beautyProvider: [
    { id: "overview",   label: "Overview",   icon: LayoutGrid },
    { id: "portfolio",  label: "Portfolio",  icon: Sparkles },      
    { id: "add-service",label: "Add Service",icon: PlusCircle },   
    { id: "schedule",   label: "Schedule",   icon: Clock, badge: 3 },
    { id: "analytics",  label: "Analytics",  icon: BarChart2 },
    { id: "messages",   label: "Messages",   icon: MessageSquare, badge: 5 },
    { id: "reviews",    label: "Reviews",    icon: Star },
    { id: "settings",   label: "Settings",   icon: Settings },
  ],
  spareSeller: [
    { id: "overview",   label: "Overview",   icon: LayoutGrid },
    { id: "inventory",  label: "Inventory",  icon: Package },
    { id: "add",        label: "Add Part",   icon: PlusCircle },
    { id: "enquiries",  label: "Enquiries",  icon: Inbox, badge: 5 },
    { id: "analytics",  label: "Analytics",  icon: BarChart2 },
    { id: "messages",   label: "Messages",   icon: MessageSquare },
    { id: "settings",   label: "Settings",   icon: Settings },
  ],
};