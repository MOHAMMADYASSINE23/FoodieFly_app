import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useCartStore } from "@/store/cart.store";

const money = (amount: number) => `$${amount.toFixed(2)}`;

export default function Cart() {
  const {
    items,
    removeItem,
    increaseQty,
    decreaseQty,
    clearCart,
    getTotalPrice,
  } = useCartStore();

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <View className="mb-6 mt-5 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-dark-100">Your cart</Text>
        {items.length > 0 && (
          <Pressable onPress={clearCart} accessibilityRole="button">
            <Text className="font-semibold text-primary">Clear cart</Text>
          </Pressable>
        )}
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-lg font-semibold text-dark-100">Your cart is empty</Text>
          <Text className="text-center text-gray-500">Browse the menu and add something delicious.</Text>
          <Pressable
            className="rounded-full bg-primary px-6 py-3"
            onPress={() => router.push("/search")}
            accessibilityRole="button"
          >
            <Text className="font-bold text-white">Explore menu</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-1">
          <View className="gap-4">
            {items.map((item) => {
              const customizations = item.customizations ?? [];
              return (
                <View key={`${item.id}-${customizations.map((option) => option.id).join("-")}`} className="flex-row items-center gap-3 rounded-2xl border border-gray-100 p-3">
                  <Image source={{ uri: item.image_url }} className="size-20 rounded-xl" resizeMode="contain" />
                  <View className="flex-1 gap-1">
                    <Text className="font-semibold text-dark-100">{item.name}</Text>
                    <Text className="text-sm text-gray-500">{money(item.price)} each</Text>
                    <View className="mt-1 flex-row items-center gap-3">
                      <Pressable onPress={() => decreaseQty(item.id, customizations)} accessibilityRole="button" accessibilityLabel={`Decrease ${item.name} quantity`}>
                        <Text className="px-2 text-lg font-bold">−</Text>
                      </Pressable>
                      <Text>{item.quantity}</Text>
                      <Pressable onPress={() => increaseQty(item.id, customizations)} accessibilityRole="button" accessibilityLabel={`Increase ${item.name} quantity`}>
                        <Text className="px-2 text-lg font-bold">+</Text>
                      </Pressable>
                    </View>
                  </View>
                  <View className="items-end gap-2">
                    <Text className="font-bold text-dark-100">{money((item.price + customizations.reduce((sum, option) => sum + option.price, 0)) * item.quantity)}</Text>
                    <Pressable onPress={() => removeItem(item.id, customizations)} accessibilityRole="button" accessibilityLabel={`Remove ${item.name}`}>
                      <Text className="text-sm text-red-600">Remove</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>

          <View className="mt-auto gap-3 border-t border-gray-100 py-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-dark-100">Subtotal</Text>
              <Text className="text-xl font-bold text-dark-100">{money(getTotalPrice())}</Text>
            </View>
            <Text className="text-sm text-gray-500">Checkout and payment are not connected in this mobile demo yet.</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
