import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ReportOverview {
  totalOrders: number;
  completedOrders: number;
  totalUsers: number;
  activeEngineers: number;
}

export default function Reports() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState('monthly');

  // Fetch overview data
  const { data: overview, isLoading: isLoadingOverview, error: overviewError } = useQuery<ReportOverview>({
    queryKey: ['/api/reports/overview'],
  });

  // Sample data for charts (to be replaced with real API data)
  const revenueData = [
    { month: 'Jan', revenue: 4200, orders: 12 },
    { month: 'Feb', revenue: 5100, orders: 15 },
    { month: 'Mar', revenue: 6800, orders: 19 },
    { month: 'Apr', revenue: 5900, orders: 17 },
    { month: 'May', revenue: 7200, orders: 21 },
    { month: 'Jun', revenue: 8100, orders: 24 },
  ];

  const engineerData = [
    { name: 'Ahmed Ali', completed: 45, avgTime: 2.3 },
    { name: 'Mohammed Hassan', completed: 38, avgTime: 2.8 },
    { name: 'Khalid Ibrahim', completed: 42, avgTime: 2.1 },
    { name: 'Omar Saleh', completed: 35, avgTime: 3.2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">{t('reports.title')}</h1>
          <p className="text-muted-foreground">Analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" data-testid="button-export-pdf">
            <FileText className="mr-2 h-4 w-4" />
            {t('reports.exportPDF')}
          </Button>
          <Button variant="outline" size="sm" data-testid="button-export-excel">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {t('reports.exportExcel')}
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]" data-testid="select-date-range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">{t('reports.daily')}</SelectItem>
            <SelectItem value="monthly">{t('reports.monthly')}</SelectItem>
            <SelectItem value="quarterly">{t('reports.quarterly')}</SelectItem>
            <SelectItem value="yearly">{t('reports.yearly')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="engineer" data-testid="tab-engineer">{t('reports.engineerPerformance')}</TabsTrigger>
          <TabsTrigger value="sales" data-testid="tab-sales">{t('reports.salesPerformance')}</TabsTrigger>
          <TabsTrigger value="parts" data-testid="tab-parts">{t('reports.partUsage')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          {overviewError && (
            <Card className="col-span-full">
              <CardContent className="pt-6">
                <p className="text-sm text-destructive">Failed to load overview data. Please try again later.</p>
              </CardContent>
            </Card>
          )}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('reports.totalOrders')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOverview ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-semibold" data-testid="text-total-orders">
                    {overview?.totalOrders || 0}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('reports.completedOrders')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOverview ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-semibold" data-testid="text-completed-orders">
                    {overview?.completedOrders || 0}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('reports.totalUsers')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOverview ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-semibold" data-testid="text-total-users">
                    {overview?.totalUsers || 0}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('reports.activeEngineers')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOverview ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-semibold" data-testid="text-active-engineers">
                    {overview?.activeEngineers || 0}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.totalRevenue')}</CardTitle>
                <CardDescription>Monthly revenue and order trends</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('reports.completedOrders')}</CardTitle>
                <CardDescription>Work orders completed per month</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engineer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.engineerPerformance')}</CardTitle>
              <CardDescription>Work order completion statistics by engineer</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={engineerData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={150} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center space-y-2">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium">Sales Performance</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Sales analytics including revenue by sales person, conversion rates, and customer acquisition metrics.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parts" className="space-y-6">
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center space-y-2">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium">Part Usage Statistics</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Track spare part consumption, inventory levels, and popular parts across all work orders.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
