import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Snowflakes } from '@/components/Snowflakes';
import { getEventById, getParticipantsByEvent, drawName, Event, Participant } from '@/lib/nocodb';
import { Gift, Loader2, Sparkles, PartyPopper, AlertCircle, User } from 'lucide-react';

export default function Draw() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
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
      const [eventData, participantsData] = await Promise.all([
        getEventById(eventId),
        getParticipantsByEvent(eventId),
      ]);
      setEvent(eventData);
      setParticipants(participantsData);
      
      const undrawnCount = participantsData.filter(p => !p.is_drawn).length;
      if (undrawnCount === 0) {
        setAllDrawn(true);
      }
    } catch (err) {
      setError(t('eventNotFound'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraw = async () => {
    if (!eventId || hasDrawn || !selectedParticipantId) return;
    setIsDrawing(true);
    setError(null);
    
    try {
      const drawn = await drawName(eventId, parseInt(selectedParticipantId));
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

  // Get undrawn participants for selection (excluding those who already drew)
  const undrawnParticipants = participants.filter(p => !p.is_drawn);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <Snowflakes />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-secondary/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6 safe-area-top">
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-lg sm:text-xl font-bold">{t('secretSanta')}</span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-sm glass-card border-0 rounded-3xl overflow-hidden holiday-shadow-lg">
          {/* Gradient accent */}
          <div className="h-1.5 gradient-holiday" />
          
          <CardContent className="p-6 sm:p-8 text-center">
            {event && (
              <p className="text-muted-foreground mb-6 sm:mb-8 font-medium">{event.name}</p>
            )}

            {/* Error State */}
            {error && !allDrawn && !drawnPerson && (
              <div className="animate-fade-up">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
                  <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-destructive" />
                </div>
                <p className="text-destructive font-medium">{error}</p>
              </div>
            )}

            {/* All Drawn State */}
            {allDrawn && !drawnPerson && (
              <div className="animate-fade-up">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-6">
                  <Gift className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">{t('allDrawn')}</h2>
              </div>
            )}

            {/* Success State - Drawn Name */}
            {drawnPerson && (
              <div className="animate-scale-up">
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 glow-gold animate-pulse-soft">
                  <PartyPopper className="h-12 w-12 sm:h-14 sm:w-14 text-primary" />
                </div>
                <p className="text-muted-foreground mb-3">{t('yourSecretFriend')}</p>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gradient mb-6 leading-tight">
                  {drawnPerson.name}
                </h2>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-4">
                  {t('keepSecret')}
                </p>
              </div>
            )}

            {/* Initial State - Ready to Draw */}
            {!drawnPerson && !allDrawn && !error && (
              <div className="animate-fade-up">
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 sm:mb-8 animate-float holiday-shadow">
                  <Gift className="h-12 w-12 sm:h-14 sm:w-14 text-primary" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">{t('secretSanta')}</h2>
                <p className="text-muted-foreground mb-4">Selecione seu nome e descubra quem você tirou!</p>
                
                {/* Participant Selection */}
                <div className="mb-6">
                  <Select value={selectedParticipantId} onValueChange={setSelectedParticipantId}>
                    <SelectTrigger className="w-full rounded-xl bg-background border-border">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Quem é você?" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      {participants.map((p) => (
                        <SelectItem key={p.Id} value={String(p.Id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  size="lg"
                  onClick={handleDraw}
                  disabled={isDrawing || !selectedParticipantId}
                  className="w-full sm:w-auto px-10 py-6 text-lg rounded-2xl btn-primary-gradient hover:scale-105 transition-all duration-300 disabled:opacity-50"
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

      {/* Footer decoration */}
      <div className="relative z-10 h-8 safe-area-bottom" />
    </div>
  );
}
