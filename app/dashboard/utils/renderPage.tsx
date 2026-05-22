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
import { AdminManagementPage } from '../pages/admin/AdminManagementPage';

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
  toggleTheme: () => void,
  onSessionRefresh?: () => void
): ReactElement {
  const { color } = meta;
  const role = user.role;

  // Create a unique key for this page instance
  const cacheKey = `${activeItem}-${user.id}-${user.role}-${user.fullName}-${isDarkMode}`;

  // Check if we already have this component instance cached
  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey)!;
  }

  let component: ReactElement;

  switch (activeItem) {
    case "admin":
    case "admin-users":
    case "admin-staff":
    case "admin-providers":
    case "admin-support":
    case "admin-payments":
    case "admin-reviews":
      component = ["admin", "support"].includes(role)
        ? (
          <AdminManagementPage
            color={color}
            canManageRoles={user.roles.includes("admin")}
            initialTab={
              activeItem === "admin-users" ? "users"
              : activeItem === "admin-staff" ? "staff"
              : activeItem === "admin-providers" ? "providers"
              : activeItem === "admin-support" ? "support"
              : activeItem === "admin-payments" ? "payments"
              : activeItem === "admin-reviews" ? "reviews"
              : "overview"
            }
          />
        )
        : <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;
      break;

    case "overview":    
      component = ["admin", "support"].includes(role)
        ? <AdminManagementPage color={color} canManageRoles={user.roles.includes("admin")} />
        : <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;
      break;

    // Spare Seller
    case "inventory":   
      component = role === "spareSeller" || ["admin", "support"].includes(role)
        ? <InventoryPage color={color} role="spareSeller" user={user} onNavigate={setActiveItem} />
        : <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;
      break;
    case "enquiries":   
      component = <EnquiriesPage color={color} user={user} />;
      break;
    case "add":         
      component = role === "spareSeller" || ["admin", "support"].includes(role)
        ? <AddPartPage color={color} user={user} />
        : <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;
      break;
    case "analytics":   
      component = <AnalyticsPage color={color} user={user} />;
      break;

    // Landlord
    case "listings":    
      component = role === "landlord" || role === "agent" || ["admin", "support"].includes(role)
        ? <InventoryPage color={color} role={["admin", "support"].includes(role) ? "landlord" : role} user={user} onNavigate={setActiveItem} />
        : <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;
      break;
    case "upload":
      component = role === "landlord" || role === "agent" || ["admin", "support"].includes(role)
        ? <AddPropertyPage color={color} user={user} />
        : <OverviewPage user={user} meta={meta} navItems={navItems} setActiveItem={setActiveItem} />;
      break;
    case "calendar":    
      component = <CalendarPage color={color} role={role} user={user} />;
      break;

    // Beauty Provider
    case "schedule":    
      component = <CalendarPage color={color} role={role} user={user} />;
      break;
    case "portfolio":   
      component = role === "beautyProvider" || ["admin", "support"].includes(role)
        ? <PortfolioPage color={color} user={user} />
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
      component = <ReviewsPage color={color} user={user} />;
      break;

    case "browse":
      component = <RentalsPage color={color} />;   
      break;
    case "saved":
      component = <RentalsPage color={color} />;   
      break;
    case "add-service":
      component = role === "beautyProvider" || ["admin", "support"].includes(role)
        ? <PortfolioPage color={color} user={user} initialShowAdd />
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
      component = <ProfilePage color={color} user={user} meta={meta} onSessionRefresh={onSessionRefresh} />;
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
