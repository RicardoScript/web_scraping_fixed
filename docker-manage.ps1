param(
    [Parameter(Mandatory=$true)]
    [string]$Action,
    [string]$Service
)

# Cargar variables de entorno desde .env si existe
$envFile = ".env"
$ServerIP = "18.117.79.180"
$FrontendPort = "80"
$MongoPort = "27018"
$VncPort = "6080"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^SERVER_IP=(.+)$") { $ServerIP = $matches[1] }
        if ($_ -match "^FRONTEND_PORT=(.+)$") { $FrontendPort = $matches[1] }
        if ($_ -match "^MONGODB_PORT=(.+)$") { $MongoPort = $matches[1] }
        if ($_ -match "^VNC_PORT=(.+)$") { $VncPort = $matches[1] }
    }
}

switch ($Action) {
    "build" {
        Write-Host "Construyendo las imagenes Docker..." -ForegroundColor Yellow
        docker-compose build --no-cache
    }
    "up" {
        Write-Host "Iniciando los servicios..." -ForegroundColor Green
        docker-compose up -d
        Write-Host "Servicios iniciados!" -ForegroundColor Green
        Write-Host "Frontend: http://${ServerIP}:${FrontendPort}" -ForegroundColor Cyan
        Write-Host "MongoDB: mongodb://${ServerIP}:${MongoPort}" -ForegroundColor Cyan
        Write-Host "VNC: http://${ServerIP}:${VncPort}" -ForegroundColor Cyan
    }
    "down" {
        Write-Host "Deteniendo los servicios..." -ForegroundColor Red
        docker-compose down
    }
    "logs" {
        if ([string]::IsNullOrEmpty($Service)) {
            docker-compose logs -f
        } else {
            docker-compose logs -f $Service
        }
    }
    "restart" {
        Write-Host "Reiniciando los servicios..." -ForegroundColor Yellow
        docker-compose restart
    }
    "clean" {
        Write-Host "Limpiando contenedores, imagenes y volumenes..." -ForegroundColor Red
        docker-compose down -v
        docker system prune -f
        docker volume prune -f
    }
    "status" {
        Write-Host "Estado de los servicios:" -ForegroundColor Blue
        docker-compose ps
    }
    default {
        Write-Host "Script de manejo Docker para Web Scraping" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "Comandos disponibles:" -ForegroundColor White
        Write-Host "  build     - Construir las imagenes Docker" -ForegroundColor Gray
        Write-Host "  up        - Iniciar todos los servicios" -ForegroundColor Gray
        Write-Host "  down      - Detener todos los servicios" -ForegroundColor Gray
        Write-Host "  logs      - Ver logs (usar -Service para logs especificos)" -ForegroundColor Gray
        Write-Host "  restart   - Reiniciar todos los servicios" -ForegroundColor Gray
        Write-Host "  clean     - Limpiar contenedores, imagenes y volumenes" -ForegroundColor Gray
        Write-Host "  status    - Ver estado de los servicios" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Ejemplo: .\docker-manage.ps1 -Action up" -ForegroundColor Yellow
        Write-Host "Ejemplo: .\docker-manage.ps1 -Action logs -Service backend" -ForegroundColor Yellow
    }
}
