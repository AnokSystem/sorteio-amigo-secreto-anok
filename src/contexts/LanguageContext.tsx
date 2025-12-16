import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'pt';

const translations = {
  en: {
    // Landing
    title: 'Secret Santa Drawer',
    subtitle: 'Create magical gift exchange moments with friends and family',
    getStarted: 'Get Started',
    login: 'Login',
    signup: 'Sign Up',
    
    // Auth
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    
    // Dashboard
    myEvents: 'My Events',
    createEvent: 'Create Event',
    eventName: 'Event Name',
    noEvents: 'No events yet. Create your first Secret Santa!',
    participants: 'participants',
    drawn: 'drawn',
    
    // Event
    addParticipant: 'Add Participant',
    addParticipants: 'Add Participants',
    participantName: 'Name',
    participantEmail: 'Email (optional)',
    bulkAdd: 'Bulk Add (comma-separated names)',
    generateLink: 'Generate Draw Link',
    copyLink: 'Copy Link',
    linkCopied: 'Link copied!',
    resetDraw: 'Reset Draw',
    exportCSV: 'Export to CSV',
    deleteEvent: 'Delete Event',
    status: 'Status',
    actions: 'Actions',
    notDrawn: 'Not Drawn',
    drawnStatus: 'Drawn',
    
    // Draw page
    secretSanta: 'Secret Santa',
    yourSecretFriend: 'Your secret friend is...',
    allDrawn: 'All names have been drawn!',
    drawError: 'Could not draw a name. Please try again.',
    keepSecret: 'Keep this secret! 🤫',
    drawName: 'Draw a Name',
    drawing: 'Drawing...',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    back: 'Back',
    dashboard: 'Dashboard',
    logout: 'Logout',
  },
  pt: {
    // Landing
    title: 'Sorteio Amigo Secreto',
    subtitle: 'Crie momentos mágicos de troca de presentes com amigos e família',
    getStarted: 'Começar',
    login: 'Entrar',
    signup: 'Cadastrar',
    
    // Auth
    email: 'E-mail',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    noAccount: 'Não tem uma conta?',
    hasAccount: 'Já tem uma conta?',
    
    // Dashboard
    myEvents: 'Meus Eventos',
    createEvent: 'Criar Evento',
    eventName: 'Nome do Evento',
    noEvents: 'Nenhum evento ainda. Crie seu primeiro Amigo Secreto!',
    participants: 'participantes',
    drawn: 'sorteados',
    
    // Event
    addParticipant: 'Adicionar Participante',
    addParticipants: 'Adicionar Participantes',
    participantName: 'Nome',
    participantEmail: 'E-mail (opcional)',
    bulkAdd: 'Adicionar em Lote (nomes separados por vírgula)',
    generateLink: 'Gerar Link de Sorteio',
    copyLink: 'Copiar Link',
    linkCopied: 'Link copiado!',
    resetDraw: 'Resetar Sorteio',
    exportCSV: 'Exportar Planilha',
    deleteEvent: 'Excluir Evento',
    status: 'Status',
    actions: 'Ações',
    notDrawn: 'Não Sorteado',
    drawnStatus: 'Sorteado',
    
    // Draw page
    secretSanta: 'Amigo Secreto',
    yourSecretFriend: 'Seu amigo secreto é...',
    allDrawn: 'Todos os nomes já foram sorteados!',
    drawError: 'Não foi possível sortear um nome. Tente novamente.',
    keepSecret: 'Mantenha em segredo! 🤫',
    drawName: 'Sortear Nome',
    drawing: 'Sorteando...',
    
    // Common
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    back: 'Voltar',
    dashboard: 'Painel',
    logout: 'Sair',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('secretsanta_lang');
    return (stored as Language) || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('secretsanta_lang', lang);
  };

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
