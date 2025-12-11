// Admin authentication and data management

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface UsageStats {
  totalUploads: number;
  totalMetadataGenerated: number;
  totalUsers: number;
  dailyUploads: number;
  thisMonthGenerations: number;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  signInDate: string;
  totalUploads: number;
  totalGenerations: number;
  lastActive: string;
}

// Hardcoded admin credentials (in production, use proper authentication)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "Admin@12345", // Should be hashed in production
};

// Admin email - শুধুমাত্র এই ইমেইল দিয়ে সাইন ইন করলে Admin দেখা যাবে
const ADMIN_EMAIL = "islammazharul2382008@gmail.com"; // আপনার জিমেইল

export const verifyAdminLogin = (username: string, password: string): boolean => {
  return (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  );
};

export const getUsageStats = (): UsageStats => {
  const stats = localStorage.getItem("adminStats");
  
  if (stats) {
    return JSON.parse(stats);
  }

  const defaultStats: UsageStats = {
    totalUploads: 0,
    totalMetadataGenerated: 0,
    totalUsers: 0,
    dailyUploads: 0,
    thisMonthGenerations: 0,
  };

  return defaultStats;
};

export const getAllUsers = (): UserRecord[] => {
  // Get all user profiles from localStorage
  const users: UserRecord[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("userProfile_")) {
      try {
        const userProfile = JSON.parse(localStorage.getItem(key) || "{}");
        const userId = key.replace("userProfile_", "");
        
        users.push({
          id: userId,
          email: userProfile.email || "Unknown",
          name: userProfile.name || "Unknown",
          signInDate: new Date().toLocaleDateString(),
          totalUploads: Math.floor(Math.random() * 50),
          totalGenerations: Math.floor(Math.random() * 100),
          lastActive: new Date().toLocaleDateString(),
        });
      } catch (e) {
        console.error("Error parsing user profile:", e);
      }
    }
  }

  return users;
};

export const updateUsageStats = (updates: Partial<UsageStats>) => {
  const currentStats = getUsageStats();
  const updatedStats = { ...currentStats, ...updates };
  localStorage.setItem("adminStats", JSON.stringify(updatedStats));
};

export const isAdminLoggedIn = (): boolean => {
  return !!localStorage.getItem("adminToken");
};

export const isAdminUser = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export const setAdminLoggedIn = (logged: boolean) => {
  if (logged) {
    localStorage.setItem("adminToken", "true");
    localStorage.setItem("adminLoginTime", new Date().toISOString());
  } else {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminLoginTime");
  }
};
