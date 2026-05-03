import { Link } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getPokemonList } from "@/src/lib/pokeapi";
import type { PokemonListItem } from "@/src/types/pokemon";

const PAGE_SIZE = 30;

function formatPokemonName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export default function PokedexScreen() {
  const [pokemon, setPokemon] = useState<PokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePokemon, setHasMorePokemon] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoadingMoreRef = useRef(false);

  async function loadPokemon(isPullToRefresh = false) {
    if (isPullToRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const pokemonList = await getPokemonList(PAGE_SIZE, 0);
      setPokemon(pokemonList);
      setHasMorePokemon(pokemonList.length === PAGE_SIZE);
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

  async function loadMorePokemon() {
    if (
      isLoading ||
      isRefreshing ||
      isLoadingMore ||
      isLoadingMoreRef.current ||
      !hasMorePokemon
    ) {
      return;
    }

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      const nextPokemon = await getPokemonList(PAGE_SIZE, pokemon.length);

      setPokemon((currentPokemon) => [...currentPokemon, ...nextPokemon]);
      setHasMorePokemon(nextPokemon.length === PAGE_SIZE);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while loading more Pokemon.";

      setError(message);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }

  useEffect(() => {
    loadPokemon();
  }, []);

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
        <Text style={styles.errorCopy}>{error}</Text>

        <Pressable onPress={() => loadPokemon()} style={styles.retryButton}>
          <Text style={styles.retryButtonLabel}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.listContent}
      data={pokemon}
      keyExtractor={(item) => item.name}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => loadPokemon(true)}
          tintColor="#DC2626"
        />
      }
      onEndReached={() => loadMorePokemon()}
      onEndReachedThreshold={0.4}
      renderItem={({ item, index }) => (
        <Link href={`./${item.name}`} asChild>
          <Pressable style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.imageWrap}>
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              </View>

              <View>
                <Text style={styles.cardNumber}>
                  #{String(index + 1).padStart(3, "0")}
                </Text>
                <Text style={styles.cardTitle}>
                  {formatPokemonName(item.name)}
                </Text>
              </View>
            </View>

            <Text style={styles.cardAction}>Details</Text>
          </Pressable>
        </Link>
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Pokedex</Text>
          <Text style={styles.copy}>
            Browse Pokemon from PokeAPI and tap any Pokemon to view its
            details. More load as you scroll.
          </Text>
          {error ? <Text style={styles.inlineError}>{error}</Text> : null}
        </View>
      }
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color="#DC2626" />
            <Text style={styles.footerText}>Loading more Pokemon...</Text>
          </View>
        ) : null
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
  inlineError: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: "#B91C1C",
  },
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 20,
    gap: 10,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
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
  },
  imageWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
  },
  cardImage: {
    width: 48,
    height: 48,
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
  },
});