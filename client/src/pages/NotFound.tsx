import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import Header from '@/components/Header';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-[#0B7D4A] opacity-20">404</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Página Não Encontrada</h2>
          <p className="text-gray-600 mb-8">
            Desculpe, a página que você está procurando não existe ou foi movida.
          </p>
          <Button
            onClick={() => setLocation('/')}
            className="cturismo-button-primary w-full"
          >
            Voltar para Home
          </Button>
        </div>
      </div>
    </>
  );
}
