-- =====================================================
-- OAZYS MARKETPLACE - MIGRATIONS SUPABASE
-- Version: 1.0.0
-- Description: Migrations complètes pour la marketplace
-- =====================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLE: users
-- Description: Gestion des utilisateurs et vendeurs
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'staff')),
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  affiliate_code TEXT UNIQUE NOT NULL,
  referrer_id UUID REFERENCES users(id),
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  affiliate_earnings DECIMAL(10,2) DEFAULT 0.00,
  pending_balance DECIMAL(10,2) DEFAULT 0.00,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_affiliate_code ON users(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =====================================================
-- TABLE: categories
-- Description: Catégories de produits
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  products_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- =====================================================
-- TABLE: products
-- Description: Produits digitaux
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_free BOOLEAN DEFAULT FALSE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT,
  preview_urls TEXT[],
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  downloads_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at);

-- Index pour la recherche full-text
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('french', title || ' ' || description));

-- =====================================================
-- TABLE: transactions
-- Description: Transactions et paiements
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) DEFAULT 0.00,
  affiliate_id UUID REFERENCES users(id) ON DELETE SET NULL,
  affiliate_commission DECIMAL(10,2) DEFAULT 0.00,
  cinetpay_transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  failure_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_product ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_cinetpay ON transactions(cinetpay_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);

-- =====================================================
-- TABLE: download_links
-- Description: Liens de téléchargement sécurisés
-- =====================================================
CREATE TABLE IF NOT EXISTS download_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  encrypted_url TEXT NOT NULL,
  downloads_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 3,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_downloaded_at TIMESTAMP WITH TIME ZONE
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_download_links_transaction ON download_links(transaction_id);
CREATE INDEX IF NOT EXISTS idx_download_links_user ON download_links(user_id);
CREATE INDEX IF NOT EXISTS idx_download_links_expires ON download_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_download_links_active ON download_links(is_active);

-- =====================================================
-- TABLE: affiliate_links
-- Description: Liens d'affiliation
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_affiliate_links_user ON affiliate_links(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_product ON affiliate_links(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_code ON affiliate_links(code);

-- =====================================================
-- TABLE: likes
-- Description: Likes sur les produits
-- =====================================================
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_product ON likes(product_id);

-- =====================================================
-- TABLE: withdrawal_requests
-- Description: Demandes de retrait
-- =====================================================
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('bank_transfer', 'mobile_money', 'paypal')),
  account_details JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  admin_notes TEXT,
  processed_by UUID REFERENCES users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);

-- =====================================================
-- TABLE: reports
-- Description: Signalements
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('product', 'user', 'other')),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_product ON reports(product_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- =====================================================
-- TABLE: download_logs
-- Description: Logs des téléchargements
-- =====================================================
CREATE TABLE IF NOT EXISTS download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  download_link_id UUID REFERENCES download_links(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  transaction_id TEXT REFERENCES transactions(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_download_logs_user ON download_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_product ON download_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_date ON download_logs(downloaded_at);

-- =====================================================
-- TABLE: email_templates
-- Description: Templates d'emails
-- =====================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: settings
-- Description: Paramètres globaux
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FONCTIONS TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Fonction pour générer un code d'affiliation unique
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  done BOOLEAN DEFAULT FALSE;
BEGIN
  WHILE NOT done LOOP
    code := 'AFF_' || UPPER(substr(md5(random()::text), 1, 8));
    IF NOT EXISTS (SELECT 1 FROM users WHERE affiliate_code = code) THEN
      done := TRUE;
    END IF;
  END LOOP;
  RETURN code;
END;
$$ language 'plpgsql';

-- Fonction pour mettre à jour le compteur de produits dans les catégories
CREATE OR REPLACE FUNCTION update_category_products_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories 
    SET products_count = products_count + 1 
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories 
    SET products_count = GREATEST(products_count - 1, 0) 
    WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.category_id != NEW.category_id THEN
      UPDATE categories 
      SET products_count = GREATEST(products_count - 1, 0) 
      WHERE id = OLD.category_id;
      
      UPDATE categories 
      SET products_count = products_count + 1 
      WHERE id = NEW.category_id;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ language 'plpgsql';

-- Fonction pour mettre à jour le compteur de likes
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.product_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ language 'plpgsql';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_links_updated_at 
  BEFORE UPDATE ON affiliate_links 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawal_requests_updated_at 
  BEFORE UPDATE ON withdrawal_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at 
  BEFORE UPDATE ON reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at 
  BEFORE UPDATE ON email_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at 
  BEFORE UPDATE ON settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour générer le code d'affiliation
CREATE TRIGGER generate_user_affiliate_code 
  BEFORE INSERT ON users 
  FOR EACH ROW 
  WHEN (NEW.affiliate_code IS NULL OR NEW.affiliate_code = '')
  EXECUTE FUNCTION (SELECT generate_affiliate_code());

-- Triggers pour les compteurs
CREATE TRIGGER update_category_products_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION update_category_products_count();

CREATE TRIGGER update_product_likes_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Politiques pour users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Politiques pour categories (lecture publique)
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (is_active = true);

-- Politiques pour products
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own products" ON products
  FOR ALL USING (auth.uid() = seller_id);

-- Politiques pour transactions
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Politiques pour download_links
CREATE POLICY "Users can view their own download links" ON download_links
  FOR SELECT USING (auth.uid() = user_id);

-- Politiques pour affiliate_links
CREATE POLICY "Users can manage their own affiliate links" ON affiliate_links
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour likes
CREATE POLICY "Users can manage their own likes" ON likes
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour withdrawal_requests
CREATE POLICY "Users can manage their own withdrawal requests" ON withdrawal_requests
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour reports
CREATE POLICY "Users can manage their own reports" ON reports
  FOR ALL USING (auth.uid() = reporter_id);

-- =====================================================
-- DONNÉES INITIALES
-- =====================================================

-- Insérer les catégories par défaut
INSERT INTO categories (name, slug, description, icon) VALUES
  ('Templates Web', 'templates-web', 'Templates HTML, CSS, React et autres frameworks', '🌐'),
  ('Graphisme', 'graphisme', 'Logos, illustrations, designs et ressources graphiques', '🎨'),
  ('Photos Stock', 'photos-stock', 'Images haute qualité libres de droits', '📸'),
  ('Audio', 'audio', 'Musiques, effets sonores, podcasts et contenus audio', '🎵'),
  ('Vidéos', 'videos', 'Clips, animations, tutoriels et contenus vidéo', '🎬'),
  ('E-books', 'ebooks', 'Guides, romans, manuels et livres numériques', '📚'),
  ('Outils & Scripts', 'outils-scripts', 'Scripts, plugins et outils de développement', '⚙️'),
  ('Formations', 'formations', 'Cours en ligne et matériel pédagogique', '🎓')
ON CONFLICT (slug) DO NOTHING;

-- Insérer les paramètres par défaut
INSERT INTO settings (key, value, description) VALUES
  ('commission_rate', '0.05', 'Commission de la plateforme (5%)'),
  ('affiliate_rate', '0.10', 'Commission d\'affiliation (10%)'),
  ('download_expiry_hours', '24', 'Durée d\'expiration des liens de téléchargement'),
  ('max_downloads_per_purchase', '3', 'Nombre maximum de téléchargements par achat'),
  ('min_withdrawal_amount', '10000', 'Montant minimum de retrait (en centimes)'),
  ('site_name', '"Oazys"', 'Nom du site'),
  ('site_description', '"Marketplace de produits digitaux"', 'Description du site'),
  ('contact_email', '"support@oazys.com"', 'Email de contact'),
  ('maintenance_mode', 'false', 'Mode maintenance')
ON CONFLICT (key) DO NOTHING;

-- Insérer les templates d'email par défaut
INSERT INTO email_templates (name, subject, html_content, variables) VALUES
  (
    'welcome_email',
    'Bienvenue sur Oazys !',
    '<h1>Bienvenue {{user_name}} !</h1><p>Merci de vous être inscrit sur Oazys.</p><p>Votre code d''affiliation : {{affiliate_code}}</p>',
    ARRAY['user_name', 'affiliate_code']
  ),
  (
    'purchase_confirmation',
    'Confirmation d''achat - {{product_title}}',
    '<h1>Merci pour votre achat !</h1><p>Produit : {{product_title}}</p><p>Montant : {{amount}}</p><p>Transaction : {{transaction_id}}</p>',
    ARRAY['product_title', 'amount', 'transaction_id']
  ),
  (
    'download_link',
    'Téléchargement disponible - {{product_title}}',
    '<h1>Votre téléchargement est prêt !</h1><p>Produit : {{product_title}}</p><p><a href="{{download_url}}">Télécharger maintenant</a></p><p>Ce lien expire le {{expiry_date}}</p>',
    ARRAY['product_title', 'download_url', 'expiry_date']
  )
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue pour les statistiques des produits
CREATE OR REPLACE VIEW product_stats AS
SELECT 
  p.id,
  p.title,
  p.price,
  p.downloads_count,
  p.likes_count,
  p.views_count,
  COALESCE(SUM(t.amount), 0) as total_revenue,
  COUNT(t.id) as sales_count,
  u.full_name as seller_name,
  c.name as category_name
FROM products p
LEFT JOIN transactions t ON p.id = t.product_id AND t.status = 'completed'
LEFT JOIN users u ON p.seller_id = u.id
LEFT JOIN categories c ON p.category_id = c.id
GROUP BY p.id, u.full_name, c.name;

-- Vue pour les statistiques des utilisateurs
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.full_name,
  u.email,
  u.wallet_balance,
  u.total_earnings,
  u.affiliate_earnings,
  COUNT(DISTINCT p.id) as products_count,
  COUNT(DISTINCT tb.id) as purchases_count,
  COUNT(DISTINCT ts.id) as sales_count
FROM users u
LEFT JOIN products p ON u.id = p.seller_id AND p.is_active = true
LEFT JOIN transactions tb ON u.id = tb.buyer_id AND tb.status = 'completed'
LEFT JOIN transactions ts ON u.id = ts.seller_id AND ts.status = 'completed'
GROUP BY u.id;

-- =====================================================
-- COMMENTAIRES FINAUX
-- =====================================================

COMMENT ON TABLE users IS 'Table des utilisateurs avec gestion des rôles et du wallet';
COMMENT ON TABLE categories IS 'Catégories de produits avec compteurs automatiques';
COMMENT ON TABLE products IS 'Produits digitaux avec métadonnées complètes';
COMMENT ON TABLE transactions IS 'Transactions avec support affiliation et commissions';
COMMENT ON TABLE download_links IS 'Liens de téléchargement sécurisés et temporaires';
COMMENT ON TABLE affiliate_links IS 'Gestion des liens d''affiliation';
COMMENT ON TABLE withdrawal_requests IS 'Demandes de retrait des vendeurs';
COMMENT ON TABLE reports IS 'Système de signalement et modération';
COMMENT ON TABLE download_logs IS 'Logs détaillés des téléchargements';

-- =====================================================
-- FIN DES MIGRATIONS
-- =====================================================