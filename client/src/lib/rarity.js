export const RARITY_LABELS = {
  C: "Common",
  U: "Uncommon",
  R: "Rare",
  E: "Epic",
  L: "Legendary"
};

export function formatRarity(rarity) {
  return RARITY_LABELS[rarity] ?? rarity;
}
