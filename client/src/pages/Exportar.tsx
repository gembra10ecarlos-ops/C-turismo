import { Button } from '@/components/ui/button';
import { useClients } from '@/contexts/ClientContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useState, useRef } from 'react';
import Header from '@/components/Header';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Exportar() {
  const { clients } = useClients();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [exportType, setExportType] = useState<'all' | 'trip'>('all');
  const [loading, setLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const tripData = JSON.parse(localStorage.getItem('cturismo_trip') || 'null');
  const clientsToExport = exportType === 'trip' && tripData ? tripData.passengers : clients;

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    setLoading(true);

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      const filename = exportType === 'trip' && tripData ? `viagem-${tripData.name}.pdf` : 'clientes.pdf';
      pdf.save(filename);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'CPF/CNPJ', 'Rua', 'Cidade', 'Estado', 'CEP'];
    const rows = clientsToExport.map((client: any) => [
      client.name,
      client.email,
      client.phone,
      client.cpfCnpj,
      client.street,
      client.city,
      client.state,
      client.zipCode,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportType === 'trip' && tripData ? `viagem-${tripData.name}.csv` : 'clientes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Exportar Lista</h1>
              <p className="text-gray-600">Baixe a lista de clientes em PDF ou CSV</p>
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

          {/* Export Type Selection */}
          <div className="cturismo-card p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tipo de Exportação</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="exportType"
                  value="all"
                  checked={exportType === 'all'}
                  onChange={(e) => setExportType(e.target.value as 'all' | 'trip')}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-gray-800">Todos os Clientes</p>
                  <p className="text-sm text-gray-600">Exportar lista completa ({clients.length} clientes)</p>
                </div>
              </label>
              {tripData && (
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="exportType"
                    value="trip"
                    checked={exportType === 'trip'}
                    onChange={(e) => setExportType(e.target.value as 'all' | 'trip')}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">Viagem: {tripData.name}</p>
                    <p className="text-sm text-gray-600">
                      {tripData.passengers.length} passageiro(s) - Saída: {tripData.departureTime}
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="cturismo-card p-8 mb-8" ref={contentRef}>
            {/* Header with Logo */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-300">
              <div className="flex items-center gap-4">
                <img src="/logo-cturismo.png" alt="CTURISMO" className="h-16 w-auto" />
                <div>
                  <h1 className="text-2xl font-bold text-[#0B7D4A]">CTURISMO</h1>
                  <p className="text-gray-600">Sistema de Gerenciamento de Clientes</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Data: {new Date().toLocaleDateString('pt-BR')}
                </p>
                {exportType === 'trip' && tripData && (
                  <p className="text-sm text-gray-600">
                    Saída: {tripData.departureTime}
                  </p>
                )}
              </div>
            </div>

            {/* Trip Info */}
            {exportType === 'trip' && tripData && (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h2 className="font-bold text-gray-800 mb-2">Informações da Viagem</h2>
                <p className="text-gray-700">
                  <strong>Nome:</strong> {tripData.name}
                </p>
                <p className="text-gray-700">
                  <strong>Horário de Saída:</strong> {tripData.departureTime}
                </p>
                <p className="text-gray-700">
                  <strong>Data:</strong> {tripData.date}
                </p>
                <p className="text-gray-700">
                  <strong>Total de Passageiros:</strong> {tripData.passengers.length}
                </p>
              </div>
            )}

            {/* Clients Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0B7D4A] text-white">
                    <th className="text-left py-3 px-4 font-semibold">#</th>
                    <th className="text-left py-3 px-4 font-semibold">Nome</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Telefone</th>
                    <th className="text-left py-3 px-4 font-semibold">CPF/CNPJ</th>
                    <th className="text-left py-3 px-4 font-semibold">Cidade</th>
                  </tr>
                </thead>
                <tbody>
                  {clientsToExport.map((client: any, index: number) => (
                    <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700 font-medium">{index + 1}</td>
                      <td className="py-3 px-4 text-gray-700 font-medium">{client.name}</td>
                      <td className="py-3 px-4 text-gray-700">{client.email}</td>
                      <td className="py-3 px-4 text-gray-700">{client.phone}</td>
                      <td className="py-3 px-4 text-gray-700">{client.cpfCnpj}</td>
                      <td className="py-3 px-4 text-gray-700">{client.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-300 text-center text-xs text-gray-600">
              <p>CTURISMO © 2024 - Sistema de Gerenciamento de Clientes</p>
              <p>Documento gerado em {new Date().toLocaleString('pt-BR')}</p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleExportPDF}
              disabled={loading}
              className="cturismo-button-primary flex-1 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {loading ? 'Gerando PDF...' : 'Baixar PDF'}
            </Button>
            <Button
              onClick={handleExportCSV}
              className="cturismo-button-secondary flex-1 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="flex-1"
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
