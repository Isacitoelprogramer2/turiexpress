# =====================================================
# Script: iniciar-git.ps1
# Propósito: Inicializar el repositorio Git local de turiexpress
# Autor: Isaac Daniel Pingo Mezones
# =====================================================

# 1. Configurar identidad de Git (solo para este proyecto, no global)
git config user.name "Isaac Daniel Pingo Mezones"
git config user.email "u25255014@utp.edu.pe"

# 2. Crear .gitignore apropiado para un sitio web estático en Firebase
$gitignore = @"
# Configuración local de Claude Code
.claude/

# Dependencias y archivos de build (por si los agregas a futuro)
node_modules/
dist/
build/
.cache/

# Variables de entorno (credenciales, claves de API, etc.)
.env
.env.local
.env.*.local

# Archivos del sistema operativo
.DS_Store
Thumbs.db
desktop.ini

# Archivos temporales y de editores
*.log
*.tmp
*.swp
.vscode/
.idea/

# Caché local de Firebase CLI
.firebase/
firebase-debug.log
firestore-debug.log
ui-debug.log
"@
Set-Content -Path ".gitignore" -Value $gitignore -Encoding UTF8

# 3. Inicializar el repositorio
git init

# 4. Cambiar a rama principal "main" (convención moderna)
git branch -M main

# 5. Agregar todos los archivos (respetando .gitignore)
git add .

# 6. Hacer el primer commit
git commit -m "Initial commit: landing Turiexpress con 4 tours y deploy en Firebase Hosting"

# 7. Mostrar resumen del estado
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  ✅ Repositorio Git inicializado con éxito" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Rama actual: main" -ForegroundColor Cyan
Write-Host "Usuario configurado: Isaac Daniel Pingo Mezones" -ForegroundColor Cyan
Write-Host "Email configurado: u25255014@utp.edu.pe" -ForegroundColor Cyan
Write-Host ""

# 8. Verificar qué se va a subir (solo el primero que aparece, resumido)
$filesToCommit = git ls-files | Measure-Object
Write-Host "Archivos en el commit inicial: $($filesToCommit.Count)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Los próximos pasos son:" -ForegroundColor Magenta
Write-Host "  1. Revisar el commit: git log --oneline" -ForegroundColor White
Write-Host "  2. Crear un repo en https://github.com/new" -ForegroundColor White
Write-Host "  3. Conectar y subir: me avisas y te doy los comandos" -ForegroundColor White
