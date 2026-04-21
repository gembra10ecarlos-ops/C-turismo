import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Client {
  id: string;
  name: string;
  street: string;
  cpfCnpj: string;
  rg?: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string;
  createdAt: string;
}

interface ClientContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, client: Omit<Client, 'id' | 'createdAt'>) => void;
  deleteClient: (id: string) => void;
  importClients: (clients: Omit<Client, 'id' | 'createdAt'>[]) => void;
  exportClients: () => Client[];
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);

  // Restaurar clientes do localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('cturismo_clients');
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    }
  }, []);

  // Salvar clientes no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem('cturismo_clients', JSON.stringify(clients));
  }, [clients]);

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setClients([...clients, newClient]);
  };

  const updateClient = (id: string, client: Omit<Client, 'id' | 'createdAt'>) => {
    setClients(
      clients.map((c) =>
        c.id === id ? { ...c, ...client } : c
      )
    );
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
  };

  const importClients = (newClients: Omit<Client, 'id' | 'createdAt'>[]) => {
    const importedClients = newClients.map((client) => ({
      ...client,
      id: Date.now().toString() + Math.random(),
      createdAt: new Date().toISOString(),
    }));
    setClients([...clients, ...importedClients]);
  };

  const exportClients = () => clients;

  return (
    <ClientContext.Provider
      value={{
        clients,
        addClient,
        updateClient,
        deleteClient,
        importClients,
        exportClients,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
}
