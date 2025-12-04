
import { Category, Condition } from '../types';

export const getCategoryLabel = (cat: string, t: any) => {
  const map: Record<string, string> = {
    [Category.CYCLING]: t.catCycling,
    [Category.RUNNING]: t.catRunning,
    [Category.SWIMMING]: t.catSwimming,
    [Category.TRIATHLON]: t.catTriathlon,
    [Category.OTHER]: t.catOther
  };
  return map[cat] || cat;
};

export const getRoleLabel = (role: string, t: any) => {
  const map: Record<string, string> = {
    'admin': t.roleAdmin,
    'seller': t.roleSeller,
    'buyer': t.roleBuyer
  };
  return map[role] || role;
};

// Config for icons and colors
export const CATEGORY_CONFIG: Record<string, { icon: string, color: string, bg: string, ring: string }> = {
  [Category.CYCLING]: { icon: 'fa-bicycle', color: 'text-tri-orange', bg: 'bg-orange-50', ring: 'ring-tri-orange' },
  [Category.RUNNING]: { icon: 'fa-person-running', color: 'text-tri-green', bg: 'bg-lime-50', ring: 'ring-tri-green' },
  [Category.SWIMMING]: { icon: 'fa-person-swimming', color: 'text-tri-blue', bg: 'bg-cyan-50', ring: 'ring-tri-blue' },
  [Category.TRIATHLON]: { icon: 'fa-layer-group', color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-500' },
  [Category.OTHER]: { icon: 'fa-tag', color: 'text-gray-500', bg: 'bg-gray-50', ring: 'ring-gray-400' },
};

export const getConditionLabel = (cond: string, t: any) => {
  const map: Record<string, string> = {
    [Condition.NEW]: t.condNew,
    [Condition.USED_LIKE_NEW]: t.condLikeNew,
    [Condition.USED_GOOD]: t.condGood,
    [Condition.USED_FAIR]: t.condFair
  };
  return map[cond] || cond;
};

export const getPriceDisplay = (price: number, currency?: string) => {
  const symbol = currency === 'USD' ? 'U$S' : currency === 'EUR' ? '€' : '$';
  return `${symbol} ${price.toLocaleString()}`;
};
