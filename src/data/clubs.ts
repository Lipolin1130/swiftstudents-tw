import type { Lang } from '../i18n/ui';

export interface Club {
  name: string;
  school: Record<Lang, string>;
  logo: string;
  url?: string;
}

export const clubs: Club[] = [
  { name: 'NTU iOS Club', school: { 'zh-Hant': '國立臺灣大學', en: 'National Taiwan University' }, logo: '/clubs/ntu-ios-club.jpg', url: 'https://www.instagram.com/ntu.iosclub/' },
  { name: 'FCU iOS Club', school: { 'zh-Hant': '逢甲大學', en: 'Feng Chia University' }, logo: '/clubs/ios-club.jpg', url: 'https://www.instagram.com/fcu.iosclub/' },
  { name: 'iOS 教學與輔助使用 Club', school: { 'zh-Hant': '國立臺中教育大學', en: 'National Taichung University of Education' }, logo: '/clubs/ntcu-ios-club.jpg', url: 'https://www.instagram.com/ntcu_iosclub/' },
];
