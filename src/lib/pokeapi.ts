import type {
  PokemonDetail,
  PokemonDetailsResponse,
  PokemonInsight,
  PokemonListItem,
  PokemonListResponse,
  PokemonSpeciesResponse,
} from "@/src/types/pokemon";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
const POKEMON_SPRITE_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const FALLBACK_POKEMON_IMAGE_URL = `${POKEMON_SPRITE_BASE_URL}/0.png`;

function getPokemonIdFromUrl(url: string) {
  const matches = url.match(/\/pokemon\/(\d+)\/?$/);

  if (!matches) {
    return null;
  }

  return matches[1];
}

function formatStatName(statName: string) {
  return statName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatFlavorText(value: string) {
  return value.replace(/[\f\n\r]+/g, " ").replace(/\s+/g, " ").trim();
}

function formatPokemonImageUrl(
  pokemonId: string | null,
  imageUrl?: string | null
) {
  if (imageUrl) {
    return imageUrl;
  }

  if (pokemonId) {
    return `${POKEMON_SPRITE_BASE_URL}/${pokemonId}.png`;
  }

  return FALLBACK_POKEMON_IMAGE_URL;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
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

    return data.results
      .filter(
        (pokemon) =>
          isNonEmptyString(pokemon?.name) && isNonEmptyString(pokemon?.url)
      )
      .map((pokemon) => {
        const pokemonId = getPokemonIdFromUrl(pokemon.url);

        return {
          ...pokemon,
          imageUrl: formatPokemonImageUrl(pokemonId),
        };
      });
  } catch {
    throw new Error("Unable to load Pokemon right now.");
  }
}

export async function getPokemonDetails(name: string): Promise<PokemonDetail> {
  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${name}`);

    if (!response.ok) {
      throw new Error("Unable to load Pokemon details right now.");
    }

    const data = (await response.json()) as PokemonDetailsResponse;
    const officialArtwork =
      data.sprites.other?.["official-artwork"]?.front_default;
    const pokemonId = typeof data.id === "number" ? String(data.id) : null;
    const stats = Array.isArray(data.stats)
      ? data.stats
          .filter(
            (entry) =>
              typeof entry?.base_stat === "number" &&
              isNonEmptyString(entry?.stat?.name)
          )
          .map(({ base_stat, stat }) => ({
            name: formatStatName(stat.name),
            value: base_stat,
          }))
      : [];
    const abilities = Array.isArray(data.abilities)
      ? data.abilities
          .map(({ ability }) => ability?.name)
          .filter(isNonEmptyString)
      : [];
    const types = Array.isArray(data.types)
      ? data.types.map(({ type }) => type?.name).filter(isNonEmptyString)
      : [];

    return {
      id: typeof data.id === "number" ? data.id : 0,
      name: isNonEmptyString(data.name) ? data.name : name,
      imageUrl: formatPokemonImageUrl(
        pokemonId,
        officialArtwork ?? data.sprites.front_default
      ),
      heightMeters: typeof data.height === "number" ? data.height / 10 : 0,
      weightKilograms: typeof data.weight === "number" ? data.weight / 10 : 0,
      baseExperience:
        typeof data.base_experience === "number" ? data.base_experience : 0,
      abilities,
      stats,
      types,
    };
  } catch {
    throw new Error("Unable to load Pokemon details right now.");
  }
}

export async function getPokemonInsights(name: string): Promise<PokemonInsight> {
  try {
    const pokemonResponse = await fetch(`${POKEAPI_BASE_URL}/pokemon/${name}`);

    if (!pokemonResponse.ok) {
      throw new Error("Unable to load Pokemon insights right now.");
    }

    const pokemonData = (await pokemonResponse.json()) as PokemonDetailsResponse;

    if (!isNonEmptyString(pokemonData.species?.url)) {
      throw new Error("Unable to load Pokemon insights right now.");
    }

    const speciesResponse = await fetch(pokemonData.species.url);

    if (!speciesResponse.ok) {
      throw new Error("Unable to load Pokemon insights right now.");
    }

    const speciesData = (await speciesResponse.json()) as PokemonSpeciesResponse;
    const validStats = Array.isArray(pokemonData.stats)
      ? pokemonData.stats.filter(
          (stat) =>
            typeof stat?.base_stat === "number" &&
            isNonEmptyString(stat?.stat?.name)
        )
      : [];
    const totalStats = validStats.reduce(
      (sum, stat) => sum + stat.base_stat,
      0
    );
    const strongestPokemonStat =
      validStats.length > 0
        ? validStats.reduce((bestStat, stat) =>
            stat.base_stat > bestStat.base_stat ? stat : bestStat
          )
        : null;
    const englishFlavorText =
      speciesData.flavor_text_entries.find(
        (entry) =>
          entry.language.name === "en" && isNonEmptyString(entry.flavor_text)
      )?.flavor_text ?? "No Pokedex entry is available right now.";
    const englishGenus =
      speciesData.genera.find(
        (entry) => entry.language.name === "en" && isNonEmptyString(entry.genus)
      )?.genus ?? "Pokemon";
    const eggGroups = Array.isArray(speciesData.egg_groups)
      ? speciesData.egg_groups
          .map((group) => group?.name)
          .filter(isNonEmptyString)
      : [];

    return {
      flavorText: formatFlavorText(englishFlavorText),
      genus: englishGenus,
      habitat: speciesData.habitat?.name ?? null,
      shape: speciesData.shape?.name ?? null,
      growthRate: speciesData.growth_rate?.name ?? "unknown",
      captureRate:
        typeof speciesData.capture_rate === "number"
          ? speciesData.capture_rate
          : 0,
      baseHappiness:
        typeof speciesData.base_happiness === "number"
          ? speciesData.base_happiness
          : 0,
      eggGroups,
      totalStats,
      averageStat:
        validStats.length > 0 ? Math.round(totalStats / validStats.length) : 0,
      strongestStat: {
        name: strongestPokemonStat
          ? formatStatName(strongestPokemonStat.stat.name)
          : "Unknown",
        value: strongestPokemonStat?.base_stat ?? 0,
      },
    };
  } catch {
    throw new Error("Unable to load Pokemon insights right now.");
  }
}
