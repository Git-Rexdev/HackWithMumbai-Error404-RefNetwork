import React, { useState } from 'react';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { Monitor, Moon, Sun, Check } from 'lucide-react';
import { Button } from '../ui/button';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    icon: Sun,
    description: 'Light mode'
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon,
    description: 'Dark mode'
  },
  {
    value: 'system',
    label: 'System',
    icon: Monitor,
    description: 'Follow system preference'
  }
];

const getIconForTheme = (theme: Theme) => {
  switch (theme) {
    case 'light':
      return <Sun className="h-4 w-4" />;
    case 'dark':
      return <Moon className="h-4 w-4" />;
    case 'system':
      return <Monitor className="h-4 w-4" />;
    default:
      return <Sun className="h-4 w-4" />;
  }
};

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentThemeOption = themeOptions.find(option => option.value === theme);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-background hover:bg-accent"
      >
        {getIconForTheme(theme)}
        <span className="hidden sm:inline">{currentThemeOption?.label}</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg z-50 p-1">
            <div className="p-2 border-b border-border">
              <h3 className="font-medium text-sm text-foreground">Choose theme</h3>
            </div>
            
            <div className="p-1">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm
                    hover:bg-accent hover:text-accent-foreground
                    ${theme === option.value ? 'bg-accent text-accent-foreground' : 'text-foreground'}
                  `}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {getIconForTheme(option.value)}
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </div>
                  {theme === option.value && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};