import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SidebarTrigger } from "@/components/ui/sidebar"

type FormData = {
  cedula: string
}

interface CitacionJudicial {
  provincia: string
  canton: string
  judicatura: string
  numeroCausa: string
  demandado: string
  proceso: string
  fechaRazonCopias: string
  fechaRazonEnvio: string
  fechaBoletasRecibidas: string
  fechaDevolucion: string
  fechaAsignacionCitado: string
  estado: string
  fechaActaCitacion: string
  tiposCitacion: string
}

interface CitacionesJudicialesData {
  citaciones: CitacionJudicial[]
  totalCitaciones: number
  cedula: string
}

export function CitacionJudicialPage() {
  const [error, setError] = useState<string>("")
  const [noResults, setNoResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [citacionesData, setCitacionesData] = useState<CitacionesJudicialesData | null>(null)
  const [showCards, setShowCards] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setShowCards(false)
    setCitacionesData(null)
    setError("")
    setNoResults(false)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://18.217.24.122:3000";
      const response = await fetch(`${apiBaseUrl}/api/citaciones-judiciales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cedula: data.cedula }),
      })

      const resultado = await response.json()

      if (resultado.success) {
        const { citaciones, totalCitaciones, cedula } = resultado.data

        if (totalCitaciones > 0) {
          setCitacionesData({
            citaciones,
            totalCitaciones,
            cedula
          })
          setShowCards(true)
        } else {
          setNoResults(true)
        }
      } else {
        setError("Ocurrió un error al hacer scraping")
      }
    } catch (error) {
      console.error("Error al consultar citaciones judiciales:", error)
      setError("Ocurrió un error al hacer scraping")
    } finally {
      setIsLoading(false)
    }
  }

  const CitacionesCards = ({ citaciones }: { citaciones: CitacionJudicial[] }) => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⚖️ Citaciones Judiciales Encontradas
          <span className="text-sm font-normal text-muted-foreground">
            ({citaciones.length} {citaciones.length === 1 ? 'citación' : 'citaciones'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {citaciones.map((citacion, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header de la citación */}
                  <div className="border-b pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-lg text-blue-600">Causa: {citacion.numeroCausa}</p>
                        <p className="text-sm text-gray-600">{citacion.proceso}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        citacion.estado === 'NO REALIZADO' 
                          ? "bg-red-100 text-red-800"
                          : citacion.estado === 'REALIZADO'
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {citacion.estado}
                      </span>
                    </div>
                    <p className="text-sm"><span className="font-medium">Demandado:</span> {citacion.demandado}</p>
                  </div>

                  {/* Ubicación */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-sm text-blue-800 mb-2">📍 Ubicación</h4>
                    <p className="text-sm mb-1"><span className="font-medium">Provincia:</span> {citacion.provincia}</p>
                    <p className="text-sm mb-1"><span className="font-medium">Cantón:</span> {citacion.canton}</p>
                    <p className="text-sm"><span className="font-medium">Judicatura:</span> {citacion.judicatura}</p>
                  </div>

                  {/* Fechas importantes */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">📅 Fechas del Proceso</h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      {citacion.fechaRazonEnvio && (
                        <p><span className="font-medium">Razón de Envío:</span> {citacion.fechaRazonEnvio}</p>
                      )}
                      {citacion.fechaBoletasRecibidas && (
                        <p><span className="font-medium">Boletas Recibidas:</span> {citacion.fechaBoletasRecibidas}</p>
                      )}
                      {citacion.fechaAsignacionCitado && (
                        <p><span className="font-medium">Asignación Citado:</span> {citacion.fechaAsignacionCitado}</p>
                      )}
                      {citacion.fechaActaCitacion && (
                        <p><span className="font-medium">Acta de Citación:</span> {citacion.fechaActaCitacion}</p>
                      )}
                      {citacion.fechaRazonCopias && (
                        <p><span className="font-medium">Razón de Copias:</span> {citacion.fechaRazonCopias}</p>
                      )}
                      {citacion.fechaDevolucion && (
                        <p><span className="font-medium">Devolución:</span> {citacion.fechaDevolucion}</p>
                      )}
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-sm text-orange-800 mb-2">ℹ️ Detalles</h4>
                    <p className="text-sm">
                      <span className="font-medium">Tipo de Citación:</span> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        citacion.tiposCitacion === 'DESCONOCIDO' 
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-orange-200 text-orange-700'
                      }`}>
                        {citacion.tiposCitacion}
                      </span>
                    </p>
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
            <h1 className="text-lg font-semibold">Citación Judicial</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Consulta de Citación Judicial</CardTitle>
              <CardDescription>
                Verifica si tienes citaciones judiciales pendientes ingresando tu número de cédula.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cedula">Número de Cédula</Label>
                  <Input
                    id="cedula"
                    placeholder="Ej: 1234567890"
                    {...register("cedula", {
                      required: "La cédula es requerida",
                      pattern: {
                        value: /^\d{10}$/,
                        message: "La cédula debe tener 10 dígitos",
                      },
                    })}
                  />
                  {errors.cedula && <p className="text-sm text-destructive">{errors.cedula.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Consultando..." : "Consultar"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {showCards && citacionesData && (
            <div className="space-y-6">
              {/* Resumen */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Resumen de Consulta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{citacionesData.totalCitaciones}</div>
                      <div className="text-sm text-blue-600">Total Citaciones</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cards de Citaciones */}
              <CitacionesCards citaciones={citacionesData.citaciones} />
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
                    <div className="text-6xl mb-4">⚖️</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No se encontraron citaciones
                    </h3>
                    <p className="text-gray-500">
                      No se encontraron citaciones judiciales para la cédula consultada.
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
