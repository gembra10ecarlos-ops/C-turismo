import { Button } from '@/components/ui/button';
import { useClients } from '@/contexts/ClientContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import { ArrowLeft, Users, Mail, Phone, MapPin } from 'lucide-react';

export default function Stats() {
  const { clients } = useClients();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h1>
            <p className="text-gray-600 mb-6">Você precisa fazer login para acessar esta página.</p>
            <Button onClick={() => setLocation('/login')} className="cturismo-button-primary">
              Fazer Login
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Calcular estatísticas
  const totalClients = clients.length;
  const clientsWithEmail = clients.filter((c) => c.email).length;
  const clientsWithPhone = clients.filter((c) => c.phone).length;
  const uniqueCities = new Set(clients.map((c) => c.city)).size;
  const uniqueStates = new Set(clients.map((c) => c.state)).size;

  // Clientes por cidade
  const clientsByCity = clients.reduce(
    (acc, client) => {
      if (client.city) {
        acc[client.city] = (acc[client.city] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const topCities = Object.entries(clientsByCity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Estatísticas</h1>
              <p className="text-gray-600">Visualize dados e estatísticas do sistema</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="text-[#0B7D4A] border-[#0B7D4A] hover:bg-[#0B7D4A] hover:text-white flex items-center gap-2 h-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Clientes */}
            <div className="cturismo-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Total de Clientes</h3>
                <div className="bg-[#0B7D4A] rounded-lg p-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-800">{totalClients}</p>
              <p className="text-sm text-gray-500 mt-2">Clientes cadastrados</p>
            </div>

            {/* Com Email */}
            <div className="cturismo-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Com Email</h3>
                <div className="bg-[#0E9B8A] rounded-lg p-3">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-800">{clientsWithEmail}</p>
              <p className="text-sm text-gray-500 mt-2">
                {totalClients > 0 ? Math.round((clientsWithEmail / totalClients) * 100) : 0}% do total
              </p>
            </div>

            {/* Com Telefone */}
            <div className="cturismo-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Com Telefone</h3>
                <div className="bg-[#FFC107] rounded-lg p-3">
                  <Phone className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-800">{clientsWithPhone}</p>
              <p className="text-sm text-gray-500 mt-2">
                {totalClients > 0 ? Math.round((clientsWithPhone / totalClients) * 100) : 0}% do total
              </p>
            </div>

            {/* Cidades */}
            <div className="cturismo-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Cidades</h3>
                <div className="bg-[#004E89] rounded-lg p-3">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-800">{uniqueCities}</p>
              <p className="text-sm text-gray-500 mt-2">
                {uniqueStates} estado(s)
              </p>
            </div>
          </div>

          {/* Top Cities */}
          {topCities.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              <div className="cturismo-card p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Top 5 Cidades</h2>
                <div className="space-y-3">
                  {topCities.map(([city, count], index) => (
                    <div key={city} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-[#0B7D4A]">#{index + 1}</span>
                        <span className="text-gray-700">{city || 'Não informado'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#0B7D4A] h-2 rounded-full"
                            style={{
                              width: `${(count / totalClients) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-800 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Quality */}
              <div className="cturismo-card p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Qualidade dos Dados</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Email Preenchido</span>
                      <span className="font-semibold text-gray-800">
                        {totalClients > 0 ? Math.round((clientsWithEmail / totalClients) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#0E9B8A] h-2 rounded-full"
                        style={{
                          width: `${totalClients > 0 ? (clientsWithEmail / totalClients) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Telefone Preenchido</span>
                      <span className="font-semibold text-gray-800">
                        {totalClients > 0 ? Math.round((clientsWithPhone / totalClients) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#FFC107] h-2 rounded-full"
                        style={{
                          width: `${totalClients > 0 ? (clientsWithPhone / totalClients) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {totalClients === 0 && (
            <div className="cturismo-card p-12 text-center">
              <p className="text-gray-600 text-lg mb-6">
                Nenhum cliente cadastrado ainda. Comece adicionando clientes para ver estatísticas.
              </p>
              <Button onClick={() => setLocation('/cadastro')} className="cturismo-button-primary">
                Cadastrar Primeiro Cliente
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
