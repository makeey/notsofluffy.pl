'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/theme-provider';
import type { Theme } from '@/components/theme-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, Monitor, AlertTriangle, Globe, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient, SiteSetting, ShippingProvider } from '@/lib/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([]);
  const [shippingProviders, setShippingProviders] = useState<ShippingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchShippingProviders();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSettings();
      setSiteSettings(response.settings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShippingProviders = async () => {
    try {
      const response = await apiClient.getShippingProviders();
      setShippingProviders(response.providers);
    } catch (error) {
      console.error('Failed to fetch shipping providers:', error);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      setUpdating(key);
      await apiClient.updateSetting(key, value);
      await fetchSettings(); // Refresh settings
      await fetchShippingProviders(); // Refresh shipping data
    } catch (error) {
      console.error('Failed to update setting:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getSettingValue = (key: string): string => {
    const setting = siteSettings.find(s => s.key === key);
    return setting?.value || '';
  };

  const isMaintenanceMode = getSettingValue('maintenance_mode') === 'true';

  const themeOptions = [
    {
      value: 'light',
      label: 'Light',
      description: 'Clean, bright interface ideal for daytime use',
      icon: Sun,
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Reduces eye strain and saves battery on OLED displays',
      icon: Moon,
    },
    {
      value: 'system',
      label: 'System',
      description: 'Automatically switches based on your device settings',
      icon: Monitor,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences and account settings</p>
      </div>

      <div className="grid gap-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the interface looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Theme</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Choose your preferred theme. The theme will be applied immediately and saved for your next visit.
              </p>
              
              <div className="grid gap-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent ${
                        theme === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                      onClick={() => setTheme(option.value as Theme)}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <input
                          type="radio"
                          name="theme"
                          value={option.value}
                          checked={theme === option.value}
                          onChange={() => setTheme(option.value as Theme)}
                          className="w-4 h-4 text-primary bg-background border-border focus:ring-ring focus:ring-2"
                        />
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium text-foreground">
                            {option.label}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Site Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Site Management
            </CardTitle>
            <CardDescription>
              Control site-wide settings and maintenance mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground mb-4">
                When enabled, the site will display a &quot;Coming Soon&quot; page to all visitors except admins.
              </p>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={`h-5 w-5 ${isMaintenanceMode ? 'text-orange-500' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="font-medium">
                      {isMaintenanceMode ? 'Maintenance Mode Active' : 'Site Online'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isMaintenanceMode 
                        ? 'Only admins can access the site' 
                        : 'Site is available to all visitors'
                      }
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => updateSetting('maintenance_mode', isMaintenanceMode ? 'false' : 'true')}
                  disabled={updating === 'maintenance_mode' || loading}
                  variant={isMaintenanceMode ? 'default' : 'outline'}
                  className={isMaintenanceMode ? 'bg-orange-500 hover:bg-orange-600' : ''}
                >
                  {updating === 'maintenance_mode' 
                    ? 'Updating...' 
                    : isMaintenanceMode 
                      ? 'Disable Maintenance' 
                      : 'Enable Maintenance'
                  }
                </Button>
              </div>
              
              {isMaintenanceMode && (
                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-800 dark:text-orange-200">
                        Maintenance Mode is Active
                      </p>
                      <p className="text-orange-700 dark:text-orange-300 mt-1">
                        All visitors will see the &quot;Coming Soon&quot; page. Only administrators can access the site normally.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Settings
            </CardTitle>
            <CardDescription>
              Configure shipping providers and delivery costs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {shippingProviders.map((provider) => (
              <div key={provider.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{provider.name}</Label>
                    <p className="text-sm text-muted-foreground">
                      Configure pricing and availability for {provider.name} delivery
                    </p>
                  </div>
                  <Switch
                    checked={provider.enabled}
                    onCheckedChange={(checked) => 
                      updateSetting(`shipping_${provider.id}_enabled`, checked.toString())
                    }
                    disabled={updating === `shipping_${provider.id}_enabled`}
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor={`cost_${provider.id}`} className="text-sm font-medium">
                      Delivery Cost (PLN)
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id={`cost_${provider.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={provider.cost.toString()}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          // Only update if it's a valid number
                          if (newValue && !isNaN(parseFloat(newValue))) {
                            updateSetting(`shipping_${provider.id}_cost`, newValue);
                          }
                        }}
                        disabled={updating === `shipping_${provider.id}_cost`}
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">PLN</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {shippingProviders.length === 0 && !loading && (
              <div className="text-center py-4 text-muted-foreground">
                No shipping providers configured
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your account details and basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Role</Label>
                <p className="text-sm text-muted-foreground mt-1 capitalize">{user?.role}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Account Created</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Updated</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Information */}
        <Card>
          <CardHeader>
            <CardTitle>Application</CardTitle>
            <CardDescription>
              Information about this application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Version</Label>
                <p className="text-sm text-muted-foreground mt-1">1.0.0</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Features</Label>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• User Management</li>
                  <li>• Image Upload & Management</li>
                  <li>• Role-based Access Control</li>
                  <li>• Theme Customization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}