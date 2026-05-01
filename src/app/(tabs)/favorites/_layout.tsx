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

export default function FavoritesStackLayout() {
  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen name="index" options={{ title: "Favorites" }} />
    </Stack>
  );
}
