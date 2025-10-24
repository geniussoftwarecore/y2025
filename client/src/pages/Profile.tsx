import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    username: user?.username || '',
    preferredLanguage: user?.preferredLanguage || 'en',
    specialization: user?.specialization || '',
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t('common.success'),
      description: 'Profile updated successfully',
    });
    setIsEditing(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t('common.success'),
      description: 'Password changed successfully',
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold mb-2">{t('nav.profile')}</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>{user?.fullName}</CardTitle>
              <CardDescription>{t(`roles.${user?.role || 'customer'}`)}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={!isEditing}
                  data-testid="input-profile-fullname"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  data-testid="input-profile-email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">{t('auth.username')}</Label>
                <Input
                  id="username"
                  value={formData.username}
                  disabled
                  data-testid="input-profile-username"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language">{t('users.preferredLanguage')}</Label>
                <Select
                  value={formData.preferredLanguage}
                  onValueChange={(value) => setFormData({ ...formData, preferredLanguage: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {user?.role === 'engineer' && (
                <div className="grid gap-2">
                  <Label htmlFor="specialization">{t('users.specialization')}</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    disabled={!isEditing}
                    data-testid="input-profile-specialization"
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
                {t('common.edit')}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" data-testid="button-save-profile">
                  {t('common.save')}
                </Button>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('auth.resetPassword')}</CardTitle>
          <CardDescription>Change your account password</CardDescription>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" data-testid="input-current-password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" data-testid="input-new-password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input id="confirmNewPassword" type="password" data-testid="input-confirm-new-password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" data-testid="button-change-password">
              Change Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
