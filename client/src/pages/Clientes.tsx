import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClients, Client } from '@/contexts/ClientContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useState } from 'react';
import Header from '@/components/Header';
import { ArrowLeft, Edit2, Trash2, Search, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function Clientes() {
  const { clients, updateClient, deleteClient } = useClients();
  const { isAuthenticated, adminPassword } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete'; id: string } | null>(null);
  const [editFormData, setEditFormData] = useState<Omit<Client, 'id' | 'createdAt'> | null>(null);

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-foreground mb-4">Acesso Negado</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Você precisa fazer login para acessar esta página.</p>
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
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpfCnpj.includes(searchTerm)
  );

  const handleEditClick = (client: Client) => {
    setPendingAction({ type: 'edit', id: client.id });
    setShowPasswordDialog(true);
  };

  const handleDeleteClick = (id: string) => {
    setPendingAction({ type: 'delete', id });
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = () => {
    if (adminPasswordInput === adminPassword && pendingAction) {
      if (pendingAction.type === 'edit') {
        const client = clients.find((c) => c.id === pendingAction.id);
        if (client) {
          setEditFormData({
            name: client.name,
            street: client.street,
            cpfCnpj: client.cpfCnpj,
            email: client.email,
            phone: client.phone,
            city: client.city,
            state: client.state,
            zipCode: client.zipCode,
            notes: client.notes,
          });
          setEditingId(pendingAction.id);
        }
      } else if (pendingAction.type === 'delete') {
        deleteClient(pendingAction.id);
      }
      setShowPasswordDialog(false);
      setAdminPasswordInput('');
      setPendingAction(null);
    }
  };

  const handleSaveEdit = () => {
    if (editingId && editFormData) {
      updateClient(editingId, editFormData);
      setEditingId(null);
      setEditFormData(null);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [name]: value,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-12">
      <Header />
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-[#0B7D4A] dark:text-foreground mb-4">Gerenciar Clientes</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Visualize, edite ou remova clientes do sistema</p>
          </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setLocation('/cadastro')}
                className="cturismo-button-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Cliente
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/')}
                className="text-[#0B7D4A] border-[#0B7D4A] hover:bg-[#0B7D4A] hover:text-white dark:border-[#0B7D4A] dark:text-[#0B7D4A] flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nome, email ou CPF/CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 dark:bg-card dark:border-border"
              />
            </div>
          </div>

          {/* Clients List */}
          {filteredClients.length === 0 ? (
            <div className="cturismo-card p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                {clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}
              </p>
              {clients.length === 0 && (
                <Button onClick={() => setLocation('/cadastro')} className="cturismo-button-primary">
                  Cadastrar Primeiro Cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="cturismo-card p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
                      <p className="font-semibold text-gray-800 dark:text-foreground">{client.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-semibold text-gray-800 dark:text-foreground">{client.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Telefone</p>
                      <p className="font-semibold text-gray-800 dark:text-foreground">{client.phone}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">CPF/CNPJ</p>
                      <p className="font-semibold text-gray-800 dark:text-foreground">{client.cpfCnpj}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Endereço</p>
                      <p className="font-semibold text-gray-800 dark:text-foreground">{client.street}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cidade/Estado</p>
                      <p className="font-semibold text-gray-800 dark:text-foreground">
                        {client.city} {client.state && `- ${client.state}`}
                      </p>
                    </div>
                  </div>
                  {client.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Observações</p>
                      <p className="text-gray-700 dark:text-gray-300">{client.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-border">
                    <Button
                      onClick={() => handleEditClick(client)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 dark:border-border dark:text-foreground"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(client.id)}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar com Senha do Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Digite a senha do administrador para {pendingAction?.type === 'edit' ? 'editar' : 'excluir'} este cliente.
            </p>
            <Input
              type="password"
              placeholder="Senha do admin"
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePasswordSubmit} className="cturismo-button-primary">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          {editFormData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <Input
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CPF/CNPJ</label>
                  <Input
                    name="cpfCnpj"
                    value={editFormData.cpfCnpj}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                  <Input
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                <Input
                  name="street"
                  value={editFormData.street}
                  onChange={handleEditChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                  <Input
                    name="city"
                    value={editFormData.city}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <Input
                    name="state"
                    value={editFormData.state}
                    onChange={handleEditChange}
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                  <Input
                    name="zipCode"
                    value={editFormData.zipCode}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                <Textarea
                  name="notes"
                  value={editFormData.notes}
                  onChange={handleEditChange}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="cturismo-button-primary">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
