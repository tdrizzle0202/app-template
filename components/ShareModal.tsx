
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { FONTS, TYPE, COLORS, SHADOWS } from '@/constants/theme';
import { getPhotoUrl } from '@/lib/photoStorage';
import { HEIGHT_GROUPS } from '@/lib/heightGroups';
import { formatHeight } from '@/lib/unitPreference';

type ShareModalProps = {
  visible: boolean;
  onClose: () => void;
  name: string;
  heightCm: number;
  photoUri: string | null;
  photoUrl?: string | null;
  unit: 'ft' | 'cm';
  demoImageSource?: number; // For bundled demo images
};

export const ShareModal = ({ visible, onClose, name, heightCm, photoUri, photoUrl: passedPhotoUrl, unit, demoImageSource }: ShareModalProps) => {
  const viewShotRef = useRef<ViewShot>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(passedPhotoUrl || null);
  const [photoLoading, setPhotoLoading] = useState(false);

  const heightGroup = HEIGHT_GROUPS.find(group => heightCm >= group.minCm && heightCm <= group.maxCm);

  useEffect(() => {
    // If photoUrl is already passed, use it immediately
    if (passedPhotoUrl) {
      setPhotoUrl(passedPhotoUrl);
      setPhotoLoading(false);
      return;
    }

    // Otherwise, fetch it from photoUri
    if (photoUri && visible) {
      setPhotoLoading(true);
      getPhotoUrl(photoUri)
        .then(setPhotoUrl)
        .catch((error) => {
          console.error('Failed to get photo URL:', error);
          setPhotoUrl(null);
        })
        .finally(() => setPhotoLoading(false));
    }
  }, [photoUri, passedPhotoUrl, visible]);




  const displayName = name && name.trim() !== '' && name !== 'Name'
    ? name
    : 'Name';

  const handleShare = async () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (!viewShotRef.current?.capture) {
        console.error('ViewShot ref not available');
        return;
      }

      console.log('Capturing view...');
      const uri = await viewShotRef.current.capture();
      console.log('Captured URI:', uri);

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `height-result-${displayName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share Height Result',
          });
        }
      }

      // Close modal after sharing
      onClose();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };



  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            onClose();
          }} style={styles.closeButton}>
            <X color="#000000" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share Result</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.previewContainer}>
            <View style={styles.cardWrapper}>
              <ViewShot
                ref={viewShotRef}
                options={{
                  format: 'png',
                  quality: 1.0,
                  result: 'tmpfile',
                }}
                style={styles.shareCard}
              >
                <View style={styles.card}>
                  {demoImageSource ? (
                    <Image
                      source={demoImageSource}
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
                      <Text style={styles.placeholderText}>Photo</Text>
                    </View>
                  )}

                  <View style={styles.topLeft}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryText}>
                        {heightGroup?.emoji} {heightGroup?.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.topRight}>
                    <Text style={styles.watermark}>HeightSnap</Text>
                  </View>

                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                        {displayName}
                      </Text>
                      <View style={styles.heightContainer}>
                        <Text style={styles.heightText}>
                          {formatHeight(heightCm, unit)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ViewShot>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomButton}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.black,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    fontSize: 22,
    color: COLORS.black,
  },
  spacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  previewContainer: {
    flex: 1,
  },
  cardWrapper: {
    flex: 1,
    borderRadius: 0,
    overflow: 'hidden',
  },
  shareCard: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  card: {
    flex: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    color: '#999999',
    fontWeight: '500',
    fontFamily: FONTS.medium,
  },
  topLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  categoryPill: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.black,
    // Shadow for better visibility
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  topRight: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  watermark: {
    fontSize: 16,
    fontFamily: FONTS.extrabold,
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  infoCard: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  nameText: {
    flex: 1,
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  heightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  heightLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#666666',
    marginBottom: 2,
    textAlign: 'right',
  },
  heightText: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  bottomButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 24,
    backgroundColor: COLORS.white,
    borderTopWidth: 2,
    borderTopColor: COLORS.black,
  },
  shareButton: {
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.black,
    alignItems: 'center',
  },
  shareButtonText: {
    ...TEXT_STYLES.h3,
    fontSize: 18,
    color: COLORS.white,
  },
});