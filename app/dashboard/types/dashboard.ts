import { ReactElement } from 'react';

export type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
};

export type NavMode = 'bottom' | 'sidebar';

export type RoleMeta = {
  label: string;
  color: string;
  icon: React.ElementType;
  greeting: string;
  statCards: Array<{
    label: string;
    value: string;
    icon: React.ElementType;
    delta?: string;
  }>;
  recentItems: Array<{
    title: string;
    sub: string;
    badge: string;
    badgeColor: string;
  }>;
};

export type SessionUser = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  roles: string[];
  providers: Array<{
    id: string;
    type: string | null;
    role: string;
    display_name: string | null;
    business_name: string | null;
    verification_status: string;
    is_verified: boolean;
  }>;
  activeRole: string;
  activeProviderId: string | null;
  canSwitchRoles: boolean;
  avatarUrl?: string | null;
  fullName?: string;
  city?: string | null;
  district?: string | null;
  streetAddress?: string | null;
  nationality?: string | null;
  preferredLanguage?: string | null;
  bio?: string | null;
  businessName?: string;
  companyName?: string;
  garageName?: string;
};
