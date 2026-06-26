# ─── React Native ─────────────────────────────────────────────────────────────
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# ─── Hermes ───────────────────────────────────────────────────────────────────
-keep class com.facebook.hermes.unicode.** { *; }

# ─── react-native-keychain ────────────────────────────────────────────────────
-keep class com.oblador.keychain.** { *; }

# ─── react-native-config ──────────────────────────────────────────────────────
-keep class com.lugg.ReactNativeConfig.** { *; }

# ─── react-native-vector-icons ────────────────────────────────────────────────
-keep class com.oblador.vectoricons.** { *; }

# ─── General ──────────────────────────────────────────────────────────────────
# Keep JS-facing annotations so React Native reflection works post-shrink.
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
