'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  MapPin,
  Phone
} from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    marketplace: {
      title: 'Marketplace',
      links: [
        { name: 'Tous les produits', href: '/products' },
        { name: 'Catégories', href: '/categories' },
        { name: 'Nouveautés', href: '/products?sort=newest' },
        { name: 'Les plus populaires', href: '/products?sort=popular' },
        { name: 'Produits gratuits', href: '/products?free=true' },
      ]
    },
    vendeurs: {
      title: 'Pour les vendeurs',
      links: [
        { name: 'Vendre sur Oazys', href: '/sell' },
        { name: 'Guide du vendeur', href: '/seller-guide' },
        { name: 'Outils de promotion', href: '/promotion-tools' },
        { name: 'Programme d\'affiliation', href: '/affiliate' },
        { name: 'Statistiques de vente', href: '/dashboard/analytics' },
      ]
    },
    support: {
      title: 'Support',
      links: [
        { name: 'Centre d\'aide', href: '/help' },
        { name: 'Comment ça marche', href: '/how-it-works' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Nous contacter', href: '/contact' },
        { name: 'Signaler un problème', href: '/report' },
      ]
    },
    legal: {
      title: 'Légal',
      links: [
        { name: 'Conditions d\'utilisation', href: '/terms' },
        { name: 'Politique de confidentialité', href: '/privacy' },
        { name: 'Politique de remboursement', href: '/refund' },
        { name: 'Cookies', href: '/cookies' },
        { name: 'DMCA', href: '/dmca' },
      ]
    }
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/oazys' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/oazys' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/oazys' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/oazys' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Restez informé des nouveautés
            </h3>
            <p className="text-gray-400 mb-6">
              Recevez les derniers produits, offres spéciales et conseils directement dans votre boîte mail.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
              >
                S'abonner
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="text-xl font-bold">Oazys</span>
            </div>
            <p className="text-gray-400 mb-6">
              La marketplace qui révolutionne la vente de produits digitaux. 
              Vendez, achetez et découvrez des créations exceptionnelles.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@oazys.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+225 07 XX XX XX XX</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Abidjan, Côte d'Ivoire</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key} className="lg:col-span-1">
              <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Oazys. Tous droits réservés.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">Paiements sécurisés par</span>
              <div className="flex items-center space-x-2">
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-primary-600 font-bold text-xs">CinetPay</span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-gray-900 font-bold text-xs">Mobile Money</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}