import crypto from 'crypto';
import { CinetPayPayment, CinetPayResponse, CinetPayWebhook } from '@/types';

const CINETPAY_API_URL = 'https://api-checkout.cinetpay.com/v2/payment';
const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY!;
const CINETPAY_SECRET_KEY = process.env.CINETPAY_SECRET_KEY!;
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID!;

if (!CINETPAY_API_KEY || !CINETPAY_SECRET_KEY || !CINETPAY_SITE_ID) {
  throw new Error('Missing CinetPay configuration');
}

/**
 * Initie un paiement CinetPay
 */
export async function initiateCinetPayPayment(payment: CinetPayPayment): Promise<CinetPayResponse> {
  try {
    const payload = {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: payment.transaction_id,
      amount: payment.amount,
      currency: payment.currency,
      alternative_currency: payment.currency,
      description: payment.description,
      customer_name: payment.customer_name,
      customer_surname: payment.customer_name.split(' ').slice(-1)[0] || '',
      customer_email: payment.customer_email,
      customer_phone_number: payment.customer_phone || '',
      customer_address: '',
      customer_city: '',
      customer_country: 'CI',
      customer_state: '',
      customer_zip_code: '',
      return_url: payment.return_url,
      notify_url: payment.notify_url,
      custom: JSON.stringify(payment.metadata || {}),
      channels: 'ALL',
    };

    const response = await fetch(CINETPAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'initiation du paiement CinetPay:', error);
    throw new Error('Erreur lors de l\'initiation du paiement');
  }
}

/**
 * Vérifie le statut d'une transaction CinetPay
 */
export async function checkCinetPayTransaction(transactionId: string): Promise<any> {
  try {
    const payload = {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: transactionId,
    };

    const response = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la vérification de la transaction:', error);
    throw error;
  }
}

/**
 * Génère la signature pour la vérification du webhook
 */
export function generateWebhookSignature(data: Record<string, string>): string {
  // Trier les clés par ordre alphabétique
  const sortedKeys = Object.keys(data).sort();
  
  // Créer la chaîne de données
  let dataString = '';
  sortedKeys.forEach(key => {
    if (key !== 'signature') {
      dataString += `${key}=${data[key]}&`;
    }
  });
  
  // Supprimer le dernier '&'
  dataString = dataString.slice(0, -1);
  
  // Ajouter la clé secrète
  dataString += CINETPAY_SECRET_KEY;
  
  // Générer le hash SHA256
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

/**
 * Vérifie la signature du webhook CinetPay
 */
export function verifyWebhookSignature(webhook: CinetPayWebhook): boolean {
  const data = {
    cpm_site_id: webhook.cpm_site_id,
    cpm_trans_id: webhook.cpm_trans_id,
    cpm_trans_date: webhook.cpm_trans_date,
    cpm_trans_status: webhook.cpm_trans_status,
    cpm_amount: webhook.cpm_amount,
    cpm_currency: webhook.cpm_currency,
    cpm_payid: webhook.cpm_payid,
    cpm_custom: webhook.cpm_custom || '',
  };

  const expectedSignature = generateWebhookSignature(data);
  return expectedSignature === webhook.signature;
}

/**
 * Convertit le statut CinetPay en statut interne
 */
export function mapCinetPayStatus(status: string): 'pending' | 'completed' | 'failed' | 'refunded' {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'accepted':
    case 'success':
      return 'completed';
    case 'pending':
    case 'waiting':
      return 'pending';
    case 'cancelled':
    case 'rejected':
    case 'failed':
      return 'failed';
    case 'refunded':
      return 'refunded';
    default:
      return 'pending';
  }
}

/**
 * Génère un ID de transaction unique
 */
export function generateTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `TXN_${timestamp}_${random}`;
}

/**
 * Calcule les frais et commissions
 */
export function calculateFees(amount: number, commissionRate: number = 0.05) {
  const commission = Math.round(amount * commissionRate);
  const sellerAmount = amount - commission;
  
  return {
    totalAmount: amount,
    commission,
    sellerAmount,
    commissionRate,
  };
}

/**
 * Formats amount for display
 */
export function formatCurrency(amount: number, currency: string = 'XOF'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Valide les données de paiement
 */
export function validatePaymentData(payment: Partial<CinetPayPayment>): string[] {
  const errors: string[] = [];

  if (!payment.amount || payment.amount <= 0) {
    errors.push('Le montant doit être supérieur à 0');
  }

  if (!payment.customer_email || !/\S+@\S+\.\S+/.test(payment.customer_email)) {
    errors.push('Email client invalide');
  }

  if (!payment.customer_name || payment.customer_name.trim().length < 2) {
    errors.push('Nom client requis');
  }

  if (!payment.description || payment.description.trim().length < 5) {
    errors.push('Description requise');
  }

  if (!payment.transaction_id) {
    errors.push('ID de transaction requis');
  }

  return errors;
}