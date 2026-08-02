"use client";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  createdAt: string;
}

const USERS_KEY = "tournaops_users";
const CURRENT_USER_KEY = "tournaops_current_user";
const SESSION_KEY = "tournaops_session";

// Simple ID generator
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Get all users
export function getAllUsers(): any[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

// Register new user
export function registerUser(email: string, password: string, username: string, displayName: string): { success: boolean; user?: User; error?: string } {
  if (typeof window === "undefined") return { success: false, error: "Not in browser" };
  
  const users = getAllUsers();
  
  // Check if email exists
  if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: "Email already registered" };
  }
  
  // Check if username exists
  if (users.find((u: any) => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, error: "Username already taken" };
  }
  
  // Validate password
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }
  
  // Create user
  const newUser = {
    id: generateId(),
    email,
    username,
    displayName,
    password, // In production, hash this!
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Auto login
  const { password: _, ...userWithoutPassword } = newUser;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
  localStorage.setItem(SESSION_KEY, generateId());
  
  return { success: true, user: userWithoutPassword };
}

// Login user
export function loginUser(email: string, password: string): { success: boolean; user?: User; error?: string } {
  if (typeof window === "undefined") return { success: false, error: "Not in browser" };
  
  const users = getAllUsers();
  const user = users.find((u: any) => 
    u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  
  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }
  
  const { password: _, ...userWithoutPassword } = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
  localStorage.setItem(SESSION_KEY, generateId());
  
  return { success: true, user: userWithoutPassword };
}

// Logout
export function logoutUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(SESSION_KEY);
}

// Get current user
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// Check if logged in
export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

// Update user
export function updateUser(updates: Partial<User>): { success: boolean; user?: User; error?: string } {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, error: "Not logged in" };
  
  const users = getAllUsers();
  const idx = users.findIndex((u: any) => u.id === currentUser.id);
  if (idx === -1) return { success: false, error: "User not found" };
  
  users[idx] = { ...users[idx], ...updates };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  const { password: _, ...userWithoutPassword } = users[idx];
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
  
  return { success: true, user: userWithoutPassword };
}