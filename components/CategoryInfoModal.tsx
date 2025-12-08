import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/designSystem';
import { TEXT_STYLES } from '@/constants/typography';
import { HeightGroup } from '@/lib/heightGroups';

interface CategoryInfoModalProps {
    visible: boolean;
    onClose: () => void;
    category: HeightGroup | null;
}

export const CategoryInfoModal = ({ visible, onClose, category }: CategoryInfoModalProps) => {
    if (!category) return null;

    const handleClose = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />

                <View style={styles.modalContainer}>
                    <View style={styles.content}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <X size={20} color={COLORS.gray600} />
                        </TouchableOpacity>

                        <View style={styles.header}>
                            <Text style={styles.emoji}>{category.emoji}</Text>
                            <Text style={styles.title}>{category.label}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.body}>
                            <Text style={styles.subtitleLabel}>Height Range</Text>
                            <Text style={styles.subtitle}>{category.subtitle}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        width: '80%',
        maxWidth: 320,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS['2xl'],
        ...SHADOWS.lg,
        overflow: 'hidden',
    },
    content: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: SPACING.md,
        right: SPACING.md,
        padding: SPACING.xs,
        zIndex: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    emoji: {
        fontSize: 48,
        marginBottom: SPACING.sm,
    },
    title: {
        ...TEXT_STYLES.h2,
        color: COLORS.black,
        textAlign: 'center',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: COLORS.gray200,
        marginBottom: SPACING.lg,
    },
    body: {
        alignItems: 'center',
        gap: SPACING.xs,
    },
    subtitleLabel: {
        ...TEXT_STYLES.small,
        color: COLORS.gray500,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    subtitle: {
        ...TEXT_STYLES.h1,
        fontSize: 24,
        color: COLORS.black,
        textAlign: 'center',
    },
});
