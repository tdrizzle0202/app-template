import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { COLORS, SPACING, FONTS } from "@/constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PrePaywallScreen() {
    const handleContinue = () => {
        if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        router.push("/paywall");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>
                        Try <Text style={styles.highlightText}>HeightSnap</Text> for <Text style={styles.highlightText}>FREE</Text>
                    </Text>
                </View>

                <View style={styles.phoneContainer}>
                    <View style={styles.phoneFrame}>
                        <Image
                            source={require("../assets/onboarding/paywall_preview.jpg")}
                            style={styles.screenshot}
                            contentFit="cover"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#C5B5E8", // Purple from paywall
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: SPACING.xl,
        paddingHorizontal: SPACING.lg,
    },
    headerContainer: {
        marginTop: SPACING.xl,
        alignItems: "center",
        zIndex: 10, // Ensure text is above if there's any overlap (though layout should prevent it)
    },
    headerText: {
        fontSize: 32, // Slightly larger for better impact with shorter text
        fontFamily: "Nunito_700Bold",
        color: COLORS.white,
        textAlign: "center",
        lineHeight: 40,
    },
    highlightText: {
        color: "#FFD700", // Gold/Yellow color
        fontFamily: "Nunito_800ExtraBold",
    },
    phoneContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        marginVertical: SPACING.md, // Reduced margin
    },
    phoneFrame: {
        width: SCREEN_WIDTH * 0.55, // Reduced from 0.7
        aspectRatio: 9 / 19.5,
        backgroundColor: "#000",
        borderRadius: 30, // Adjusted for smaller size
        borderWidth: 6, // Adjusted for smaller size
        borderColor: "#333",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    screenshot: {
        width: "100%",
        height: "100%",
    },
    continueButton: {
        backgroundColor: COLORS.white,
        width: "100%",
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: SPACING.lg,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    continueButtonText: {
        fontSize: 20,
        fontFamily: "Nunito_700Bold",
        color: COLORS.black,
    },
});
