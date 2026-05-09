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
  role: string;
  businessName?: string;
  companyName?: string;
  garageName?: string;
};