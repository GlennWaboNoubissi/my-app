# 🚀 Guide de Déploiement - Oazys Marketplace

Ce guide vous accompagne dans le déploiement de la marketplace Oazys en production.

## 📋 Prérequis

### Comptes et Services Requis
- [ ] **Supabase** : Projet créé sur [supabase.com](https://supabase.com)
- [ ] **CinetPay** : Compte marchand sur [cinetpay.com](https://cinetpay.com)
- [ ] **SMTP** : Service email (Gmail, SendGrid, Mailgun, etc.)
- [ ] **Domaine** : Nom de domaine configuré avec SSL
- [ ] **Plateforme de déploiement** : Vercel, Netlify, AWS, etc.

### Outils de Développement
- Node.js 18+ installé
- Git configuré
- Accès terminal/console

## 🔧 Étapes de Déploiement

### 1. Configuration Supabase

#### Créer le Projet
1. Créez un nouveau projet sur [supabase.com](https://supabase.com)
2. Notez l'URL et les clés API (anon + service_role)
3. Activez l'authentification par email

#### Exécuter les Migrations
1. Ouvrez l'éditeur SQL dans Supabase
2. Copiez-collez le contenu de `database/migrations.sql`
3. Exécutez le script complet
4. Vérifiez que toutes les tables sont créées

#### Configurer l'Authentification
```sql
-- Dans l'éditeur SQL Supabase
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  'admin@oazys.com',
  crypt('votre_mot_de_passe_admin', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
);

-- Créer l'utilisateur admin dans la table users
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  affiliate_code,
  is_verified
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@oazys.com'),
  'admin@oazys.com',
  'Administrateur Oazys',
  'admin',
  'AFF_ADMIN',
  true
);
```

#### Configurer les Politiques RLS
Vérifiez que toutes les politiques RLS sont actives :
```sql
-- Lister les politiques
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 2. Configuration CinetPay

#### Paramètres de Base
1. Connectez-vous à votre dashboard CinetPay
2. Créez une nouvelle application
3. Configurez les URLs de retour :
   - **URL de succès** : `https://votre-domaine.com/payment/success`
   - **URL d'échec** : `https://votre-domaine.com/payment/failed`
   - **URL de notification** : `https://votre-domaine.com/api/payment/webhook`

#### Webhooks de Sécurité
1. Activez les webhooks dans les paramètres CinetPay
2. Définissez une clé secrète pour les webhooks
3. Testez l'URL de webhook avec l'outil de test CinetPay

### 3. Configuration Email (SMTP)

#### Gmail (Recommandé pour débuter)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
SMTP_FROM=noreply@votre-domaine.com
```

**Note** : Utilisez un mot de passe d'application Gmail, pas votre mot de passe principal.

#### SendGrid (Production)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre-clé-api-sendgrid
SMTP_FROM=noreply@votre-domaine.com
```

#### Mailgun (Alternative)
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre-clé-mailgun
SMTP_FROM=noreply@votre-domaine.com
```

### 4. Variables d'Environnement

#### Fichier .env.local Complet
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# CinetPay Configuration  
CINETPAY_API_KEY=votre-clé-api-cinetpay
CINETPAY_SECRET_KEY=votre-clé-secrète-cinetpay
CINETPAY_SITE_ID=votre-site-id
NEXT_PUBLIC_CINETPAY_SITE_ID=votre-site-id

# Application Settings
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
NEXTAUTH_SECRET=votre-secret-nextauth-super-long
NEXTAUTH_URL=https://votre-domaine.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_FROM=noreply@votre-domaine.com

# Security (Générez avec openssl rand -hex 16)
JWT_SECRET=votre-secret-jwt-très-long-et-sécurisé
ENCRYPTION_KEY=votre-clé-de-chiffrement-32-caractères

# Admin Configuration
ADMIN_EMAIL=admin@votre-domaine.com

# Webhook Security
WEBHOOK_SECRET=votre-clé-secrète-webhook

# File Storage
NEXT_PUBLIC_MAX_FILE_SIZE=100MB
DOWNLOAD_LINK_EXPIRY_HOURS=24

# Commission Settings
DEFAULT_COMMISSION_RATE=0.05
AFFILIATE_COMMISSION_RATE=0.10
```

### 5. Déploiement sur Vercel

#### Installation et Configuration
```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer le projet
vercel --prod
```

#### Configuration des Variables
Dans le dashboard Vercel :
1. Allez dans Settings > Environment Variables
2. Ajoutez toutes les variables d'environnement
3. Redéployez le projet

#### Configuration du Domaine
1. Ajoutez votre domaine personnalisé dans Vercel
2. Configurez les enregistrements DNS
3. Activez HTTPS automatique

### 6. Tests de Production

#### Checklist de Vérification
- [ ] **Page d'accueil** charge correctement
- [ ] **Inscription/Connexion** fonctionne
- [ ] **Upload de produit** opérationnel
- [ ] **Paiement test** réussi avec CinetPay
- [ ] **Webhook** reçu et traité
- [ ] **Email de confirmation** envoyé
- [ ] **Lien de téléchargement** fonctionnel
- [ ] **Wallet** mis à jour correctement
- [ ] **Affiliation** fonctionne
- [ ] **Retrait** peut être demandé

#### Tests de Paiement
1. Créez un produit test
2. Achetez avec un compte différent
3. Vérifiez la réception du webhook
4. Testez le téléchargement
5. Vérifiez la mise à jour du wallet

#### Tests d'Email
1. Testez l'inscription d'un nouvel utilisateur
2. Vérifiez l'email de bienvenue
3. Testez un achat complet
4. Vérifiez tous les emails envoyés

### 7. Monitoring et Maintenance

#### Logs et Surveillance
- Configurez les alertes Vercel
- Surveillez les logs Supabase
- Monitorer les webhooks CinetPay
- Vérifiez régulièrement les emails

#### Sauvegardes
- Supabase : Sauvegardes automatiques activées
- Code : Repository Git à jour
- Configuration : Variables d'environnement documentées

#### Mises à Jour
```bash
# Mise à jour régulière
git pull origin main
npm update
vercel --prod
```

## 🔒 Sécurité en Production

### SSL/HTTPS
- Certificat SSL configuré (automatique avec Vercel)
- Redirection HTTP vers HTTPS
- Headers de sécurité configurés

### Base de Données
- RLS (Row Level Security) activé sur toutes les tables
- Politiques d'accès strictes
- Connexions chiffrées uniquement

### API et Webhooks
- Rate limiting activé
- Validation des signatures webhook
- Logs d'audit configurés

### Fichiers et Uploads
- Validation des types de fichiers
- Limite de taille des fichiers
- Scan antivirus recommandé

## 📈 Optimisations Performance

### Cache et CDN
- Images optimisées avec Next.js Image
- CDN Vercel automatique
- Cache headers configurés

### Base de Données
- Index sur les colonnes importantes
- Requêtes optimisées
- Pagination implémentée

### Monitoring
```bash
# Outils recommandés
- Vercel Analytics
- Supabase Dashboard
- Google Analytics
- Hotjar pour l'UX
```

## 🆘 Dépannage

### Problèmes Courants

#### Webhook Non Reçu
1. Vérifiez l'URL dans CinetPay
2. Testez manuellement l'endpoint
3. Vérifiez les logs Vercel
4. Validez la signature

#### Emails Non Envoyés
1. Vérifiez les credentials SMTP
2. Testez la configuration email
3. Vérifiez les logs d'erreur
4. Validez les limites d'envoi

#### Erreurs de Base de Données
1. Vérifiez les politiques RLS
2. Validez les permissions Supabase
3. Testez les requêtes manuellement
4. Vérifiez les migrations

### Support Technique
- **Documentation Supabase** : https://supabase.com/docs
- **Documentation CinetPay** : https://docs.cinetpay.com
- **Support Vercel** : https://vercel.com/support
- **Community Discord** : Rejoignez la communauté

## 📞 Contacts d'Urgence

En cas de problème critique en production :

1. **Supabase** : Support technique via dashboard
2. **CinetPay** : support@cinetpay.com
3. **Vercel** : Support via dashboard
4. **DNS/Domaine** : Support de votre registrar

---

**✅ Déploiement terminé !** Votre marketplace Oazys est maintenant en production.

N'oubliez pas de :
- Sauvegarder vos clés et mots de passe
- Configurer la surveillance
- Tester régulièrement
- Maintenir le code à jour