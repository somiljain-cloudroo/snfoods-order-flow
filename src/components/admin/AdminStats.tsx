import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  ShoppingCart,
  Package,
  Users,
  Building2,
  TrendingUp,
  DollarSign
} from "lucide-react";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalAccounts: number;
  totalUsers: number;
  totalRevenue: number;
}

export const AdminStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalAccounts: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes, accountsRes, profilesRes] = await Promise.all([
          supabase.from("orders").select("status, total_amount"),
          supabase.from("products").select("id", { count: "exact" }),
          supabase.from("accounts").select("id", { count: "exact" }),
          supabase.from("profiles").select("id", { count: "exact" }),
        ]);

        const orders = ordersRes.data || [];
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const totalRevenue = orders
          .filter(order => order.status === 'approved')
          .reduce((sum, order) => sum + (typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount), 0);

        setStats({
          totalOrders: orders.length,
          pendingOrders,
          totalProducts: productsRes.count || 0,
          totalAccounts: accountsRes.count || 0,
          totalUsers: profilesRes.count || 0,
          totalRevenue,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: "text-orange-600",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-green-600",
    },
    {
      title: "Total Accounts",
      value: stats.totalAccounts,
      icon: Building2,
      color: "text-purple-600",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-indigo-600",
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-6 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Get a comprehensive view of your business metrics and performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{typeof stat.value === 'string' ? stat.value : stat.value.toString()}</p>
                  </div>
                  <div className={`p-2 rounded-full bg-muted ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};