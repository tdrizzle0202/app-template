import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert, Platform, InteractionManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { TEXT_STYLES } from "@/constants/typography";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "@/constants/designSystem";
import { uploadPhoto } from "@/lib/photoStorage";
import { insertPlaceholder } from "@/lib/heightStore";
import { callHeightEstimation } from "@/lib/heightEstimation";
import { showWaitingAd } from "@/lib/admobAds";
import { getCachedProStatus, useProStatusStore } from "@/lib/proStatusStore";

export default function PreviewScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const decodedImageUri = imageUri ? decodeURIComponent(imageUri) : null;
  const [isProcessing, setIsProcessing] = useState(false);
  const hasPro = useProStatusStore((state) => state.hasPro);

  const handleAdd = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (imageUri) {
      router.push(`/info-chat?imageUri=${imageUri}`);
    } else {
      router.push('/info-chat');
    }
  };

  const handleDone = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (!decodedImageUri) {
      router.push('/(tabs)/home');
      return;
    }

    try {
      setIsProcessing(true);

      // 1) Upload & placeholder first
      console.log('Uploading photo:', decodedImageUri);
      const photoPath = await uploadPhoto(decodedImageUri);
      console.log('Photo uploaded to:', photoPath);

      const resultId = await insertPlaceholder({
        name: 'Name',
        photoUri: photoPath,
      });
      console.log('Created result with ID:', resultId);

      // 2) Start Gemini (do not await)
      const estimationPromise = callHeightEstimation(resultId, photoPath, '').catch((error) => {
        console.error('Height estimation failed:', error);
      });

      // 3) Navigate home immediately
      router.push('/(tabs)/home');

      // 4) Wait ~500ms before showing ad (guarantees UI finished rendering)
      setTimeout(async () => {
        try {
          await showWaitingAd(hasPro);
        } catch {
          // Ignore ad issues; flow continues
        }
      }, 500);
    } catch (error) {
      console.error('Failed to process image:', error);
      if (Platform.OS === 'web') {
        console.error('Processing failed. Please try again.');
      } else {
        Alert.alert(
          'Processing Failed',
          'There was an error processing your photo. Please try again.',
          [{ text: 'OK' }]
        );
      }
      router.push('/(tabs)/home');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          router.back();
        }}>
          <ArrowLeft color="#000000" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.photoContainer}>
          {decodedImageUri ? (
            <Image
              source={{ uri: decodedImageUri }}
              style={styles.photo}
              contentFit="contain"
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoText}>Photo Preview</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>Add Info</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.doneButton, isProcessing && styles.doneButtonDisabled]}
            onPress={handleDone}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.doneButtonText}>Done</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DDD9E6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 0,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    fontSize: 28,
    color: COLORS.black,
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  photoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING['2xl'],
  },
  photo: {
    width: "100%",
    aspectRatio: 3/4,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  photoPlaceholder: {
    width: "100%",
    aspectRatio: 3/4,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
  },
  photoText: {
    ...TEXT_STYLES.h3,
    color: COLORS.black,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  addButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    paddingVertical: SPACING.md,
    borderRadius: 24,
    alignItems: "center",
  },
  addButtonText: {
    ...TEXT_STYLES.h3,
    color: COLORS.black,
  },
  doneButton: {
    flex: 1,
    backgroundColor: COLORS.black,
    paddingVertical: SPACING.md,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.black,
    alignItems: "center",
  },
  doneButtonText: {
    ...TEXT_STYLES.h3,
    color: COLORS.white,
  },
  doneButtonDisabled: {
    opacity: 0.6,
  },
});