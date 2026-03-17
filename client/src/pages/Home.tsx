import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import { Users, FileUp, Download, Edit3, Trash2, MapPin } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-[#0B7D4A] to-[#0E9B8A] flex items-center justify-center px-4">
          <div className="text-center text-white max-w-2xl">
            <img src="/logo-cturismo.png" alt="CTURISMO" className="h-32 w-auto mx-auto mb-8" />
            <h1 className="text-5xl font-bold mb-4">Bem-vindo ao CTURISMO</h1>
            <p className="text-xl mb-8 opacity-90">
              Sistema completo para gerenciamento de clientes e viagens
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation('/cadastro')}
                size="lg"
                className="bg-white text-[#0B7D4A] hover:bg-gray-100 font-bold text-lg"
              >
                Vamos Começar
              </Button>
              <Button
                onClick={() => setLocation('/login')}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#0B7D4A] font-bold text-lg"
              >
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#0B7D4A] mb-4">
                Dashboard de Clientes
              </h1>
              <p className="text-gray-600 text-lg">
                Gerencie seus clientes, importe dados e organize viagens
              </p>
            </div>
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="text-[#0B7D4A] border-[#0B7D4A] hover:bg-[#0B7D4A] hover:text-white"
            >
              ← Voltar
            </Button>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Cadastrar Cliente */}
            <div className="cturismo-card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-[#0B7D4A] rounded-lg mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Cadastrar Cliente</h3>
              <p className="text-gray-600 mb-4">
                Adicione novos clientes ao sistema com todos os dados necessários
              </p>
              <Button
                onClick={() => setLocation('/cadastro')}
                className="cturismo-button-primary w-full"
              >
                Novo Cadastro
              </Button>
            </div>

            {/* Importar Arquivo */}
            <div className="cturismo-card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-[#0E9B8A] rounded-lg mb-4">
                <FileUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Importar Arquivo</h3>
              <p className="text-gray-600 mb-4">
                Importe clientes de arquivos CSV ou Excel
              </p>
              <Button
                onClick={() => setLocation('/importar')}
                className="cturismo-button-secondary w-full"
              >
                Importar
              </Button>
            </div>

            {/* Gerenciar Clientes */}
            <div className="cturismo-card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-[#FFC107] rounded-lg mb-4">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Gerenciar Clientes</h3>
              <p className="text-gray-600 mb-4">
                Edite, exclua ou visualize clientes cadastrados
              </p>
              <Button
                onClick={() => setLocation('/clientes')}
                className="bg-[#FFC107] text-gray-800 hover:bg-[#FFB300] w-full font-medium"
              >
                Gerenciar
              </Button>
            </div>

            {/* Selecionar Passageiros */}
            <div className="cturismo-card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-[#004E89] rounded-lg mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Selecionar Passageiros</h3>
              <p className="text-gray-600 mb-4">
                Escolha clientes para uma viagem específica
              </p>
              <Button
                onClick={() => setLocation('/viagem')}
                className="bg-[#004E89] text-white hover:bg-[#003366] w-full font-medium"
              >
                Selecionar
              </Button>
            </div>

            {/* Exportar Lista */}
            <div className="cturismo-card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-[#FF6B35] rounded-lg mb-4">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Exportar Lista</h3>
              <p className="text-gray-600 mb-4">
                Baixe a lista de clientes em PDF com logo e horários
              </p>
              <Button
                onClick={() => setLocation('/exportar')}
                className="bg-[#FF6B35] text-white hover:bg-[#E55A2B] w-full font-medium"
              >
                Exportar
              </Button>
            </div>

            {/* Relatórios */}
            <div className="cturismo-card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-[#6B21A8] rounded-lg mb-4">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Estatísticas</h3>
              <p className="text-gray-600 mb-4">
                Visualize estatísticas e relatórios do sistema
              </p>
              <Button
                onClick={() => setLocation('/stats')}
                className="bg-[#6B21A8] text-white hover:bg-[#581C87] w-full font-medium"
              >
                Ver Estatísticas
              </Button>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-[#0B7D4A]">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sobre o Sistema</h2>
            <p className="text-gray-600 mb-4">
              O CTURISMO é um sistema completo para gerenciamento de clientes e viagens.
              Com ele você pode:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="text-[#0B7D4A] font-bold">✓</span>
                <span>Cadastrar e gerenciar clientes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#0B7D4A] font-bold">✓</span>
                <span>Importar dados de arquivos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#0B7D4A] font-bold">✓</span>
                <span>Selecionar passageiros para viagens</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#0B7D4A] font-bold">✓</span>
                <span>Exportar listas com logo e horários</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
