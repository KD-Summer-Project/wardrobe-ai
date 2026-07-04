import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { resolveImageUrl } from '../api/client';
import { ClothingItem } from '../types';
import { colors, radii, spacing } from '../theme';

interface Props {
  item: ClothingItem;
  onPress?: () => void;
  onLongPress?: () => void;
}

export default function ClothingCard({ item, onPress, onLongPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress} onLongPress={onLongPress}>
      <Image source={{ uri: resolveImageUrl(item.image_url) }} style={styles.image} />
      <Text style={styles.category} numberOfLines={1}>
        {item.category}
      </Text>
      <Text style={styles.color} numberOfLines={1}>
        {item.color}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    paddingBottom: spacing.sm,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.background,
  },
  category: {
    marginTop: spacing.xs,
    marginHorizontal: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  color: {
    marginHorizontal: spacing.sm,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
});
