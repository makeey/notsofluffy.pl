'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTheme } from '@/components/theme-provider';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Theme Settings</DialogTitle>
          <DialogDescription>
            Choose your preferred theme. The theme will be applied immediately and saved for your next visit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="light"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={() => setTheme('light')}
                className="w-4 h-4 text-primary bg-background border-border focus:ring-ring focus:ring-2"
              />
              <label htmlFor="light" className="flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="dark"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={() => setTheme('dark')}
                className="w-4 h-4 text-primary bg-background border-border focus:ring-ring focus:ring-2"
              />
              <label htmlFor="dark" className="flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="system"
                name="theme"
                value="system"
                checked={theme === 'system'}
                onChange={() => setTheme('system')}
                className="w-4 h-4 text-primary bg-background border-border focus:ring-ring focus:ring-2"
              />
              <label htmlFor="system" className="flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                <div className="h-4 w-4 flex">
                  <Sun className="h-2 w-2" />
                  <Moon className="h-2 w-2" />
                </div>
                <span>System</span>
              </label>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {theme === 'system' && (
              <p>Using system preference (automatically switches based on your device settings)</p>
            )}
            {theme === 'light' && (
              <p>Light theme provides a clean, bright interface ideal for daytime use</p>
            )}
            {theme === 'dark' && (
              <p>Dark theme reduces eye strain and saves battery on OLED displays</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}