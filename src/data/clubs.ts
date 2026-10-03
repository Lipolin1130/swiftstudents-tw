import type { Lang } from '../i18n/ui';

export interface Club {
  name: string;
  school: Record<Lang, string>;
  logo: string;
  url?: string;
}

// TODO: replace the placeholder clubs with the real ones.
export const clubs: Club[] = [
  { name: 'NTU iOS Club', school: { 'zh-Hant': '國立臺灣大學', en: 'National Taiwan University' }, logo: '/clubs/ios-club.jpg', url: 'https://www.instagram.com/ntu.iosclub/' },
  { name: 'FCU iOS Club', school: { 'zh-Hant': '逢甲大學', en: 'Feng Chia University' }, logo: '/clubs/ios-club.jpg' },
  { name: 'iOS Club', school: { 'zh-Hant': '學校名稱', en: 'School name' }, logo: '/clubs/ios-club.jpg' },
];
