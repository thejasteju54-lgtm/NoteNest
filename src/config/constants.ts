// Centralized Application Constants

export const APP_CONFIG = {
  NAME: 'NoteNest',
  TAGLINE: 'Your notes. Organized.',
  VERSION: '1.0.0',
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024, // 50 MB
  MAX_FILE_SIZE_LABEL: '50 MB',
  ALLOWED_EXTENSIONS: ['.pdf'] as const,
  ALLOWED_MIME_TYPES: ['application/pdf'] as const,
  PDF_MAGIC_BYTES: [0x25, 0x50, 0x44, 0x46, 0x2d] as const, // %PDF-
  DB_NAME: 'notenest_db',
  DB_VERSION: 1,
  DEFAULT_PAGE_SIZE: 20,
} as const;

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  bgSubtle: string;
  borderSubtle: string;
  badgeBg: string;
  badgeText: string;
}

export const SUBJECT_COLORS: readonly ColorOption[] = [
  {
    id: 'sage',
    name: 'Sage Green',
    hex: '#7E9C8D',
    bgSubtle: 'bg-[#EAF0ED]',
    borderSubtle: 'border-[#7E9C8D]/25',
    badgeBg: 'bg-[#7E9C8D]/15',
    badgeText: 'text-[#506A5D]',
  },
  {
    id: 'blue',
    name: 'Slate Blue',
    hex: '#8FA7B8',
    bgSubtle: 'bg-[#EEF3F6]',
    borderSubtle: 'border-[#8FA7B8]/25',
    badgeBg: 'bg-[#8FA7B8]/15',
    badgeText: 'text-[#4A6475]',
  },
  {
    id: 'lavender',
    name: 'Soft Lavender',
    hex: '#A99BC8',
    bgSubtle: 'bg-[#F4F1F9]',
    borderSubtle: 'border-[#A99BC8]/25',
    badgeBg: 'bg-[#A99BC8]/15',
    badgeText: 'text-[#635584]',
  },
  {
    id: 'sand',
    name: 'Warm Sand',
    hex: '#D8CFC4',
    bgSubtle: 'bg-[#FAF7F3]',
    borderSubtle: 'border-[#D8CFC4]/40',
    badgeBg: 'bg-[#D8CFC4]/30',
    badgeText: 'text-[#6B6155]',
  },
  {
    id: 'terracotta',
    name: 'Muted Terracotta',
    hex: '#D98A76',
    bgSubtle: 'bg-[#FAF0ED]',
    borderSubtle: 'border-[#D98A76]/25',
    badgeBg: 'bg-[#D98A76]/15',
    badgeText: 'text-[#874A3A]',
  },
  {
    id: 'mint',
    name: 'Cool Mint',
    hex: '#6EB798',
    bgSubtle: 'bg-[#EBF7F1]',
    borderSubtle: 'border-[#6EB798]/25',
    badgeBg: 'bg-[#6EB798]/15',
    badgeText: 'text-[#3E7B62]',
  },
] as const;

export const DEFAULT_SUBJECT_COLOR = SUBJECT_COLORS[0];
