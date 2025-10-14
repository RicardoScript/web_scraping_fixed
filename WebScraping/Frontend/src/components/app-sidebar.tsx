import {
  FileText,
  Gavel,
  Building2,
  Receipt,
  UserX,
  Heart,
  Scale,
  GraduationCap,
  Shield,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

// --- Menú lateral con las secciones disponibles ---
const menuItems = [
  { title: "Datos IESS", url: "/datos-iess", icon: FileText },
  { title: "Citaciones ANT", url: "/citaciones-ant", icon: FileText },
  { title: "Citación Judicial", url: "/citacion-judicial", icon: Gavel },
  { title: "Consejo Judicatura", url: "/consejo-judicatura", icon: Building2 },
  { title: "Consulta SRI", url: "/consulta-sri", icon: Receipt },
  { title: "SRI Deudas", url: "/sri-deudas", icon: Receipt },
  { title: "Impedimentos Cargos Públicos", url: "/impedimentos-cargos", icon: UserX },
  { title: "Pensión Alimenticia", url: "/pension-alimenticia", icon: Heart },
  { title: "Procesos Judiciales", url: "/procesos-judiciales", icon: Scale },
  { title: "Senescyt", url: "/senescyt", icon: GraduationCap },
  { title: "Super CIAS", url: "/supercias", icon: Building2 },
  { title: "Interpol", url: "/interpol", icon: FileText },
  { title: "Antecedentes Penales", url: "/antecedentes-penales", icon: Shield },
];

// --- Componente principal del Sidebar ---
export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar>
      {/* Encabezado del panel lateral */}
      <SidebarHeader>
        <div className="px-4 py-3">
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            Sistema Scraping
          </h2>
          <p className="text-sm text-sidebar-foreground/70">
            Consultas y verificaciones
          </p>
        </div>
      </SidebarHeader>

      {/* Contenido principal del sidebar */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Consultas Disponibles</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200
                          ${
                            isActive
                              ? "bg-blue-600 opacity-50 text-white shadow-lg shadow-blue-400/40 scale-[1.02]"
                              : "hover:bg-blue-100 hover:shadow-md hover:scale-[1.01]"
                          }`}
                      >
                        <item.icon
                          className={`w-5 h-5 ${
                            isActive ? "text-white" : "text-gray-600"
                          }`}
                        />
                        <span className="text-sm font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
