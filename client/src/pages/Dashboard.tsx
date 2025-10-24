import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const stats = [
    {
      title: t('reports.totalRevenue'),
      value: '$12,450',
      icon: DollarSign,
      description: '+12% from last month',
    },
    {
      title: t('reports.completedOrders'),
      value: '145',
      icon: ClipboardList,
      description: '+8% from last month',
    },
    {
      title: t('users.title'),
      value: '24',
      icon: Users,
      description: '5 active engineers',
    },
    {
      title: t('reports.avgCompletionTime'),
      value: '2.4h',
      icon: TrendingUp,
      description: '-0.5h from last month',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">
          {t('nav.dashboard')}
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.fullName}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} data-testid={`card-stat-${stat.title}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('workOrders.title')}</CardTitle>
            <CardDescription>Recent work orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('workOrders.noOrders')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('chat.title')}</CardTitle>
            <CardDescription>Recent messages</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('chat.noMessages')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
