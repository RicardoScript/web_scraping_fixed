"use client";

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SidebarTrigger } from "@/components/ui/sidebar"

type FormData = {
  ruc: string
}

interface DatosContribuyente {
  estado: string
  tipoContribuyente: string
  regimen: string
}

interface Establecimiento {
  numEstablecimiento: string
  nombre: string
  ubicacion: string
  estado: string
}

interface ConsultaSRIData {
  ruc: string
  datosContribuyente: DatosContribuyente
  establecimientos: Establecimiento[]
  fechaConsulta: string
}

export function ConsultaSRIPage() {
  const [error, setError] = useState<string>("")
  const [noResults, setNoResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sriData, setSriData] = useState<ConsultaSRIData | null>(null)
  const [showCards, setShowCards] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setShowCards(false);
    setSriData(null);
    setError("");
    setNoResults(false);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://18.217.24.122:3000";
      const response = await fetch(`${apiBaseUrl}/api/consulta-sri`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ruc: data.ruc }),
      });

      const resultado = await response.json();
      console.log("API Response:", resultado); // Debug: Log the API response

      if (resultado.success) {
        const { ruc, datosContribuyente, establecimientos, fechaConsulta } = resultado.data; // Destructure from resultado.data
        // Check if there’s valid data in either datosContribuyente or establecimientos
        if (
          (datosContribuyente && Object.keys(datosContribuyente).length > 0) ||
          (establecimientos && establecimientos.length > 0)
        ) {
          setSriData({
            ruc,
            datosContribuyente: datosContribuyente || {},
            establecimientos: establecimientos || [],
            fechaConsulta,
          });
          setShowCards(true);
        } else {
          setNoResults(true);
        }
      } else {
        setError(resultado.message || "Ocurrió un error al hacer scraping");
      }
    } catch (error) {
      console.error("Error al consultar SRI:", error);
      setError("Ocurrió un error al hacer scraping");
    } finally {
      setIsLoading(false);
    }
  };

  const ContribuyenteCard = ({ datosContribuyente, ruc }: { 
    datosContribuyente: DatosContribuyente, 
    ruc: string 
  }) => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏢 Información del Contribuyente
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            datosContribuyente.estado === 'ACTIVO' 
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
            {datosContribuyente.estado}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-sm font-medium text-blue-600 mb-2">RUC</div>
              <div className="text-xl font-bold text-blue-800 font-mono">{ruc}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-blue-600 mb-2">Tipo de Contribuyente</div>
              <div className="text-lg font-semibold text-blue-800">{datosContribuyente.tipoContribuyente}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-blue-600 mb-2">Régimen Tributario</div>
              <div className="text-lg font-semibold text-blue-800">{datosContribuyente.regimen}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const EstablecimientosCards = ({ establecimientos }: { establecimientos: Establecimiento[] }) => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏪 Establecimientos Registrados
          <span className="text-sm font-normal text-muted-foreground">
            ({establecimientos.length} {establecimientos.length === 1 ? 'establecimiento' : 'establecimientos'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {establecimientos.map((establecimiento, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header del establecimiento */}
                  <div className="border-b pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-blue-600">
                          Establecimiento {establecimiento.numEstablecimiento}
                        </h3>
                        {establecimiento.nombre && (
                          <p className="text-sm font-medium text-gray-600 mt-1">
                            {establecimiento.nombre}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        establecimiento.estado === 'ABIERTO' 
                          ? "bg-green-100 text-green-800"
                          : establecimiento.estado === 'CERRADO'
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {establecimiento.estado}
                      </span>
                    </div>
                  </div>

                  {/* Información del establecimiento */}
                  <div className="space-y-3">
                    {!establecimiento.nombre && (
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 italic text-center">
                          Sin nombre comercial registrado
                        </p>
                      </div>
                    )}

                    {/* Ubicación */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm text-green-800 mb-2">📍 Ubicación</h4>
                      <p className="text-sm text-green-700 leading-relaxed">
                        {establecimiento.ubicacion}
                      </p>
                    </div>

                    {/* Detalles adicionales */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-medium text-gray-600">Número:</span>
                          <p className="font-mono text-gray-800">{establecimiento.numEstablecimiento}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Estado:</span>
                          <p className="font-semibold text-gray-800">{establecimiento.estado}</p>
                        </div>
                      </div>
                    </div>

                    {/* Alerta si está cerrado */}
                    {establecimiento.estado === 'CERRADO' && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-red-600">⚠️</span>
                          <p className="text-sm text-red-800 font-medium">
                            Establecimiento cerrado
                          </p>
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                          Este establecimiento no se encuentra operativo.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <SidebarTrigger />
          <div className="ml-4">
            <h1 className="text-lg font-semibold">Consulta SRI - Solo RUC</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Consulta SRI - Solo RUC</CardTitle>
              <CardDescription>
                Verifica información tributaria y establecimientos registrados ingresando el número de RUC (13 dígitos).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ruc">Número de RUC</Label>
                  <Input
                    id="ruc"
                    placeholder="Ej: 1234567890001 (RUC - 13 dígitos)"
                    {...register("ruc", {
                      required: "El RUC es requerido",
                      pattern: {
                        value: /^\d{13}$/,
                        message: "El RUC debe tener exactamente 13 dígitos",
                      },
                    })}
                  />
                  {errors.ruc && <p className="text-sm text-destructive">{errors.ruc.message}</p>}
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Solo se permiten números de RUC (13 dígitos). No se aceptan cédulas.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Consultando..." : "Consultar"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {showCards && sriData && (
            <div className="space-y-6">
              {/* Resumen */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Resumen de Consulta SRI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm font-bold text-blue-600">{sriData.ruc}</div>
                      <div className="text-sm text-blue-600">RUC Consultado</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {sriData.establecimientos.filter(e => e.estado === 'ABIERTO').length}
                      </div>
                      <div className="text-sm text-green-600">Establecimientos Abiertos</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {sriData.establecimientos.filter(e => e.estado === 'CERRADO').length}
                      </div>
                      <div className="text-sm text-red-600">Establecimientos Cerrados</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información del Contribuyente */}
              <ContribuyenteCard 
                datosContribuyente={sriData.datosContribuyente} 
                ruc={sriData.ruc}
              />

              {/* Establecimientos */}
              {sriData.establecimientos.length > 0 && (
                <EstablecimientosCards establecimientos={sriData.establecimientos} />
              )}
            </div>
          )}

          {/* Mostrar mensaje de error */}
          {error && (
            <div className="mt-4 text-red-600 font-semibold">
              {error}
            </div>
          )}

          {/* Mostrar mensaje cuando no hay resultados */}
          {noResults && (
            <div className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🏢</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No se encontraron datos
                    </h3>
                    <p className="text-gray-500">
                      No se encontraron datos para el RUC consultado en el sistema del SRI.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}