import React, { useState, useEffect, useRef } from "react";
import {
    StyleSheet,
    Text,
    View,
    Animated,
    Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, TYPE } from "@/constants/theme";
import { PressableScale } from "@/components/ui/PressableScale";

// ── Replace with your app's onboarding slides ───────────
const SLIDES = [
    {
        id: 1,
        text: "Step One Headline",
        type: "text",
    },
    {
        id: 2,
        text: "Step Two Headline",
        type: "text",
    },
    {
        id: 3,
        text: "Step Three Headline",
        type: "text",
    },
];

const AnimatedText = ({ text, trigger }: { text: string; trigger: number }) => {
    const [letters, setLetters] = useState<string[]>([]);
    const animations = useRef<Animated.Value[]>([]).current;

    useEffect(() => {
        const chars = text.split("");
        setLetters(chars);

        animations.length = 0;
        chars.forEach(() => {
            animations.push(new Animated.Value(0));
        });

        const timingAnimations = chars.map((_, index) => {
            return Animated.timing(animations[index], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            });
        });

        Animated.stagger(20, timingAnimations).start();
    }, [text, trigger]);

    return (
        <View style={styles.textContainer}>
            {letters.map((letter, index) => (
                <Animated.Text
                    key={index}
                    style={[
                        styles.titleText,
                        {
                            opacity: animations[index],
                            transform: [
                                {
                                    translateY: animations[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [10, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {letter}
                </Animated.Text>
            ))}
        </View>
    );
};

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            router.replace("/paywall");
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            router.back();
        }
    };

    const currentSlide = SLIDES[currentIndex];

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Navigation */}
            <View style={styles.topNav}>
                <PressableScale
                    style={styles.navButton}
                    onPress={handleBack}
                    scaleDown={0.9}
                >
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </PressableScale>

                <View style={styles.dotsContainer}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentIndex ? styles.activeDot : styles.inactiveDot,
                            ]}
                        />
                    ))}
                </View>

                <PressableScale
                    style={styles.navButton}
                    onPress={handleNext}
                    scaleDown={0.9}
                >
                    <Ionicons name="chevron-forward" size={24} color={COLORS.black} />
                </PressableScale>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Image area — add your onboarding images here */}
                <View style={styles.imageContainer}>
                    <Text style={styles.placeholderText}>Slide {currentSlide.id} Image</Text>
                </View>

                <View style={styles.textWrapper}>
                    <AnimatedText text={currentSlide.text} trigger={currentIndex} />
                </View>

                <PressableScale
                    style={styles.nextButton}
                    onPress={handleNext}
                >
                    <Text style={styles.nextButtonText}>Next</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                </PressableScale>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F7",
    },
    topNav: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    dotsContainer: {
        flexDirection: "row",
        gap: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    activeDot: {
        backgroundColor: COLORS.black,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    inactiveDot: {
        backgroundColor: "#D1D1D6",
    },
    content: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
    imageContainer: {
        width: "100%",
        height: "72%",
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: SPACING.xl,
        position: "relative",
        backgroundColor: "#E8E8ED",
        alignItems: "center",
        justifyContent: "center",
    },
    placeholderText: {
        fontSize: 16,
        color: "#999",
    },
    textWrapper: {
        width: "100%",
        alignItems: "center",
        marginBottom: SPACING.xl,
        height: 80,
        justifyContent: "center",
    },
    textContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    titleText: {
        fontSize: 34,
        fontFamily: FONTS.bold,
        color: COLORS.black,
        textAlign: "center",
    },
    nextButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.black,
        paddingHorizontal: SPACING["3xl"],
        paddingVertical: 14,
        borderRadius: 30,
        width: "90%",
        gap: 8,
    },
    nextButtonText: {
        fontSize: 20,
        fontFamily: "Nunito_600SemiBold",
        color: COLORS.white,
    },
});
