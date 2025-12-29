export type CodetecaApp = {
  id: string;
  name: string;
  description: string;
  href?: string;
  repo?: string;
  status?: "active" | "wip" | "archived";
  tags?: string[];
};
