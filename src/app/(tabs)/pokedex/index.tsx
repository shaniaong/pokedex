import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getPokemonList } from "@/src/lib/pokeapi";
import type { PokemonListItem } from "@/src/types/pokemon";

const LOCAL_POKEMON_LIMIT = 150;
const SEARCH_DEBOUNCE_MS = 250;

function formatPokemonName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatLoadError(message: string) {
  return `${message} Check your connection and pull to refresh.`;
}

function PokemonListCard({
  item,
  index,
}: {
  item: PokemonListItem;
  index: number;
}) {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <Link
      href={{
        pathname: "/pokedex/[pokemon]",
        params: { pokemon: item.name },
      }}
      asChild
    >
      <Pressable style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.imageWrap}>
            {hasImageError ? (
              <Text style={styles.imageFallbackLabel}>
                {formatPokemonName(item.name).slice(0, 1)}
              </Text>
            ) : (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                onError={() => setHasImageError(true)}
              />
            )}
          </View>

          <View>
            <Text style={styles.cardNumber}>
              #{String(index + 1).padStart(3, "0")}
            </Text>
            <Text style={styles.cardTitle}>{formatPokemonName(item.name)}</Text>
          </View>
        </View>

        <Text style={styles.cardAction}>Details</Text>
      </Pressable>
    </Link>
  );
}

export default function PokedexScreen() {
  const [pokemon, setPokemon] = useState<PokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const normalizedSearchQuery = debouncedSearchQuery.trim().toLowerCase();
  const filteredPokemon =
    normalizedSearchQuery.length > 0
      ? pokemon.filter((item) =>
          item.name.toLowerCase().includes(normalizedSearchQuery)
        )
      : pokemon;

  async function loadPokemon(isPullToRefresh = false) {
    if (isPullToRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const pokemonList = await getPokemonList(LOCAL_POKEMON_LIMIT, 0);
      setPokemon(pokemonList);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while loading Pokemon.";

      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadPokemon();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.stateText}>Loading Pokemon...</Text>
      </View>
    );
  }

  if (error && pokemon.length === 0) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.errorTitle}>Could not load Pokedex</Text>
        <Text style={styles.errorCopy}>{formatLoadError(error)}</Text>

        <Pressable onPress={() => void loadPokemon()} style={styles.retryButton}>
          <Text style={styles.retryButtonLabel}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.listContent}
      data={filteredPokemon}
      keyExtractor={(item) => item.name}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void loadPokemon(true)}
          tintColor="#DC2626"
        />
      }
      keyboardShouldPersistTaps="handled"
      renderItem={({ item, index }) => <PokemonListCard item={item} index={index} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Pokedex</Text>
          <Text style={styles.copy}>
            Browse and locally search the first 150 Pokemon from PokeAPI, then
            tap any Pokemon to view its details.
          </Text>

          <View style={styles.searchWrap}>
            <Text style={styles.searchLabel}>Search Pokemon</Text>
            <View style={styles.searchInputRow}>
              <Text style={styles.searchIcon}>/</Text>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Try Pikachu, Eevee, Mew..."
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                style={styles.searchInput}
              />
            </View>
            <Text style={styles.searchMeta}>
              {filteredPokemon.length} of {pokemon.length} Pokemon shown
            </Text>
          </View>

          {error ? (
            <View style={styles.inlineErrorWrap}>
              <Text style={styles.inlineError}>{formatLoadError(error)}</Text>
              <Pressable
                onPress={() => void loadPokemon(true)}
                style={styles.inlineRetryButton}
              >
                <Text style={styles.inlineRetryLabel}>Refresh Now</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Pokemon matched</Text>
          <Text style={styles.emptyStateCopy}>
            Try a different name or clear the search to browse all 150 Pokemon.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  centeredState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#FFF7ED",
  },
  stateText: {
    marginTop: 12,
    fontSize: 16,
    color: "#991B1B",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#991B1B",
    marginBottom: 8,
  },
  errorCopy: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    color: "#B91C1C",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryButtonLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    backgroundColor: "#FFF7ED",
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#7F1D1D",
    marginBottom: 8,
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
    color: "#991B1B",
  },
  searchWrap: {
    marginTop: 16,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FED7AA",
    shadowColor: "#EA580C",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  searchLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#C2410C",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  searchInputRow: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F59E0B",
    backgroundColor: "#FFFBF5",
    paddingHorizontal: 12,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchIcon: {
    fontSize: 18,
    fontWeight: "800",
    color: "#EA580C",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#7C2D12",
    paddingVertical: 12,
  },
  searchMeta: {
    marginTop: 12,
    fontSize: 12,
    color: "#9A3412",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  inlineErrorWrap: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FFEDD5",
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  inlineError: {
    fontSize: 14,
    lineHeight: 20,
    color: "#B91C1C",
  },
  inlineRetryButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#DC2626",
  },
  inlineRetryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#7F1D1D",
    marginBottom: 8,
  },
  emptyStateCopy: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#991B1B",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  imageWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    overflow: "hidden",
  },
  cardImage: {
    width: 48,
    height: 48,
  },
  imageFallbackLabel: {
    fontSize: 22,
    fontWeight: "800",
    color: "#C2410C",
  },
  cardNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EA580C",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#7C2D12",
  },
  cardAction: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
    marginLeft: 12,
  },
});
