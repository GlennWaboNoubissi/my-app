import { NextRequest, NextResponse } from 'next/server';
import { verifyDownloadToken } from '@/lib/security';
import { supabaseAdmin } from '@/lib/supabase';
import { rateLimit } from '@/lib/security';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Rate limiting par IP
    const ip = request.ip || 'unknown';
    const rateLimitResult = rateLimit(ip, 10, 60000); // 10 téléchargements par minute
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives de téléchargement' },
        { status: 429 }
      );
    }

    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token de téléchargement requis' },
        { status: 400 }
      );
    }

    // Vérifier et décoder le token
    const tokenData = verifyDownloadToken(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Token de téléchargement invalide ou expiré' },
        { status: 401 }
      );
    }

    const { 
      transactionId, 
      productId, 
      userId, 
      fileUrl, 
      maxDownloads,
      downloadsCount
    } = tokenData;

    // Vérifier si le nombre de téléchargements n'est pas dépassé
    if (downloadsCount >= maxDownloads) {
      return NextResponse.json(
        { error: 'Nombre maximum de téléchargements atteint' },
        { status: 403 }
      );
    }

    // Récupérer les détails du lien de téléchargement depuis la base de données
    const { data: downloadLink, error: downloadLinkError } = await supabaseAdmin
      .from('download_links')
      .select(`
        *,
        transaction:transactions(id, status, buyer_id),
        product:products(id, title, file_url, file_size, file_type),
        user:users(id, email)
      `)
      .eq('transaction_id', transactionId)
      .eq('product_id', productId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (downloadLinkError || !downloadLink) {
      return NextResponse.json(
        { error: 'Lien de téléchargement non trouvé ou inactif' },
        { status: 404 }
      );
    }

    // Vérifier que la transaction est complétée
    if (downloadLink.transaction.status !== 'completed') {
      return NextResponse.json(
        { error: 'Transaction non complétée' },
        { status: 403 }
      );
    }

    // Vérifier l'expiration
    const now = new Date();
    const expiryDate = new Date(downloadLink.expires_at);
    
    if (now > expiryDate) {
      // Désactiver le lien expiré
      await supabaseAdmin
        .from('download_links')
        .update({ is_active: false })
        .eq('id', downloadLink.id);

      return NextResponse.json(
        { error: 'Lien de téléchargement expiré' },
        { status: 410 }
      );
    }

    // Vérifier le nombre de téléchargements dans la base de données
    if (downloadLink.downloads_count >= downloadLink.max_downloads) {
      return NextResponse.json(
        { error: 'Nombre maximum de téléchargements atteint' },
        { status: 403 }
      );
    }

    // Incrémenter le compteur de téléchargements
    const { error: updateError } = await supabaseAdmin
      .from('download_links')
      .update({
        downloads_count: downloadLink.downloads_count + 1,
        last_downloaded_at: new Date().toISOString()
      })
      .eq('id', downloadLink.id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du compteur de téléchargements:', updateError);
    }

    // Logger le téléchargement
    await supabaseAdmin
      .from('download_logs')
      .insert({
        download_link_id: downloadLink.id,
        user_id: userId,
        product_id: productId,
        transaction_id: transactionId,
        ip_address: ip,
        user_agent: request.headers.get('user-agent') || 'unknown',
        downloaded_at: new Date().toISOString()
      });

    // Préparer la réponse de téléchargement
    try {
      // Si le fichier est stocké localement, le servir directement
      if (fileUrl.startsWith('/uploads/') || fileUrl.startsWith('./uploads/')) {
        const filePath = fileUrl.replace(/^\.?\//, '');
        const fs = await import('fs').then(m => m.promises);
        const path = await import('path');
        
        const fullPath = path.join(process.cwd(), 'public', filePath);
        
        try {
          const fileBuffer = await fs.readFile(fullPath);
          const fileExtension = path.extname(fullPath).toLowerCase();
          
          // Déterminer le type MIME
          const mimeTypes: Record<string, string> = {
            '.pdf': 'application/pdf',
            '.zip': 'application/zip',
            '.rar': 'application/x-rar-compressed',
            '.mp3': 'audio/mpeg',
            '.mp4': 'video/mp4',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.txt': 'text/plain',
          };
          
          const contentType = mimeTypes[fileExtension] || 'application/octet-stream';
          
          // Nom de fichier sécurisé pour le téléchargement
          const safeFileName = downloadLink.product.title
            .replace(/[^a-zA-Z0-9\-_\.]/g, '_')
            + fileExtension;

          return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Content-Disposition': `attachment; filename="${safeFileName}"`,
              'Content-Length': fileBuffer.length.toString(),
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
        } catch (fileError) {
          console.error('Erreur lors de la lecture du fichier:', fileError);
          return NextResponse.json(
            { error: 'Fichier non trouvé sur le serveur' },
            { status: 404 }
          );
        }
      }
      
      // Si le fichier est stocké sur un service externe (S3, etc.)
      else if (fileUrl.startsWith('http')) {
        // Rediriger vers l'URL externe avec un token temporaire si nécessaire
        return NextResponse.redirect(fileUrl, 302);
      }
      
      else {
        return NextResponse.json(
          { error: 'URL de fichier invalide' },
          { status: 500 }
        );
      }
      
    } catch (downloadError) {
      console.error('Erreur lors du téléchargement:', downloadError);
      return NextResponse.json(
        { error: 'Erreur lors du téléchargement du fichier' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur dans l\'API de téléchargement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Route pour obtenir les informations du téléchargement sans télécharger
export async function HEAD(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    
    const tokenData = verifyDownloadToken(token);
    
    if (!tokenData) {
      return new NextResponse(null, { status: 401 });
    }

    const { transactionId, productId, userId } = tokenData;

    const { data: downloadLink, error } = await supabaseAdmin
      .from('download_links')
      .select(`
        *,
        product:products(title, file_size, file_type)
      `)
      .eq('transaction_id', transactionId)
      .eq('product_id', productId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !downloadLink) {
      return new NextResponse(null, { status: 404 });
    }

    // Vérifier l'expiration
    if (new Date() > new Date(downloadLink.expires_at)) {
      return new NextResponse(null, { status: 410 });
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Length': downloadLink.product.file_size?.toString() || '0',
        'Content-Type': downloadLink.product.file_type || 'application/octet-stream',
        'X-Downloads-Remaining': (downloadLink.max_downloads - downloadLink.downloads_count).toString(),
        'X-Expires-At': downloadLink.expires_at
      }
    });

  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}