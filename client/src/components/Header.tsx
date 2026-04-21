import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from 'wouter';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const logoUrl = `${import.meta.env.BASE_URL}logo-cturismo.png`;

  return (
    <header className="cturismo-header sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation('/')}>
          <img src={logoUrl} alt="CTURISMO" className="h-12 w-auto" />
          <span className="text-xl font-bold text-[#0B7D4A] hidden sm:inline">CTURISMO</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-400">Olá, {user?.email}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 dark:border-border dark:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setLocation('/login')}
              className="cturismo-button-primary"
              size="sm"
            >
              Entrar
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Theme Toggle Mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5 dark:text-foreground" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-border bg-white dark:bg-card">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-400">Olá, {user?.email}</span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start dark:border-border dark:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setLocation('/login');
                  setMobileMenuOpen(false);
                }}
                className="cturismo-button-primary w-full"
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
