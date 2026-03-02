// constants/conventions.ts
// Project conventions — reference guide, not runtime code.
//
// COMPONENTS
// - Never use raw TouchableOpacity — always use Button or GlassCard components.
// - Every button/card press uses withSpring scale (0.96 → 1.0).
//
// STYLING
// - Never use inline hex colors — everything from constants/theme.ts (COLORS).
// - All spacing on 8px grid (SPACING: 8, 16, 24, 32, 40).
// - borderCurve: 'continuous' on all cards and buttons (BORDER_CURVE).
//
// ANIMATIONS
// - All animations use Reanimated. Never use the built-in Animated API.
// - Interactive animations (press, toggle, tap): withSpring (SPRING_CONFIG / SPRING_BUTTON).
// - Entrance animations and number counting: withTiming (TIMING_CONFIG).
// - Every number animates to its value (withTiming, 1.2s, easeOut), never appears instantly.
//
// HAPTICS
// - Haptic feedback on EVERY interaction (HAPTICS config in designSystem.ts).
//
// KEYBOARD
// - Never use autoFocus on TextInputs — keyboard only appears when user taps the field.
// - Never use KeyboardAvoidingView — buttons/content stay pinned, never ride up with keyboard.
// - Wrap screens with text inputs in <Pressable onPress={Keyboard.dismiss}> to dismiss on outside tap.
//
// SAFE AREA
// - Never use SafeAreaView on lazy-loaded screens — it applies insets async, causing a 1-frame "push up" jump.
// - Always use useSafeAreaInsets() hook + regular View with padding — insets are synchronous on first render.
// - If tabs use lazy: true, always pair with the hook, not SafeAreaView.
// - No FadeIn entering animations on lazy-loaded tab screens — Reanimated flickers on mount.
//
// NAVIGATION
// - headerShown: false globally in root _layout.tsx — no screen should ever show a native header.
// - Stack transitions use native iOS slide (Expo Router default — don't override).
// - Swipe-back gesture enabled on all stack screens.
// - Native iOS bounce/overscroll on all scrollable screens.
// - Pull-to-refresh uses native iOS RefreshControl.
//
// SCREEN STATES
// - Every screen handles three states: loading, empty, populated.
//
// DATA
// - Use mock data for everything until explicitly told to connect real data.
//
// ERROR FIXING
// - When fixing a pasted error, fix ONLY the error. Don't touch anything else.
