import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getOutfitSuggestion } from '../api/outfits';
import ClothingCard from '../components/ClothingCard';
import PlaidDivider from '../components/PlaidDivider';
import { colors, radii, spacing, typography } from '../theme';
import { OutfitSuggestion } from '../types';

const SLOTS: { key: keyof Pick<OutfitSuggestion, 'top' | 'bottom' | 'dress' | 'shoes' | 'outerwear'>; label: string }[] = [
  { key: 'dress', label: 'Dress' },
  { key: 'top', label: 'Top' },
  { key: 'bottom', label: 'Bottom' },
  { key: 'outerwear', label: 'Outerwear' },
  { key: 'shoes', label: 'Shoes' },
];

type ScreenState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; suggestion: OutfitSuggestion };

export default function OutfitOfTheDayScreen() {
  const [state, setState] = useState<ScreenState>({ status: 'loading' });

  const fetchSuggestion = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setState({ status: 'error', message: 'Location access is needed to check the weather.' });
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const suggestion = await getOutfitSuggestion(
        position.coords.latitude,
        position.coords.longitude
      );
      setState({ status: 'ready', suggestion });
    } catch {
      setState({ status: 'error', message: "Couldn't put together an outfit right now. Try again." });
    }
  }, []);

  useEffect(() => {
    fetchSuggestion();
  }, [fetchSuggestion]);

  if (state.status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Checking the vibe outside...</Text>
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Ugh, as if!</Text>
        <Text style={styles.errorMessage}>{state.message}</Text>
        <Pressable style={styles.button} onPress={fetchSuggestion}>
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  const { suggestion } = state;
  const picks = SLOTS.map((slot) => ({ ...slot, item: suggestion[slot.key] })).filter(
    (slot) => slot.item
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Outfit of the Day</Text>
      <PlaidDivider />
      <View style={{ height: spacing.md }} />
      <View style={styles.weatherCard}>
        <Text style={styles.weatherTemp}>{Math.round(suggestion.weather.temp_c)}°C</Text>
        <Text style={styles.weatherDescription}>
          {suggestion.weather.description}
          {suggestion.weather.city_name ? ` in ${suggestion.weather.city_name}` : ''}
        </Text>
      </View>

      {picks.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Nothing to work with!</Text>
          <Text style={styles.errorMessage}>Add some clothes to your closet first.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {picks.map((slot) => (
            <View key={slot.key} style={styles.slot}>
              <Text style={styles.slotLabel}>{slot.label}</Text>
              <ClothingCard item={slot.item!} />
            </View>
          ))}
        </View>
      )}

      {suggestion.missing_slots.length > 0 ? (
        <Text style={styles.missing}>
          Missing from your closet: {suggestion.missing_slots.join(', ')}
        </Text>
      ) : null}

      <Pressable style={styles.button} onPress={fetchSuggestion}>
        <Text style={styles.buttonText}>Shuffle</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 42,
    color: colors.text,
    marginBottom: spacing.md,
  },
  weatherCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  weatherTemp: {
    fontFamily: typography.display,
    fontSize: 56,
    color: colors.text,
  },
  weatherDescription: {
    fontSize: 14,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  slot: {
    width: '50%',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  slotLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  missing: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  errorTitle: {
    fontFamily: typography.display,
    fontSize: 32,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
  },
});
