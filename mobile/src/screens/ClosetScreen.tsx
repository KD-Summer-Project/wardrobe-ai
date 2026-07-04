import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { deleteItem, listItems } from '../api/items';
import ClothingCard from '../components/ClothingCard';
import PlaidDivider from '../components/PlaidDivider';
import { ClosetStackParamList } from '../navigation/types';
import { colors, radii, spacing, typography } from '../theme';
import { ClothingItem } from '../types';

type Props = NativeStackScreenProps<ClosetStackParamList, 'ClosetList'>;

export default function ClosetScreen({ navigation }: Props) {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const data = await listItems();
      setItems(data);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems])
  );

  function handleRefresh() {
    setIsRefreshing(true);
    fetchItems();
  }

  function handleLongPress(item: ClothingItem) {
    Alert.alert('Remove item?', `Take "${item.category}" out of your closet?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setItems((prev) => prev.filter((i) => i.id !== item.id));
          try {
            await deleteItem(item.id);
          } catch {
            Alert.alert('Ugh, as if!', 'Could not remove that item. Try again.');
            fetchItems();
          }
        },
      },
    ]);
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Closet</Text>
        <Pressable style={styles.addButton} onPress={() => navigation.navigate('AddItem')}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>
      <PlaidDivider />

      {loadError && items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Hello?!</Text>
          <Text style={styles.emptySubtitle}>Couldn't load your closet. Check your connection.</Text>
          <Pressable style={styles.retryButton} onPress={fetchItems}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Totally empty closet!</Text>
          <Text style={styles.emptySubtitle}>Snap a photo of your first item to get started.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.grid}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          renderItem={({ item }) => (
            <ClothingCard item={item} onLongPress={() => handleLongPress(item)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 42,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addButtonText: {
    fontWeight: '700',
    color: colors.text,
  },
  grid: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: typography.display,
    fontSize: 32,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  retryButtonText: {
    fontWeight: '700',
    color: colors.text,
  },
});
