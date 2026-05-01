import { Stack } from "expo-router";

const headerOptions = {
  headerStyle: {
    backgroundColor: "#DC2626",
  },
  headerTintColor: "#FFFFFF",
  headerTitleStyle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
};

export default function PokedexStackLayout() {
  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen name="index" options={{ title: "Pokedex" }} />
      <Stack.Screen name="[pokemon]" options={{ title: "Pokemon Details" }} />
      <Stack.Screen
        name="pokemon-insights"
        options={{
          title: "Pokemon Intel",
          presentation: "formSheet",
        }}
      />
    </Stack>
  );
}
