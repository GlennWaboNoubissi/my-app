import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, supabaseAdmin } from '@/lib/supabase';
import { 
  verifyWebhookSignature, 
  mapCinetPayStatus,
  checkCinetPayTransaction
} from '@/lib/cinetpay';
import { generateSecureDownloadUrl } from '@/lib/security';
import { 
  sendDownloadLinkEmail,
  sendPurchaseConfirmationEmail,
  sendSaleNotificationEmail
} from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Webhook CinetPay reçu:', body);

    // Vérifier la signature du webhook
    if (!verifyWebhookSignature(body)) {
      console.error('Signature webhook invalide');
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 401 }
      );
    }

    const {
      cpm_trans_id,
      cpm_trans_status,
      cpm_amount,
      cpm_currency,
      cpm_custom,
      cpm_payid
    } = body;

    // Vérifier les données requises
    if (!cmp_trans_id || !cpm_trans_status) {
      console.error('Données webhook manquantes');
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Double vérification du statut avec l'API CinetPay
    let verificationResult;
    try {
      verificationResult = await checkCinetPayTransaction(cpm_trans_id);
    } catch (error) {
      console.error('Erreur lors de la vérification CinetPay:', error);
      return NextResponse.json(
        { error: 'Erreur de vérification' },
        { status: 500 }
      );
    }

    // Récupérer la transaction dans notre base de données
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        buyer:users!buyer_id(id, email, full_name),
        seller:users!seller_id(id, email, full_name, wallet_balance),
        product:products(id, title, file_url, downloads_count),
        affiliate:users!affiliate_id(id, email, full_name, wallet_balance)
      `)
      .eq('id', cpm_trans_id)
      .single();

    if (transactionError || !transaction) {
      console.error('Transaction non trouvée:', cpm_trans_id);
      return NextResponse.json(
        { error: 'Transaction non trouvée' },
        { status: 404 }
      );
    }

    // Éviter de traiter plusieurs fois la même transaction
    if (transaction.status === 'completed') {
      console.log('Transaction déjà traitée:', cpm_trans_id);
      return NextResponse.json({ message: 'Transaction déjà traitée' });
    }

    const newStatus = mapCinetPayStatus(cpm_trans_status);
    
    // Mettre à jour le statut de la transaction
    const { error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({
        status: newStatus,
        cinetpay_transaction_id: cpm_payid,
        payment_method: 'cinetpay',
        updated_at: new Date().toISOString()
      })
      .eq('id', cpm_trans_id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour de la transaction:', updateError);
      return NextResponse.json(
        { error: 'Erreur de mise à jour' },
        { status: 500 }
      );
    }

    // Traiter uniquement les paiements réussis
    if (newStatus === 'completed') {
      try {
        await processSuccessfulPayment(transaction);
      } catch (error) {
        console.error('Erreur lors du traitement du paiement réussi:', error);
        // Ne pas retourner d'erreur pour éviter que CinetPay renvoie le webhook
      }
    }

    return NextResponse.json({ 
      message: 'Webhook traité avec succès',
      status: newStatus
    });

  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}

async function processSuccessfulPayment(transaction: any) {
  const {
    id: transactionId,
    buyer,
    seller,
    product,
    affiliate,
    amount,
    commission_amount,
    affiliate_commission
  } = transaction;

  // 1. Créer le lien de téléchargement sécurisé
  const downloadUrl = generateSecureDownloadUrl(
    transactionId,
    product.id,
    buyer.id,
    product.file_url,
    3 // 3 téléchargements maximum
  );

  // 2. Enregistrer le lien de téléchargement
  const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
  
  const { error: downloadLinkError } = await supabaseAdmin
    .from('download_links')
    .insert({
      transaction_id: transactionId,
      product_id: product.id,
      user_id: buyer.id,
      encrypted_url: downloadUrl,
      max_downloads: 3,
      downloads_count: 0,
      expires_at: expiryDate.toISOString(),
      is_active: true
    });

  if (downloadLinkError) {
    console.error('Erreur lors de la création du lien de téléchargement:', downloadLinkError);
    throw downloadLinkError;
  }

  // 3. Mettre à jour le wallet du vendeur
  const sellerAmount = amount - commission_amount - (affiliate_commission || 0);
  
  const { error: walletError } = await supabaseAdmin
    .from('users')
    .update({
      wallet_balance: seller.wallet_balance + sellerAmount,
      total_earnings: seller.total_earnings + sellerAmount,
      updated_at: new Date().toISOString()
    })
    .eq('id', seller.id);

  if (walletError) {
    console.error('Erreur lors de la mise à jour du wallet vendeur:', walletError);
  }

  // 4. Mettre à jour le wallet de l'affilié si applicable
  if (affiliate && affiliate_commission > 0) {
    const { error: affiliateWalletError } = await supabaseAdmin
      .from('users')
      .update({
        wallet_balance: affiliate.wallet_balance + affiliate_commission,
        affiliate_earnings: affiliate.affiliate_earnings + affiliate_commission,
        updated_at: new Date().toISOString()
      })
      .eq('id', affiliate.id);

    if (affiliateWalletError) {
      console.error('Erreur lors de la mise à jour du wallet affilié:', affiliateWalletError);
    }

    // Enregistrer la commission d'affiliation
    await supabaseAdmin
      .from('affiliate_links')
      .upsert({
        user_id: affiliate.id,
        product_id: product.id,
        code: affiliate.affiliate_code,
        conversions_count: 1,
        total_earnings: affiliate_commission,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,product_id',
        ignoreDuplicates: false
      });
  }

  // 5. Mettre à jour les statistiques du produit
  const { error: productStatsError } = await supabaseAdmin
    .from('products')
    .update({
      downloads_count: product.downloads_count + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', product.id);

  if (productStatsError) {
    console.error('Erreur lors de la mise à jour des stats produit:', productStatsError);
  }

  // 6. Envoyer les emails de notification
  try {
    // Email de confirmation d'achat à l'acheteur
    await sendPurchaseConfirmationEmail(
      buyer.email,
      buyer.full_name || buyer.email.split('@')[0],
      product.title,
      amount / 100, // Reconvertir en unité normale
      transactionId
    );

    // Email avec lien de téléchargement à l'acheteur
    await sendDownloadLinkEmail(
      buyer.email,
      buyer.full_name || buyer.email.split('@')[0],
      product.title,
      downloadUrl,
      expiryDate
    );

    // Email de notification de vente au vendeur
    await sendSaleNotificationEmail(
      seller.email,
      seller.full_name || seller.email.split('@')[0],
      product.title,
      amount / 100,
      commission_amount / 100,
      buyer.full_name || buyer.email.split('@')[0]
    );

  } catch (emailError) {
    console.error('Erreur lors de l\'envoi des emails:', emailError);
    // Ne pas faire échouer le traitement si l'email échoue
  }

  // 7. Créer une entrée dans l'historique des transactions
  await supabaseAdmin
    .from('transaction_history')
    .insert({
      transaction_id: transactionId,
      status: 'completed',
      details: {
        payment_method: 'cinetpay',
        amount: amount,
        commission: commission_amount,
        affiliate_commission: affiliate_commission || 0,
        processed_at: new Date().toISOString()
      }
    });

  console.log(`Paiement traité avec succès pour la transaction ${transactionId}`);
}

// Méthode GET pour vérifier que l'endpoint est actif
export async function GET() {
  return NextResponse.json({
    message: 'Webhook CinetPay endpoint actif',
    timestamp: new Date().toISOString()
  });
}

// Méthode OPTIONS pour CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}