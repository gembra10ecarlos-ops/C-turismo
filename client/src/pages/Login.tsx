import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/Header';

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const logoUrl = `${import.meta.env.BASE_URL}logo-cturismo.png`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simular delay de login
    setTimeout(() => {
      if (login(email, password)) {
        setLocation('/');
      } else {
        setError('Email ou senha incorretos. Use a senha do administrador.');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="cturismo-card p-8 shadow-2xl">
            <div className="text-center mb-8">
              <img src={logoUrl} alt="CTURISMO" className="h-20 w-auto mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-[#0B7D4A] dark:text-foreground">Acesso ao Sistema</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Entre com suas credenciais de administrador</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ex: seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ex: Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="cturismo-button-primary w-full py-2 text-lg font-semibold"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Dica:</strong> Use qualquer email e a senha do administrador para acessar o sistema.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Primeira vez?{' '}
                <Button
                  variant="link"
                  className="text-[#0B7D4A] hover:text-[#065A38] p-0 h-auto font-semibold"
                  onClick={() => setLocation('/')}
                >
                  Voltar para home
                </Button>
              </p>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="mt-8 text-center text-white text-sm opacity-80">
            <p>CTURISMO © 2024 - Sistema de Gerenciamento de Clientes</p>
          </div>
        </div>
      </div>
    </>
  );
}
