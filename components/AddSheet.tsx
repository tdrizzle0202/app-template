import React from "react";
import { View, TouchableOpacity, Text, Modal, StyleSheet, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { Camera, Upload } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from "@/constants/designSystem";
import { TEXT_STYLES } from "@/constants/typography";

export function AddSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const handleTakePhoto = async () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Camera permission is required to take photos.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.8,
                allowsMultipleSelection: false,
                exif: false,
            });

            if (!result.canceled && result.assets[0]) {
                const originalUri = result.assets[0].uri;

                // Resize immediately (max 1600px longest edge, JPEG)
                try {
                    const manipResult = await ImageManipulator.manipulateAsync(
                        originalUri,
                        [{ resize: { width: 1600 } }], // Constrains width, height auto-adjusts
                        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
                    );

                    onClose();
                    router.push(`/preview?imageUri=${encodeURIComponent(manipResult.uri)}`);
                } catch (error) {
                    console.error('Resize failed, using original image:', error);
                    onClose();
                    router.push(`/preview?imageUri=${encodeURIComponent(originalUri)}`);
                }
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    };

    const handleUploadPhoto = async () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        try {
            if (Platform.OS === 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission needed', 'Media library permission is required to upload photos.');
                    return;
                }
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.8,
                allowsMultipleSelection: false,
                exif: false,
            });

            if (!result.canceled && result.assets[0]) {
                const originalUri = result.assets[0].uri;

                // Resize immediately (max 1600px longest edge, JPEG)
                try {
                    const manipResult = await ImageManipulator.manipulateAsync(
                        originalUri,
                        [{ resize: { width: 1600 } }], // Constrains width, height auto-adjusts
                        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
                    );

                    onClose();
                    router.push(`/preview?imageUri=${encodeURIComponent(manipResult.uri)}`);
                } catch (error) {
                    console.error('Resize failed, using original image:', error);
                    onClose();
                    router.push(`/preview?imageUri=${encodeURIComponent(originalUri)}`);
                }
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            Alert.alert('Error', 'Failed to upload photo. Please try again.');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.sheetContainer}
                activeOpacity={1}
                onPress={() => {
                    if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                    onClose();
                }}
            >
                <TouchableOpacity
                    style={styles.sheet}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={styles.optionsGrid}>
                        <TouchableOpacity style={styles.optionBox} onPress={handleTakePhoto}>
                            <Camera color={COLORS.gray900} size={32} />
                            <Text style={styles.optionText}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionBox} onPress={handleUploadPhoto}>
                            <Upload color={COLORS.gray900} size={32} />
                            <Text style={styles.optionText}>Upload Photo</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    sheetContainer: {
        flex: 1,
        justifyContent: "flex-end",
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING['3xl'] + 72,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    sheet: {
        backgroundColor: "transparent",
    },
    optionsGrid: {
        flexDirection: "row",
        gap: SPACING.md,
    },
    optionBox: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: COLORS.black,
        paddingVertical: SPACING.xl,
        paddingHorizontal: SPACING.md,
        alignItems: "center",
        justifyContent: "center",
    },
    optionText: {
        ...TEXT_STYLES.body,
        color: COLORS.black,
        marginTop: SPACING.md,
        textAlign: "center",
    },
});
