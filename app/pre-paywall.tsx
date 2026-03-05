import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PressableScale } from "@/components/ui/PressableScale";
import { COLORS, SPACING } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PrePaywallScreen() {
    const handleContinue = () => {
        router.push("/paywall");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>
                        Try <Text style={styles.highlightText}>Pro</Text> for <Text style={styles.highlightText}>FREE</Text>
                    </Text>
                </View>

                <View style={styles.phoneContainer}>
                    {/* Add your app screenshot here */}
                    <View style={styles.phoneFrame}>
                        <View style={styles.screenshotPlaceholder}>
                            <Text style={styles.placeholderText}>App Screenshot</Text>
                        </View>
                    </View>
                </View>

                <PressableScale
                    style={styles.continueButton}
                    onPress={handleContinue}
                    haptic="Medium"
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </PressableScale>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#C5B5E8",
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
    },
    headerText: {
        fontSize: 32,
        fontFamily: "Nunito_700Bold",
        color: COLORS.white,
        textAlign: "center",
        lineHeight: 40,
    },
    highlightText: {
        color: "#FFD700",
        fontFamily: "Nunito_800ExtraBold",
    },
    phoneContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        marginVertical: SPACING.md,
    },
    phoneFrame: {
        width: SCREEN_WIDTH * 0.55,
        aspectRatio: 9 / 19.5,
        backgroundColor: "#000",
        borderRadius: 30,
        borderWidth: 6,
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
    screenshotPlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a2e",
    },
    placeholderText: {
        color: "#666",
        fontSize: 14,
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
