import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  return (
    <header className="cturismo-header sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation('/')}>
          <img src="/logo-cturismo.png" alt="CTURISMO" className="h-12 w-auto" />
          <span className="text-xl font-bold text-[#0B7D4A] hidden sm:inline">CTURISMO</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600">Olá, {user?.email}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
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
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">Olá, {user?.email}</span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
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
