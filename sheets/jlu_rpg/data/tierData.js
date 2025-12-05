// ========================================
// TIER DATA
// Game tier information and stats
// ========================================

export const TIER_DATA = {
    'D': {
        pax: 40,
        baseDet: 12,
        defBase: 8,
        baseAtk: 1,
        dadoDano: '1d6',
        attributeLimit: 6,
        description: 'Tier D - Heróis iniciantes'
    },
    'C': {
        pax: 60,
        baseDet: 15,
        defBase: 10,
        baseAtk: 2,
        dadoDano: '1d6',
        attributeLimit: 9,
        description: 'Tier C - Heróis experientes'
    },
    'B': {
        pax: 80,
        baseDet: 18,
        defBase: 12,
        baseAtk: 3,
        dadoDano: '1d8',
        attributeLimit: 12,
        description: 'Tier B - Heróis veteranos'
    },
    'A': {
        pax: 100,
        baseDet: 21,
        defBase: 14,
        baseAtk: 4,
        dadoDano: '1d10',
        attributeLimit: 15,
        description: 'Tier A - Heróis poderosos'
    },
    'S': {
        pax: 120,
        baseDet: 24,
        defBase: 16,
        baseAtk: 5,
        dadoDano: '1d12',
        attributeLimit: 18,
        description: 'Tier S - Heróis lendários'
    }
};

export default TIER_DATA;
