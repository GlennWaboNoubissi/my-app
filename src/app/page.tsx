import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Star,
  Download,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: 'Paiements Sécurisés',
      description: 'Transactions protégées avec CinetPay et liens de téléchargement cryptés et temporaires.'
    },
    {
      icon: Download,
      title: 'Téléchargement Instantané',
      description: 'Accès immédiat à vos achats avec des liens sécurisés envoyés par email.'
    },
    {
      icon: TrendingUp,
      title: 'Programme d\'Affiliation',
      description: 'Gagnez des commissions en recommandant des produits à votre réseau.'
    },
    {
      icon: Zap,
      title: 'Plateforme Rapide',
      description: 'Interface moderne et responsive optimisée pour une expérience fluide.'
    },
    {
      icon: Users,
      title: 'Communauté Active',
      description: 'Rejoignez des milliers de créateurs et d\'acheteurs passionnés.'
    },
    {
      icon: Clock,
      title: 'Support 24/7',
      description: 'Équipe de support dédiée pour vous accompagner à tout moment.'
    }
  ];

  const stats = [
    { label: 'Produits disponibles', value: '10,000+' },
    { label: 'Créateurs actifs', value: '2,500+' },
    { label: 'Téléchargements', value: '50,000+' },
    { label: 'Satisfaction client', value: '98%' }
  ];

  const categories = [
    {
      name: 'Templates Web',
      description: 'Templates HTML, CSS et React',
      image: '/images/categories/web-templates.jpg',
      count: 1200
    },
    {
      name: 'Graphisme',
      description: 'Logos, illustrations et designs',
      image: '/images/categories/graphics.jpg',
      count: 850
    },
    {
      name: 'Photos Stock',
      description: 'Images haute qualité libres de droits',
      image: '/images/categories/photos.jpg',
      count: 2500
    },
    {
      name: 'Audio',
      description: 'Musiques, effets sonores et podcasts',
      image: '/images/categories/audio.jpg',
      count: 600
    },
    {
      name: 'Vidéos',
      description: 'Clips, animations et tutoriels',
      image: '/images/categories/videos.jpg',
      count: 400
    },
    {
      name: 'E-books',
      description: 'Guides, romans et manuels',
      image: '/images/categories/ebooks.jpg',
      count: 300
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Michel',
      role: 'Designer Graphique',
      avatar: '/images/avatars/sarah.jpg',
      content: 'Oazys m\'a permis de monétiser mes créations facilement. La plateforme est intuitive et les paiements sont rapides.',
      rating: 5
    },
    {
      name: 'Jean-Paul Kouassi',
      role: 'Développeur Web',
      avatar: '/images/avatars/jean-paul.jpg',
      content: 'Excellent endroit pour vendre mes templates. Les outils d\'analyse m\'aident à optimiser mes ventes.',
      rating: 5
    },
    {
      name: 'Marie Dubois',
      role: 'Photographe',
      avatar: '/images/avatars/marie.jpg',
      content: 'J\'ai trouvé des ressources incroyables ici. La qualité des produits est toujours au rendez-vous.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Votre marketplace de 
                  <span className="text-gradient block mt-2">
                    produits digitaux
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Découvrez, achetez et vendez des créations digitales exceptionnelles. 
                  Rejoignez une communauté de créateurs passionnés et monétisez vos talents.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explorer les produits
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Commencer à vendre
                  </Button>
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">4.9/5 (2,341 avis)</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Produits populaires</h3>
                    <span className="text-sm text-primary-600 font-medium">Cette semaine</span>
                  </div>
                  
                  {[1,2,3].map((item) => (
                    <div key={item} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold">#</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Template React Dashboard
                        </p>
                        <p className="text-sm text-gray-500">Par WebCreator</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">29 €</p>
                        <p className="text-xs text-green-600">+{item * 15} ventes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary-200 rounded-full opacity-20 animate-pulse-slow"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary-200 rounded-full opacity-20 animate-pulse-slow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Explorez nos catégories
            </h2>
            <p className="text-xl text-gray-600">
              Des milliers de produits digitaux dans toutes les catégories pour tous vos besoins créatifs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link key={index} href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                      <p className="text-sm opacity-90">{category.count} produits</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-gray-600">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Oazys ?
            </h2>
            <p className="text-xl text-gray-600">
              Une plateforme moderne, sécurisée et optimisée pour les créateurs et les acheteurs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Vendez ou achetez en quelques clics seulement.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16">
            {/* For Sellers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Pour les vendeurs</h3>
              <div className="space-y-6">
                {[
                  { step: 1, title: 'Créez votre compte', desc: 'Inscription gratuite en quelques secondes' },
                  { step: 2, title: 'Uploadez vos produits', desc: 'Ajoutez vos créations avec descriptions et previews' },
                  { step: 3, title: 'Fixez vos prix', desc: 'Définissez le prix ou proposez gratuitement' },
                  { step: 4, title: 'Recevez vos gains', desc: 'Les paiements arrivent directement dans votre wallet' }
                ].map((item) => (
                  <div key={item.step} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* For Buyers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Pour les acheteurs</h3>
              <div className="space-y-6">
                {[
                  { step: 1, title: 'Explorez les produits', desc: 'Parcourez notre catalogue ou utilisez la recherche' },
                  { step: 2, title: 'Choisissez et payez', desc: 'Paiement sécurisé avec CinetPay' },
                  { step: 3, title: 'Recevez le lien', desc: 'Email automatique avec lien de téléchargement' },
                  { step: 4, title: 'Téléchargez', desc: 'Accès instantané à vos fichiers pendant 24h' }
                ].map((item) => (
                  <div key={item.step} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-secondary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600">
              Rejoignez des milliers de créateurs et d'acheteurs satisfaits.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${star <= testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-medium text-sm">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Prêt à commencer votre aventure ?
            </h2>
            <p className="text-xl opacity-90">
              Rejoignez Oazys aujourd'hui et découvrez un monde de possibilités créatives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Créer mon compte gratuit
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-primary-600">
                  Explorer maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}