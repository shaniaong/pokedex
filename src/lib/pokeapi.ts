import type { PokemonListItem, PokemonListResponse } from "@/src/types/pokemon";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
const POKEMON_SPRITE_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

function getPokemonIdFromUrl(url: string) {
  const matches = url.match(/\/pokemon\/(\d+)\/?$/);

  if (!matches) {
    return null;
  }

  return matches[1];
}

export async function getPokemonList(
  limit = 30,
  offset = 0
): Promise<PokemonListItem[]> {
  try {
    const response = await fetch(
      `${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error("Unable to load Pokemon right now.");
    }

    const data = (await response.json()) as PokemonListResponse;

    if (!Array.isArray(data.results)) {
      throw new Error("Unable to load Pokemon right now.");
    }

    return data.results.map((pokemon) => {
      const pokemonId = getPokemonIdFromUrl(pokemon.url);

      return {
        ...pokemon,
        imageUrl: pokemonId
          ? `${POKEMON_SPRITE_BASE_URL}/${pokemonId}.png`
          : `${POKEMON_SPRITE_BASE_URL}/0.png`,
      };
    });
  } catch {
    throw new Error("Unable to load Pokemon right now.");
  }
}