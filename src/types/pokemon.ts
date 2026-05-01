export type PokemonListItem = {
  name: string;
  url: string;
  imageUrl: string;
};

export type PokemonListResponse = {
  results: Pick<PokemonListItem, "name" | "url">[];
};

export type PokemonDetailsResponse = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  abilities: {
    ability: {
      name: string;
    };
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
  types: {
    type: {
      name: string;
    };
  }[];
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
      };
    };
  };
  species: {
    name: string;
    url: string;
  };
};

export type PokemonSpeciesResponse = {
  base_happiness: number;
  capture_rate: number;
  egg_groups: {
    name: string;
  }[];
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
    version: {
      name: string;
    };
  }[];
  genera: {
    genus: string;
    language: {
      name: string;
    };
  }[];
  growth_rate: {
    name: string;
  };
  habitat: {
    name: string;
  } | null;
  shape: {
    name: string;
  } | null;
};

export type PokemonDetail = {
  id: number;
  name: string;
  imageUrl: string;
  heightMeters: number;
  weightKilograms: number;
  baseExperience: number;
  abilities: string[];
  stats: {
    name: string;
    value: number;
  }[];
  types: string[];
};

export type PokemonInsight = {
  flavorText: string;
  genus: string;
  habitat: string | null;
  shape: string | null;
  growthRate: string;
  captureRate: number;
  baseHappiness: number;
  eggGroups: string[];
  totalStats: number;
  averageStat: number;
  strongestStat: {
    name: string;
    value: number;
  };
};

export type FavoritePokemon = {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
  addedAt: string;
};
