import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function PokedexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokedex</Text>
      <Text style={styles.copy}>
        Tap the button below to test pushing a Pokemon details page inside the
        Pokedex tab stack.
      </Text>

      <Link href="/pokedex/pikachu" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonLabel}>Go To Details Page</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#FFF7ED",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#7F1D1D",
    marginBottom: 12,
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    color: "#991B1B",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
