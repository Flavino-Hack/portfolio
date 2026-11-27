export interface DownloadableResource {
  id: string;
  label: string;
  filename: string;
  url: string;
  source: 'github' | 'local';
  projectSlug?: string;
  keywords: string[];
  description: string;
}

export const DOWNLOADABLE_RESOURCES: DownloadableResource[] = [
  {
    id: 'cv',
    label: 'CV — Wendtoin Guy Flavien Kiéma',
    filename: 'CV_Wendtoin_Guy_Flavien_Kiema.pdf',
    url: '/downloads/cv.pdf',
    source: 'local',
    keywords: ['cv', 'resume', 'curriculum', 'parcours pdf'],
    description: 'Curriculum Vitae (PDF local)',
  },
  {
    id: 'password-hack-repo',
    label: 'Dépôt GitHub — Cracking d’archives & Défense',
    filename: 'password_hack',
    url: 'https://github.com/Flavino-Hack/password_hack.git',
    source: 'github',
    projectSlug: 'password-hack',
    keywords: ['cracking', 'archive', 'archives', 'defense', 'défense', 'password_hack', 'mot de passe'],
    description: 'Code source & scripts sur GitHub',
  },
  {
    id: 'local-share-repo',
    label: 'Dépôt GitHub — LocalShare',
    filename: 'local-share',
    url: 'https://github.com/Flavino-Hack/local-share.git',
    source: 'github',
    projectSlug: 'local-share',
    keywords: ['localshare', 'local share', 'partage hors ligne', 'wifi'],
    description: 'Dépôt GitHub du projet LocalShare',
  },
  {
    id: 'agent-zero-repo',
    label: 'Dépôt GitHub — Agent Zero',
    filename: 'agent-zero-project',
    url: 'https://github.com/Flavino-Hack/agent-zero-project',
    source: 'github',
    projectSlug: 'agent-zero',
    keywords: ['agent zero', 'agent-zero', 'assistant ia autonome'],
    description: 'Dépôt GitHub Agent Zero',
  },
  {
    id: 'openclaw-repo',
    label: 'Dépôt GitHub — OpenClaw Assistant',
    filename: 'openclaw-assistant',
    url: 'https://github.com/Flavino-Hack/openclaw-assistant',
    source: 'github',
    projectSlug: 'openclaw',
    keywords: ['openclaw', 'assistant ia'],
    description: 'Dépôt GitHub OpenClaw',
  },
  {
    id: 'vpn-repo',
    label: 'Dépôt GitHub — VPN Personnel',
    filename: 'vpn-project',
    url: 'https://github.com/Flavino-Hack/vpn-project',
    source: 'github',
    projectSlug: 'vpn-personnel',
    keywords: ['vpn', 'openvpn', 'kali', 'tunnel'],
    description: 'Dépôt GitHub VPN Personnel',
  },
  {
    id: 'mini-cloud-repo',
    label: 'Dépôt GitHub — Mini Cloud Provider',
    filename: 'mini-cloud-provider',
    url: 'https://github.com/Flavino-Hack/mini-cloud-provider.git',
    source: 'github',
    projectSlug: 'mini-cloud',
    keywords: ['cloud', 'vps', 'mini cloud'],
    description: 'Dépôt GitHub Mini Cloud Provider',
  },
  {
    id: 'pbx-repo',
    label: 'Dépôt GitHub — IPBX Issabel & Telegram',
    filename: 'pbx',
    url: 'https://github.com/Flavino-Hack/pbx.git',
    source: 'github',
    projectSlug: 'ipbx-issabel',
    keywords: ['ipbx', 'issabel', 'voip', 'telegram', 'telephonie', 'téléphonie'],
    description: 'Dépôt GitHub IPBX Issabel',
  },
];

export function matchDownloadableResource(message: string): DownloadableResource | null {
  const q = message.toLowerCase();
  const asksForResource =
    /\b(cv|resume|curriculum|fichier|fichiers|telecharger|télécharger|envoyer|doc|documentation|pdf|zip|ressource|git|github|depot|dépôt|code|repo|gither)\b/i.test(
      q
    );

  if (!asksForResource) return null;

  for (const res of DOWNLOADABLE_RESOURCES) {
    if (res.keywords.some((kw) => q.includes(kw))) {
      return res;
    }
  }

  return null;
}