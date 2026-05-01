import { Link } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
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
import { getFavoritePokemon } from "@/src/lib/favorites";
import type { FavoritePokemon } from "@/src/types/pokemon";

function formatPokemonName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatTypeLabel(type: string) {
  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function FavoritePokemonCard({ item }: { item: FavoritePokemon }) {
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

          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>{formatPokemonName(item.name)}</Text>
            <Text style={styles.cardNumber}>
              #{String(item.id).padStart(3, "0")}
            </Text>
            <View style={styles.typeRow}>
              {item.types.length > 0 ? (
                item.types.map((type) => (
                  <View key={type} style={styles.typeChip}>
                    <Text style={styles.typeLabel}>{formatTypeLabel(type)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.cardMeta}>Type unknown</Text>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.cardAction}>Open</Text>
      </Pressable>
    </Link>
  );
}

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoritePokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const nextFavorites = await getFavoritePokemon();
      setFavorites(nextFavorites);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while loading favorites.";

      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadFavorites();
    }, [loadFavorites])
  );

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.stateText}>Loading favorites...</Text>
      </View>
    );
  }

  if (error && favorites.length === 0) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.errorTitle}>Could not load favorites</Text>
        <Text style={styles.errorCopy}>{error}</Text>
        <Pressable onPress={() => void loadFavorites()} style={styles.retryButton}>
          <Text style={styles.retryButtonLabel}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.listContent}
      data={favorites}
      keyExtractor={(item) => item.name}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void loadFavorites(true)}
          tintColor="#DC2626"
        />
      }
      renderItem={({ item }) => <FavoritePokemonCard item={item} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
          <Text style={styles.copy}>
            Your saved Pokemon stay on this device, so you can come back to
            them anytime.
          </Text>
          {error ? <Text style={styles.inlineError}>{error}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No favorites yet</Text>
          <Text style={styles.emptyStateCopy}>
            Open any Pokemon and tap Add to Favorites to build your list.
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
    backgroundColor: "#FFFBEB",
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
    backgroundColor: "#FFFBEB",
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
  emptyState: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyStateTitle: {
    fontSize: 22,
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
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  imageWrap: {
    width: 62,
    height: 62,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    overflow: "hidden",
  },
  cardImage: {
    width: 52,
    height: 52,
  },
  imageFallbackLabel: {
    fontSize: 24,
    fontWeight: "800",
    color: "#C2410C",
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#7C2D12",
  },
  cardNumber: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#EA580C",
  },
  typeRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400E",
  },
  cardMeta: {
    fontSize: 13,
    color: "#9A3412",
  },
  cardAction: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
    marginLeft: 12,
  },
});
