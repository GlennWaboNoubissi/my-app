#!/bin/bash

# Script d'installation automatisé pour Oazys Marketplace
# Auteur: Équipe Oazys
# Version: 1.0.0

echo "🚀 Bienvenue dans l'installation d'Oazys Marketplace"
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher des messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si Node.js est installé
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js $NODE_VERSION détecté"
    else
        print_error "Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
        exit 1
    fi
}

# Vérifier si npm est installé
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm $NPM_VERSION détecté"
    else
        print_error "npm n'est pas installé"
        exit 1
    fi
}

# Installer les dépendances
install_dependencies() {
    print_status "Installation des dépendances..."
    if npm install; then
        print_success "Dépendances installées avec succès"
    else
        print_error "Erreur lors de l'installation des dépendances"
        exit 1
    fi
}

# Créer le fichier .env.local
setup_env() {
    print_status "Configuration du fichier d'environnement..."
    
    if [ ! -f .env.local ]; then
        cp .env.example .env.local
        print_success "Fichier .env.local créé"
        print_warning "⚠️  N'oubliez pas de configurer vos variables d'environnement dans .env.local"
        echo ""
        echo "Variables importantes à configurer :"
        echo "- NEXT_PUBLIC_SUPABASE_URL"
        echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "- SUPABASE_SERVICE_ROLE_KEY"
        echo "- CINETPAY_API_KEY"
        echo "- CINETPAY_SECRET_KEY"
        echo "- JWT_SECRET"
        echo "- ENCRYPTION_KEY (32 caractères)"
        echo ""
    else
        print_warning "Le fichier .env.local existe déjà"
    fi
}

# Générer une clé de chiffrement
generate_encryption_key() {
    if command -v openssl &> /dev/null; then
        ENCRYPTION_KEY=$(openssl rand -hex 16)
        print_success "Clé de chiffrement générée: $ENCRYPTION_KEY"
        echo "Ajoutez cette ligne à votre .env.local :"
        echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
    else
        print_warning "OpenSSL non trouvé. Générez manuellement une clé de 32 caractères pour ENCRYPTION_KEY"
    fi
}

# Générer un secret JWT
generate_jwt_secret() {
    if command -v openssl &> /dev/null; then
        JWT_SECRET=$(openssl rand -base64 32)
        print_success "Secret JWT généré: $JWT_SECRET"
        echo "Ajoutez cette ligne à votre .env.local :"
        echo "JWT_SECRET=$JWT_SECRET"
    else
        print_warning "OpenSSL non trouvé. Générez manuellement un secret JWT"
    fi
}

# Créer les dossiers nécessaires
create_directories() {
    print_status "Création des dossiers nécessaires..."
    
    directories=(
        "public/uploads"
        "public/images/categories"
        "public/images/avatars"
        "public/images/products"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_success "Dossier créé: $dir"
        fi
    done
}

# Créer un fichier gitignore si nécessaire
setup_gitignore() {
    if [ ! -f .gitignore ]; then
        cat > .gitignore << EOF
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Uploads
public/uploads/*
!public/uploads/.gitkeep

# Temporary files
*.tmp
*.temp
EOF
        print_success "Fichier .gitignore créé"
    fi
}

# Afficher les prochaines étapes
show_next_steps() {
    echo ""
    echo "🎉 Installation terminée avec succès !"
    echo "=================================="
    echo ""
    echo "Prochaines étapes :"
    echo ""
    echo "1. 📝 Configurez vos variables d'environnement dans .env.local"
    echo "   - Créez un projet Supabase sur https://supabase.com"
    echo "   - Obtenez vos clés API CinetPay sur https://cinetpay.com"
    echo "   - Configurez votre SMTP pour les emails"
    echo ""
    echo "2. 🗄️  Exécutez les migrations SQL dans Supabase"
    echo "   - Copiez le SQL du README.md dans l'éditeur SQL de Supabase"
    echo ""
    echo "3. 🚀 Démarrez l'application en mode développement :"
    echo "   npm run dev"
    echo ""
    echo "4. 🌐 Ouvrez votre navigateur sur http://localhost:3000"
    echo ""
    echo "📚 Documentation complète disponible dans README.md"
    echo ""
    echo "🆘 Support :"
    echo "   - Email: support@oazys.com"
    echo "   - GitHub Issues: créez un ticket pour signaler un problème"
    echo ""
    print_success "Bonne chance avec votre marketplace Oazys ! 🚀"
}

# Fonction principale
main() {
    echo ""
    print_status "Vérification des prérequis..."
    check_node
    check_npm
    
    echo ""
    print_status "Installation des dépendances..."
    install_dependencies
    
    echo ""
    print_status "Configuration de l'environnement..."
    setup_env
    setup_gitignore
    create_directories
    
    echo ""
    print_status "Génération des clés de sécurité..."
    generate_encryption_key
    echo ""
    generate_jwt_secret
    
    show_next_steps
}

# Vérifier si le script est exécuté depuis le bon répertoire
if [ ! -f "package.json" ]; then
    print_error "Ce script doit être exécuté depuis la racine du projet Oazys"
    exit 1
fi

# Exécuter le script principal
main