// lib/auth.ts  –  Simulated auth, no backend. Uses localStorage as the "database".

export interface StoredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  businessName?: string;
  serviceMode?: string;
  companyName?: string;
  idNumber?: string;
  garageName?: string;
  businessType?: string;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  businessName?: string;
  companyName?: string;
  garageName?: string;
}

const USERS_KEY = "connectmw_users";
const SESSION_KEY = "connectmw_session";

function getUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(data: Omit<StoredUser, "id" | "createdAt">): {
  ok: boolean;
  error?: string;
  user?: SessionUser;
} {
  const users = getUsers();
  if (users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { ok: false, error: "An account with that email already exists." };
  }
  const user: StoredUser = {
    ...data,
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  const session = toSession(user);
  setSession(session);
  return { ok: true, user: session };
}

export function loginUser(emailOrPhone: string, password: string): {
  ok: boolean;
  error?: string;
  user?: SessionUser;
} {
  const users = getUsers();
  const user = users.find(
    (u) =>
      (u.email.toLowerCase() === emailOrPhone.toLowerCase() ||
        u.phone === emailOrPhone) &&
      u.password === password
  );
  if (!user) {
    return { ok: false, error: "Incorrect email/phone or password." };
  }
  const session = toSession(user);
  setSession(session);
  return { ok: true, user: session };
}

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function toSession(u: StoredUser): SessionUser {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    businessName: u.businessName,
    companyName: u.companyName,
    garageName: u.garageName,
  };
}