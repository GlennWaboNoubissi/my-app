# 🚀 Oazys - Marketplace de Produits Digitaux

Oazys est une marketplace complète et moderne pour la vente et l'achat de produits digitaux, avec un système d'affiliation intégré, des paiements sécurisés via CinetPay, et des liens de téléchargement cryptés.

## ✨ Fonctionnalités Principales

### 🛒 **Marketplace Complète**
- Page d'accueil impactante et moderne
- Catalogue de produits avec filtres avancés (catégorie, prix, popularité)
- Pages produit individuelles avec aperçus et descriptions détaillées
- Système de recherche puissant
- Catégories organisées et navigation intuitive

### 💳 **Paiements Sécurisés**
- Intégration complète avec **CinetPay**
- Support pour Mobile Money et autres méthodes locales
- Webhooks sécurisés pour validation automatique
- Gestion des produits gratuits
- Calcul automatique des commissions

### 🔐 **Sécurité Avancée**
- Liens de téléchargement **cryptés et temporaires**
- Expiration automatique configurable (24h par défaut)
- Limite de téléchargements par achat
- Rate limiting sur les API
- Validation des webhooks avec signature

### 📧 **Système d'Email Automatisé**
- Email de confirmation d'achat
- Envoi automatique des liens de téléchargement
- Notifications aux vendeurs lors des ventes
- Templates d'email personnalisés et responsives
- Support SMTP configurable

### 💰 **Système de Wallet & Affiliation**
- Wallet personnel pour chaque utilisateur
- Calcul automatique des gains après chaque vente
- **Programme d'affiliation** avec codes personnalisés
- Commission configurable pour les affiliés
- Système de retrait manuel ou automatique

### 🎯 **Dashboard Utilisateur**
- Interface vendeur : gestion des produits, statistiques, gains
- Interface acheteur : historique d'achats, re-téléchargements
- Analytics avancés pour les vendeurs
- Gestion des liens d'affiliation

### ⚙️ **Administration**
- Panel d'administration complet
- Gestion des utilisateurs et des produits
- Validation et modération du contenu
- Statistiques globales de la plateforme
- Gestion des litiges et du support

## 🛠️ Technologies Utilisées

### **Frontend**
- **Next.js 14** avec App Router
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour un design moderne et responsive
- **Framer Motion** pour les animations fluides
- **React Hook Form** + **Zod** pour la validation
- **Lucide React** pour les icônes

### **Backend & Base de Données**
- **Supabase** pour l'authentification et la base de données
- **PostgreSQL** via Supabase
- **Row Level Security (RLS)** pour la sécurité
- API Routes Next.js pour la logique métier

### **Paiements & Sécurité**
- **CinetPay** pour les paiements locaux
- **Crypto-js** pour le chiffrement des liens
- **JWT** pour les tokens de téléchargement
- **Nodemailer** pour l'envoi d'emails

## 🚀 Installation et Configuration

### 1. **Cloner le Projet**
```bash
git clone <repository-url>
cd oazys-marketplace
npm install
```

### 2. **Configuration Environnement**
Copier `.env.example` vers `.env.local` et configurer :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CinetPay Configuration
CINETPAY_API_KEY=your_cinetpay_api_key
CINETPAY_SECRET_KEY=your_cinetpay_secret_key
CINETPAY_SITE_ID=your_cinetpay_site_id
NEXT_PUBLIC_CINETPAY_SITE_ID=your_cinetpay_site_id

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Email Configuration (SMTP)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@oazys.com

# Security
JWT_SECRET=your_jwt_secret_for_download_links
ENCRYPTION_KEY=your_32_char_encryption_key

# Webhooks
WEBHOOK_SECRET=your_webhook_secret_key
```

### 3. **Base de Données Supabase**
Exécuter les migrations SQL dans Supabase :

```sql
-- Créer les tables principales
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'staff')),
  wallet_balance DECIMAL DEFAULT 0,
  affiliate_code TEXT UNIQUE NOT NULL,
  referrer_id UUID REFERENCES users(id),
  total_earnings DECIMAL DEFAULT 0,
  affiliate_earnings DECIMAL DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  products_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  price DECIMAL NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  category_id UUID REFERENCES categories(id),
  seller_id UUID REFERENCES users(id),
  image_url TEXT,
  preview_urls TEXT[],
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  downloads_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  amount DECIMAL NOT NULL,
  commission_amount DECIMAL DEFAULT 0,
  affiliate_id UUID REFERENCES users(id),
  affiliate_commission DECIMAL DEFAULT 0,
  cinetpay_transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE download_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT REFERENCES transactions(id),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES users(id),
  encrypted_url TEXT NOT NULL,
  downloads_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 3,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_downloaded_at TIMESTAMP WITH TIME ZONE
);

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_links ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS (exemples)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (is_active = TRUE);
```

### 4. **Démarrer l'Application**
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 📂 Structure du Projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # API Routes
│   │   ├── payment/       # Gestion des paiements
│   │   └── download/      # Téléchargements sécurisés
│   ├── auth/              # Pages d'authentification
│   ├── dashboard/         # Interface utilisateur
│   └── products/          # Pages produits
├── components/            # Composants React
│   ├── ui/               # Composants UI réutilisables
│   └── layout/           # Layout et navigation
├── lib/                  # Utilitaires et configurations
│   ├── supabase.ts       # Configuration Supabase
│   ├── cinetpay.ts       # Intégration CinetPay
│   ├── security.ts       # Sécurité et chiffrement
│   ├── email.ts          # Système d'emails
│   └── utils.ts          # Utilitaires généraux
└── types/                # Types TypeScript
```

## 🔐 Sécurité et Webhooks

### **Configuration Webhook CinetPay**
URL à configurer dans CinetPay : `https://votre-domaine.com/api/payment/webhook`

### **Liens de Téléchargement Sécurisés**
- Chiffrement AES-256
- Token JWT avec signature HMAC
- Expiration automatique (24h par défaut)
- Limite de téléchargements (3 par défaut)
- Rate limiting sur l'API

### **Validation des Paiements**
- Double vérification avec l'API CinetPay
- Signature webhook obligatoire
- Prévention de la double exécution
- Logs détaillés des transactions

## 🎨 Personnalisation

### **Couleurs et Thème**
Modifiez `tailwind.config.js` pour personnaliser les couleurs :

```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    // ... autres nuances
    900: '#0c4a6e',
  }
}
```

### **Configuration des Commissions**
Dans `.env.local` :
- `DEFAULT_COMMISSION_RATE=0.05` (5% pour la plateforme)
- `AFFILIATE_COMMISSION_RATE=0.10` (10% pour l'affilié)

### **Durée d'Expiration des Liens**
- `DOWNLOAD_LINK_EXPIRY_HOURS=24` (24 heures par défaut)

## 📧 Configuration Email

### **SMTP Gmail (exemple)**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_FROM=noreply@votre-domaine.com
```

### **Templates d'Email**
Les templates sont dans `src/lib/email.ts` et peuvent être personnalisés.

## 🚀 Déploiement

### **Vercel (Recommandé)**
```bash
npm install -g vercel
vercel --prod
```

### **Variables d'Environnement**
Configurez toutes les variables d'environnement sur votre plateforme de déploiement.

### **CinetPay Production**
- Configurez l'URL de webhook de production
- Utilisez les clés API de production
- Testez les paiements en mode sandbox d'abord

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Commitez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- 📧 Email : support@oazys.com
- 📱 WhatsApp : +225 07 XX XX XX XX
- 🐛 Issues GitHub : [Créer un issue](https://github.com/votre-repo/issues)

## 🔄 Changelog

### Version 1.0.0
- ✅ Marketplace complète avec catalogue produits
- ✅ Intégration CinetPay pour paiements
- ✅ Système d'affiliation
- ✅ Liens de téléchargement sécurisés
- ✅ Dashboard vendeur/acheteur
- ✅ Panel d'administration
- ✅ Système d'emails automatisés
- ✅ Interface responsive et moderne

---

**Fait avec ❤️ par l'équipe Oazys**