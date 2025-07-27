import nodemailer from 'nodemailer';
import { formatCurrency } from './cinetpay';

const SMTP_HOST = process.env.SMTP_HOST!;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASS = process.env.SMTP_PASS!;
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@oazys.com';

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn('SMTP configuration missing. Email functionality will be disabled.');
}

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransporter({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true pour 465, false pour autres ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// Interface pour les options d'email
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

/**
 * Envoie un email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.log('Email simulation (SMTP not configured):', {
        to: options.to,
        subject: options.subject,
      });
      return true; // Simulation pour le développement
    }

    const mailOptions = {
      from: SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Template de base pour les emails
 */
function getBaseTemplate(content: string, title: string = 'Oazys'): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #0ea5e9;
            margin-bottom: 10px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #0ea5e9;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
            font-weight: 500;
        }
        .button:hover {
            background-color: #0284c7;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
            text-align: center;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
        }
        .success {
            background-color: #dcfce7;
            border: 1px solid #22c55e;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
        }
        .info {
            background-color: #dbeafe;
            border: 1px solid #3b82f6;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Oazys</div>
            <p>Votre marketplace de produits digitaux</p>
        </div>
        ${content}
        <div class="footer">
            <p>© 2024 Oazys. Tous droits réservés.</p>
            <p>Si vous avez des questions, contactez-nous à support@oazys.com</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Email de confirmation d'achat
 */
export async function sendPurchaseConfirmationEmail(
  to: string,
  customerName: string,
  productTitle: string,
  amount: number,
  transactionId: string
): Promise<boolean> {
  const content = `
    <h2>Merci pour votre achat !</h2>
    <p>Bonjour ${customerName},</p>
    <p>Votre achat a été confirmé avec succès. Voici les détails de votre commande :</p>
    
    <div class="info">
        <strong>Produit :</strong> ${productTitle}<br>
        <strong>Montant :</strong> ${formatCurrency(amount)}<br>
        <strong>ID de transaction :</strong> ${transactionId}<br>
        <strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}
    </div>
    
    <p>Vous recevrez un autre email avec le lien de téléchargement dans quelques minutes.</p>
    
    <p>Merci de votre confiance !</p>
  `;

  return sendEmail({
    to,
    subject: `Confirmation d'achat - ${productTitle}`,
    html: getBaseTemplate(content, 'Confirmation d\'achat'),
  });
}

/**
 * Email avec lien de téléchargement
 */
export async function sendDownloadLinkEmail(
  to: string,
  customerName: string,
  productTitle: string,
  downloadUrl: string,
  expiryDate: Date
): Promise<boolean> {
  const content = `
    <h2>Votre lien de téléchargement est prêt !</h2>
    <p>Bonjour ${customerName},</p>
    <p>Votre produit "${productTitle}" est maintenant disponible au téléchargement.</p>
    
    <div class="success">
        <p><strong>Important :</strong></p>
        <ul>
            <li>Ce lien expire le ${expiryDate.toLocaleDateString('fr-FR')} à ${expiryDate.toLocaleTimeString('fr-FR')}</li>
            <li>Vous pouvez télécharger le fichier jusqu'à 3 fois</li>
            <li>Ne partagez pas ce lien, il est personnel et sécurisé</li>
        </ul>
    </div>
    
    <p style="text-align: center;">
        <a href="${downloadUrl}" class="button">Télécharger maintenant</a>
    </p>
    
    <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
    <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
        ${downloadUrl}
    </p>
  `;

  return sendEmail({
    to,
    subject: `Téléchargement disponible - ${productTitle}`,
    html: getBaseTemplate(content, 'Téléchargement disponible'),
  });
}

/**
 * Email de notification de vente pour le vendeur
 */
export async function sendSaleNotificationEmail(
  to: string,
  sellerName: string,
  productTitle: string,
  amount: number,
  commission: number,
  buyerName: string
): Promise<boolean> {
  const sellerAmount = amount - commission;
  
  const content = `
    <h2>Nouvelle vente réalisée ! 🎉</h2>
    <p>Bonjour ${sellerName},</p>
    <p>Excellente nouvelle ! Votre produit "${productTitle}" vient d'être vendu.</p>
    
    <div class="success">
        <strong>Détails de la vente :</strong><br>
        <strong>Produit :</strong> ${productTitle}<br>
        <strong>Acheteur :</strong> ${buyerName}<br>
        <strong>Montant total :</strong> ${formatCurrency(amount)}<br>
        <strong>Commission (5%) :</strong> ${formatCurrency(commission)}<br>
        <strong>Votre gain :</strong> ${formatCurrency(sellerAmount)}
    </div>
    
    <p>Le montant a été automatiquement ajouté à votre wallet Oazys.</p>
    
    <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Voir mon dashboard</a>
    </p>
  `;

  return sendEmail({
    to,
    subject: `Nouvelle vente - ${productTitle}`,
    html: getBaseTemplate(content, 'Nouvelle vente'),
  });
}

/**
 * Email de bienvenue pour nouveaux utilisateurs
 */
export async function sendWelcomeEmail(
  to: string,
  name: string,
  affiliateCode: string
): Promise<boolean> {
  const content = `
    <h2>Bienvenue sur Oazys ! 🚀</h2>
    <p>Bonjour ${name},</p>
    <p>Merci de vous être inscrit sur Oazys, votre marketplace de produits digitaux.</p>
    
    <div class="info">
        <p><strong>Votre code d'affiliation :</strong> ${affiliateCode}</p>
        <p>Utilisez ce code pour gagner des commissions sur les ventes que vous recommandez !</p>
    </div>
    
    <h3>Que pouvez-vous faire maintenant ?</h3>
    <ul>
        <li>📦 Parcourir nos produits digitaux</li>
        <li>💰 Vendre vos propres créations</li>
        <li>🤝 Recommander des produits et gagner des commissions</li>
        <li>💳 Gérer votre wallet et vos gains</li>
    </ul>
    
    <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Accéder à mon compte</a>
    </p>
  `;

  return sendEmail({
    to,
    subject: 'Bienvenue sur Oazys !',
    html: getBaseTemplate(content, 'Bienvenue'),
  });
}

/**
 * Email de demande de retrait
 */
export async function sendWithdrawalRequestEmail(
  to: string,
  name: string,
  amount: number,
  method: string
): Promise<boolean> {
  const content = `
    <h2>Demande de retrait reçue</h2>
    <p>Bonjour ${name},</p>
    <p>Nous avons bien reçu votre demande de retrait.</p>
    
    <div class="info">
        <strong>Détails du retrait :</strong><br>
        <strong>Montant :</strong> ${formatCurrency(amount)}<br>
        <strong>Méthode :</strong> ${method}<br>
        <strong>Date de demande :</strong> ${new Date().toLocaleDateString('fr-FR')}
    </div>
    
    <p>Votre demande sera traitée dans les 48 heures ouvrables. Vous recevrez un email de confirmation une fois le transfert effectué.</p>
    
    <div class="warning">
        <strong>Important :</strong> Assurez-vous que vos coordonnées bancaires sont correctes. 
        En cas d'erreur, le traitement pourrait être retardé.
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Demande de retrait reçue',
    html: getBaseTemplate(content, 'Demande de retrait'),
  });
}

/**
 * Email de confirmation de retrait
 */
export async function sendWithdrawalConfirmationEmail(
  to: string,
  name: string,
  amount: number,
  method: string
): Promise<boolean> {
  const content = `
    <h2>Retrait effectué avec succès ✅</h2>
    <p>Bonjour ${name},</p>
    <p>Votre retrait a été traité avec succès !</p>
    
    <div class="success">
        <strong>Détails du retrait :</strong><br>
        <strong>Montant :</strong> ${formatCurrency(amount)}<br>
        <strong>Méthode :</strong> ${method}<br>
        <strong>Date de traitement :</strong> ${new Date().toLocaleDateString('fr-FR')}
    </div>
    
    <p>Le montant devrait apparaître sur votre compte dans les prochaines heures selon votre méthode de retrait.</p>
    
    <p>Merci de votre confiance !</p>
  `;

  return sendEmail({
    to,
    subject: 'Retrait effectué',
    html: getBaseTemplate(content, 'Retrait effectué'),
  });
}

/**
 * Email de réinitialisation de mot de passe
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
): Promise<boolean> {
  const content = `
    <h2>Réinitialisation de votre mot de passe</h2>
    <p>Bonjour ${name},</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
    
    <p style="text-align: center;">
        <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
    </p>
    
    <div class="warning">
        <strong>Important :</strong>
        <ul>
            <li>Ce lien expire dans 1 heure</li>
            <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
            <li>Ne partagez jamais ce lien avec personne</li>
        </ul>
    </div>
    
    <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
    <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
        ${resetUrl}
    </p>
  `;

  return sendEmail({
    to,
    subject: 'Réinitialisation de mot de passe - Oazys',
    html: getBaseTemplate(content, 'Réinitialisation de mot de passe'),
  });
}

/**
 * Teste la configuration email
 */
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return false;
    }
    
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}