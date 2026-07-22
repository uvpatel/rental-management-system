'use client';

import { useState } from 'react';
import { useRentalStore } from '@/hooks/use-rental-store';
import { SiteHeaderNav } from '@/components/layout/site-header-nav';
import { toast } from 'sonner';
import {
  Settings,
  Building,
  Percent,
  Clock,
  ShieldCheck,
  Users,
  Plus,
  Trash2,
  Save
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
  const store = useRentalStore();
  const settings = store.getSettings();
  const users = store.getUsers();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [gstin, setGstin] = useState(settings.gstin);
  const [gstPercentage, setGstPercentage] = useState(settings.gstPercentage);
  const [securityDepositPercentage, setSecurityDepositPercentage] = useState(settings.securityDepositPercentage);
  const [lateFeeMultiplier, setLateFeeMultiplier] = useState(settings.lateFeeHourlyRateMultiplier);

  const [newCategory, setNewCategory] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings({
      companyName,
      gstin,
      gstPercentage,
      securityDepositPercentage,
      lateFeeHourlyRateMultiplier: lateFeeMultiplier
    });
    toast.success('System Configuration & ERP Settings updated successfully!');
  };

  const handleAddCategory = () => {
    if (!newCategory) return;
    if (settings.productCategories.includes(newCategory)) {
      toast.error('Category already exists.');
      return;
    }
    store.updateSettings({
      productCategories: [...settings.productCategories, newCategory]
    });
    setNewCategory('');
    toast.success(`Added category "${newCategory}"`);
  };

  const handleRemoveCategory = (cat: string) => {
    store.updateSettings({
      productCategories: settings.productCategories.filter((c) => c !== cat)
    });
    toast.info(`Removed category "${cat}"`);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans">
      <SiteHeaderNav />

      <main className="container max-w-5xl mx-auto py-8 px-4 flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">System Settings & Configuration</h1>
          <p className="text-xs text-muted-foreground">
            Configure global rental rules, tax rates, late fee penalty logic, product attributes, and user roles.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Company & GST Settings */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-600" /> Organization & Tax Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Legal Company Name</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label>Company GSTIN (Mandatory)</Label>
                  <Input value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} className="font-mono uppercase font-semibold" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>GST Tax Rate (%)</Label>
                  <Input type="number" value={gstPercentage} onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)} required />
                </div>
                <div className="space-y-1">
                  <Label>Default Security Deposit (%)</Label>
                  <Input type="number" value={securityDepositPercentage} onChange={(e) => setSecurityDepositPercentage(parseFloat(e.target.value) || 0)} required />
                </div>
                <div className="space-y-1">
                  <Label>Late Fee Hourly Multiplier</Label>
                  <Input type="number" step="0.1" value={lateFeeMultiplier} onChange={(e) => setLateFeeMultiplier(parseFloat(e.target.value) || 1.5)} required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Categories */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-600" /> Product Categories & Taxonomy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex gap-2">
                <Input
                  placeholder="New category name (e.g., Drones & Robotics)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="text-xs h-9 max-w-md"
                />
                <Button type="button" onClick={handleAddCategory} className="bg-purple-600 text-white h-9 text-xs gap-1">
                  <Plus className="w-4 h-4" /> Add Category
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {settings.productCategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="px-3 py-1 text-xs gap-2">
                    {cat}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Role Overview */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" /> System Registered Users & Roles ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs">
              <div className="divide-y border rounded-lg overflow-hidden">
                {users.map((usr) => (
                  <div key={usr.id} className="p-3 flex items-center justify-between bg-white dark:bg-slate-900">
                    <div>
                      <p className="font-bold">{usr.name}</p>
                      <p className="text-[10px] text-muted-foreground">{usr.email} | {usr.companyName || 'Independent'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-purple-600">GST: {usr.gstin || 'N/A'}</span>
                      <Badge className={usr.role === 'admin' ? 'bg-emerald-600' : usr.role === 'vendor' ? 'bg-indigo-600' : 'bg-slate-700'}>
                        {usr.role.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-2 py-5 px-6">
            <Save className="w-4 h-4" /> Save System Configurations
          </Button>
        </form>
      </main>
    </div>
  );
}
