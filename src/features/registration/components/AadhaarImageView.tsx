import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { appConfig } from '@config/env';
import { TokenService } from '@services/TokenService';

const GREEN = '#1E8038';
const MUTED = '#7A7A7A';

interface AadhaarImageViewProps {
  label: string;
  /** Stored reference, e.g. "aadhaar/<uuid>.jpg". */
  fileRef: string;
}

/**
 * Renders an uploaded Aadhaar image for a reviewer. The stream endpoint
 * (GET /uploads/aadhaar/:id) is restricted to SAAS_ADMIN / TENANT_ADMIN, so the
 * request carries the bearer token via the Image `headers` source option.
 */
const AadhaarImageView: React.FC<AadhaarImageViewProps> = ({ label, fileRef }) => {
  const [token, setToken] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    void TokenService.getAccessToken().then(t => {
      if (active) {
        setToken(t);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const fileId = fileRef.split('/').pop() ?? fileRef;
  const uri = `${appConfig.BASE_URL}/uploads/aadhaar/${fileId}`;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.frame}>
        {failed ? (
          <Text style={styles.error}>Unable to load image</Text>
        ) : token ? (
          <Image
            source={{ uri, headers: { Authorization: `Bearer ${token}` } }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <ActivityIndicator color={GREEN} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  label: { fontSize: 12, color: MUTED, marginBottom: 6 },
  frame: {
    height: 120,
    borderRadius: 10,
    backgroundColor: '#F1F5F1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  error: { fontSize: 12, color: MUTED },
});

export default AadhaarImageView;
