"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";

type FormData = {
  ruc: string;
};

interface SriDeudasData {
  ruc: string;
  rucObtenida: string;
  razonSocial: string;
  fechaCorte: string;
  estadoDeuda: string;
  fechaConsulta: string;
  tipoResultado: string;
}

export function SriDeudasPage() {
  const [datos, setDatos] = useState<SriDeudasData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vncWindow, setVncWindow] = useState<Window | null>(null);
  const [needsRetry, setNeedsRetry] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  // Cerrar noVNC cuando no está cargando
  useEffect(() => {
    if (!isLoading && vncWindow && !vncWindow.closed) {
      const timer = setTimeout(() => {
        vncWindow.close();
        setVncWindow(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, vncWindow]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (vncWindow && !vncWindow.closed) {
        vncWindow.close();
        setVncWindow(null);
      }
    };
  }, [vncWindow]);

  const onSubmit = async (data: FormData) => {
    if (isLoading) return;
    setIsLoading(true);
    setDatos(null);
    setError(null);
    setNeedsRetry(false);
    setFormData(data);

    // Abrir noVNC
    const vncUrl = import.meta.env.VITE_VNC_URL;
    const windowRef = window.open(`${vncUrl}/vnc.html`);
    if (windowRef) {
      setVncWindow(windowRef);
    } else {
      setError(`No se pudo abrir noVNC. Abre manualmente ${vncUrl}/vnc.html y reintenta.`);
      setNeedsRetry(true);
      setIsLoading(false);
      return;
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://18.217.24.122:3000";
      const response = await fetch(`${apiBaseUrl}/api/sri-deudas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ruc: data.ruc }),
      });

      const resultado = await response.json();

      // Si el CAPTCHA se resolvió, reintentar automáticamente
      if (resultado.captchaResolved) {
        if (vncWindow && !vncWindow.closed) {
          vncWindow.close();
          setVncWindow(null);
        }
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return onSubmit(data);
      }

      // Si se necesita resolver CAPTCHA manualmente
      if (resultado.error === "captcha_required" || resultado.error === "incapsula_blocked") {
        setError(resultado.message);
        setNeedsRetry(true);
        setIsLoading(false);
        return;
      }

      // Si la consulta fue exitosa
      if (resultado.success) {
        setDatos(resultado.data);
      } else {
        setError(resultado.message || "Ocurrió un error al consultar deudas SRI");
      }
    } catch (error) {
      console.error("Error al consultar deudas SRI:", error);
      setError("Ocurrió un error al consultar deudas SRI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (formData) {
      onSubmit(formData);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center px-4">
          <SidebarTrigger />
          <div className="ml-4">
            <h1 className="text-lg font-semibold">SRI Deudas</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Consulta de Deudas SRI</CardTitle>
              <CardDescription>
                Ingresa el RUC o cédula para verificar deudas firmes o impugnadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ruc">RUC o Cédula</Label>
                  <Input
                    id="ruc"
                    placeholder="Ej: 1234567890001"
                    {...register("ruc", {
                      required: "El RUC o Cédula son requeridos",
                      pattern: {
                        value: /^\d{10,13}$/,
                        message: "El RUC o cédula debe tener 10 o 13 dígitos",
                      },
                    })}
                  />
                  {errors.ruc && <p className="text-sm text-destructive">{errors.ruc.message}</p>}
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl">ℹ️</span>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-1">Información Importante</h4>
                      <p className="text-sm text-blue-700">
                        Esta consulta puede requerir resolver un CAPTCHA mediante noVNC. La ventana de noVNC se abrirá automáticamente y se cerrará al finalizar.
                      </p>
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Consultando..." : "Consultar"}
                </Button>
                {needsRetry && (
                  <Button
                    type="button"
                    onClick={handleRetry}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Reintentar Consulta (después de resolver en noVNC)
                  </Button>
                )}
              </form>

              {error && (
                <div className="mt-4 text-red-600 font-semibold">
                  {error}
                </div>
              )}

              {datos && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2">Resultados</h2>
                  <table className="w-full table-auto border border-gray-300">
                    <tbody>
                      <tr className="border-b">
                        <td className="font-semibold p-2">RUC:</td>
                        <td className="p-2">{datos.rucObtenida}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="font-semibold p-2">Razón Social:</td>
                        <td className="p-2">{datos.razonSocial}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="font-semibold p-2">Fecha de Corte:</td>
                        <td className="p-2">{datos.fechaCorte}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold p-2">Estado de Deuda:</td>
                        <td className="p-2">{datos.estadoDeuda}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}