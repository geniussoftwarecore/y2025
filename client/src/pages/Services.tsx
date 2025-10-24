import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Search, Plus, Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Service, SparePart, Specialization } from '@shared/schema';

interface ServiceForm {
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price: string;
  durationMinutes: string;
}

interface PartForm {
  nameAr: string;
  nameEn: string;
  unitPrice: string;
}

export default function Services() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isPartDialogOpen, setIsPartDialogOpen] = useState(false);

  const { register: registerService, handleSubmit: handleServiceSubmit, reset: resetService } = useForm<ServiceForm>({
    defaultValues: {
      nameAr: '',
      nameEn: '',
      descAr: '',
      descEn: '',
      price: '0',
      durationMinutes: '60',
    },
  });

  const { register: registerPart, handleSubmit: handlePartSubmit, reset: resetPart } = useForm<PartForm>({
    defaultValues: {
      nameAr: '',
      nameEn: '',
      unitPrice: '0',
    },
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/catalog/services'],
  });

  const { data: parts = [], isLoading: partsLoading } = useQuery<SparePart[]>({
    queryKey: ['/api/catalog/parts'],
  });

  const { data: specializations = [], isLoading: specializationsLoading } = useQuery<Specialization[]>({
    queryKey: ['/api/catalog/specializations'],
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceForm) => {
      return apiRequest('/api/catalog/services', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: data.nameAr,
          nameEn: data.nameEn,
          descAr: data.descAr,
          descEn: data.descEn,
          price: Number(data.price),
          durationMinutes: Number(data.durationMinutes),
          isActive: true,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/catalog/services'] });
      toast({
        title: 'Success',
        description: 'Service created successfully',
      });
      setIsServiceDialogOpen(false);
      resetService();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create service',
        variant: 'destructive',
      });
    },
  });

  // Create part mutation
  const createPartMutation = useMutation({
    mutationFn: async (data: PartForm) => {
      return apiRequest('/api/catalog/parts', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: data.nameAr,
          nameEn: data.nameEn,
          unitPrice: Number(data.unitPrice),
          isActive: true,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/catalog/parts'] });
      toast({
        title: 'Success',
        description: 'Spare part created successfully',
      });
      setIsPartDialogOpen(false);
      resetPart();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create part',
        variant: 'destructive',
      });
    },
  });

  const onServiceSubmit = (data: ServiceForm) => {
    createServiceMutation.mutate(data);
  };

  const onPartSubmit = (data: PartForm) => {
    createPartMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">{t('services.title')}</h1>
          <p className="text-muted-foreground">Manage services, parts, and specializations</p>
        </div>
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList>
          <TabsTrigger value="services" data-testid="tab-services">{t('services.services')}</TabsTrigger>
          <TabsTrigger value="parts" data-testid="tab-parts">{t('services.spareParts')}</TabsTrigger>
          <TabsTrigger value="specializations" data-testid="tab-specializations">{t('services.specializations')}</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-services"
              />
            </div>
            <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-service">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('services.addService')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleServiceSubmit(onServiceSubmit)}>
                  <DialogHeader>
                    <DialogTitle>{t('services.addService')}</DialogTitle>
                    <DialogDescription>Add a new service to the catalog</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>{t('services.nameAr')}</Label>
                        <Input {...registerService('nameAr', { required: true })} placeholder={t('services.nameAr')} data-testid="input-service-name-ar" />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t('services.nameEn')}</Label>
                        <Input {...registerService('nameEn', { required: true })} placeholder={t('services.nameEn')} data-testid="input-service-name-en" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>{t('services.descAr')}</Label>
                        <Textarea {...registerService('descAr')} placeholder={t('services.descAr')} data-testid="textarea-service-desc-ar" />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t('services.descEn')}</Label>
                        <Textarea {...registerService('descEn')} placeholder={t('services.descEn')} data-testid="textarea-service-desc-en" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>{t('services.price')}</Label>
                        <Input {...registerService('price', { required: true })} type="number" step="0.01" placeholder="0.00" data-testid="input-service-price" />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t('services.duration')}</Label>
                        <Input {...registerService('durationMinutes', { required: true })} type="number" placeholder="60" data-testid="input-service-duration" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsServiceDialogOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={createServiceMutation.isPending} data-testid="button-save-service">
                      {createServiceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('common.save')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              {servicesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : services.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('services.nameEn')}</TableHead>
                      <TableHead>{t('services.nameAr')}</TableHead>
                      <TableHead>{t('services.price')}</TableHead>
                      <TableHead>{t('services.duration')}</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id} data-testid={`row-service-${service.id}`}>
                        <TableCell>{service.nameEn}</TableCell>
                        <TableCell>{service.nameAr}</TableCell>
                        <TableCell>${service.price}</TableCell>
                        <TableCell>{service.durationMinutes} min</TableCell>
                        <TableCell>
                          <Badge variant={service.isActive ? 'default' : 'secondary'}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No services found. Add your first service to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parts" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search spare parts..."
                className="pl-10"
                data-testid="input-search-parts"
              />
            </div>
            <Dialog open={isPartDialogOpen} onOpenChange={setIsPartDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-part">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Part
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handlePartSubmit(onPartSubmit)}>
                  <DialogHeader>
                    <DialogTitle>Add Spare Part</DialogTitle>
                    <DialogDescription>Add a new spare part to the catalog</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Name (Arabic)</Label>
                        <Input {...registerPart('nameAr', { required: true })} placeholder="اسم القطعة" data-testid="input-part-name-ar" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Name (English)</Label>
                        <Input {...registerPart('nameEn', { required: true })} placeholder="Part name" data-testid="input-part-name-en" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Unit Price</Label>
                      <Input {...registerPart('unitPrice', { required: true })} type="number" placeholder="0.00" data-testid="input-part-price" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsPartDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createPartMutation.isPending} data-testid="button-save-part">
                      {createPartMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              {partsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : parts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name (English)</TableHead>
                      <TableHead>Name (Arabic)</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parts.map((part) => (
                      <TableRow key={part.id} data-testid={`row-part-${part.id}`}>
                        <TableCell>{part.nameEn}</TableCell>
                        <TableCell>{part.nameAr}</TableCell>
                        <TableCell>${part.unitPrice}</TableCell>
                        <TableCell>
                          <Badge variant={part.isActive ? 'default' : 'secondary'}>
                            {part.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No spare parts found. Add your first part to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specializations" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {specializationsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : specializations && specializations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name (English)</TableHead>
                      <TableHead>Name (Arabic)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specializations.map((spec) => (
                      <TableRow key={spec.id} data-testid={`row-spec-${spec.id}`}>
                        <TableCell className="font-medium">{spec.code}</TableCell>
                        <TableCell>{spec.nameEn}</TableCell>
                        <TableCell>{spec.nameAr}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No specializations found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
