import { ReactElement } from 'react';
import { SessionUser, RoleMeta, NavItem } from '../types/dashboard';
import { OverviewPage } from '../pages/OverviewPage';
import { InventoryPage } from '../pages/InventoryPage';
import { EnquiriesPage } from '../pages/EnquiriesPage';
import { AddPartPage } from '../pages/AddPartPage';
import { AddPropertyPage } from '../pages/AddPropertyPage';
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

// Create a cache to store component instances with their state
const pageCache = new Map<string, ReactElement>();

// Clear cache when needed (e.g., on logout)
export function clearPageCache() {
  pageCache.clear();
}

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

  // Create a unique key for this page instance
  const cacheKey = `${activeItem}-${user.id}-${isDarkMode}`;

  // Check if we already have this component instance cached
  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey)!;
  }

  let component: ReactElement;

  switch (activeItem) {
    case "overview":    
      component = <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;
      break;

    // Spare Seller
    case "inventory":   
      component = role === "spareSeller"
        ? <InventoryPage color={color} role={role} />
        : <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;
      break;
    case "enquiries":   
      component = <EnquiriesPage color={color} />;
      break;
    case "add":         
      component = role === "spareSeller"
        ? <AddPartPage color={color} />
        : <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;
      break;
    case "analytics":   
      component = <AnalyticsPage color={color} meta={meta} />;
      break;

    // Landlord
    case "listings":    
      component = role === "landlord"
        ? <InventoryPage color={color} role={role} />
        : <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;
      break;
    case "upload":
      component = role === "landlord"
        ? <AddPropertyPage color={color} />
        : <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;
      break;
    case "calendar":    
      component = <CalendarPage color={color} role={role} />;
      break;

    // Beauty Provider
    case "schedule":    
      component = <CalendarPage color={color} role={role} />;
      break;
    case "portfolio":   
      component = role === "beautyProvider"
        ? <PortfolioPage color={color} />
        : <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;
      break;

    // Customer
    case "rentals":     
      component = <RentalsPage color={color} />;
      break;
    case "bookings":    
      component = <BookingsPage color={color} />;
      break;
    case "orders":      
      component = <OrdersPage color={color} />;
      break;
    case "reviews":     
      component = <ReviewsPage color={color} />;
      break;

    case "browse":
      component = <RentalsPage color={color} />;   
      break;
    case "saved":
      component = <RentalsPage color={color} />;   
      break;
    case "add-service":
      component = role === "beautyProvider"
        ? <PortfolioPage color={color} initialShowAdd />
        : <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;
      break;

    // Shared
    case "notifications":
      component = <NotificationsPage color={color} key="notifications-page" />;
      break;
    case "messages":    
      component = <MessagesPage color={color} key="messages-page" />;
      break;
    case "settings":    
      component = <SettingsPage color={color} user={user} isDarkMode={isDarkMode} toggleTheme={toggleTheme} onNavigate={setActiveItem} />;
      break;

    // Profile menu
    case "profile":     
      component = <ProfilePage color={color} user={user} meta={meta} />;
      break;
    case "billing":     
      component = <BillingPage color={color} user={user} />;
      break;
    case "privacy":     
      component = <PrivacyPage color={color} />;
      break;
    case "help":        
      component = <HelpPage color={color} />;
      break;

    default:            
      component = <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;
      break;
  }

  // Cache the component
  pageCache.set(cacheKey, component);
  
  return component;
}
