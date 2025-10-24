import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Eye, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { WorkOrder, User, Service } from '@shared/schema';
import { format } from 'date-fns';

interface CreateWorkOrderForm {
  customerId: string;
  serviceId: string;
  vehicleIdent: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  problemDesc: string;
}

export default function WorkOrders() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm<CreateWorkOrderForm>({
    defaultValues: {
      customerId: '',
      serviceId: '',
      vehicleIdent: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: new Date().getFullYear().toString(),
      problemDesc: '',
    },
  });

  const customerId = watch('customerId');
  const serviceId = watch('serviceId');

  // Fetch work orders
  const { data: workOrders = [], isLoading } = useQuery<WorkOrder[]>({
    queryKey: ['/api/work/orders'],
  });

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    select: (users) => users.filter(u => u.role === 'customer'),
  });

  // Fetch services for dropdown
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/catalog/services'],
  });

  // Fetch engineers for assignment
  const { data: engineers = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    select: (users) => users.filter(u => u.role === 'engineer'),
  });

  // Create work order mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateWorkOrderForm) => {
      return apiRequest('POST', '/api/work/orders', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work/orders'] });
      toast({
        title: 'Success',
        description: 'Work order created successfully',
      });
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create work order',
        variant: 'destructive',
      });
    },
  });

  // Assign engineer mutation
  const assignMutation = useMutation({
    mutationFn: async ({ orderId, engineerId }: { orderId: string; engineerId: string }) => {
      return apiRequest('PATCH', `/api/work/orders/${orderId}/assign`, { assignedEngineerId: engineerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work/orders'] });
      toast({
        title: 'Success',
        description: 'Engineer assigned successfully',
      });
    },
  });

  // Start work order mutation
  const startMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return apiRequest('PATCH', `/api/work/orders/${orderId}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work/orders'] });
      toast({
        title: 'Success',
        description: 'Work order started',
      });
    },
  });

  // Finish work order mutation
  const finishMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return apiRequest('PATCH', `/api/work/orders/${orderId}/finish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work/orders'] });
      toast({
        title: 'Success',
        description: 'Work order marked as done',
      });
    },
  });

  // Deliver work order mutation
  const deliverMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return apiRequest('PATCH', `/api/work/orders/${orderId}/deliver`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work/orders'] });
      toast({
        title: 'Success',
        description: 'Work order delivered',
      });
    },
  });

  const onSubmit = (data: CreateWorkOrderForm) => {
    createMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      new: 'secondary',
      assigned: 'default',
      in_progress: 'default',
      done: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    };
    return variants[status] || 'default';
  };

  const filteredOrders = workOrders.filter(order => 
    order.vehicleIdent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.vehicleMake?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.vehicleModel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canAssign = user?.role === 'admin' || user?.role === 'supervisor';
  const canStart = user?.role === 'engineer';
  const canDeliver = user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'sales';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">{t('workOrders.title')}</h1>
          <p className="text-muted-foreground">Manage work orders and track progress</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'sales') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-work-order">
                <Plus className="mr-2 h-4 w-4" />
                {t('workOrders.createOrder')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>{t('workOrders.createOrder')}</DialogTitle>
                  <DialogDescription>Create a new work order</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>{t('workOrders.customer')}</Label>
                    <Select value={customerId} onValueChange={(value) => setValue('customerId', value)}>
                      <SelectTrigger data-testid="select-customer">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label>{t('workOrders.vehicleIdent')}</Label>
                      <Input {...register('vehicleIdent', { required: true })} placeholder="VIN/Plate" data-testid="input-vehicle-ident" />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('workOrders.vehicleMake')}</Label>
                      <Input {...register('vehicleMake', { required: true })} placeholder="Toyota" data-testid="input-vehicle-make" />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('workOrders.vehicleModel')}</Label>
                      <Input {...register('vehicleModel', { required: true })} placeholder="Camry" data-testid="input-vehicle-model" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('workOrders.service')}</Label>
                    <Select value={serviceId} onValueChange={(value) => setValue('serviceId', value)}>
                      <SelectTrigger data-testid="select-service">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.nameEn} - {service.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('workOrders.notes')}</Label>
                    <Input {...register('problemDesc')} placeholder="Additional notes..." data-testid="input-notes" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-work-order">
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('common.save')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-work-orders"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t('workOrders.vehicleIdent')}</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>{t('workOrders.opened')}</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} data-testid={`row-work-order-${order.id}`}>
                    <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                    <TableCell>{order.vehicleIdent}</TableCell>
                    <TableCell>{order.vehicleMake} {order.vehicleModel}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(order.status)} data-testid={`badge-status-${order.id}`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(order.openedAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {order.status === 'new' && canAssign && (
                          <Select onValueChange={(engineerId) => assignMutation.mutate({ orderId: order.id, engineerId })}>
                            <SelectTrigger className="w-[150px]" data-testid={`select-assign-${order.id}`}>
                              <SelectValue placeholder="Assign" />
                            </SelectTrigger>
                            <SelectContent>
                              {engineers.map((engineer) => (
                                <SelectItem key={engineer.id} value={engineer.id}>
                                  {engineer.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {order.status === 'assigned' && canStart && order.assignedEngineerId === user?.id && (
                          <Button
                            size="sm"
                            onClick={() => startMutation.mutate(order.id)}
                            disabled={startMutation.isPending}
                            data-testid={`button-start-${order.id}`}
                          >
                            Start
                          </Button>
                        )}
                        {order.status === 'in_progress' && canStart && order.assignedEngineerId === user?.id && (
                          <Button
                            size="sm"
                            onClick={() => finishMutation.mutate(order.id)}
                            disabled={finishMutation.isPending}
                            data-testid={`button-finish-${order.id}`}
                          >
                            Finish
                          </Button>
                        )}
                        {order.status === 'done' && canDeliver && (
                          <Button
                            size="sm"
                            onClick={() => deliverMutation.mutate(order.id)}
                            disabled={deliverMutation.isPending}
                            data-testid={`button-deliver-${order.id}`}
                          >
                            Deliver
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No work orders found. Create your first work order to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
