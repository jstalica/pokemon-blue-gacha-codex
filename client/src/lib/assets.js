const spriteModules = import.meta.glob("../assets/sprites/*.svg", { eager: true, import: "default" });

export function getSpritePath(spriteName) {
  if (!spriteName) return null;
  const entry = Object.entries(spriteModules).find(([path]) => path.endsWith(`/${spriteName}`));
  return entry ? entry[1] : null;
}
