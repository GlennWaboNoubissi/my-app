import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { 
  initiateCinetPayPayment, 
  generateTransactionId, 
  calculateFees,
  validatePaymentData
} from '@/lib/cinetpay';
import { rateLimit } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || 'unknown';
    const rateLimitResult = rateLimit(ip, 5, 60000); // 5 requests per minute
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives, veuillez réessayer plus tard' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { productId, affiliateCode } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'ID du produit requis' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Récupérer les détails du produit
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        seller:users!seller_id(id, full_name, email),
        category:categories(id, name)
      `)
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Produit non trouvé ou inactif' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur ne peut pas acheter son propre produit
    if (product.seller_id === user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas acheter votre propre produit' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà acheté ce produit
    const { data: existingPurchase } = await supabase
      .from('transactions')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('product_id', productId)
      .eq('status', 'completed')
      .single();

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Vous avez déjà acheté ce produit' },
        { status: 400 }
      );
    }

    // Récupérer les informations de l'utilisateur
    const { data: buyer, error: buyerError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (buyerError || !buyer) {
      return NextResponse.json(
        { error: 'Informations utilisateur introuvables' },
        { status: 404 }
      );
    }

    // Gérer les produits gratuits
    if (product.is_free || product.price === 0) {
      // Créer directement la transaction pour les produits gratuits
      const transactionId = generateTransactionId();
      
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          id: transactionId,
          buyer_id: user.id,
          seller_id: product.seller_id,
          product_id: productId,
          amount: 0,
          commission_amount: 0,
          status: 'completed',
          payment_method: 'free'
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Erreur lors de la création de la transaction gratuite:', transactionError);
        return NextResponse.json(
          { error: 'Erreur lors du traitement' },
          { status: 500 }
        );
      }

      // Créer le lien de téléchargement
      const { generateSecureDownloadUrl } = await import('@/lib/security');
      const downloadUrl = generateSecureDownloadUrl(
        transaction.id,
        productId,
        user.id,
        product.file_url
      );

      // Enregistrer le lien de téléchargement
      await supabase
        .from('download_links')
        .insert({
          transaction_id: transaction.id,
          product_id: productId,
          user_id: user.id,
          encrypted_url: downloadUrl,
          max_downloads: 10, // Plus généreux pour les produits gratuits
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
        });

      // Mettre à jour les statistiques
      await supabase
        .from('products')
        .update({ downloads_count: product.downloads_count + 1 })
        .eq('id', productId);

      // Envoyer l'email avec le lien de téléchargement
      try {
        const { sendDownloadLinkEmail } = await import('@/lib/email');
        await sendDownloadLinkEmail(
          buyer.email,
          buyer.full_name || buyer.email.split('@')[0],
          product.title,
          downloadUrl,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        );
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      }

      return NextResponse.json({
        success: true,
        message: 'Produit gratuit ajouté à votre collection',
        transaction_id: transaction.id,
        download_url: downloadUrl
      });
    }

    // Traitement pour les produits payants
    const amount = Math.round(product.price * 100); // Convertir en centimes
    const { commission, sellerAmount } = calculateFees(amount);

    // Gérer l'affiliation
    let affiliateId = null;
    let affiliateCommission = 0;

    if (affiliateCode) {
      const { data: affiliate } = await supabase
        .from('users')
        .select('id')
        .eq('affiliate_code', affiliateCode)
        .neq('id', user.id) // L'utilisateur ne peut pas s'auto-parrainer
        .neq('id', product.seller_id) // Le vendeur ne peut pas être son propre affilié
        .single();

      if (affiliate) {
        affiliateId = affiliate.id;
        affiliateCommission = Math.round(amount * 0.1); // 10% de commission d'affiliation
      }
    }

    // Créer la transaction en attente
    const transactionId = generateTransactionId();
    
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        id: transactionId,
        buyer_id: user.id,
        seller_id: product.seller_id,
        product_id: productId,
        amount: amount,
        commission_amount: commission,
        affiliate_id: affiliateId,
        affiliate_commission: affiliateCommission,
        status: 'pending'
      });

    if (transactionError) {
      console.error('Erreur lors de la création de la transaction:', transactionError);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la transaction' },
        { status: 500 }
      );
    }

    // Préparer les données de paiement pour CinetPay
    const paymentData = {
      amount: amount / 100, // Reconvertir en unité normale
      currency: 'XOF',
      transaction_id: transactionId,
      customer_name: buyer.full_name || buyer.email.split('@')[0],
      customer_email: buyer.email,
      customer_phone: buyer.phone || '',
      description: `Achat de "${product.title}" sur Oazys`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?transaction_id=${transactionId}`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      metadata: {
        product_id: productId,
        buyer_id: user.id,
        seller_id: product.seller_id,
        affiliate_id: affiliateId
      }
    };

    // Valider les données de paiement
    const validationErrors = validatePaymentData(paymentData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Données de paiement invalides', details: validationErrors },
        { status: 400 }
      );
    }

    // Initier le paiement avec CinetPay
    const cinetpayResponse = await initiateCinetPayPayment(paymentData);

    if (cinetpayResponse.code !== '201') {
      // Marquer la transaction comme échouée
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', transactionId);

      return NextResponse.json(
        { error: 'Erreur lors de l\'initiation du paiement', details: cinetpayResponse.message },
        { status: 400 }
      );
    }

    // Mettre à jour la transaction avec l'ID CinetPay
    await supabase
      .from('transactions')
      .update({ 
        cinetpay_transaction_id: cinetpayResponse.data?.payment_token 
      })
      .eq('id', transactionId);

    return NextResponse.json({
      success: true,
      payment_url: cinetpayResponse.data?.payment_url,
      transaction_id: transactionId,
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        seller: product.seller.full_name || product.seller.email
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'initiation du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Méthode OPTIONS pour CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}