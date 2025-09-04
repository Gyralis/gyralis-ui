'use client'

// Organization Manager Component

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useOrganization,
  useOrganizationSelection
} from '../hooks';
import type { Organization, CreateOrganizationRequest } from '../utils/types';

interface OrganizationManagerProps {
  className?: string;
  onOrganizationSelect?: (organization: Organization | null) => void;
}

/**
 * Organization Manager Component
 * 
 * Provides a complete interface for managing blockchain organizations.
 * Includes listing, creating, editing, and deleting organizations.
 */
export function OrganizationManager({ className, onOrganizationSelect }: OrganizationManagerProps) {
  // Hook integrations
  const organization = useOrganization();
  const selection = useOrganizationSelection(organization.organizations);

  // Local state for forms
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  // Notify parent component of selection changes
  React.useEffect(() => {
    onOrganizationSelect?.(selection.selectedOrganization);
  }, [selection.selectedOrganization, onOrganizationSelect]);

  // Auto-load organizations on mount
  React.useEffect(() => {
    if (organization.organizations.length === 0 && !organization.loading) {
      organization.listOrganizations().catch(console.error);
    }
  }, [organization.organizations.length, organization.loading, organization.listOrganizations]);

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setEditDialogOpen(true);
  };

  const handleDelete = async (org: Organization) => {
    if (confirm(`Are you sure you want to delete organization "${org.metadata?.name || org.contract_address}"?`)) {
      try {
        await organization.deleteOrganization(org.id);
        if (selection.selectedOrganization?.id === org.id) {
          selection.clearSelection();
        }
      } catch (error) {
        console.error('Failed to delete organization:', error);
      }
    }
  };

  // Organization Card Component
  const OrganizationCard = ({ org }: { org: Organization }) => (
    <Card 
      className={`cursor-pointer transition-all ${
        selection.isSelected(org.id) ? 'ring-2 ring-primary' : 'hover:shadow-md'
      }`}
      onClick={() => selection.selectOrganization(
        selection.isSelected(org.id) ? null : org
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">
              {org.metadata?.name || 'Unnamed Organization'}
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              {org.contract_address}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(org);
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(org);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      {org.metadata?.description && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            {org.metadata.description}
          </p>
        </CardContent>
      )}
    </Card>
  );

  // Create Organization Form
  const CreateOrganizationForm = () => {
    const [formData, setFormData] = useState<CreateOrganizationRequest>({
      contract_address: '',
      metadata: { name: '', description: '' }
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        await organization.createOrganization(formData);
        setCreateDialogOpen(false);
        setFormData({
          contract_address: '',
          metadata: { name: '', description: '' }
        });
      } catch (error) {
        console.error('Failed to create organization:', error);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
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
        
        <div className="space-y-2">
          <Label htmlFor="name">Organization Name</Label>
          <Input
            id="name"
            value={formData.metadata?.name || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              metadata: { ...prev.metadata, name: e.target.value }
            }))}
            placeholder="My Organization"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.metadata?.description || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              metadata: { ...prev.metadata, description: e.target.value }
            }))}
            placeholder="Organization description..."
            rows={3}
          />
        </div>
        
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting || !formData.contract_address}>
            {submitting ? 'Creating...' : 'Create Organization'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setCreateDialogOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  };

  // Edit Organization Form
  const EditOrganizationForm = () => {
    const [formData, setFormData] = useState({
      metadata: editingOrg?.metadata || {}
    });
    const [submitting, setSubmitting] = useState(false);

    React.useEffect(() => {
      if (editingOrg) {
        setFormData({ metadata: editingOrg.metadata || {} });
      }
    }, [editingOrg]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingOrg) return;

      setSubmitting(true);

      try {
        await organization.updateOrganization(editingOrg.id, formData);
        setEditDialogOpen(false);
        setEditingOrg(null);
      } catch (error) {
        console.error('Failed to update organization:', error);
      } finally {
        setSubmitting(false);
      }
    };

    if (!editingOrg) return null;

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Contract Address</Label>
          <Input value={editingOrg.contract_address} disabled />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit_name">Organization Name</Label>
          <Input
            id="edit_name"
            value={formData.metadata?.name || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              metadata: { ...prev.metadata, name: e.target.value }
            }))}
            placeholder="My Organization"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit_description">Description</Label>
          <Textarea
            id="edit_description"
            value={formData.metadata?.description || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              metadata: { ...prev.metadata, description: e.target.value }
            }))}
            placeholder="Organization description..."
            rows={3}
          />
        </div>
        
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Organization'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditDialogOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">🏢 Organizations</h2>
            <p className="text-muted-foreground">
              Manage blockchain organizations and their contracts
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => organization.refresh()} variant="outline">
              Refresh
            </Button>
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>Create Organization</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Organization</DialogTitle>
                  <DialogDescription>
                    Create a new blockchain organization with contract address
                  </DialogDescription>
                </DialogHeader>
                <CreateOrganizationForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Error Display */}
        {organization.error && (
          <Alert variant="destructive">
            <AlertDescription>{organization.error}</AlertDescription>
          </Alert>
        )}

        {/* Selected Organization Info */}
        {selection.selectedOrganization && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✅ Selected Organization
                <Badge>{selection.selectedOrganization.metadata?.name || 'Unnamed'}</Badge>
              </CardTitle>
              <CardDescription>
                Contract: {selection.selectedOrganization.contract_address}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Organizations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Organizations ({organization.organizations.length})
            </h3>
            {selection.selectedOrganization && (
              <Button variant="outline" onClick={selection.clearSelection}>
                Clear Selection
              </Button>
            )}
          </div>

          {/* Loading State */}
          {organization.loading && organization.organizations.length === 0 && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!organization.loading && organization.organizations.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="mb-4 text-muted-foreground">
                  No organizations found. Create your first organization to get started.
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  Create Organization
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Organizations Grid */}
          {organization.organizations.length > 0 && (
            <div className="grid gap-4">
              {organization.organizations.map((org) => (
                <OrganizationCard key={org.id} org={org} />
              ))}
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Organization</DialogTitle>
              <DialogDescription>
                Update organization metadata and settings
              </DialogDescription>
            </DialogHeader>
            <EditOrganizationForm />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}