export type Page = 'home' | 'design';

export type SidebarView = 'home' | 'projects' | 'starred' | 'recent' | 'shared' | 'help';

export interface Project {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  starred: boolean;
  lastViewed?: string;
  sharedBy?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
