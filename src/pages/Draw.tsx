import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Snowflakes } from '@/components/Snowflakes';
import { getEventById, getParticipantsByEvent, drawName, Event, Participant } from '@/lib/nocodb';
import { Gift, Loader2, Sparkles, PartyPopper } from 'lucide-react';

export default function Draw() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [drawnPerson, setDrawnPerson] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [allDrawn, setAllDrawn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  const eventId = id ? parseInt(id) : null;

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    if (!eventId) return;
    try {
      const [eventData, participants] = await Promise.all([
        getEventById(eventId),
        getParticipantsByEvent(eventId),
      ]);
      setEvent(eventData);
      
      const undrawnCount = participants.filter(p => !p.is_drawn).length;
      if (undrawnCount === 0) {
        setAllDrawn(true);
      }
    } catch (err) {
      setError('Event not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraw = async () => {
    if (!eventId || hasDrawn) return;
    setIsDrawing(true);
    setError(null);
    
    try {
      const drawn = await drawName(eventId);
      if (drawn) {
        setDrawnPerson(drawn);
        setHasDrawn(true);
      } else {
        setAllDrawn(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('drawError'));
    } finally {
      setIsDrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/20 via-background to-primary/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-primary/20 flex flex-col relative overflow-hidden">
      <Snowflakes />
      
      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold">{t('secretSanta')}</span>
        </div>
        <LanguageToggle />
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-border/50 holiday-shadow overflow-hidden">
          {/* Header decoration */}
          <div className="h-2 gradient-holiday" />
          
          <CardContent className="pt-8 pb-10 text-center">
            {event && (
              <p className="text-muted-foreground mb-6">{event.name}</p>
            )}

            {error && !allDrawn && !drawnPerson && (
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <Gift className="h-10 w-10 text-destructive" />
                </div>
                <p className="text-destructive">{error}</p>
              </div>
            )}

            {allDrawn && !drawnPerson && (
              <div className="animate-fade-in">
                <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
                  <Gift className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">{t('allDrawn')}</h2>
              </div>
            )}

            {drawnPerson && (
              <div className="animate-scale-in">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6 glow-gold animate-float">
                  <PartyPopper className="h-12 w-12 text-primary" />
                </div>
                <p className="text-muted-foreground mb-2">{t('yourSecretFriend')}</p>
                <h2 className="font-display text-4xl font-bold text-gradient mb-6">
                  {drawnPerson.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('keepSecret')}
                </p>
              </div>
            )}

            {!drawnPerson && !allDrawn && !error && (
              <div className="animate-fade-in">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-float">
                  <Gift className="h-12 w-12 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-6">{t('secretSanta')}</h2>
                <Button
                  size="lg"
                  onClick={handleDraw}
                  disabled={isDrawing}
                  className="px-8 hover:scale-105 transition-transform"
                >
                  {isDrawing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      {t('drawing')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      {t('drawName')}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Decorative */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/30 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl translate-x-1/2" />
    </div>
  );
}
