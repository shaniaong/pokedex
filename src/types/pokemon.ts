export type PokemonListItem = {
  name: string;
  url: string;
  imageUrl: string;
};

export type PokemonListResponse = {
  results: Pick<PokemonListItem, "name" | "url">[];
};
