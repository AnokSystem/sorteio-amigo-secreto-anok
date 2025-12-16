import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Snowflakes } from '@/components/Snowflakes';
import { 
  getEventById, 
  getParticipantsByEvent, 
  addParticipant, 
  deleteParticipant, 
  resetDraw, 
  deleteEvent,
  exportToCSV,
  Event,
  Participant 
} from '@/lib/nocodb';
import { useToast } from '@/hooks/use-toast';
import { Gift, Plus, Trash2, Loader2, ArrowLeft, Copy, Check, RefreshCw, Download, Users, UserCheck, Link as LinkIcon } from 'lucide-react';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const eventId = id ? parseInt(id) : null;
  const drawLink = `${window.location.origin}/draw/${eventId}`;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (eventId) {
      loadData();
    }
  }, [eventId]);

  const loadData = async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const [eventData, participantsData] = await Promise.all([
        getEventById(eventId),
        getParticipantsByEvent(eventId),
      ]);
      setEvent(eventData);
      setParticipants(participantsData);
    } catch (error) {
      toast({ title: t('error'), description: 'Falha ao carregar evento', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSingle = async () => {
    if (!newName.trim() || !eventId) return;
    setIsAdding(true);
    try {
      await addParticipant(eventId, newName.trim(), newEmail.trim() || undefined);
      setNewName('');
      setNewEmail('');
      await loadData();
      toast({ title: t('success'), description: 'Participante adicionado!' });
    } catch (error) {
      toast({ title: t('error'), description: 'Falha ao adicionar participante', variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddBulk = async () => {
    if (!bulkNames.trim() || !eventId) return;
    setIsAdding(true);
    try {
      const names = bulkNames.split(',').map(n => n.trim()).filter(n => n);
      for (const name of names) {
        await addParticipant(eventId, name);
      }
      setBulkNames('');
      setDialogOpen(false);
      await loadData();
      toast({ title: t('success'), description: `${names.length} participantes adicionados!` });
    } catch (error) {
      toast({ title: t('error'), description: 'Falha ao adicionar participantes', variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (participantId: number) => {
    try {
      await deleteParticipant(participantId);
      await loadData();
      toast({ title: t('success'), description: 'Participante removido' });
    } catch (error) {
      toast({ title: t('error'), description: 'Falha ao remover participante', variant: 'destructive' });
    }
  };

  const handleResetDraw = async () => {
    if (!eventId) return;
    try {
      await resetDraw(eventId);
      await loadData();
      toast({ title: t('success'), description: 'Sorteio reiniciado!' });
    } catch (error) {
      toast({ title: t('error'), description: 'Falha ao reiniciar sorteio', variant: 'destructive' });
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventId) return;
    try {
      await deleteEvent(eventId);
      navigate('/dashboard');
      toast({ title: t('success'), description: 'Evento excluído' });
    } catch (error) {
      toast({ title: t('error'), description: 'Falha ao excluir evento', variant: 'destructive' });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(drawLink);
    setCopied(true);
    toast({ title: t('linkCopied') });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (event) {
      exportToCSV(participants, event.name);
      toast({ title: t('success'), description: 'CSV baixado!' });
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{t('eventNotFound')}</p>
      </div>
    );
  }

  const drawnCount = participants.filter(p => p.is_drawn).length;

  return (
    <div className="min-h-screen bg-background relative">
      <Snowflakes />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
      </div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 safe-area-top">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <span className="font-display text-base sm:text-lg font-bold truncate">{event.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 safe-area-bottom">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="glass-card rounded-2xl">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{participants.length}</div>
                  <div className="text-xs text-muted-foreground">{t('participants')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card rounded-2xl">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-secondary">{drawnCount}</div>
                  <div className="text-xs text-muted-foreground">{t('drawn')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card rounded-2xl col-span-2">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input 
                  value={drawLink} 
                  readOnly 
                  className="text-xs sm:text-sm h-9 rounded-lg bg-muted/50 border-0" 
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleCopyLink}
                  className="rounded-lg h-9 w-9 shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-secondary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button variant="outline" size="sm" onClick={handleResetDraw} className="rounded-xl h-9">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('resetDraw')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="rounded-xl h-9">
            <Download className="h-4 w-4 mr-2" />
            {t('exportCSV')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="rounded-xl h-9">
                <Trash2 className="h-4 w-4 mr-2" />
                {t('deleteEvent')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="mx-4 rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">{t('deleteEventConfirm')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('deleteEventDesc')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="rounded-xl">{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteEvent} className="rounded-xl">{t('delete')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Add Participant */}
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg font-display">{t('addParticipant')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Input
                  placeholder={t('participantName')}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSingle()}
                  className="h-11 rounded-xl"
                />
                <Input
                  placeholder={t('participantEmail')}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSingle()}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Button 
                  onClick={handleAddSingle} 
                  disabled={isAdding || !newName.trim()} 
                  className="flex-1 h-11 rounded-xl btn-primary-gradient"
                >
                  {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Adicionar
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-11 rounded-xl">{t('bulkAdd')}</Button>
                  </DialogTrigger>
                  <DialogContent className="mx-4 rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="font-display">{t('addParticipants')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input
                        placeholder="João, Maria, Pedro, Ana..."
                        value={bulkNames}
                        onChange={(e) => setBulkNames(e.target.value)}
                        className="h-11 rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">Separe os nomes por vírgula</p>
                      <Button 
                        onClick={handleAddBulk} 
                        disabled={isAdding || !bulkNames.trim()} 
                        className="w-full h-11 rounded-xl btn-primary-gradient"
                      >
                        {isAdding && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        {t('save')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participants List */}
        <Card className="glass-card rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg font-display flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t('participants')} ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {participants.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {t('noParticipants')}
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {participants.map((p, index) => (
                  <div 
                    key={p.Id} 
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors animate-fade-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium">{p.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.name}</div>
                        {p.email && (
                          <div className="text-xs text-muted-foreground truncate">{p.email}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <Badge 
                        variant={p.is_drawn ? 'default' : 'destructive'}
                        className={`rounded-full text-xs ${p.is_drawn ? 'bg-secondary text-secondary-foreground' : ''}`}
                      >
                        {p.is_drawn ? t('drawnStatus') : t('notDrawn')}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => p.Id && handleDelete(p.Id)}
                        className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
