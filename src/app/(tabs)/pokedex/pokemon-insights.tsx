import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { getPokemonInsights } from "@/src/lib/pokeapi";
import type { PokemonInsight } from "@/src/types/pokemon";
import { pokemonInsightsStyles as styles } from "./pokemon-details.styles";
import { pokemonDetailsTheme } from "./pokemon-details-theme";

function getRawPokemonName(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatName(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function PokemonInsightsModal() {
  const { pokemon } = useLocalSearchParams<{ pokemon?: string | string[] }>();
  const pokemonSlug = getRawPokemonName(pokemon)?.toLowerCase();
  const [insights, setInsights] = useState<PokemonInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPokemonInsights = useCallback(async (slug: string | undefined) => {
    if (!slug) {
      setError("This Pokemon could not be found.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextInsights = await getPokemonInsights(slug);
      setInsights(nextInsights);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while loading Pokemon insights.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPokemonInsights(pokemonSlug);
  }, [loadPokemonInsights, pokemonSlug]);

  const screenTitle = formatName(pokemonSlug ?? "Pokemon");

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <Stack.Screen options={{ title: `${screenTitle} Intel` }} />
        <ActivityIndicator size="large" color={pokemonDetailsTheme.action} />
        <Text style={styles.stateCopy}>Loading battle intel...</Text>
      </View>
    );
  }

  if (error || !insights) {
    return (
      <View style={styles.centeredState}>
        <Stack.Screen options={{ title: `${screenTitle} Intel` }} />
        <Text style={styles.errorTitle}>Could not load insights</Text>
        <Text style={styles.errorCopy}>
          {(error ?? "Something went wrong while loading Pokemon insights.") +
            " Check your connection and try again."}
        </Text>
        <Pressable
          onPress={() => void loadPokemonInsights(pokemonSlug)}
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
      <Stack.Screen options={{ title: `${screenTitle} Intel` }} />

      <View style={styles.headerCard}>
        <View style={styles.headerGlow} />
        <Text style={styles.headerEyebrow}>Field Report</Text>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <Text style={styles.headerCopy}>{insights.genus}</Text>
        <View style={styles.spotlightRow}>
          <View style={styles.spotlightCard}>
            <Text style={styles.spotlightLabel}>Strongest Stat</Text>
            <Text style={styles.spotlightValue}>
              {insights.strongestStat.name}
            </Text>
          </View>
          <View style={styles.spotlightCard}>
            <Text style={styles.spotlightLabel}>Total Power</Text>
            <Text style={styles.spotlightValue}>{insights.totalStats}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pokedex Entry</Text>
        <Text style={styles.sectionCopy}>
          A quick lore snapshot pulled from the species records.
        </Text>
        <Text style={styles.flavorText}>{insights.flavorText}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Fancy Numbers</Text>
        <Text style={styles.sectionCopy}>
          Battle-facing stats and training signals at a glance.
        </Text>
        <View style={styles.splitRow}>
          <View style={styles.splitCard}>
            <Text style={styles.splitLabel}>Strongest Stat Value</Text>
            <Text style={styles.splitValue}>{insights.strongestStat.value}</Text>
          </View>
          <View style={styles.splitCard}>
            <Text style={styles.splitLabel}>Average Stat</Text>
            <Text style={styles.splitValue}>{insights.averageStat}</Text>
          </View>
        </View>
        <View style={styles.accentDivider} />
        <View style={styles.factGrid}>
          <View style={styles.factCard}>
            <Text style={styles.factLabel}>Total Stats</Text>
            <Text style={styles.factValue}>{insights.totalStats}</Text>
          </View>
          <View style={styles.factCard}>
            <Text style={styles.factLabel}>Capture Rate</Text>
            <Text style={styles.factValue}>{insights.captureRate}</Text>
          </View>
          <View style={styles.factCard}>
            <Text style={styles.factLabel}>Base Happiness</Text>
            <Text style={styles.factValue}>{insights.baseHappiness}</Text>
          </View>
          <View style={styles.factCard}>
            <Text style={styles.factLabel}>Growth Rate</Text>
            <Text style={styles.factValue}>{formatName(insights.growthRate)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Wild Profile</Text>
        <Text style={styles.sectionCopy}>
          Biological and environmental traits from species data.
        </Text>
        <View style={styles.factGrid}>
          <View style={styles.factCard}>
            <Text style={styles.factLabel}>Habitat</Text>
            <Text style={styles.factValue}>
              {formatName(insights.habitat ?? "Unknown")}
            </Text>
          </View>
          <View style={styles.factCard}>
            <Text style={styles.factLabel}>Shape</Text>
            <Text style={styles.factValue}>
              {formatName(insights.shape ?? "Unknown")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Egg Groups</Text>
        <Text style={styles.sectionCopy}>
          Breeding classification tags for this Pokemon species.
        </Text>
        <View style={styles.chipRow}>
          {insights.eggGroups.length > 0 ? (
            insights.eggGroups.map((group) => (
              <View key={group} style={styles.chip}>
                <Text style={styles.chipLabel}>{formatName(group)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.flavorText}>No egg group data available.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
