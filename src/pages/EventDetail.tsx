import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
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
import { Gift, Plus, Trash2, Loader2, ArrowLeft, Copy, Check, RefreshCw, Download, Link as LinkIcon } from 'lucide-react';

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
      toast({ title: t('error'), description: 'Failed to load event', variant: 'destructive' });
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
      toast({ title: t('success'), description: 'Participant added!' });
    } catch (error) {
      toast({ title: t('error'), description: 'Failed to add participant', variant: 'destructive' });
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
      toast({ title: t('success'), description: `${names.length} participants added!` });
    } catch (error) {
      toast({ title: t('error'), description: 'Failed to add participants', variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (participantId: number) => {
    try {
      await deleteParticipant(participantId);
      await loadData();
      toast({ title: t('success'), description: 'Participant removed' });
    } catch (error) {
      toast({ title: t('error'), description: 'Failed to remove participant', variant: 'destructive' });
    }
  };

  const handleResetDraw = async () => {
    if (!eventId) return;
    try {
      await resetDraw(eventId);
      await loadData();
      toast({ title: t('success'), description: 'Draw has been reset!' });
    } catch (error) {
      toast({ title: t('error'), description: 'Failed to reset draw', variant: 'destructive' });
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventId) return;
    try {
      await deleteEvent(eventId);
      navigate('/dashboard');
      toast({ title: t('success'), description: 'Event deleted' });
    } catch (error) {
      toast({ title: t('error'), description: 'Failed to delete event', variant: 'destructive' });
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
      toast({ title: t('success'), description: 'CSV downloaded!' });
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Event not found</p>
      </div>
    );
  }

  const drawnCount = participants.filter(p => p.is_drawn).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-primary/10 relative">
      <Snowflakes />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-bold">{event.name}</span>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-8 space-y-6">
        {/* Stats & Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">{participants.length}</div>
              <div className="text-sm text-muted-foreground">{t('participants')}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-secondary">{drawnCount}</div>
              <div className="text-sm text-muted-foreground">{t('drawn')}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 sm:col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Input value={drawLink} readOnly className="text-sm" />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleResetDraw}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('resetDraw')}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {t('exportCSV')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                {t('deleteEvent')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the event and all participants.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteEvent}>{t('delete')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Add Participant */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-display">{t('addParticipant')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder={t('participantName')}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSingle()}
              />
              <Input
                placeholder={t('participantEmail')}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSingle()}
              />
              <Button onClick={handleAddSingle} disabled={isAdding || !newName.trim()}>
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">{t('bulkAdd')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('addParticipants')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="John, Jane, Bob, Alice..."
                      value={bulkNames}
                      onChange={(e) => setBulkNames(e.target.value)}
                    />
                    <Button onClick={handleAddBulk} disabled={isAdding || !bulkNames.trim()} className="w-full">
                      {isAdding && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {t('save')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Participants Table */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('participantName')}</TableHead>
                  <TableHead>{t('participantEmail')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="w-[50px]">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((p) => (
                  <TableRow key={p.Id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={p.is_drawn ? 'default' : 'secondary'}>
                        {p.is_drawn ? t('drawnStatus') : t('notDrawn')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => p.Id && handleDelete(p.Id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {participants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No participants yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
