import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const JWT_SECRET = process.env.JWT_SECRET!;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
}

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

/**
 * Chiffre une chaîne de caractères
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Déchiffre une chaîne de caractères
 */
export function decrypt(encryptedText: string): string {
  try {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encrypted = textParts.join(':');
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Interface pour les données du token de téléchargement
 */
export interface DownloadTokenData {
  transactionId: string;
  productId: string;
  userId: string;
  fileUrl: string;
  expiresAt: number;
  maxDownloads: number;
  downloadsCount: number;
}

/**
 * Crée un token JWT pour le téléchargement sécurisé
 */
export function createDownloadToken(data: Omit<DownloadTokenData, 'expiresAt' | 'downloadsCount'>): string {
  const expiryHours = parseInt(process.env.DOWNLOAD_LINK_EXPIRY_HOURS || '24');
  const expiresAt = Date.now() + (expiryHours * 60 * 60 * 1000);
  
  const tokenData: DownloadTokenData = {
    ...data,
    expiresAt,
    downloadsCount: 0,
  };

  // Créer une signature simple avec HMAC
  const payload = JSON.stringify(tokenData);
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payload)
    .digest('hex');

  // Combiner payload et signature
  const token = Buffer.from(`${payload}.${signature}`).toString('base64url');
  
  return token;
}

/**
 * Vérifie et décode un token de téléchargement
 */
export function verifyDownloadToken(token: string): DownloadTokenData | null {
  try {
    // Décoder le token
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [payload, signature] = decoded.split('.');
    
    if (!payload || !signature) {
      return null;
    }

    // Vérifier la signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      return null;
    }

    // Parser les données
    const data: DownloadTokenData = JSON.parse(payload);

    // Vérifier l'expiration
    if (Date.now() > data.expiresAt) {
      return null;
    }

    // Vérifier le nombre de téléchargements
    if (data.downloadsCount >= data.maxDownloads) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error verifying download token:', error);
    return null;
  }
}

/**
 * Génère un lien de téléchargement sécurisé
 */
export function generateSecureDownloadUrl(
  transactionId: string,
  productId: string,
  userId: string,
  fileUrl: string,
  maxDownloads: number = 3
): string {
  const token = createDownloadToken({
    transactionId,
    productId,
    userId,
    fileUrl,
    maxDownloads,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/download/${token}`;
}

/**
 * Génère un code d'affiliation unique
 */
export function generateAffiliateCode(userId: string): string {
  const timestamp = Date.now().toString(36);
  const userHash = crypto
    .createHash('md5')
    .update(userId)
    .digest('hex')
    .substring(0, 6);
  
  return `AFF_${userHash}_${timestamp}`.toUpperCase();
}

/**
 * Génère un lien d'affiliation
 */
export function generateAffiliateLink(productId: string, affiliateCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/product/${productId}?ref=${affiliateCode}`;
}

/**
 * Hash d'un mot de passe avec salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Vérifie un mot de passe
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch (error) {
    return false;
  }
}

/**
 * Génère un OTP
 */
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  
  return otp;
}

/**
 * Génère un token de réinitialisation
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Valide un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide un mot de passe (minimum 8 caractères, au moins une majuscule, une minuscule et un chiffre)
 */
export function isValidPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Sanitise une chaîne de caractères pour éviter les injections
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/[<>\"']/g, '')
    .trim()
    .substring(0, 500); // Limite la longueur
}

/**
 * Génère un slug sécurisé à partir d'un titre
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Supprimer les tirets multiples
    .replace(/^-|-$/g, ''); // Supprimer les tirets en début/fin
}

/**
 * Limite le taux de requêtes (simple implementation en mémoire)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = identifier;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  current.count++;
  rateLimitStore.set(key, current);
  
  return { allowed: true, remaining: maxRequests - current.count };
}