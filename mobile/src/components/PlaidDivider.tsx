import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

const STRIPE_COLORS = [colors.primary, colors.accent, colors.text, colors.primary, colors.accent];

export default function PlaidDivider() {
  return (
    <View style={styles.row}>
      {STRIPE_COLORS.map((color, index) => (
        <View key={index} style={[styles.stripe, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    height: 5,
    width: '100%',
  },
  stripe: {
    flex: 1,
  },
});
