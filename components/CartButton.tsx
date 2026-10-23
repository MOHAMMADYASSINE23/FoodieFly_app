import { router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { images } from "@/constants";
import { useCartStore } from "@/store/cart.store";

export default function CartButton() {
  const count = useCartStore((state) => state.getTotalItems());

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open cart, ${count} items`}
      className="flex-row items-center gap-2 rounded-full bg-amber-50 px-4 py-3"
      onPress={() => router.push("/cart")}
    >
      <Image source={images.bag} className="size-5" resizeMode="contain" />
      <View className="min-w-5 items-center rounded-full bg-primary px-1">
        <Text className="text-xs font-bold text-white">{count}</Text>
      </View>
    </Pressable>
  );
}
