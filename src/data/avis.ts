export interface Avis {
  nom: string;
  date: string;
  message: string;
}

export const avisParProjet: Record<string, Avis[]> = {
  'agent-zero': [
    {
      nom: "Jean Dupont",
      date: "12 Octobre 2026",
      message: "L'intégration de Gemini est vraiment impressionnante. Beau travail sur les logs !"
    }
  ],
  'openclaw-assistant': [
    {
      nom: "Sarah K.",
      date: "05 Octobre 2026",
      message: "L'agent IA sur Telegram est super fluide. Le déploiement sur Ubuntu est bien expliqué."
    }
  ],
  'vpn-personnel': []
};