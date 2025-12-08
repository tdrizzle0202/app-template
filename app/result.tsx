import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Modal, Platform, ActivityIndicator, KeyboardAvoidingView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { ArrowLeft, ThumbsUp, ThumbsDown, Share, MoreHorizontal, Edit3 } from "lucide-react-native";
import { getById, updateName, deleteResult } from "@/lib/heightStore";
import { getPhotoUrl } from "@/lib/photoStorage";
import { getUnitPreference, formatHeight as formatHeightUtil, UnitType } from "@/lib/unitPreference";
import { ShareModal } from "@/components/ShareModal";
import { TEXT_STYLES } from "@/constants/typography";
import { isDemoItem, DEMO_RESULTS, DEMO_IMAGES } from "@/lib/demoData";

type HeightDataItem = {
  id: string;
  name: string;
  photoUri: string | null;
  heightCm: number | null;
  explanation: string | null;
  method: string | null;
  date: string;
};

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [title, setTitle] = useState("Name");
  const [isEditingName, setIsEditingName] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<HeightDataItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [unit, setUnit] = useState<UnitType>("ft");
  const [nameChanged, setNameChanged] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  // Load unit preference on mount
  useEffect(() => {
    const loadUnitPreference = async () => {
      const savedUnit = await getUnitPreference();
      setUnit(savedUnit);
    };
    loadUnitPreference();
  }, []);

  // When unmounting (navigating away), if name changed, set refresh param
  useEffect(() => {
    return () => {
      if (nameChanged) {
        router.setParams({ refresh: 'true' });
      }
    };
  }, [nameChanged]);

  useEffect(() => {
    const loadItem = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Check if this is a demo item
        if (isDemoItem(id)) {
          setIsDemo(true);
          const demoItem = DEMO_RESULTS.find(item => item.id === id);
          if (demoItem) {
            setCurrentItem(demoItem);
            setTitle(demoItem.name);
            // Demo items use bundled images, no need to load URL
          }
          setLoading(false);
          return;
        }

        // Regular item - load from database
        setIsDemo(false);
        const item = await getById(id);
        setCurrentItem(item);
        if (item) {
          setTitle(item.name);

          // Load photo if available
          if (item.photoUri) {
            setPhotoLoading(true);
            try {
              const url = await getPhotoUrl(item.photoUri);
              setPhotoUrl(url);
            } catch (error) {
              console.error('Failed to get photo URL:', error);
              setPhotoUrl(null);
            } finally {
              setPhotoLoading(false);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load item:', error);
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id]);

  const height = currentItem && currentItem.heightCm ? formatHeightUtil(currentItem.heightCm, unit) : (unit === "cm" ? "180 cm" : "5′11″");
  
  const explanation = currentItem?.explanation || "Based on visual analysis of body proportions and reference objects in the image, our AI model estimates this person's height with high confidence. The analysis considers factors such as head-to-body ratio, limb proportions, and environmental context clues to provide an accurate measurement.";
  const shortAnalysis = explanation.length > 100 ? explanation.substring(0, 100) + "..." : explanation;
  const fullAnalysis = explanation;

  const handleShare = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowShareModal(true);
  };

  const handleFeedback = (type: "up" | "down") => {
    if (!type || type.trim() === "") return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setFeedback(type);
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      await deleteResult(id);
      setShowMenu(false);
      // Navigate back to home with refresh parameter to immediately update the list
      router.replace('/(tabs)/home?refresh=true');
    } catch (error) {
      console.error('Failed to delete result:', error);
    }
  };

  const MenuModal = () => (
    <Modal
      visible={showMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowMenu(false)}
    >
      <TouchableOpacity 
        style={styles.menuOverlay} 
        activeOpacity={1} 
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          setShowMenu(false);
        }}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
            <Text style={styles.menuItemText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          router.back();
        }}>
          <ArrowLeft color="#000000" size={24} />
        </TouchableOpacity>
        <View style={styles.titleContainer} />
        {!isDemo ? (
          <TouchableOpacity onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            setShowMenu(true);
          }} style={styles.menuButton}>
            <MoreHorizontal color="#000000" size={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.menuButton} />
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 160 }}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            <View style={styles.photoContainer}>
              {isDemo && id && DEMO_IMAGES[id] ? (
                <Image
                  source={DEMO_IMAGES[id]}
                  style={styles.photo}
                  contentFit="cover"
                  transition={0}
                />
              ) : photoLoading ? (
                <View style={styles.photoPlaceholder}>
                  <ActivityIndicator size="large" color="#666666" />
                </View>
              ) : photoUrl ? (
                <Image
                  source={{ uri: photoUrl }}
                  style={styles.photo}
                  contentFit="cover"
                  transition={0}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoText}>Result Photo</Text>
                </View>
              )}
            </View>
        
        <View style={styles.resultContainer}>
          <View style={styles.heightSection}>
            <View style={styles.nameInfo}>
              {isDemo ? (
                // Demo items - name not editable
                <View style={styles.nameContainer}>
                  <Text style={styles.nameLabel}>{title}</Text>
                </View>
              ) : isEditingName ? (
                <TextInput
                  style={styles.nameInput}
                  value={title}
                  onChangeText={setTitle}
                  onBlur={async () => {
                    setIsEditingName(false);
                    if (id && title.trim() !== "") {
                      await updateName(id, title.trim());
                      setNameChanged(true);
                    }
                  }}
                  onSubmitEditing={async () => {
                    setIsEditingName(false);
                    if (id && title.trim() !== "") {
                      await updateName(id, title.trim());
                      setNameChanged(true);
                    }
                  }}
                  autoFocus
                  selectTextOnFocus
                />
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                    setIsEditingName(true);
                  }}
                  style={styles.nameContainer}
                >
                  <Text style={styles.nameLabel}>{title}</Text>
                  {title === "Name" && <Edit3 color="#666666" size={20} />}
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.heightInfo}>
              <Text style={styles.heightLabel}>Barefoot Height</Text>
              <Text style={styles.heightValue}>{height}</Text>
            </View>
          </View>
          
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Analysis</Text>
            <Text style={styles.analysisText}>
              {showFullAnalysis ? fullAnalysis : shortAnalysis}
            </Text>
            <TouchableOpacity onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              setShowFullAnalysis(!showFullAnalysis);
            }}>
              <Text style={styles.readMoreText}>
                {showFullAnalysis ? "Show less" : "Read more"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Was this helpful?</Text>
            <View style={styles.feedbackButtons}>
              <TouchableOpacity
                style={[styles.feedbackButton, feedback === "up" && styles.feedbackButtonActive]}
                onPress={() => handleFeedback("up")}
              >
                <ThumbsUp color={feedback === "up" ? "#ffffff" : "#666666"} size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.feedbackButton, feedback === "down" && styles.feedbackButtonActive]}
                onPress={() => handleFeedback("down")}
              >
                <ThumbsDown color={feedback === "down" ? "#ffffff" : "#666666"} size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
          </>
        )}
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={[
          styles.shareButtonWrapper,
          { paddingBottom: Math.max(insets.bottom, 8) },
        ]}
      >
        <View style={styles.shareButtonContainer}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share color="#ffffff" size={20} />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      <MenuModal />

      {currentItem && currentItem.heightCm && (
        <ShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          name={currentItem.name}
          heightCm={currentItem.heightCm}
          photoUri={currentItem.photoUri}
          unit={unit}
          demoImageSource={isDemo && id ? DEMO_IMAGES[id] : undefined}
        />
      )}
    </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    fontSize: 24,
    color: "#000000",
  },
  titleInput: {
    ...TEXT_STYLES.h1,
    fontSize: 24,
    color: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingVertical: 2,
    minWidth: 80,
  },
  editButton: {
    padding: 4,
  },
  titleTouchable: {
    // No additional styling needed, just makes the title touchable
  },
  spacer: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  photoContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  photo: {
    width: "100%",
    aspectRatio: 3/4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#000000",
  },
  photoPlaceholder: {
    width: "100%",
    aspectRatio: 3/4,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  photoText: {
    ...TEXT_STYLES.h3,
    color: "#000000",
  },
  resultContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#000000",
  },
  heightSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  nameInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nameLabel: {
    fontSize: 36,
    fontFamily: TEXT_STYLES.h0.fontFamily,
    color: "#000000",
  },
  nameInput: {
    fontSize: 36,
    fontFamily: TEXT_STYLES.h0.fontFamily,
    color: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingVertical: 2,
  },
  heightInfo: {
    alignItems: "flex-end",
  },
  heightLabel: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    color: "#666666",
    marginBottom: 2,
  },
  heightValue: {
    fontSize: 32,
    color: "#000000",
    fontFamily: TEXT_STYLES.h0.fontFamily,
  },
  analysisSection: {
    marginBottom: 32,
  },
  analysisTitle: {
    ...TEXT_STYLES.h3,
    color: "#000000",
    marginBottom: 12,
  },
  analysisText: {
    ...TEXT_STYLES.body,
    color: "#666666",
    lineHeight: 24,
    marginBottom: 8,
  },
  readMoreText: {
    ...TEXT_STYLES.body,
    color: "#000000",
  },
  feedbackSection: {
    alignItems: "center",
  },
  feedbackTitle: {
    ...TEXT_STYLES.body,
    color: "#666666",
    marginBottom: 16,
  },
  feedbackButtons: {
    flexDirection: "row",
    gap: 16,
  },
  feedbackButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  feedbackButtonActive: {
    backgroundColor: "#000000",
  },
  shareButtonContainer: {
    paddingHorizontal: 24,
    paddingTop: 0,
  },
  shareButton: {
    backgroundColor: "#000000",
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#000000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  shareButtonText: {
    ...TEXT_STYLES.h3,
    color: "#ffffff",
  },
  shareButtonWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuButton: {
    padding: 4,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 24,
  },
  menuContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 120,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    ...TEXT_STYLES.body,
    color: "#ff3b30",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: "#666666",
  },
});
