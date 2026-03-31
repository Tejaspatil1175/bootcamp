import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
ArrowLeft,
User,
Phone,
Mail,
MapPin,
CreditCard,
Bell,
Lock,
HelpCircle,
LogOut,
ChevronRight,
Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getProfile, updateProfile, logout } from "@/services";

const Profile = () => {
const navigate = useNavigate();
const { toast } = useToast();
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [editDialogOpen, setEditDialogOpen] = useState(false);
const [profileData, setProfileData] = useState<any>(null);
const [editData, setEditData] = useState({
name: "",
phoneNumber: "",
upiId: "",
});

// Fetch profile data on mount
useEffect(() => {
const fetchProfile = async () => {
try {
setLoading(true);
const response = await getProfile();
if (response.success && response.user) {
setProfileData(response.user);
setEditData({
name: response.user.name || "",
phoneNumber: response.user.phoneNumber?.replace("+9", "") || "",
upiId: response.user.upiId || "",
});
}
} catch (error: any) {
toast({
title: "Error",
description: error.message || "Failed to load profile",
variant: "destructive",
});
} finally {
setLoading(false);
}
};

fetchProfile();
}, []);

const handleSaveProfile = async () => {
if (!editData.name.trim()) {
toast({
title: "Error",
description: "Name cannot be empty",
variant: "destructive",
});
return;
}

if (editData.phoneNumber && editData.phoneNumber.length !== 10) {
toast({
title: "Error",
description: "Please enter a valid 10-digit phone number",
variant: "destructive",
});
return;
}

try {
setSaving(true);
const response = await updateProfile({
name: editData.name,
phoneNumber: editData.phoneNumber ? `+9${editData.phoneNumber}` : undefined,
upiId: editData.upiId || undefined,
});

if (response.success) {
setProfileData(response.user);
toast({
title: "Profile Updated",
description: "Your profile has been updated successfully",
});
setEditDialogOpen(false);
}
} catch (error: any) {
toast({
title: "Error",
description: error.message || "Failed to update profile",
variant: "destructive",
});
} finally {
setSaving(false);
}
};

const handleLogout = async () => {
try {
await logout();
toast({
title: "Logged Out",
description: "You have been logged out successfully",
});
navigate("/login");
} catch (error) {
// Still navigate to login even if logout API fails
navigate("/login");
}
};

if (loading) {
return (
<div className="min-h-screen bg-background flex items-center justify-center">
<Loader2 className="h-8 w-8 animate-spin text-primary" />
</div>
);
}

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
            {profileData?.name ? profileData.name.substring(0, 2).toUpperCase() : "US"}
            </AvatarFallback>
            </Avatar>
            <div>
            <h2 className="text-2xl font-bold">{profileData?.name || "User"}</h2>
            <p className="text-muted-foreground">{profileData?.phoneNumber || "Not set"}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setEditDialogOpen(true)}>
            Edit Profile
          </Button>
        </Card>

        {/* Edit Profile Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <div className="flex gap-2">
              <div className="flex items-center justify-center px-3 bg-muted rounded-md border">
              <span className="text-sm font-medium">+9</span>
              </div>
              <Input
              id="edit-phone"
              type="tel"
              value={editData.phoneNumber}
              onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              maxLength={10}
              placeholder="98765 43210"
              />
              </div>
              </div>
              <div className="space-y-2">
              <Label htmlFor="edit-upi">UPI ID</Label>
              <Input
              id="edit-upi"
              type="text"
              value={editData.upiId}
              onChange={(e) => setEditData({ ...editData, upiId: e.target.value })}
              placeholder="yourname@upi"
              />
              <p className="text-xs text-muted-foreground">
              This will be used for receiving payments
              </p>
              </div>
            </div>
            <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
            Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? (
            <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
            </>
            ) : (
            "Save Changes"
            )}
            </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Account Details */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Account Details</h3>
          <Card className="divide-y">
            <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 text-left">
            <p className="font-medium">Phone Number</p>
            <p className="text-sm text-muted-foreground">{profileData?.phoneNumber || "Not set"}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 text-left">
            <p className="font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{profileData?.email || "Not set"}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 text-left">
            <p className="font-medium">Location</p>
            <p className="text-sm text-muted-foreground">{profileData?.address || "Not set"}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 text-left">
            <p className="font-medium">UPI ID</p>
            <p className="text-sm text-muted-foreground">{profileData?.upiId || "Not set"}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </Card>
        </div>

        {/* Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Settings</h3>
          <Card className="divide-y">
            <button 
              className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="font-medium">Notifications</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="font-medium">Security & Privacy</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="font-medium">Help & Support</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </Card>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full touch-target"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Profile;
