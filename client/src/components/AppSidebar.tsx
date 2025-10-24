import {
  LayoutDashboard,
  Users,
  Wrench,
  ClipboardList,
  MessageSquare,
  BarChart3,
  LogOut,
  Car,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export function AppSidebar() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user, logout } = useAuth();

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
    <aside
      className="w-64 bg-card border-r flex flex-col shrink-0"
      data-testid="sidebar"
    >
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-lg">
            <Car className="h-7 w-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">{t('app.title')}</span>
            <span className="text-xs text-muted-foreground leading-tight">{t('app.tagline')}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = location === item.url;
          return (
            <Link key={item.url} href={item.url}>
              <button
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover-elevate active-elevate-2'
                  }
                `}
                data-testid={`link-${item.url.replace('/', '')}`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.title}</span>
              </button>
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-4 space-y-4">
        <Link href="/profile">
          <div className="flex items-center gap-3 p-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-green-600 to-green-700 text-white font-semibold">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user?.fullName}</div>
              <Badge variant="secondary" className="text-xs mt-1">
                {t(`roles.${user?.role || 'customer'}`)}
              </Badge>
            </div>
          </div>
        </Link>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          {t('auth.logout')}
        </Button>
      </div>
    </aside>
  );
}
