import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClients } from '@/contexts/ClientContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useState } from 'react';
import Header from '@/components/Header';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function Viagem() {
  const { clients } = useClients();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tripName, setTripName] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [departureTime, setDepartureTime] = useState('08:00');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleClient = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredClients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredClients.map((c) => c.id)));
    }
  };

  const handleExportTrip = () => {
    if (selectedIds.size === 0) {
      alert('Selecione pelo menos um passageiro');
      return;
    }

    const selectedClients = clients.filter((c) => selectedIds.has(c.id));
    const tripData = {
      name: tripName || 'Viagem sem nome',
      departureDate,
      returnDate,
      departureTime,
      passengers: selectedClients,
      date: new Date().toLocaleDateString('pt-BR'),
    };

    // Salvar no localStorage
    localStorage.setItem('cturismo_trip', JSON.stringify(tripData));
    setShowSuccess(true);

    setTimeout(() => {
      setLocation('/exportar');
    }, 2000);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Selecionar Passageiros</h1>
              <p className="text-gray-600">Escolha os clientes para a viagem</p>
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

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-700">Viagem criada com sucesso! Redirecionando...</p>
            </div>
          )}

          {/* Trip Info Card */}
          <div className="cturismo-card p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Informações da Viagem</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="tripName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Viagem
                </label>
                <Input
                  id="tripName"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="Ex: Viagem para São Paulo"
                />
              </div>
              
              <div>
                <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Ida
                </label>
                <Input
                  id="departureDate"
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Volta
                </label>
                <Input
                  id="returnDate"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="departureTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Horário de Saída
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <Input
                    id="departureTime"
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Select All */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <Input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSelectAll}
              variant="outline"
              className="border-[#0B7D4A] text-[#0B7D4A] hover:bg-[#0B7D4A] hover:text-white"
            >
              {selectedIds.size === filteredClients.length && filteredClients.length > 0
                ? 'Desselecionar Todos'
                : 'Selecionar Todos'}
            </Button>
          </div>

          {/* Clients List */}
          {filteredClients.length === 0 ? (
            <div className="cturismo-card p-12 text-center">
              <p className="text-gray-600 text-lg">
                {clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="cturismo-card p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleToggleClient(client.id)}
                >
                  <Checkbox
                    checked={selectedIds.has(client.id)}
                    onChange={() => handleToggleClient(client.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{client.name}</h3>
                    <p className="text-sm text-gray-600">{client.email}</p>
                    <p className="text-sm text-gray-600">{client.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">{client.cpfCnpj}</p>
                    <p className="text-xs text-gray-500">{client.city}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary and Actions */}
          <div className="cturismo-card p-6 mb-8 bg-blue-50 border-l-4 border-[#0B7D4A]">
            <h3 className="font-bold text-gray-800 mb-2">Resumo da Seleção</h3>
            <p className="text-gray-700">
              {selectedIds.size} de {clients.length} cliente(s) selecionado(s)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleExportTrip}
              disabled={selectedIds.size === 0}
              className="cturismo-button-primary flex-1"
            >
              Próximo: Exportar Lista
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
