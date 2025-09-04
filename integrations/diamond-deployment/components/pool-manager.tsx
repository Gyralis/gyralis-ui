'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { usePool } from '../hooks';
import type { Pool, CreatePoolRequest, Organization } from '../utils/types';

interface PoolManagerProps {
  className?: string;
  selectedOrganization?: Organization | null;
}

export function PoolManager({ className, selectedOrganization }: PoolManagerProps) {
  const pool = usePool();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);

  // Auto-load pools when organization changes
  useEffect(() => {
    if (selectedOrganization?.id && !pool.loading) {
      pool.listPools(selectedOrganization.id).catch(console.error);
    }
  }, [selectedOrganization?.id]);

  const handleCreatePool = async (data: CreatePoolRequest) => {
    try {
      await pool.createPool(data);
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create pool:', error);
    }
  };

  const handleUpdatePool = async (id: string, data: Partial<CreatePoolRequest>) => {
    try {
      await pool.updatePool(id, data);
      setEditDialogOpen(false);
      setEditingPool(null);
    } catch (error) {
      console.error('Failed to update pool:', error);
    }
  };

  const handleDeletePool = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este pool?')) return;
    
    try {
      await pool.deletePool(id);
    } catch (error) {
      console.error('Failed to delete pool:', error);
    }
  };

  if (!selectedOrganization) {
    return (
      <Card className={className}>
        <CardContent className="flex h-32 items-center justify-center">
          <p className="text-muted-foreground">
            Selecciona una organización para ver sus pools
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pools Manager</CardTitle>
            <p className="text-sm text-muted-foreground">
              Organización: {selectedOrganization.metadata?.name || 'Sin nombre'}
            </p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Crear Pool</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Pool</DialogTitle>
              </DialogHeader>
              <CreatePoolForm 
                organizationId={selectedOrganization.id}
                onSubmit={handleCreatePool}
                loading={pool.loading}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {pool.error && (
            <Alert className="mb-4">
              <AlertDescription>{pool.error}</AlertDescription>
            </Alert>
          )}

          {pool.loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              {pool.pools.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No hay pools para esta organización
                </p>
              ) : (
                pool.pools.map((poolItem) => (
                  <Card key={poolItem.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {poolItem.metadata?.name || 'Pool sin nombre'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {poolItem.contract_address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {poolItem.id}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPool(poolItem);
                            setEditDialogOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePool(poolItem.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pool</DialogTitle>
          </DialogHeader>
          {editingPool && (
            <EditPoolForm
              pool={editingPool}
              onSubmit={(data) => handleUpdatePool(editingPool.id, data)}
              loading={pool.loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Pool Form Component
function CreatePoolForm({ 
  organizationId, 
  onSubmit, 
  loading 
}: {
  organizationId: string;
  onSubmit: (data: CreatePoolRequest) => Promise<void>;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    contract_address: '',
    name: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contract_address.trim()) {
      alert('Contract address es requerido');
      return;
    }

    await onSubmit({
      organization_id: organizationId,
      contract_address: formData.contract_address.trim(),
      metadata: {
        name: formData.name.trim() || 'Pool sin nombre',
        description: formData.description.trim() || ''
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="contract_address">Contract Address</Label>
        <Input
          id="contract_address"
          value={formData.contract_address}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            contract_address: e.target.value 
          }))}
          placeholder="0x..."
          required
        />
      </div>

      <div>
        <Label htmlFor="name">Nombre del Pool</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            name: e.target.value 
          }))}
          placeholder="Mi Pool"
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            description: e.target.value 
          }))}
          placeholder="Descripción del pool..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Pool'}
      </Button>
    </form>
  );
}

// Edit Pool Form Component  
function EditPoolForm({
  pool,
  onSubmit,
  loading
}: {
  pool: Pool;
  onSubmit: (data: Partial<CreatePoolRequest>) => Promise<void>;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: pool.metadata?.name || '',
    description: pool.metadata?.description || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await onSubmit({
      metadata: {
        ...pool.metadata,
        name: formData.name.trim() || 'Pool sin nombre',
        description: formData.description.trim() || ''
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit_name">Nombre del Pool</Label>
        <Input
          id="edit_name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            name: e.target.value 
          }))}
          placeholder="Mi Pool"
        />
      </div>

      <div>
        <Label htmlFor="edit_description">Descripción</Label>
        <Textarea
          id="edit_description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            description: e.target.value 
          }))}
          placeholder="Descripción del pool..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </form>
  );
}