import {
  LayoutDashboard,
  Users,
  Wrench,
  ClipboardList,
  MessageSquare,
  BarChart3,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user, logout } = useAuth();

  // Navigation items based on role
  const getNavigationItems = () => {
    const items = [
      {
        title: t('nav.dashboard'),
        url: '/dashboard',
        icon: LayoutDashboard,
        roles: ['admin', 'supervisor', 'engineer', 'sales', 'customer'],
      },
      {
        title: t('nav.users'),
        url: '/users',
        icon: Users,
        roles: ['admin', 'supervisor'],
      },
      {
        title: t('nav.services'),
        url: '/services',
        icon: Wrench,
        roles: ['admin', 'supervisor'],
      },
      {
        title: t('nav.workOrders'),
        url: '/work-orders',
        icon: ClipboardList,
        roles: ['admin', 'supervisor', 'engineer', 'sales', 'customer'],
      },
      {
        title: t('nav.chat'),
        url: '/chat',
        icon: MessageSquare,
        roles: ['admin', 'supervisor', 'engineer', 'sales', 'customer'],
      },
      {
        title: t('nav.reports'),
        url: '/reports',
        icon: BarChart3,
        roles: ['admin', 'supervisor'],
      },
    ];

    return items.filter((item) => item.roles.includes(user?.role || 'customer'));
  };

  const navigationItems = getNavigationItems();

  return (
    <Sidebar data-testid="sidebar">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-md flex items-center justify-center">
            <Wrench className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg">{t('app.title')}</span>
            <span className="text-xs text-muted-foreground">{t('app.tagline')}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.dashboard')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.url.replace('/', '')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center justify-between gap-2">
          <Link href="/profile" className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate">{user?.fullName}</span>
              <span className="text-xs text-muted-foreground truncate">
                {t(`roles.${user?.role || 'customer'}`)}
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            data-testid="button-logout"
            className="shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
