import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FavoritePokemon, PokemonDetail } from "@/src/types/pokemon";

const FAVORITES_STORAGE_KEY = "pokedex.favorite-pokemon";

function sortFavorites(favorites: FavoritePokemon[]) {
  return [...favorites].sort((left, right) =>
    right.addedAt.localeCompare(left.addedAt)
  );
}

function isFavoritePokemonShape(value: unknown): value is FavoritePokemon {
  if (!value || typeof value !== "object") {
    return false;
  }

  const favorite = value as FavoritePokemon;

  return (
    typeof favorite.id === "number" &&
    typeof favorite.name === "string" &&
    typeof favorite.imageUrl === "string" &&
    Array.isArray(favorite.types) &&
    typeof favorite.addedAt === "string"
  );
}

async function readFavorites() {
  const rawValue = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return sortFavorites(parsedValue.filter(isFavoritePokemonShape));
  } catch {
    return [];
  }
}

async function writeFavorites(favorites: FavoritePokemon[]) {
  await AsyncStorage.setItem(
    FAVORITES_STORAGE_KEY,
    JSON.stringify(sortFavorites(favorites))
  );
}

export async function getFavoritePokemon() {
  return readFavorites();
}

export async function isFavoritePokemon(name: string) {
  const favorites = await readFavorites();

  return favorites.some((favorite) => favorite.name === name);
}

export async function addFavoritePokemon(pokemon: PokemonDetail) {
  const favorites = await readFavorites();

  if (favorites.some((favorite) => favorite.name === pokemon.name)) {
    return favorites;
  }

  const nextFavorite: FavoritePokemon = {
    id: pokemon.id,
    name: pokemon.name,
    imageUrl: pokemon.imageUrl,
    types: pokemon.types,
    addedAt: new Date().toISOString(),
  };
  const nextFavorites = sortFavorites([...favorites, nextFavorite]);

  await writeFavorites(nextFavorites);
  return nextFavorites;
}

export async function removeFavoritePokemon(name: string) {
  const favorites = await readFavorites();
  const nextFavorites = favorites.filter((favorite) => favorite.name !== name);

  await writeFavorites(nextFavorites);
  return nextFavorites;
}

export async function toggleFavoritePokemon(pokemon: PokemonDetail) {
  const favoriteExists = await isFavoritePokemon(pokemon.name);

  if (favoriteExists) {
    await removeFavoritePokemon(pokemon.name);
    return false;
  }

  await addFavoritePokemon(pokemon);
  return true;
}
