export const pokemonDetailsTheme = {
  background: "#F8F5F0",
  surface: "#FFFDFC",
  surfaceMuted: "#F3ECE3",
  border: "#E6D6C3",
  heroBackground: "#1F3A5F",
  heroAccent: "#7DD3FC",
  heroGlow: "#F59E0B",
  textPrimary: "#1F2937",
  textSecondary: "#5B6472",
  textMuted: "#7C8698",
  textOnDark: "#F8FAFC",
  textOnDarkMuted: "#C7D2E3",
  error: "#B42318",
  errorMuted: "#D92D20",
  action: "#D97706",
  white: "#FFFFFF",
} as const;

export const pokemonTypeColors: Record<string, string> = {
  bug: "#B8D65C",
  dark: "#6B5B95",
  dragon: "#5B8DEF",
  electric: "#F6C445",
  fairy: "#F29BC1",
  fighting: "#E76F51",
  fire: "#F08A5D",
  flying: "#8EC5FC",
  ghost: "#8E7CC3",
  grass: "#62C370",
  ground: "#C7A36B",
  ice: "#73D2DE",
  normal: "#C8C4B7",
  poison: "#B07CC6",
  psychic: "#F28482",
  rock: "#D4A373",
  steel: "#9AA5B1",
  water: "#4D96FF",
};

export function getPokemonTypeColor(type: string) {
  return pokemonTypeColors[type] ?? "#F2C078";
}
