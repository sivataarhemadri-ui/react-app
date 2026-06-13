// Fixed avatar set. Uses DiceBear SVG endpoints (no API key needed)
export const AVATARS = [
  { id: "avatar-1", name: "Chef Mango",   url: "https://api.dicebear.com/9.x/adventurer/svg?seed=ChefMango&backgroundColor=fcd34d" },
  { id: "avatar-2", name: "Captain Leaf", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=CaptainLeaf&backgroundColor=86efac" },
  { id: "avatar-3", name: "Spice Rider",  url: "https://api.dicebear.com/9.x/adventurer/svg?seed=SpiceRider&backgroundColor=fdba74" },
  { id: "avatar-4", name: "Coco Hero",    url: "https://api.dicebear.com/9.x/adventurer/svg?seed=CocoHero&backgroundColor=fca5a5" },
  { id: "avatar-5", name: "Curry Star",   url: "https://api.dicebear.com/9.x/adventurer/svg?seed=CurryStar&backgroundColor=c4b5fd" },
  { id: "avatar-6", name: "Biryani Boss", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=BiryaniBoss&backgroundColor=f0abfc" },
  { id: "avatar-7", name: "Roti Ranger",  url: "https://api.dicebear.com/9.x/adventurer/svg?seed=RotiRanger&backgroundColor=7dd3fc" },
  { id: "avatar-8", name: "Paneer Pal",   url: "https://api.dicebear.com/9.x/adventurer/svg?seed=PaneerPal&backgroundColor=fde68a" },
  { id: "avatar-9", name: "Mango Maestro", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=MangoMaestro&backgroundColor=fef08a" },
  { id: "avatar-10", name: "Saffron Sage",  url: "https://api.dicebear.com/9.x/adventurer/svg?seed=SaffronSage&backgroundColor=fbcfe8" },
];

export function getAvatar(id) {
  return AVATARS.find((a) => a.id === id) || AVATARS[0];
}

export function pickAvatarId(seed = "") {
  if (!seed) return AVATARS[0].id;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % AVATARS.length;
  }
  return AVATARS[Math.abs(hash) % AVATARS.length].id;
}