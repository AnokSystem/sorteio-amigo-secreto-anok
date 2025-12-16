const BASE_URL = 'https://anokdb.anok.com.br/api/v1/db';
const BASE_ID = 'pe3ld21e1yapb6e';
const API_TOKEN = 'Q3tlbG35ieNz0nrVttR1hIMEXubk9wYPMjhu5vRv';

const headers = {
  'xc-token': API_TOKEN,
  'Content-Type': 'application/json',
};

export interface User {
  Id?: number;
  email: string;
  password: string;
}

export interface Event {
  Id?: number;
  user_id: number;
  name: string;
  created_at?: string;
}

export interface Participant {
  Id?: number;
  event_id: number;
  name: string;
  email?: string;
  is_drawn: boolean;
}

// Generic API functions
async function apiGet<T>(tableName: string, params?: Record<string, string>): Promise<T[]> {
  const url = new URL(`${BASE_URL}/data/v1/${BASE_ID}/${tableName}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  }
  const response = await fetch(url.toString(), { headers });
  if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
  const data = await response.json();
  return data.list || [];
}

async function apiPost<T>(tableName: string, body: Partial<T>): Promise<T> {
  const response = await fetch(`${BASE_URL}/data/v1/${BASE_ID}/${tableName}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
  return response.json();
}

async function apiPatch<T>(tableName: string, id: number, body: Partial<T>, where?: string): Promise<T | null> {
  const url = new URL(`${BASE_URL}/data/v1/${BASE_ID}/${tableName}/${id}`);
  if (where) url.searchParams.append('where', where);
  
  const response = await fetch(url.toString(), {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

async function apiDelete(tableName: string, id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/data/v1/${BASE_ID}/${tableName}/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
}

// Table setup
export async function setupTables(): Promise<void> {
  try {
    // Check if tables exist by trying to fetch from them
    await apiGet('Users', { limit: '1' });
    await apiGet('Events', { limit: '1' });
    await apiGet('Participants', { limit: '1' });
  } catch {
    console.log('Tables may need to be created manually in NocoDB');
  }
}

// User functions
export async function createUser(email: string, password: string): Promise<User> {
  // Check if user exists
  const existing = await apiGet<User>('Users', { where: `(email,eq,${email})` });
  if (existing.length > 0) {
    throw new Error('User already exists');
  }
  return apiPost<User>('Users', { email, password });
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const users = await apiGet<User>('Users', { where: `(email,eq,${email})` });
  if (users.length === 0) return null;
  const user = users[0];
  if (user.password !== password) return null;
  return user;
}

// Event functions
export async function getEventsByUser(userId: number): Promise<Event[]> {
  return apiGet<Event>('Events', { where: `(user_id,eq,${userId})`, sort: '-created_at' });
}

export async function getEventById(eventId: number): Promise<Event | null> {
  const events = await apiGet<Event>('Events', { where: `(Id,eq,${eventId})` });
  return events[0] || null;
}

export async function createEvent(userId: number, name: string): Promise<Event> {
  return apiPost<Event>('Events', { 
    user_id: userId, 
    name, 
    created_at: new Date().toISOString() 
  });
}

export async function deleteEvent(eventId: number): Promise<void> {
  // Delete all participants first
  const participants = await getParticipantsByEvent(eventId);
  for (const p of participants) {
    if (p.Id) await apiDelete('Participants', p.Id);
  }
  await apiDelete('Events', eventId);
}

// Participant functions
export async function getParticipantsByEvent(eventId: number): Promise<Participant[]> {
  return apiGet<Participant>('Participants', { where: `(event_id,eq,${eventId})` });
}

export async function addParticipant(eventId: number, name: string, email?: string): Promise<Participant> {
  return apiPost<Participant>('Participants', { 
    event_id: eventId, 
    name, 
    email: email || '', 
    is_drawn: false 
  });
}

export async function deleteParticipant(participantId: number): Promise<void> {
  await apiDelete('Participants', participantId);
}

export async function resetDraw(eventId: number): Promise<void> {
  const participants = await getParticipantsByEvent(eventId);
  for (const p of participants) {
    if (p.Id) {
      await apiPatch<Participant>('Participants', p.Id, { is_drawn: false });
    }
  }
}

// Concurrency-safe draw function
export async function drawName(eventId: number, maxRetries = 5): Promise<Participant | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Get undrawn participants
    const undrawn = await apiGet<Participant>('Participants', { 
      where: `(event_id,eq,${eventId})~and(is_drawn,eq,false)` 
    });
    
    if (undrawn.length === 0) return null;
    
    // Pick random
    const randomIndex = Math.floor(Math.random() * undrawn.length);
    const selected = undrawn[randomIndex];
    
    if (!selected.Id) continue;
    
    // Attempt atomic update
    try {
      const updated = await apiPatch<Participant>(
        'Participants', 
        selected.Id, 
        { is_drawn: true }
      );
      
      if (updated) {
        return { ...selected, is_drawn: true };
      }
    } catch {
      // Retry on failure
      continue;
    }
  }
  
  throw new Error('Could not draw a name. Please try again.');
}

// Export to CSV
export function exportToCSV(participants: Participant[], eventName: string): void {
  const headers = ['Name', 'Email', 'Is Drawn'];
  const rows = participants.map(p => [
    p.name,
    p.email || '',
    p.is_drawn ? 'Yes' : 'No'
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${eventName.replace(/\s+/g, '_')}_participants.csv`;
  link.click();
}
