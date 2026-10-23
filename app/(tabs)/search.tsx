import { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import cn from "clsx";

import CartButton from "@/components/CartButton";
import Filter from "@/components/Filter";
import MenuCard from "@/components/MenuCard";
import SearchBar from "@/components/SearchBar";
import { getCategories, getMenu } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";

export default function Search() {
  const searchParams = useLocalSearchParams<{
    query?: string;
    category?: string;
  }>();
  const query = typeof searchParams.query === "string" ? searchParams.query : "";
  const category =
    typeof searchParams.category === "string" ? searchParams.category : "";

  const menuParams = useMemo(() => ({ category, query }), [category, query]);
  const { data, loading } = useAppwrite({ fn: getMenu, params: menuParams });
  const { data: categories } = useAppwrite({ fn: getCategories });
  const menuItems = data ?? [];

  return (
    <SafeAreaView className="h-full bg-white">
      <FlatList
        data={menuItems}
        renderItem={({ item, index }) => {
          const isFirstRightColItem = index % 2 === 0;
          return (
            <View
              className={cn(
                "max-w-[48%] flex-1",
                !isFirstRightColItem ? "mt-10" : "mt-0",
              )}
            >
              <MenuCard item={item} />
            </View>
          );
        }}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        columnWrapperClassName="gap-7"
        contentContainerClassName="gap-7 px-5 pb-32"
        ListHeaderComponent={
          <View className="my-5 gap-5">
            <View className="w-full flex-row items-center justify-between">
              <View>
                <Text className="small-bold uppercase text-primary">Search</Text>
                <Text className="mt-0.5 paragraph-semibold text-dark-100">
                  Find your favorite food
                </Text>
              </View>
              <CartButton />
            </View>
            <SearchBar />
            <Filter categories={categories ?? []} />
          </View>
        }
        ListEmptyComponent={
          !loading ? <Text className="px-5 text-gray-500">No results found.</Text> : null
        }
      />
    </SafeAreaView>
  );
}
