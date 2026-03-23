import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

function formatPokemonName(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return "Pokemon";
  }

  return rawValue.charAt(0).toUpperCase() + rawValue.slice(1);
}

export default function PokemonDetailsScreen() {
  const { pokemon } = useLocalSearchParams<{ pokemon?: string | string[] }>();
  const pokemonName = formatPokemonName(pokemon);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: pokemonName }} />

      <Text style={styles.title}>{pokemonName}</Text>
      <Text style={styles.copy}>
        This is a placeholder details screen inside the Pokedex tab stack.
        Later, you can load stats, sprites, abilities, and anything else here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#FFFBEB",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#92400E",
    marginBottom: 12,
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    color: "#B45309",
  },
});
