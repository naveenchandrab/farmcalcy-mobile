import React, { useCallback, useState } from 'react';
import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import type { Asset } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { AUTH_COLORS, AUTH_FONT } from '@features/auth/components/authTokens';
import { showError } from '@utils/toast';

import { uploadService } from '../services/upload.service';

interface AadhaarTileProps {
  label: string;
  testID: string;
  value?: string;
  onChange: (ref: string | undefined) => void;
}

const PICK_OPTIONS = { mediaType: 'photo', quality: 0.7, maxWidth: 1600, maxHeight: 1600 } as const;

const AadhaarTile: React.FC<AadhaarTileProps> = ({ label, testID, value, onChange }) => {
  const [busy, setBusy] = useState(false);

  const upload = useCallback(
    async (asset: Asset | undefined) => {
      if (!asset?.uri) {
        return;
      }
      setBusy(true);
      try {
        const ref = await uploadService.uploadAadhaar({
          uri: asset.uri,
          type: asset.type,
          fileName: asset.fileName,
        });
        onChange(ref);
      } catch {
        showError('Could not upload the image. Please try again.');
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  const pick = useCallback(() => {
    Alert.alert(label, 'Add the Aadhaar image', [
      {
        text: 'Take Photo',
        onPress: () => {
          void launchCamera(PICK_OPTIONS).then(r => upload(r.assets?.[0]));
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: () => {
          void launchImageLibrary(PICK_OPTIONS).then(r => upload(r.assets?.[0]));
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [label, upload]);

  const uploaded = Boolean(value);

  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.8}
      onPress={pick}
      disabled={busy}
      style={[styles.tile, uploaded && styles.tileDone]}
    >
      {busy ? (
        <ActivityIndicator color={AUTH_COLORS.primary} />
      ) : (
        <>
          <Icon
            name={uploaded ? 'check-circle' : 'camera-plus-outline'}
            size={26}
            color={uploaded ? AUTH_COLORS.primary : AUTH_COLORS.placeholder}
          />
          <Text style={[styles.tileLabel, uploaded && styles.tileLabelDone]}>
            {uploaded ? 'Uploaded' : label}
          </Text>
          {uploaded && (
            <Text
              style={styles.replace}
              onPress={e => {
                e.stopPropagation();
                onChange(undefined);
              }}
            >
              Remove
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

interface AadhaarUploadProps<T extends FieldValues> {
  control: Control<T>;
  frontName: Path<T>;
  backName: Path<T>;
}

/**
 * Optional owner Aadhaar photo upload — front + back. Each tile picks an image
 * (camera or gallery), uploads it to /uploads/aadhaar and stores the returned
 * server reference on the form field.
 */
function AadhaarUpload<T extends FieldValues>({
  control,
  frontName,
  backName,
}: AadhaarUploadProps<T>): React.ReactElement {
  return (
    <View style={styles.row}>
      <View style={styles.col}>
        <Controller
          control={control}
          name={frontName}
          render={({ field: { value, onChange } }) => (
            <AadhaarTile
              testID="aadhaar-front"
              label="Front side"
              value={typeof value === 'string' ? value : undefined}
              onChange={onChange}
            />
          )}
        />
      </View>
      <View style={styles.col}>
        <Controller
          control={control}
          name={backName}
          render={({ field: { value, onChange } }) => (
            <AadhaarTile
              testID="aadhaar-back"
              label="Back side"
              value={typeof value === 'string' ? value : undefined}
              onChange={onChange}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  tile: {
    height: 96,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: AUTH_COLORS.inputBorder,
    backgroundColor: AUTH_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  tileDone: {
    borderStyle: 'solid',
    borderColor: AUTH_COLORS.primary,
    backgroundColor: '#F1F8E9',
  },
  tileLabel: {
    fontSize: 13,
    fontFamily: AUTH_FONT.medium,
    color: AUTH_COLORS.textSecondary,
    textAlign: 'center',
  },
  tileLabelDone: { color: AUTH_COLORS.primary },
  replace: { fontSize: 12, fontFamily: AUTH_FONT.regular, color: AUTH_COLORS.error, marginTop: 2 },
});

export default AadhaarUpload;
