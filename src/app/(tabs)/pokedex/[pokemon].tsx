import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  type DimensionValue,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  isFavoritePokemon,
  toggleFavoritePokemon,
} from "@/src/lib/favorites";
import { getPokemonDetails } from "@/src/lib/pokeapi";
import type { PokemonDetail } from "@/src/types/pokemon";
import { pokemonDetailsStyles as styles } from "./pokemon-details.styles";
import {
  getPokemonTypeColor,
  pokemonDetailsTheme,
} from "./pokemon-details-theme";

function getRawPokemonName(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatPokemonName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function PokemonDetailsScreen() {
  const { pokemon } = useLocalSearchParams<{ pokemon?: string | string[] }>();
  const pokemonSlug = getRawPokemonName(pokemon)?.toLowerCase();
  const [details, setDetails] = useState<PokemonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasArtworkError, setHasArtworkError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  const loadPokemonDetails = useCallback(async (slug: string | undefined) => {
    if (!slug) {
      setError("This Pokemon could not be found.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasArtworkError(false);

    try {
      const nextDetails = await getPokemonDetails(slug);
      setDetails(nextDetails);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while loading Pokemon details.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncFavoriteStatus = useCallback(async (name: string | undefined) => {
    if (!name) {
      setIsFavorite(false);
      return;
    }

    const favoriteStatus = await isFavoritePokemon(name);
    setIsFavorite(favoriteStatus);
  }, []);

  async function handleFavoritePress() {
    if (!details || isFavoriteLoading) {
      return;
    }

    setIsFavoriteLoading(true);

    try {
      const nextFavoriteStatus = await toggleFavoritePokemon(details);
      setIsFavorite(nextFavoriteStatus);
    } finally {
      setIsFavoriteLoading(false);
    }
  }

  useEffect(() => {
    void loadPokemonDetails(pokemonSlug);
  }, [loadPokemonDetails, pokemonSlug]);

  useFocusEffect(
    useCallback(() => {
      void syncFavoriteStatus(pokemonSlug);
    }, [pokemonSlug, syncFavoriteStatus])
  );

  const screenTitle = details
    ? formatPokemonName(details.name)
    : formatPokemonName(pokemonSlug ?? "pokemon");

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <Stack.Screen options={{ title: screenTitle }} />
        <ActivityIndicator size="large" color={pokemonDetailsTheme.action} />
        <Text style={styles.stateCopy}>Loading Pokemon details...</Text>
      </View>
    );
  }

  if (error || !details) {
    return (
      <View style={styles.centeredState}>
        <Stack.Screen options={{ title: screenTitle }} />
        <Text style={styles.errorTitle}>Could not load Pokemon</Text>
        <Text style={styles.errorCopy}>
          {(error ?? "Something went wrong while loading Pokemon details.") +
            " Check your connection and try again."}
        </Text>
        <Pressable
          onPress={() => void loadPokemonDetails(pokemonSlug)}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonLabel}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: screenTitle }} />

      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.pokemonNumber}>
              #{String(details.id).padStart(3, "0")}
            </Text>
            <Text style={styles.pokemonName}>
              {formatPokemonName(details.name)}
            </Text>
            <Pressable
              onPress={() => void handleFavoritePress()}
              style={[
                styles.favoriteButton,
                isFavorite ? styles.favoriteButtonActive : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Text style={styles.favoriteButtonLabel}>
                {isFavoriteLoading
                  ? "..."
                  : isFavorite
                    ? "♥"
                    : "♡"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.typeRow}>
            {details.types.length > 0 ? (
              details.types.map((type) => (
                <View
                  key={type}
                  style={[
                    styles.typeBadge,
                    { backgroundColor: getPokemonTypeColor(type) },
                  ]}
                >
                  <Text style={styles.typeBadgeLabel}>{formatLabel(type)}</Text>
                </View>
              ))
            ) : (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeLabel}>Unknown</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.artworkWrap}>
          <View style={styles.artworkGlow} />
          {hasArtworkError ? (
            <View style={[styles.artwork, styles.artworkFallback]}>
              <Text style={styles.artworkFallbackLabel}>
                {formatPokemonName(details.name).slice(0, 1)}
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: details.imageUrl }}
              style={styles.artwork}
              onError={() => setHasArtworkError(true)}
            />
          )}
        </View>
      </View>

      <Link
        href={{
          pathname: "/pokedex/pokemon-insights",
          params: { pokemon: details.name },
        }}
        asChild
      >
        <Pressable style={styles.modalTrigger}>
          <Text style={styles.modalTriggerEyebrow}>Deep Dive</Text>
          <Text style={styles.modalTriggerTitle}>Open Pokemon Intel</Text>
          <Text style={styles.modalTriggerCopy}>
            View a fancy stat sheet with habitat, growth rate, capture data,
            strongest stat, and a Pokedex flavor entry.
          </Text>
          <Text style={styles.modalTriggerAction}>View detailed stats</Text>
        </Pressable>
      </Link>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Height</Text>
          <Text style={styles.metricValue}>{details.heightMeters} m</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Weight</Text>
          <Text style={styles.metricValue}>{details.weightKilograms} kg</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Base XP</Text>
          <Text style={styles.metricValue}>{details.baseExperience}</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Abilities</Text>
        <View style={styles.abilityRow}>
          {details.abilities.length > 0 ? (
            details.abilities.map((ability) => (
              <View key={ability} style={styles.abilityChip}>
                <Text style={styles.abilityLabel}>{formatLabel(ability)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.helperCopy}>No ability data available.</Text>
          )}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Base Stats</Text>
        <View style={styles.statsList}>
          {details.stats.length > 0 ? (
            details.stats.map((stat) => {
              const barWidth = `${(Math.min(stat.value, 160) / 160) * 100}%` as DimensionValue;

              return (
                <View key={stat.name} style={styles.statRow}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statLabel}>{stat.name}</Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                  </View>
                  <View style={styles.statTrack}>
                    <View style={[styles.statFill, { width: barWidth }]} />
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.helperCopy}>No stat data available.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
