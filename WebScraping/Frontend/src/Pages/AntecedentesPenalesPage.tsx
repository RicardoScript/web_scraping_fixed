"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Calendar, 
  FileText,
  ExternalLink,
  Info,
  Clock,
  Download,
  Eye
} from "lucide-react";

type FormData = {
  cedula: string;
};

interface AntecedentesPenalesData {
  cedula: string;
  nombre: string;
  resultado: string;
  resultadoFormateado: string;
  tieneAntecedentes: boolean;
  fechaConsulta: string;
  estado: string;
  certificadoPdf?: string;
  tieneCertificado?: boolean;
  informacionPersonal?: {
    nombre: string;
    cedula: string;
    antecedentes: string;
  };
  detallesConsulta?: {
    fecha: string;
    hora: string;
    sistema: string;
  };
  datosCompletos?: any;
  message?: string;
  success?: boolean;
}

export function AntecedentesPenalesPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [antecedentesPenalesData, setAntecedentesPenalesData] = useState<AntecedentesPenalesData | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [vncWindow, setVncWindow] = useState<Window | null>(null);
  const [needsRetry, setNeedsRetry] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    if (!isLoading && vncWindow && !vncWindow.closed) {
      vncWindow.close();
      setVncWindow(null);
    }
  }, [isLoading, vncWindow]);

  const onSubmit = async (data: FormData) => {
    if (isLoading) return;
    setIsLoading(true);
    setShowResult(false);
    setAntecedentesPenalesData(null);
    setError(null);
    setNeedsRetry(false);
    setFormData(data);
    setShowPdfViewer(false);

    const vncUrl = import.meta.env.VITE_VNC_URL;
    if (vncUrl) {
      const windowRef = window.open(`${vncUrl}/vnc.html`);
      if (windowRef) setVncWindow(windowRef);
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://18.217.24.122:3000";
      console.log('🔄 Consultando API en:', `${apiBaseUrl}/api/antecedentes-penales`);
      
      const response = await fetch(`${apiBaseUrl}/api/antecedentes-penales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula: data.cedula }),
      });

      const resultado = await response.json();
      console.log('📩 Respuesta completa del backend:', resultado);

      if (resultado.error === 'captcha_required') {
        setError(resultado.message);
        setNeedsRetry(true);
        setIsLoading(false);
        return;
      }

      if (resultado.success !== false) {
        setAntecedentesPenalesData(resultado);
        setShowResult(true);
      } else {
        setError(resultado.message || "Ocurrió un error al consultar antecedentes penales");
      }
    } catch (error) {
      console.error("Error al consultar antecedentes penales:", error);
      setError("Ocurrió un error al consultar antecedentes penales");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (formData) onSubmit(formData);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-EC', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const downloadPdf = () => {
    if (!antecedentesPenalesData?.certificadoPdf) return;
    
    const link = document.createElement('a');
    link.href = antecedentesPenalesData.certificadoPdf;
    link.download = `certificado-antecedentes-${antecedentesPenalesData.cedula}.pdf`;
    link.click();
  };

  const openPdfViewer = () => {
    setShowPdfViewer(true);
  };

  const closePdfViewer = () => {
    setShowPdfViewer(false);
  };

  const PdfViewer = () => {
    if (!antecedentesPenalesData?.certificadoPdf) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">
              Certificado de Antecedentes Penales - {antecedentesPenalesData.nombre}
            </h3>
            <div className="flex gap-2">
              <Button onClick={downloadPdf} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              <Button onClick={closePdfViewer} variant="outline" size="sm">
                Cerrar
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4">
            <iframe 
              src={antecedentesPenalesData.certificadoPdf}
              className="w-full h-full border rounded"
              title="Certificado de Antecedentes Penales"
            />
          </div>
        </div>
      </div>
    );
  };

  const ResultCard = ({ data }: { data: AntecedentesPenalesData }) => {
    console.log('🔍 Datos en ResultCard:', data);
    
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            Certificado de Antecedentes Penales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Estado Principal */}
            <div className="flex items-center justify-center p-6 rounded-lg border-2 border-dashed">
              {data.tieneAntecedentes ? (
                <div className="text-center space-y-2">
                  <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
                  <div className="text-xl font-bold text-red-600">TIENE ANTECEDENTES PENALES</div>
                  <div className="text-sm text-red-500">Se encontraron registros en el sistema del Ministerio del Interior</div>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <div className="text-xl font-bold text-green-600">NO TIENE ANTECEDENTES PENALES</div>
                  <div className="text-sm text-green-500">No se encontraron registros en el sistema del Ministerio del Interior</div>
                </div>
              )}
            </div>

            {/* Botones de Certificado PDF */}
            {data.tieneCertificado && data.certificadoPdf && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Certificado Oficial PDF
                  </CardTitle>
                  <CardDescription>
                    Documento oficial generado por el Ministerio del Interior
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={openPdfViewer} className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Certificado PDF
                    </Button>
                    <Button onClick={downloadPdf} variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>Este es el certificado oficial emitido por el Ministerio del Interior con validez legal.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!data.tieneCertificado && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="font-medium text-yellow-800">Certificado no disponible</div>
                    <div className="text-sm text-yellow-700">
                      El certificado PDF no pudo ser generado automáticamente. 
                      Puede obtenerlo manualmente en el portal del Ministerio del Interior.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información Personal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-blue-600" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-600">Nombre Completo</div>
                        <div className="font-semibold text-gray-900">
                          {data.informacionPersonal?.nombre || data.nombre || 'No disponible'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-600">Cédula de Identidad</div>
                        <div className="font-semibold text-gray-900">
                          {data.informacionPersonal?.cedula || data.cedula}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalles de la Consulta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Detalles de la Consulta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">Fecha y Hora de Consulta</div>
                      <div className="font-semibold text-gray-900">
                        {formatDate(data.fechaConsulta)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">Sistema Consultado</div>
                      <div className="font-semibold text-gray-900">
                        Ministerio del Interior del Ecuador
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resultado Oficial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-blue-600" />
                  Resultado Oficial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg border ${data.tieneAntecedentes ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="text-sm font-medium text-gray-700 mb-2">Resultado del Sistema:</div>
                  <div className={`font-bold text-lg ${data.tieneAntecedentes ? 'text-red-700' : 'text-green-700'}`}>
                    {data.resultadoFormateado || data.resultado}
                  </div>
                  {data.resultado && data.resultado !== 'Consulta realizada' && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Detalle:</strong> {data.resultado}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Información Legal */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Información importante:</strong> Este certificado es válido únicamente para el momento de su consulta. 
                Los antecedentes penales pueden cambiar en cualquier momento. Para trámites oficiales, 
                se recomienda obtener un certificado oficial del Ministerio del Interior.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <SidebarTrigger />
          <div className="ml-4">
            <h1 className="text-lg font-semibold">Consulta de Antecedentes Penales</h1>
          </div>
        </div>
      </header>
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Consulta de Antecedentes Penales
              </CardTitle>
              <CardDescription>
                Consulta los antecedentes penales en el sistema oficial del Ministerio del Interior del Ecuador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cedula">Número de Cédula</Label>
                  <Input
                    id="cedula"
                    placeholder="Ingrese los 10 dígitos de la cédula"
                    {...register("cedula", {
                      required: "La cédula es requerida",
                      pattern: { 
                        value: /^\d{10}$/, 
                        message: "La cédula debe tener exactamente 10 dígitos" 
                      },
                    })}
                  />
                  {errors.cedula && (
                    <p className="text-sm text-red-600">{errors.cedula.message}</p>
                  )}
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-1">Tiempo de Procesamiento</h4>
                      <p className="text-sm text-amber-700">
                        Esta consulta puede tomar de 15 a 30 segundos. El sistema accederá al portal oficial 
                        del Ministerio del Interior para obtener la información actualizada, incluyendo el certificado PDF oficial.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin mr-2" />
                      Consultando...
                    </>
                  ) : (
                    "Iniciar Consulta"
                  )}
                </Button>
                
                {needsRetry && (
                  <Button 
                    type="button" 
                    onClick={handleRetry} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Reintentar Consulta
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {error && (
            <Card className="mt-6 border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <div className="font-semibold">Error en la consulta</div>
                    <div className="text-sm">{error}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {showResult && antecedentesPenalesData && (
            <ResultCard data={antecedentesPenalesData} />
          )}
        </div>
      </div>

      {/* Modal de PDF Viewer */}
      {showPdfViewer && <PdfViewer />}
    </div>
  );
}