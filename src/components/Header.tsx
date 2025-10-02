import { ShoppingCart, User, Search, Menu, LogOut, UserCheck, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/sn-logo.png";

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
  onLoginClick?: () => void;
}

export const Header = ({ cartCount = 0, onCartClick, onLoginClick }: HeaderProps) => {
  const { isAuthenticated, profile, isAdmin, isSalesAdmin } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="SN Food Supplies" className="h-10 w-10" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              SN Food Supplies
            </h1>
            <p className="text-xs text-muted-foreground">Premium Food Distribution</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <UserCheck className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">
                    {profile.full_name || profile.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(isAdmin || isSalesAdmin) && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" onClick={onLoginClick}>
              <User className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Login</span>
            </Button>
          )}
          
          <Button variant="ghost" size="sm" onClick={onCartClick} className="relative">
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent">
                {cartCount}
              </Badge>
            )}
            <span className="hidden sm:inline ml-2">Cart</span>
          </Button>

          <Button variant="ghost" size="sm" className="sm:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
