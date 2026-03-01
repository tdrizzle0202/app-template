import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, ActivityIndicator, Alert, KeyboardAvoidingView, InteractionManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ArrowLeft, Send } from "lucide-react-native";
import { TYPE, COLORS, SPACING } from "@/constants/theme";
import { uploadPhoto } from "@/lib/photoStorage";
import { insertPlaceholder } from "@/lib/heightStore";
import { callHeightEstimation } from "@/lib/heightEstimation";
import { getCachedProStatus, useProStatusStore } from "@/lib/proStatusStore";

export default function InfoChatScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const decodedImageUri = imageUri ? decodeURIComponent(imageUri) : null;
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const hasPro = useProStatusStore((state) => state.hasPro);
  
  const suggestions = [
    "Who do you want to measure?",
    "Can you specify any object in the picture?",
    "What shoes are they wearing?",
    "How tall are the other people?",
  ];

  const handleSend = async () => {
    if (!message.trim() || !decodedImageUri) {
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      const estimationPromise = callHeightEstimation(resultId, photoPath, message).catch((error) => {
        console.error('Height estimation failed:', error);
      });

      // 3) Navigate home immediately
      router.push('/(tabs)/home');

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          router.back();
        }}>
          <ArrowLeft color="#000000" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Info</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.suggestionsBox}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  setMessage(suggestion);
                }}
              >
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.textInput}
            placeholder="Add info"
            placeholderTextColor={COLORS.black}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!message.trim() || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#ffffff" size={20} />
            ) : (
              <Send color="#ffffff" size={20} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DDD9E6",
  },
  keyboardView: {
    flex: 1,
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
  },
  contentContainer: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  suggestionsBox: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.black,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  bulletPoint: {
    ...TEXT_STYLES.h3,
    color: COLORS.black,
    marginRight: SPACING.sm,
    fontSize: 20,
  },
  suggestionText: {
    ...TEXT_STYLES.h3,
    fontSize: 16,
    color: COLORS.black,
    flex: 1,
  },
  inputCard: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.black,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  textInput: {
    flex: 1,
    ...TEXT_STYLES.h3,
    color: COLORS.black,
    maxHeight: 100,
    paddingVertical: SPACING.sm,
  },
  sendButton: {
    backgroundColor: COLORS.black,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.black,
  },
});