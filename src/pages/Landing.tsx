import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Snowflakes } from '@/components/Snowflakes';
import { Gift, Users, Sparkles, Share2, Heart, TreePine } from 'lucide-react';

export default function Landing() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Snowflakes />
      
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-4 sm:px-6 py-4 safe-area-top">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-lg sm:text-xl font-bold text-foreground">
            Amigo Secreto
          </span>
        </div>
        <Link to="/auth">
          <Button variant="outline" size="sm" className="rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary/40">
            {t('login')}
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Animated Icon */}
          <div className="animate-float mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 holiday-shadow-lg">
              <Gift className="h-10 w-10 sm:h-14 sm:w-14 text-primary" />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-gradient leading-tight">
            {t('title')}
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2">
            {t('subtitle')}
          </p>
          
          {/* CTA Button */}
          <div className="flex justify-center mb-16 sm:mb-24">
            <Link to="/auth?mode=signup" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 rounded-2xl btn-primary-gradient hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {t('getStarted')}
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <FeatureCard
              icon={<Users className="h-6 w-6 sm:h-7 sm:w-7" />}
              title="Fácil de Usar"
              description="Crie eventos e adicione participantes em segundos"
              color="primary"
            />
            <FeatureCard
              icon={<Share2 className="h-6 w-6 sm:h-7 sm:w-7" />}
              title="Compartilhe"
              description="Um único link para todos sortearem"
              color="secondary"
            />
            <FeatureCard
              icon={<Heart className="h-6 w-6 sm:h-7 sm:w-7" />}
              title="Sorteio Justo"
              description="Sorteio seguro e sem repetições"
              color="accent"
            />
          </div>
        </div>
      </main>

      {/* Footer decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      
      {/* Floating decorations */}
      <div className="absolute bottom-8 left-8 opacity-20 hidden sm:block">
        <TreePine className="h-16 w-16 text-secondary" />
      </div>
      <div className="absolute top-1/2 right-6 opacity-15 hidden sm:block">
        <Gift className="h-12 w-12 text-primary" />
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color: 'primary' | 'secondary' | 'accent';
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/20 text-accent-foreground',
  };
  
  return (
    <div className="p-5 sm:p-6 rounded-2xl glass-card hover:scale-[1.02] transition-all duration-300 group">
      <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${colorClasses[color]} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
