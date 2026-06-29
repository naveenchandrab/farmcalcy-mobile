# Android Emulator Commands on macOS

This guide covers how to:

- List available Android Virtual Devices (AVDs)
- Start an emulator
- View connected devices
- Configure Android SDK environment variables
- Create command shortcuts (aliases)
- Troubleshoot the `emulator: command not found` error

---

## Prerequisites

Ensure Android Studio is installed.

Default Android SDK location on macOS:

```text
~/Library/Android/sdk
```

---

# List Available Android Virtual Devices (AVDs)

```bash
emulator -list-avds
```

Example output:

```text
Pixel_9_API_36
Pixel_8_API_35
Medium_Phone_API_34
```

If `emulator` is not available in your PATH:

```bash
~/Library/Android/sdk/emulator/emulator -list-avds
```

---



# Start an Emulator

```bash
emulator -avd Pixel_9_API_36
```

Using the full path:

```bash
~/Library/Android/sdk/emulator/emulator -avd Pixel_9_API_36
```

---



# View Connected Devices

```bash
adb devices
```

Example:

```text
List of devices attached
emulator-5554    device
```

---



# List Installed SDK Packages

```bash
sdkmanager --list
```

---



# Configure Android SDK PATH

Open your shell configuration:

```bash
nano ~/.zshrc
```

Add the following:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

Reload your shell:

```bash
source ~/.zshrc
```

Verify:

```bash
which emulator
which adb
```

---



# Create Useful Aliases

Edit your `.zshrc`:

```bash
nano ~/.zshrc
```

Add:

```bash
alias emu='emulator -list-avds'
alias pixel='emulator -avd Pixel_9_API_36'
alias adbdevices='adb devices'
```

Reload:

```bash
source ~/.zshrc
```

Usage:

```bash
emu
pixel
adbdevices
```

---



# Create a Generic Emulator Function

Instead of creating an alias for each emulator, add this function:

```bash
avd() {
    emulator -avd "$1"
}
```

Reload:

```bash
source ~/.zshrc
```

Usage:

```bash
avd Pixel_9_API_36
```

---



# Troubleshooting: `zsh: command not found: emulator`



## Step 1: Check if the Emulator Exists

```bash
ls ~/Library/Android/sdk/emulator
```

Expected output:

```text
emulator
lib64
qemu-system-x86_64
...
```

If the folder doesn't exist, the Android Emulator is not installed.

---



## Step 2: Check SDK Environment Variables

```bash
echo $ANDROID_HOME
```

```bash
echo $ANDROID_SDK_ROOT
```

If both are empty, locate the emulator manually:

```bash
find ~ -name emulator -type f 2>/dev/null
```

---



## Step 3: Test Using the Full Path

```bash
~/Library/Android/sdk/emulator/emulator -list-avds
```

If this works, your PATH is not configured correctly.

---



## Step 4: Add the Emulator to PATH

Edit:

```bash
nano ~/.zshrc
```

Add:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Reload:

```bash
source ~/.zshrc
```

Verify:

```bash
which emulator
which adb

emulator -list-avds
adb devices
```

---



## Step 5: Install the Android Emulator (if Missing)

Open Android Studio.

Navigate to:

```text
Android Studio
    → Settings / Preferences
        → Languages & Frameworks
            → Android SDK
                → SDK Tools
```

Ensure **Android Emulator** is installed.

Click **Apply** if installation is required.

---



# Troubleshooting: "Running multiple emulators with the same AVD"

You try to start an emulator and see:

```text
ERROR | Running multiple emulators with the same AVD
ERROR | is an experimental feature.
ERROR | Please use -read-only flag to enable this feature.
```

This almost always means a **previous emulator session crashed or was not shut
down cleanly**, leaving behind stale lock files. The emulator sees those locks
and assumes another instance of the same AVD is already running — even when it
isn't.

## Step 1: Confirm nothing is actually running

```bash
adb devices
pgrep -fl qemu-system
```

If `adb devices` shows an empty list and there is no `qemu-system` process, the
locks are stale and safe to remove. (If a device *is* listed, do not delete
locks — kill it instead: `adb -s emulator-5554 emu kill`.)

## Step 2: Remove the stale lock files

Replace `Pixel_9_API_35` with your AVD name:

```bash
rm -f ~/.android/avd/Pixel_9_API_35.avd/hardware-qemu.ini.lock \
      ~/.android/avd/Pixel_9_API_35.avd/multiinstance.lock \
      ~/.android/avd/Pixel_9_API_35.avd/*.lock
```

## Step 3: Relaunch normally

```bash
emulator -avd Pixel_9_API_35
```

## Note: the `-read-only` workaround

The `-read-only` flag the error suggests is only for intentionally running a
**second** instance of the same AVD at once:

```bash
emulator -avd Pixel_9_API_35 -read-only
```

For a normal single launch, clear the stale locks (Step 2) instead of using
`-read-only`.

---



# Diagnostic Commands

If you're still facing issues, run the following commands:

```bash
echo $ANDROID_HOME
echo $ANDROID_SDK_ROOT

which emulator
which adb

ls ~/Library/Android/sdk
ls ~/Library/Android/sdk/emulator
```

These outputs will help identify the root cause quickly.

---

