import { useState, useEffect } from "react";
import { LogOut, Users, Upload, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUsageStats, getAllUsers, setAdminLoggedIn, UserRecord, UsageStats } from "@/lib/adminAuth";

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [stats, setStats] = useState<UsageStats>(getUsageStats());
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users">("overview");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
    // Refresh data every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setStats(getUsageStats());
      setUsers(getAllUsers());
      setIsLoading(false);
    }, 300);
  };

  const handleLogout = () => {
    setAdminLoggedIn(false);
    onLogout();
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: any;
    label: string;
    value: number | string;
    color: string;
  }) => (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage and monitor your application</p>
        </div>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-card border border-border rounded-lg p-2 w-fit">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "users"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            👥 Users
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Upload}
                label="Total Uploads"
                value={stats.totalUploads}
                color="bg-blue-500/20 text-blue-500"
              />
              <StatCard
                icon={Zap}
                label="Metadata Generated"
                value={stats.totalMetadataGenerated}
                color="bg-purple-500/20 text-purple-500"
              />
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats.totalUsers}
                color="bg-green-500/20 text-green-500"
              />
              <StatCard
                icon={TrendingUp}
                label="This Month"
                value={stats.thisMonthGenerations}
                color="bg-orange-500/20 text-orange-500"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Chart Placeholder */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  📈 Activity Trends
                </h2>
                <div className="h-64 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="mb-2">📊</div>
                    <p>Activity chart will be displayed here</p>
                    <p className="text-xs mt-2">Real-time data visualization</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  🔔 Recent Activity
                </h2>
                <div className="space-y-3">
                  {[
                    { action: "User signup", time: "2 minutes ago", user: "John Doe" },
                    { action: "Metadata generated", time: "5 minutes ago", user: "Jane Smith" },
                    { action: "File uploaded", time: "10 minutes ago", user: "Admin" },
                    { action: "User signup", time: "15 minutes ago", user: "Mike Johnson" },
                  ].map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                User Management ({users.length})
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage all registered users
              </p>
            </div>

            {users.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users registered yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary border-b border-border">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                        Name
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                        Email
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                        Sign In Date
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                        Uploads
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                        Generations
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                        Last Active
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`border-b border-border hover:bg-secondary/50 transition-colors ${
                          index % 2 === 0 ? "bg-background/50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {user.signInDate}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-500 text-xs font-medium">
                            {user.totalUploads}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 text-purple-500 text-xs font-medium">
                            {user.totalGenerations}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {user.lastActive}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
