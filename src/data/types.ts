export type Status = 'active' | 'paused' | 'completed' | 'experimental' | 'archived';

export type CodetecaApp = {
  id: string;
  name: string;
  description: string;
  href?: string;
  repo: string;
  tags?: string[];


  slug?: string; 
  owner?: string; // se agrega automáticamente
  repoName?: string; // se agrega automáticamente
  status?: Status;
  motivation?: string;
  features?: string[];
  learnings?: string;
  startDate?: string;
  demo?: string;
  highlights?: string[];

  //for markdown content
  hasDetailedContent?: boolean;
  detailedContent?: string | null | undefined;
};
