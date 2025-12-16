import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Snowflakes } from '@/components/Snowflakes';
import { setupTables } from '@/lib/nocodb';
import { useToast } from '@/hooks/use-toast';
import { Gift, Users, Sparkles, Share2, Database, Loader2, CheckCircle } from 'lucide-react';

export default function Landing() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupDone, setSetupDone] = useState(false);

  const handleSetup = async () => {
    setIsSettingUp(true);
    try {
      const result = await setupTables();
      if (result.success) {
        setSetupDone(true);
        toast({ title: 'Success', description: result.message });
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Setup failed',
        variant: 'destructive'
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-primary/10 relative overflow-hidden">
      <Snowflakes />
      
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <Gift className="h-8 w-8 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">
            Secret Santa
          </span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <Link to="/auth">
            <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
              {t('login')}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 container mx-auto px-6 py-16 text-center">
        <div className="animate-float mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
            <Gift className="h-12 w-12 text-primary" />
          </div>
        </div>
        
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 text-gradient">
          {t('title')}
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          {t('subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth?mode=signup">
            <Button size="lg" className="text-lg px-8 py-6 holiday-shadow hover:scale-105 transition-transform">
              <Sparkles className="mr-2 h-5 w-5" />
              {t('getStarted')}
            </Button>
          </Link>
          
          <Button 
            size="lg" 
            variant="outline"
            onClick={handleSetup}
            disabled={isSettingUp || setupDone}
            className="text-lg px-8 py-6 border-secondary/50 hover:bg-secondary/10"
          >
            {isSettingUp ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : setupDone ? (
              <CheckCircle className="mr-2 h-5 w-5 text-secondary" />
            ) : (
              <Database className="mr-2 h-5 w-5" />
            )}
            {setupDone ? 'Database Ready!' : 'Setup Database'}
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-4xl mx-auto">
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Easy Setup"
            description="Create events and add participants in seconds"
          />
          <FeatureCard
            icon={<Share2 className="h-8 w-8" />}
            title="Share Link"
            description="Generate a single link for all participants to draw"
          />
          <FeatureCard
            icon={<Gift className="h-8 w-8" />}
            title="Fair Draw"
            description="Secure, random assignment with no duplicates"
          />
        </div>
      </main>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl translate-x-1/2" />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card/80 backdrop-blur border border-border/50 holiday-shadow hover:scale-105 transition-transform">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
