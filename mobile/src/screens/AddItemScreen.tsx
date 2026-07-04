import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { uploadItem } from '../api/items';
import { ClosetStackParamList } from '../navigation/types';
import { colors, radii, spacing, typography } from '../theme';
import { ClothingItem } from '../types';

type Props = NativeStackScreenProps<ClosetStackParamList, 'AddItem'>;

export default function AddItemScreen({ navigation }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [tagged, setTagged] = useState<ClothingItem | null>(null);

  async function pickFromCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('No way!', 'Camera access is needed to snap your clothes.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setTagged(null);
    }
  }

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('No way!', 'Photo library access is needed to pick an item.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setTagged(null);
    }
  }

  async function handleUpload() {
    if (!imageUri) return;
    setIsUploading(true);
    try {
      const item = await uploadItem(imageUri);
      setTagged(item);
    } catch {
      Alert.alert('As if!', 'Could not tag that item. Try a clearer photo.');
    } finally {
      setIsUploading(false);
    }
  }

  function handleAddAnother() {
    setImageUri(null);
    setTagged(null);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add an Item</Text>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No photo yet</Text>
        </View>
      )}

      {tagged ? (
        <View style={styles.tagCard}>
          <Text style={styles.tagTitle}>Tagged it!</Text>
          <Text style={styles.tagRow}>Category: {tagged.category}</Text>
          <Text style={styles.tagRow}>Color: {tagged.color}</Text>
          <Text style={styles.tagRow}>Warmth level: {tagged.warmth_level}</Text>
          <Pressable style={styles.button} onPress={handleAddAnother}>
            <Text style={styles.buttonText}>Add Another</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('ClosetList')}>
            <Text style={styles.secondaryButtonText}>Back to Closet</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable style={styles.button} onPress={pickFromCamera}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={pickFromLibrary}>
            <Text style={styles.secondaryButtonText}>Choose from Library</Text>
          </Pressable>
          {imageUri ? (
            <Pressable
              style={[styles.button, isUploading && styles.buttonDisabled]}
              onPress={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.buttonText}>Tag It</Text>
              )}
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 38,
    color: colors.text,
    marginBottom: spacing.md,
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  placeholderText: {
    color: colors.textMuted,
  },
  actions: {
    gap: spacing.md,
  },
  tagCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  tagTitle: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tagRow: {
    fontSize: 15,
    color: colors.text,
    textTransform: 'capitalize',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
