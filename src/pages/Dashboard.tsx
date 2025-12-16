import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Snowflakes } from '@/components/Snowflakes';
import { getEventsByUser, createEvent, getParticipantsByEvent, Event } from '@/lib/nocodb';
import { useToast } from '@/hooks/use-toast';
import { Gift, Plus, Users, Loader2, LogOut, Calendar } from 'lucide-react';

interface EventWithStats extends Event {
  totalParticipants: number;
  drawnCount: number;
}

export default function Dashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEventName, setNewEventName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.Id) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    if (!user?.Id) return;
    setIsLoading(true);
    try {
      const userEvents = await getEventsByUser(user.Id);
      const eventsWithStats = await Promise.all(
        userEvents.map(async (event) => {
          const participants = event.Id ? await getParticipantsByEvent(event.Id) : [];
          return {
            ...event,
            totalParticipants: participants.length,
            drawnCount: participants.filter(p => p.is_drawn).length,
          };
        })
      );
      setEvents(eventsWithStats);
    } catch (error) {
      toast({ title: t('error'), description: 'Failed to load events', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEventName.trim() || !user?.Id) return;
    setIsCreating(true);
    try {
      await createEvent(user.Id, newEventName.trim());
      setNewEventName('');
      setDialogOpen(false);
      await loadEvents();
      toast({ title: t('success'), description: 'Event created!' });
    } catch (error) {
      toast({ title: t('error'), description: 'Failed to create event', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-primary/10 relative">
      <Snowflakes />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold">Secret Santa</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl font-bold">{t('myEvents')}</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('createEvent')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('createEvent')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder={t('eventName')}
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateEvent()}
                />
                <Button onClick={handleCreateEvent} disabled={isCreating || !newEventName.trim()} className="w-full">
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {t('createEvent')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <Card className="border-dashed border-2 border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Gift className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('noEvents')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={event.Id} to={`/event/${event.Id}`}>
                <Card className="hover:scale-[1.02] transition-transform cursor-pointer border-border/50 holiday-shadow hover:border-primary/30">
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2">
                      <Gift className="h-5 w-5 text-primary" />
                      {event.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {event.created_at ? new Date(event.created_at).toLocaleDateString() : 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{event.totalParticipants} {t('participants')}</span>
                      </div>
                      <div className="text-secondary font-medium">
                        {event.drawnCount} {t('drawn')}
                      </div>
                    </div>
                    {event.totalParticipants > 0 && (
                      <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary transition-all duration-500"
                          style={{ width: `${(event.drawnCount / event.totalParticipants) * 100}%` }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
