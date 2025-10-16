"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Building2, User, Calendar, FileText, Table, TrendingUp } from "lucide-react"

type FormData = {
  ruc: string // ✅ Cambio de cedulaRuc a ruc para consistencia
}

interface TablaData {
  titulo: string
  headers: string[]
  filas: Record<string, string>[]
  totalFilas: number
}

interface SuperciasData {
  cedulaRuc: string
  tipoPersona: string
  tablas: TablaData[]
  fechaConsulta: string
  estado: string
  totalTablas: number
  totalRegistros: number
}

export function SuperCiasPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [superciasData, setSuperciasData] = useState<SuperciasData | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [noResults, setNoResults] = useState(false)
  const [selectedTable, setSelectedTable] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setShowResult(false)
    setSuperciasData(null)
    setSelectedTable(null)
    setError(null)
    setNoResults(false)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://18.217.24.122:3000";
      const response = await fetch(`${apiBaseUrl}/api/supercias-empresas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ruc: data.ruc }), // ✅ Corregido: ahora envía 'ruc'
      })

      const resultado = await response.json()

      if (resultado.success) {
        // ✅ Verificar si no está registrado
        if (resultado.data.estado === 'no_registrado') {
          setNoResults(true)
        } else {
          setSuperciasData(resultado.data)
          setShowResult(true)
        }
      } else {
        setError(resultado.message || "Ocurrió un error, por favor intenta más tarde.")
      }
    } catch (error) {
      console.error("Error al consultar Superintendencia de Compañías:", error)
      setError("Error de conexión con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  const ResultCard = ({ data }: { data: SuperciasData }) => (
    <div className="mt-6 space-y-6">
      {/* Resumen general */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            Resultado de Superintendencia de Compañías
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-600">Tipo</div>
                <div className="font-semibold text-blue-700">{data.tipoPersona}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Table className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-gray-600">Tablas</div>
                <div className="font-semibold text-green-700">{data.totalTablas}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm font-medium text-gray-600">Registros</div>
                <div className="font-semibold text-purple-700">{data.totalRegistros}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div>
                <div className="text-sm font-medium text-gray-600">Consulta</div>
                <div className="font-semibold text-gray-700">
                  {new Date(data.fechaConsulta).toLocaleDateString('es-EC')}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <FileText className="h-5 w-5 text-gray-600" />
            <div>
              <div className="text-sm font-medium text-gray-600">Cédula/RUC Consultado</div>
              <div className="font-semibold">{data.cedulaRuc}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tablas */}
      <Card>
        <CardHeader>
          <CardTitle>Tablas Encontradas</CardTitle>
          <CardDescription>
            Se encontraron {data.totalTablas} tablas con información
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.tablas.map((tabla, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTable === index 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTable(selectedTable === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Table className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">{tabla.titulo}</div>
                      <div className="text-sm text-gray-600">
                        {tabla.totalFilas} registro{tabla.totalFilas !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalles de la tabla seleccionada */}
      {selectedTable !== null && data.tablas[selectedTable] && (
        <Card>
          <CardHeader>
            <CardTitle>{data.tablas[selectedTable].titulo}</CardTitle>
            <CardDescription>
              {data.tablas[selectedTable].totalFilas} registros encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    {data.tablas[selectedTable].headers.map((header, index) => (
                      <th key={index} className="border border-gray-300 px-4 py-2 text-left font-semibold text-sm">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.tablas[selectedTable].filas.map((fila, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {data.tablas[selectedTable].headers.map((header, colIndex) => (
                        <td key={colIndex} className="border border-gray-300 px-4 py-2 text-sm">
                          {fila[header] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información adicional */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>Información importante:</strong> Estos datos provienen de la Superintendencia de Compañías, 
          Valores y Seguros del Ecuador. La información mostrada corresponde al momento de la consulta y puede 
          cambiar con el tiempo. Para trámites oficiales, consulte directamente en la página oficial de la SUPERCIAS.
        </div>
      </div>

      {/* Mostrar resultados como tabla similar a SRI Deudas */}
      {data && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full table-auto border border-gray-300">
              <tbody>
                <tr className="border-b">
                  <td className="font-semibold p-2">RUC/Cédula:</td>
                  <td className="p-2">{data.cedulaRuc}</td>
                </tr>
                <tr className="border-b">
                  <td className="font-semibold p-2">Tipo de Persona:</td>
                  <td className="p-2">{data.tipoPersona}</td>
                </tr>
                <tr className="border-b">
                  <td className="font-semibold p-2">Fecha de Consulta:</td>
                  <td className="p-2">{new Date(data.fechaConsulta).toLocaleDateString('es-EC')}</td>
                </tr>
                <tr className="border-b">
                  <td className="font-semibold p-2">Estado:</td>
                  <td className="p-2 capitalize">{data.estado}</td>
                </tr>
                <tr className="border-b">
                  <td className="font-semibold p-2">Total Tablas:</td>
                  <td className="p-2">{data.totalTablas}</td>
                </tr>
                <tr>
                  <td className="font-semibold p-2">Total Registros:</td>
                  <td className="p-2">{data.totalRegistros}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <SidebarTrigger />
          <div className="ml-4">
            <h1 className="text-lg font-semibold">Superintendencia de Compañías</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Consulta Superintendencia de Compañías
              </CardTitle>
              <CardDescription>
                Consulta información empresarial mediante cédula o RUC en la base de datos de la 
                Superintendencia de Compañías, Valores y Seguros del Ecuador.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ruc">RUC o Cédula</Label> {/* ✅ Cambio de label */}
                  <Input
                    id="ruc"
                    placeholder="Ej: 1234567890001 o 1234567890"
                    {...register("ruc", {
                      required: "El RUC o Cédula son requeridos", // ✅ Consistente con SriDeudas
                      pattern: {
                        value: /^\d{10}(\d{3})?$/,
                        message: "Debe ser una cédula (10 dígitos) o RUC (13 dígitos)",
                      },
                    })}
                  />
                  {errors.ruc && <p className="text-sm text-destructive">{errors.ruc.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Consultando..." : "Consultar Superintendencia"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {showResult && superciasData && (
            <ResultCard data={superciasData} />
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
                      No se encontraron registros
                    </h3>
                    <p className="text-gray-500">
                      No se encontraron registros en la Superintendencia de Compañías para este RUC.
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