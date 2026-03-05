# CLAUDE.md

**This is a reusable app template.** When starting a new app:
- Update `app.json` (name, slug, bundleIdentifier, projectId)
- Swap `COLORS`/`FONTS` in `constants/theme.ts`
- Add app-specific fields to `useUserStore` and `useOnboardingStore`
- Add app-specific types to `types/index.ts`
- Replace placeholder content in tab screens and onboarding
- Update `TERMS_URL` and `PRIVACY_URL` in `paywall.tsx` and `landing.tsx`
- Add `.env` with RevenueCat + Supabase keys

**Tech stack:** Check `package.json` for current versions. Core: Expo, Expo Router, React Native, Reanimated, Zustand, Supabase, RevenueCat

**Components — always use:**
- `Button` (primary/glass variants) — never raw TouchableOpacity
- `GlassCard` — for any card/container
- `PressableScale` — for any custom interactive element (scale 0.96, spring animation, haptics built in)
- `ScreenWrapper` — for every screen (handles safe area, scroll, layout background)

**Styling:**
- All colors from `COLORS` in `constants/theme.ts` — never inline hex codes
- All spacing on 8px grid via `SPACING`
- All radii from `RADIUS` — always include `borderCurve: 'continuous'`
- All typography from `TYPE` or `FONTS`

**Animations:**
- Always Reanimated — never the RN Animated API
- Interactive: `withSpring(SPRING_BUTTON)`
- Entrances: `withTiming({ duration: 400, easing: Easing.out(Easing.ease) })`
- All animation constants live in `constants/theme.ts` (`SPRING_CONFIG`, `SPRING_BUTTON`, `TIMING_CONFIG`, `GLASS_BLUR`)
- Haptic feedback on every interaction

**Navigation flow:**
- `index.tsx` — checks onboarding + pro status, routes to onboarding/paywall/tabs
- Landing: `landing.tsx` → `onboarding-flow.tsx` → `paywall.tsx`
- Onboarding: welcome → name → gender → hear-about → rate-us → loading → all-set → paywall
- Post-purchase: `(tabs)` — rename/replace tabs per app

**Tab layout:**
- Template ships with 4 tabs: Home, Progress, Tools, Profile — adjust per app
- Floating pill tab bar with blur + spring animations
- AnimatedBackground at layout level, screens transparent

**Paywall:**
- Full RevenueCat flow (annual + lifetime plans)
- Package loading, purchase, restore built in

**State:**
- `useUserStore` — persisted user data (app-specific fields)
- `useOnboardingStore` — temp onboarding form state
- `useProStatusStore` — RevenueCat subscription status

**Screens:**
- Always use `useSafeAreaInsets()` hook — never `SafeAreaView`
- Handle 3 states: loading, empty, populated
- `headerShown: false` globally — no native headers
- No `autoFocus` on TextInputs
- No `KeyboardAvoidingView` — pin buttons, wrap in `Pressable onPress={Keyboard.dismiss}`

**File/folder conventions:**
- Screens go in `app/` (Expo Router file-based routing)
- Reusable UI components go in `components/ui/`
- App-specific components go in `components/`
- Icons/illustrations go in `components/icons/`
- Zustand stores go in `store/`
- Shared helpers go in `hooks/` or `lib/`
- Types go in `types/`
- Design tokens go in `constants/`

**Background:**
- AnimatedBackground lives at the layout level, not per-screen
- Screens go transparent via `LayoutBackgroundContext`

**Behavior:**
- Fix only the error — don't refactor surrounding code
- Mock data until told otherwise
- Don't add features beyond what's asked
