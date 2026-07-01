import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

import { AUTH_COLORS, AUTH_FONT } from '@features/auth/components/authTokens';
import { showError } from '@utils/toast';

import { getCurrentCoordinates } from '../services/location';

interface LocationMapPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (latitude: number, longitude: number) => void;
}

/** Geographic centre of India — the default view before a pin is dropped. */
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629, zoom: 5 };

/**
 * Draggable-pin location picker. Renders an OpenStreetMap (Leaflet) map inside a
 * WebView — no API key required — and reports the chosen coordinates back to the
 * form. The user drags the pin or taps the map; a "current location" button
 * recentres on the device GPS.
 */
const LocationMapPicker: React.FC<LocationMapPickerProps> = ({ latitude, longitude, onChange }) => {
  // Bumping the key remounts the WebView so it recentres on a new position.
  const [mapKey, setMapKey] = useState(0);
  const [locating, setLocating] = useState(false);

  const center = useMemo(
    () =>
      typeof latitude === 'number' && typeof longitude === 'number'
        ? { lat: latitude, lng: longitude, zoom: 15 }
        : DEFAULT_CENTER,
    [latitude, longitude],
  );

  const hasPin = typeof latitude === 'number' && typeof longitude === 'number';

  const html = useMemo(
    () => `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{height:100%;margin:0;padding:0}</style>
</head><body><div id="map"></div><script>
  var hasPin = ${hasPin ? 'true' : 'false'};
  var map = L.map('map').setView([${center.lat}, ${center.lng}], ${center.zoom});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© OpenStreetMap'
  }).addTo(map);
  var marker = hasPin ? L.marker([${center.lat}, ${center.lng}], { draggable: true }).addTo(map) : null;
  function post(ll){ if(window.ReactNativeWebView){ window.ReactNativeWebView.postMessage(JSON.stringify({lat:ll.lat,lng:ll.lng})); } }
  function place(ll){ if(!marker){ marker = L.marker(ll,{draggable:true}).addTo(map); marker.on('dragend', function(){ post(marker.getLatLng()); }); } else { marker.setLatLng(ll); } post(ll); }
  if(marker){ marker.on('dragend', function(){ post(marker.getLatLng()); }); }
  map.on('click', function(e){ place(e.latlng); });
</script></body></html>`,
    [center, hasPin],
  );

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const { lat, lng } = JSON.parse(event.nativeEvent.data) as { lat: number; lng: number };
        if (typeof lat === 'number' && typeof lng === 'number') {
          onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
        }
      } catch {
        // Ignore malformed messages.
      }
    },
    [onChange],
  );

  const captureCurrentLocation = useCallback(async () => {
    setLocating(true);
    try {
      const coords = await getCurrentCoordinates();
      onChange(Number(coords.latitude.toFixed(6)), Number(coords.longitude.toFixed(6)));
      setMapKey(k => k + 1);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Unable to fetch your location.');
    } finally {
      setLocating(false);
    }
  }, [onChange]);

  return (
    <View>
      <View style={styles.mapWrap}>
        <WebView
          key={mapKey}
          testID="farm-location-map"
          originWhitelist={['*']}
          source={{ html }}
          onMessage={onMessage}
          style={styles.map}
          scrollEnabled={false}
          nestedScrollEnabled
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          testID="map-use-current-location"
          activeOpacity={0.8}
          onPress={() => void captureCurrentLocation()}
          disabled={locating}
          style={styles.locationButton}
        >
          <Icon name="crosshairs-gps" size={18} color={AUTH_COLORS.primary} />
          <Text style={styles.locationButtonText}>
            {locating ? 'Getting location…' : 'Use my current location'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.coords}>
          {hasPin ? `${latitude}, ${longitude}` : 'Tap the map or drag the pin'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrap: {
    height: 240,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AUTH_COLORS.inputBorder,
  },
  map: { flex: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12,
  },
  locationButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationButtonText: { fontSize: 14, fontFamily: AUTH_FONT.semibold, color: AUTH_COLORS.primary },
  coords: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textSecondary,
  },
});

export default LocationMapPicker;
