import { ReactElement } from 'react';
import { SessionUser, RoleMeta, NavItem } from '../types/dashboard';
import { OverviewPage } from '../pages/OverviewPage';
import { InventoryPage } from '../pages/InventoryPage';
import { EnquiriesPage } from '../pages/EnquiriesPage';
import { AddPartPage } from '../pages/AddPartPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { CalendarPage } from '../pages/CalendarPage';
import { PortfolioPage } from '../pages/PortfolioPage';
import { RentalsPage } from '../pages/RentalsPage';
import { BookingsPage } from '../pages/BookingsPage';
import { OrdersPage } from '../pages/OrdersPage';
import { ReviewsPage } from '../pages/ReviewsPage';
import { MessagesPage } from '../pages/MessagesPage';
import { SettingsPage } from '../pages/SettingsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { BillingPage } from '../pages/BillingPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { HelpPage } from '../pages/HelpPage';
import { NotificationsPage } from '../pages/NotificationsPage';







export function renderPage(
  activeItem: string,
  user: SessionUser,
  meta: RoleMeta,
  navItems: NavItem[],
  setActiveItem: (id: string) => void,
  isDarkMode: boolean,
  toggleTheme: () => void
): ReactElement {
  const { color } = meta;
  const role = user.role;

  switch (activeItem) {
    case "overview":    
      return <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;

    // Spare Seller
    case "inventory":   
      return <InventoryPage color={color} role={role} />;
    case "enquiries":   
      return <EnquiriesPage color={color} />;
    case "add":         
      return <AddPartPage color={color} />;
    case "analytics":   
      return <AnalyticsPage color={color} meta={meta} />;

    // Landlord
    case "listings":    
      return <InventoryPage color={color} role={role} />;
    case "calendar":    
      return <CalendarPage color={color} role={role} />;

    // Beauty Provider
    case "schedule":    
      return <CalendarPage color={color} role={role} />;
    case "portfolio":   
      return <PortfolioPage color={color} />;

    // Customer
    case "rentals":     
      return <RentalsPage color={color} />;
    case "bookings":    
      return <BookingsPage color={color} />;
    case "orders":      
      return <OrdersPage color={color} />;
    case "reviews":     
      return <ReviewsPage color={color} />;

    // Shared
    case "notifications":
      return <NotificationsPage color={color} />;
    case "messages":    
      return <MessagesPage color={color} />;
    case "settings":    
      return <SettingsPage color={color} user={user} isDarkMode={isDarkMode} toggleTheme={toggleTheme} onNavigate={setActiveItem} />;

    // Profile menu
    case "profile":     
      return <ProfilePage color={color} user={user} meta={meta} />;
    case "billing":     
      return <BillingPage color={color} />;
    case "privacy":     
      return <PrivacyPage color={color} />;
    case "help":        
      return <HelpPage color={color} />;

    default:            
      return <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;
  }
}
