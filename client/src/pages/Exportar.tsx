import { Button } from '@/components/ui/button';
import { useClients } from '@/contexts/ClientContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useState, useRef } from 'react';
import Header from '@/components/Header';
import { ArrowLeft, Download, FileText, File as FileIcon, Upload, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, TextRun, BorderStyle, VerticalAlign, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export default function Exportar() {
  const { clients } = useClients();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [exportType, setExportType] = useState<'all' | 'trip'>('all');
  const [loading, setLoading] = useState(false);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const logoUrl = `${import.meta.env.BASE_URL}logo-cturismo.png`;

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

  const handleExportWord = async () => {
    setLoading(true);
    try {
      const title = exportType === 'trip' && tripData ? `Lista de Passageiros - ${tripData.name}` : 'Lista de Clientes';
      const filename = exportType === 'trip' && tripData ? `viagem-${tripData.name}.docx` : 'clientes.docx';

      if (templateFile) {
        // Lógica para usar template personalizado com docxtemplater
        const reader = new FileReader();
        
        const fileContent = await new Promise<ArrayBuffer>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(templateFile);
        });

        const zip = new PizZip(fileContent);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });

        // Preparar os dados para o template
        // Suporta tags simples e também loops {#clients} ... {/clients}
        const data = {
          titulo: title,
          data_geracao: new Date().toLocaleDateString('pt-BR'),
          viagem_nome: tripData?.name || '',
          viagem_saida: tripData ? `${new Date(tripData.departureDate).toLocaleDateString('pt-BR')} às ${tripData.departureTime}` : '',
          viagem_retorno: tripData ? `${new Date(tripData.returnDate).toLocaleDateString('pt-BR')} às ${tripData.returnTime}` : '',
          clientes: clientsToExport.map((client: any, index: number) => ({
            index: index + 1,
            nome: client.name || '',
            email: client.email || '',
            telefone: client.phone || '',
            cpf: client.cpfCnpj || '',
            rg: client.rg || '',
            cidade: client.city || '',
            estado: client.state || '',
            cep: client.zipCode || '',
            rua: client.street || '',
          }))
        };

        doc.render(data);

        const out = doc.getZip().generate({
          type: "blob",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        saveAs(out, filename);
      } else {
        // Lógica para criar o modelo oficial C&M TURISMO no Word
        const response = await fetch(logoUrl);
        const logoBuffer = await response.arrayBuffer();

        const doc = new Document({
          sections: [{
            properties: {
              page: {
                margin: {
                  top: 720,
                  right: 720,
                  bottom: 720,
                  left: 720,
                },
              },
            },
            children: [
              // Cabeçalho
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 25, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new ImageRun({
                                data: logoBuffer,
                                transformation: { width: 80, height: 60 },
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 75, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "RELAÇÃO DE PASSAGEIROS", bold: true, size: 24 })],
                          }),
                          new Paragraph({
                            children: [new TextRun({ text: "PARA VIAGENS E TURISMO SOB O REGIME DE FRETAMENTO", bold: true, size: 20 })],
                          }),
                          new Paragraph({
                            children: [new TextRun({ text: "PÁGINA 01", size: 16 })],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              // Título: Dados da Viagem
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        shading: { fill: "D9D9D9" },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: "DADOS DA VIAGEM", bold: true, size: 20 })],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              // Tabela de Informações da Viagem
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        columnSpan: 2,
                        children: [
                          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: tripData?.vehicle || "RENAULT/MASTER MBUS L3H2", bold: true })] }),
                          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: tripData?.year || "2019/2020", bold: true })] }),
                        ],
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: `Placa: ${tripData?.plate || "QWI - 9977"}`, bold: true })] })],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "DATA / HORÁRIO", bold: true })] }),
                          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${tripData ? new Date(tripData.departureDate).toLocaleDateString('pt-BR') : "11/04/2026"} - ${tripData?.departureTime || "06:30"}` })] }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ shading: { fill: "F2F2F2" }, children: [new Paragraph({ children: [new TextRun({ text: "CIDADE", bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: tripData?.city_origin || "ARACAJU", bold: true })] })] }),
                      new TableCell({ shading: { fill: "F2F2F2" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "SAÍDA", bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: tripData ? new Date(tripData.departureDate).toLocaleDateString('pt-BR') : "11/04/2026", bold: true })] })] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ shading: { fill: "F2F2F2" }, children: [new Paragraph({ children: [new TextRun({ text: "DESTINO", bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: tripData?.name || "PARAISO DOS TAMBAQUI/SE", bold: true })] })] }),
                      new TableCell({ shading: { fill: "F2F2F2" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "RETORNO", bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: tripData ? new Date(tripData.returnDate).toLocaleDateString('pt-BR') : "11/04/2026", bold: true })] })] }),
                    ],
                  }),
                ],
              }),

              new Paragraph({ text: "" }), // Spacer

              // Tabela de Passageiros
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "POLTRONA Nº", bold: true, size: 18 })] })] }),
                      new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NOME COMPLETO", bold: true, size: 18 })] })] }),
                      new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "RG/CPF", bold: true, size: 18 })] })] }),
                      new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Nº CONTATO", bold: true, size: 18 })] })] }),
                    ],
                  }),
                  ...Array.from({ length: Math.max(16, clientsToExport.length) }).map((_, i) => {
                    const client = clientsToExport[i];
                    return new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (i + 1).toString(), bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: client?.name || "", bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: client?.rg || client?.cpfCnpj || "" })] })] }),
                        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: client?.phone || "" })] })] }),
                      ],
                    });
                  }),
                ],
              }),

              new Paragraph({ text: "" }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "A C&M TURISMO AGRADECE PELA PREFERÊNCIA E DESEJA A TODOS UMA BOA VIAJEM!", bold: true, italic: true, size: 20 })],
              }),

              new Paragraph({ text: "" }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `${tripData?.city_origin || "Aracaju"}, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`, size: 20 })],
              }),

              new Paragraph({ text: "" }),
              new Paragraph({ text: "" }),

              // Assinaturas
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            border: { top: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 12 } },
                            children: [new TextRun({ text: "Assinatura do Solicitante", italic: true })],
                          }),
                        ],
                      }),
                      new TableCell({ children: [new Paragraph({ text: "" })] }), // Spacer
                      new TableCell({
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            border: { top: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 12 } },
                            children: [new TextRun({ text: "Representante CTurismo", italic: true })],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              new Paragraph({ text: "" }),
              new Paragraph({ text: "" }),

              // Rodapé
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "CTurismo - CNPJ Nº 31.478.411/0001-10", bold: true, size: 16 }),
                  new TextRun({ break: 1, text: "Rua São Carlos Nº 66 Bairro Marivan Aracaju - SE", size: 16 }),
                  new TextRun({ break: 1, text: "(79) 99940-1907", size: 16 }),
                ],
              }),
            ],
          }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, filename);
      }
    } catch (error) {
      console.error('Erro ao gerar Word:', error);
      alert('Erro ao gerar arquivo Word. Verifique se o modelo está correto.');
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
      <div className="min-h-screen bg-gray-50 dark:bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-foreground mb-2">Exportar Lista</h1>
              <p className="text-gray-600 dark:text-gray-400">Baixe a lista de clientes em PDF ou CSV</p>
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
                      {tripData.passengers.length} passageiro(s) - Saída: {new Date(tripData.departureDate).toLocaleDateString('pt-BR')} às {tripData.departureTime}
                    </p>
                    <p className="text-sm text-gray-600">
                      Retorno: {new Date(tripData.returnDate).toLocaleDateString('pt-BR')} às {tripData.returnTime}
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Preview - Modelo C&M TURISMO */}
          <div className="bg-white p-8 mb-8 shadow-lg border border-gray-200 overflow-x-auto" ref={contentRef} style={{ minWidth: '800px' }}>
            {/* Cabeçalho */}
            <div className="flex border-2 border-black mb-0">
              <div className="w-1/4 p-2 border-r-2 border-black flex items-center justify-center">
                <img src={logoUrl} alt="Logo" className="h-16 w-auto" />
              </div>
              <div className="w-3/4 p-2 flex flex-col justify-center">
                <h1 className="text-sm font-bold uppercase">Relação de Passageiros</h1>
                <h2 className="text-sm font-bold uppercase leading-tight">Para viagens e turismo sob o regime de fretamento</h2>
                <p className="text-[10px] mt-1">PÁGINA 01</p>
              </div>
            </div>

            {/* Dados da Viagem */}
            <div className="bg-gray-300 border-x-2 border-b-2 border-black p-1 text-center font-bold text-xs uppercase">
              Dados da Viagem
            </div>
            
            <div className="grid grid-cols-4 border-x-2 border-black text-[11px]">
              <div className="col-span-2 border-r-2 border-b-2 border-black p-1 text-center flex flex-col justify-center min-h-[40px]">
                <span className="font-bold">{tripData?.vehicle || "RENAULT/MASTER MBUS L3H2"}</span>
                <span className="font-bold">{tripData?.year || "2019/2020"}</span>
              </div>
              <div className="border-r-2 border-b-2 border-black p-1">
                <p className="font-bold">Placa: {tripData?.plate || "QWI - 9977"}</p>
              </div>
              <div className="border-b-2 border-black p-1 flex items-center justify-around">
                <div className="text-center px-1">
                  <p className="font-bold border-b border-black mb-1">DATA</p>
                  <p>{tripData ? new Date(tripData.departureDate).toLocaleDateString('pt-BR') : "11/04/2026"}</p>
                </div>
                <div className="text-center px-1">
                  <p className="font-bold border-b border-black mb-1">HORÁRIO</p>
                  <p>{tripData?.departureTime || "06:30"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 border-x-2 border-black text-[11px]">
              <div className="border-r-2 border-b-2 border-black p-1 font-bold bg-gray-50">CIDADE</div>
              <div className="border-r-2 border-b-2 border-black p-1 text-center font-bold uppercase">{tripData?.city_origin || "ARACAJU"}</div>
              <div className="border-r-2 border-b-2 border-black p-1 font-bold bg-gray-50 text-center">SAÍDA</div>
              <div className="border-b-2 border-black p-1 text-center font-bold">{tripData ? new Date(tripData.departureDate).toLocaleDateString('pt-BR') : "11/04/2026"}</div>
            </div>

            <div className="grid grid-cols-4 border-x-2 border-black text-[11px] mb-4">
              <div className="border-r-2 border-b-2 border-black p-1 font-bold bg-gray-50">DESTINO</div>
              <div className="border-r-2 border-b-2 border-black p-1 text-center font-bold uppercase">{tripData?.name || "PARAISO DOS TAMBAQUI/SE"}</div>
              <div className="border-r-2 border-b-2 border-black p-1 font-bold bg-gray-50 text-center">RETORNO</div>
              <div className="border-b-2 border-black p-1 text-center font-bold">{tripData ? new Date(tripData.returnDate).toLocaleDateString('pt-BR') : "11/04/2026"}</div>
            </div>

            {/* Tabela de Passageiros */}
            <table className="w-full border-2 border-black text-[11px] uppercase">
              <thead>
                <tr className="bg-white">
                  <th className="border-r-2 border-b-2 border-black p-1 w-16 text-center leading-tight">POLTRONA<br/>Nº</th>
                  <th className="border-r-2 border-b-2 border-black p-1 text-center">NOME COMPLETO</th>
                  <th className="border-r-2 border-b-2 border-black p-1 w-32 text-center">RG/CPF</th>
                  <th className="border-b-2 border-black p-1 w-32 text-center">Nº CONTATO</th>
                </tr>
              </thead>
              <tbody>
                {/* Preencher até 16 linhas como no modelo, ou mais se houver mais clientes */}
                {Array.from({ length: Math.max(16, clientsToExport.length) }).map((_, i) => {
                  const client = clientsToExport[i];
                  return (
                    <tr key={i} className="h-6">
                      <td className="border-r-2 border-b-2 border-black p-1 text-center font-bold">{i + 1}</td>
                      <td className="border-r-2 border-b-2 border-black p-1 px-2 font-bold">{client?.name || ""}</td>
                      <td className="border-r-2 border-b-2 border-black p-1 text-center">{client?.rg || client?.cpfCnpj || ""}</td>
                      <td className="border-b-2 border-black p-1 text-center">{client?.phone || ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Agradecimento */}
            <div className="mt-6 text-center font-bold italic text-xs uppercase">
              A C&M TURISMO AGRADECE PELA PREFERÊNCIA E DESEJA A TODOS UMA BOA VIAJEM!
            </div>

            {/* Assinaturas */}
            <div className="mt-12 text-center text-xs">
              <p className="mb-12 uppercase">{tripData?.city_origin || "Aracaju"}, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              
              <div className="flex justify-around mt-8">
                <div className="w-1/3 border-t-2 border-black pt-1">
                  <p className="italic">Assinatura do Solicitante</p>
                </div>
                <div className="w-1/3 border-t-2 border-black pt-1">
                  <p className="italic">Representante CTurismo</p>
                </div>
              </div>
            </div>

            {/* Rodapé fixo com dados da empresa */}
            <div className="mt-16 text-center text-[10px] leading-relaxed">
              <p className="font-bold">CTurismo - CNPJ Nº 31.478.411/0001-10</p>
              <p>Rua São Carlos Nº 66 Bairro Marivan Aracaju - SE</p>
              <p>(79) 99940-1907</p>
            </div>
          </div>

          {/* Template Selection */}
          <div className="cturismo-card p-6 mb-8 border-dashed border-2 border-gray-300 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FileIcon className="w-5 h-5 text-[#2B579A]" />
              Modelo de Word Personalizado (Opcional)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Suba um arquivo .docx com tags como {"{nome}"}, {"{cpf}"}, {"{telefone}"} para usar como modelo. 
              Se não subir nada, o sistema usará o modelo padrão de tabela.
            </p>
            
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".docx"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setTemplateFile(e.target.files[0]);
                  }
                }}
              />
              
              {!templateFile ? (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex items-center gap-2 border-[#2B579A] text-[#2B579A] hover:bg-[#2B579A] hover:text-white"
                >
                  <Upload className="w-4 h-4" />
                  Selecionar Modelo (.docx)
                </Button>
              ) : (
                <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-full border border-[#2B579A] shadow-sm">
                  <FileIcon className="w-4 h-4 text-[#2B579A]" />
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                    {templateFile.name}
                  </span>
                  <button
                    onClick={() => {
                      setTemplateFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleExportPDF}
              disabled={loading}
              className="cturismo-button-primary flex-1 min-w-[150px] flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {loading ? 'Gerando PDF...' : 'Baixar PDF'}
            </Button>
            <Button
              onClick={handleExportWord}
              disabled={loading}
              className="bg-[#2B579A] hover:bg-[#1E3E6D] text-white flex-1 min-w-[150px] flex items-center justify-center gap-2"
            >
              <FileIcon className="w-4 h-4" />
              {loading ? 'Gerando Word...' : 'Baixar Word'}
            </Button>
            <Button
              onClick={handleExportCSV}
              className="cturismo-button-secondary flex-1 min-w-[150px] flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="flex-1 min-w-[150px]"
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
