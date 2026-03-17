import { Button } from '@/components/ui/button';
import { useClients, Client } from '@/contexts/ClientContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useState } from 'react';
import Header from '@/components/Header';
import { ArrowLeft, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

export default function Importar() {
  const { importClients } = useClients();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Omit<Client, 'id' | 'createdAt'>[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (selectedFile: File) => {
    setLoading(true);
    setMessage(null);

    if (selectedFile.name.endsWith('.csv')) {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          try {
            const clients = results.data.map((row: any) => ({
              name: row.name || row.Nome || '',
              street: row.street || row.Rua || '',
              cpfCnpj: row.cpfCnpj || row.CPF || row.CNPJ || '',
              email: row.email || row.Email || '',
              phone: row.phone || row.Telefone || '',
              city: row.city || row.Cidade || '',
              state: row.state || row.Estado || '',
              zipCode: row.zipCode || row.CEP || '',
              notes: row.notes || row.Observações || '',
            }));
            setPreview(clients);
            setMessage({ type: 'success', text: `${clients.length} cliente(s) pronto(s) para importar` });
          } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao processar arquivo CSV' });
          }
          setLoading(false);
        },
        error: () => {
          setMessage({ type: 'error', text: 'Erro ao ler arquivo CSV' });
          setLoading(false);
        },
      });
    } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
      // Para Excel, usamos uma abordagem simplificada com FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          // Aqui você precisaria de uma biblioteca como xlsx
          // Por enquanto, mostraremos uma mensagem de suporte
          setMessage({
            type: 'error',
            text: 'Formato Excel ainda não suportado. Use CSV para importar.',
          });
        } catch (error) {
          setMessage({ type: 'error', text: 'Erro ao processar arquivo Excel' });
        }
        setLoading(false);
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setMessage({ type: 'error', text: 'Formato de arquivo não suportado. Use CSV ou Excel.' });
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (preview.length > 0) {
      importClients(preview);
      setMessage({ type: 'success', text: 'Clientes importados com sucesso!' });
      setTimeout(() => {
        setLocation('/clientes');
      }, 2000);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Importar Clientes</h1>
              <p className="text-gray-600">Importe clientes de um arquivo CSV ou Excel</p>
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

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={
                  message.type === 'success' ? 'text-green-700' : 'text-red-700'
                }
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Upload Area */}
          <div className="cturismo-card p-8 mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-[#0B7D4A] transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Selecione um arquivo
              </h3>
              <p className="text-gray-600 mb-6">
                Arraste um arquivo CSV ou Excel aqui, ou clique para selecionar
              </p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <Button
                onClick={() => document.getElementById('file-input')?.click()}
                className="cturismo-button-primary"
              >
                Escolher Arquivo
              </Button>
              {file && (
                <p className="mt-4 text-sm text-gray-600">
                  Arquivo selecionado: <strong>{file.name}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Format Info */}
          <div className="cturismo-card p-6 mb-8 bg-blue-50 border-l-4 border-[#0B7D4A]">
            <h3 className="font-semibold text-gray-800 mb-3">Formato esperado do arquivo:</h3>
            <p className="text-gray-700 mb-3">
              Seu arquivo CSV deve conter as seguintes colunas (em qualquer ordem):
            </p>
            <div className="bg-white p-4 rounded border border-gray-200 font-mono text-sm overflow-x-auto">
              <code>
                name, street, cpfCnpj, email, phone, city, state, zipCode, notes
              </code>
            </div>
            <p className="text-gray-600 text-sm mt-3">
              Ou use os nomes em português: Nome, Rua, CPF, Email, Telefone, Cidade, Estado, CEP, Observações
            </p>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="cturismo-card p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Prévia ({preview.length} cliente(s))
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 px-4 font-semibold text-gray-700">Nome</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-700">Telefone</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-700">CPF/CNPJ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 5).map((client, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-2 px-4">{client.name}</td>
                        <td className="py-2 px-4">{client.email}</td>
                        <td className="py-2 px-4">{client.phone}</td>
                        <td className="py-2 px-4">{client.cpfCnpj}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.length > 5 && (
                <p className="text-gray-600 text-sm mt-4">
                  ... e mais {preview.length - 5} cliente(s)
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {preview.length > 0 && (
            <div className="flex gap-4">
              <Button
                onClick={handleImport}
                className="cturismo-button-primary flex-1"
              >
                Importar {preview.length} Cliente(s)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setPreview([]);
                  setMessage(null);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
