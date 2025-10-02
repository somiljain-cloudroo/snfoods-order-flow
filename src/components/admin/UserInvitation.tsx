import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, UserPlus } from "lucide-react";

export const UserInvitation = () => {
  const [inviteData, setInviteData] = useState({
    email: "",
    fullName: "",
    role: "customer",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const { error } = await supabase.functions.invoke("send-invite", {
        body: { ...inviteData, siteUrl: window.location.origin },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Invitation Sent!",
        description: `An invitation email has been sent to ${inviteData.email}`,
      });

      // Reset form
      setInviteData({
        email: "",
        fullName: "",
        role: "customer",
        message: "",
      });
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const predefinedMessages = {
    customer: "You've been invited to join our customer portal where you can browse products and place orders easily.",
    sales_admin: "You've been invited to join our admin team with sales management privileges.",
    admin: "You've been invited to join as an administrator with full system access.",
  };

  const handleRoleChange = (role: string) => {
    setInviteData({
      ...inviteData,
      role,
      message: predefinedMessages[role as keyof typeof predefinedMessages] || "",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Invitation</h2>
        <p className="text-muted-foreground">
          Send invitation emails to new users to join your platform
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Send Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteData.email}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, email: e.target.value })
                  }
                  placeholder="Enter user's email address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={inviteData.fullName}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, fullName: e.target.value })
                  }
                  placeholder="Enter user's full name"
                />
              </div>

              <div>
                <Label htmlFor="role">User Role *</Label>
                <Select value={inviteData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="sales_admin">Sales Admin</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Custom Message</Label>
                <Textarea
                  id="message"
                  value={inviteData.message}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, message: e.target.value })
                  }
                  placeholder="Add a personal message to the invitation..."
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={sending} className="w-full">
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-2">Subject: You're invited to join our platform</p>
                <div className="space-y-2">
                  <p>Hi {inviteData.fullName || "[Full Name]"},</p>
                  <p>
                    {inviteData.message ||
                      "You've been invited to join our platform. Click the link below to create your account and get started."}
                  </p>
                  <p>Role: <span className="font-medium capitalize">{inviteData.role}</span></p>
                  <div className="mt-4 p-2 bg-primary text-primary-foreground rounded text-center">
                    [Accept Invitation Button]
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This invitation will expire in 7 days.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Customer</h4>
              <p className="text-sm text-muted-foreground">
                Can browse products, place orders, and manage their own account.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Sales Admin</h4>
              <p className="text-sm text-muted-foreground">
                Can manage orders, approve/reject sales, and view customer accounts.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Administrator</h4>
              <p className="text-sm text-muted-foreground">
                Full access to all features including user management, products, and system settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
