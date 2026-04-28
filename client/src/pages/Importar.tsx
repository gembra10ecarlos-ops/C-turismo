import { Button } from '@/components/ui/button';
import { useClients, Client } from '@/contexts/ClientContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useState } from 'react';
import Header from '@/components/Header';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, FileText, FileSpreadsheet, File as FileIcon } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

// Configurar o worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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

  const parseFile = async (selectedFile: File) => {
    setLoading(true);
    setMessage(null);

    const mapRowToClient = (row: any) => {
      // Função auxiliar para buscar valor em chaves variadas (case-insensitive e flexível)
      const getValue = (keys: string[]) => {
        const foundKey = Object.keys(row).find(k => 
          keys.some(key => {
            const normalizedK = k.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const normalizedKey = key.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return normalizedK === normalizedKey || normalizedK.includes(normalizedKey);
          })
        );
        return foundKey ? row[foundKey] : '';
      };

      return {
        name: getValue(['name', 'Nome', 'Cliente', 'Nome Completo']),
        street: getValue(['street', 'Rua', 'Endereco', 'Logradouro']),
        cpfCnpj: getValue(['cpfCnpj', 'CPF', 'CNPJ', 'Documento']),
        email: getValue(['email', 'Email', 'E-mail']),
        phone: getValue(['phone', 'Telefone', 'Celular', 'Contato']),
        city: getValue(['city', 'Cidade', 'Municipio']),
        state: getValue(['state', 'Estado', 'UF']),
        zipCode: getValue(['zipCode', 'CEP', 'Codigo Postal']),
        notes: getValue(['notes', 'Observacoes', 'Notas', 'Obs']),
      };
    };

    if (selectedFile.name.endsWith('.csv')) {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          try {
            const clients = results.data.map(mapRowToClient);
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
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          const clients = jsonData.map(mapRowToClient);
          setPreview(clients);
          setMessage({ type: 'success', text: `${clients.length} cliente(s) pronto(s) para importar` });
        } catch (error) {
          setMessage({ type: 'error', text: 'Erro ao processar arquivo Excel' });
        }
        setLoading(false);
      };
      reader.readAsArrayBuffer(selectedFile);
    } else if (selectedFile.name.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const result = await mammoth.convertToHtml({ arrayBuffer });
          const html = result.value;
          
          // Tentar extrair dados de todas as tabelas no HTML
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const tables = Array.from(doc.querySelectorAll('table'));
          
          if (tables.length > 0) {
            let allClients: Omit<Client, 'id' | 'createdAt'>[] = [];
            
            tables.forEach(table => {
              const rows = Array.from(table.querySelectorAll('tr'));
              if (rows.length < 2) return; // Pular tabelas sem dados
              
              const headers = Array.from(rows[0].querySelectorAll('td, th')).map(cell => cell.textContent?.trim() || '');
              const dataRows = rows.slice(1).map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                const rowData: any = {};
                headers.forEach((header, index) => {
                  if (cells[index]) {
                    rowData[header] = cells[index].textContent?.trim() || '';
                  }
                });
                return rowData;
              });
              
              const tableClients = dataRows.map(mapRowToClient);
              allClients = [...allClients, ...tableClients];
            });
            
            // Filtrar clientes que estão completamente vazios
            const validClients = allClients.filter(c => c.name || c.cpfCnpj || c.email || c.phone);
            
            if (validClients.length > 0) {
              setPreview(validClients);
              setMessage({ type: 'success', text: `${validClients.length} cliente(s) pronto(s) para importar do Word` });
            } else {
              setMessage({ type: 'error', text: 'Nenhum dado válido encontrado nas tabelas do arquivo Word.' });
            }
          } else {
            setMessage({ type: 'error', text: 'Nenhuma tabela encontrada no arquivo Word. O arquivo deve conter uma tabela com os dados.' });
          }
        } catch (error) {
          setMessage({ type: 'error', text: 'Erro ao processar arquivo Word' });
        }
        setLoading(false);
      };
      reader.readAsArrayBuffer(selectedFile);
    } else if (selectedFile.name.endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
          }

          // Nota: Importar de PDF é complexo sem uma estrutura clara.
           // Tentamos extrair o texto, mas para garantir a precisão, 
           // recomendamos o uso de Excel ou CSV.
           setMessage({ 
             type: 'error', 
             text: 'A importação de PDF ainda é experimental. Para melhores resultados, converta o PDF para Excel ou CSV antes de importar.' 
           });
        } catch (error) {
          setMessage({ type: 'error', text: 'Erro ao processar arquivo PDF' });
        }
        setLoading(false);
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setMessage({ type: 'error', text: 'Formato de arquivo não suportado. Use CSV, Excel ou Word.' });
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
      <div className="min-h-screen bg-gray-50 dark:bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-foreground mb-2">Importar Clientes</h1>
              <p className="text-gray-600 dark:text-gray-400">Importe dados de arquivos Word (.docx)</p>
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
                Arraste um arquivo CSV, Excel, Word ou PDF aqui, ou clique para selecionar
              </p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.docx,.pdf"
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
              Seu arquivo (CSV, Excel ou Word) deve conter as seguintes colunas/campos:
            </p>
            <div className="bg-white p-4 rounded border border-gray-200 font-mono text-sm overflow-x-auto">
              <code>
                name, street, cpfCnpj, email, phone, city, state, zipCode, notes
              </code>
            </div>
            <p className="text-gray-600 text-sm mt-3">
              Ou use os nomes em português: Nome, Rua, CPF, Email, Telefone, Cidade, Estado, CEP, Observações.
              No caso do <strong>Word</strong>, os dados devem estar em uma tabela.
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
