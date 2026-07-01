/**
 * Minimal geolocation wrapper for capturing a farm's GPS coordinates.
 *
 * It uses the standard `navigator.geolocation` API, which is provided by
 * `@react-native-community/geolocation` (or the platform on web). The module is
 * accessed defensively so the app builds and runs even when no geolocation
 * provider is linked — in that case the farm-owner form falls back to manual
 * latitude/longitude entry.
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface GeoPosition {
  coords: { latitude: number; longitude: number };
}

interface GeolocationLike {
  getCurrentPosition: (
    success: (position: GeoPosition) => void,
    error: (err: { message?: string }) => void,
    options?: { enableHighAccuracy?: boolean; timeout?: number; maximumAge?: number },
  ) => void;
}

const getGeolocation = (): GeolocationLike | undefined => {
  const nav = (globalThis as { navigator?: { geolocation?: GeolocationLike } }).navigator;
  return nav?.geolocation;
};

/** True when a geolocation provider is available on this device/build. */
export const isLocationAvailable = (): boolean => Boolean(getGeolocation());

/**
 * Resolves the device's current coordinates. Rejects when no provider is linked
 * or the user denies permission / a timeout occurs.
 */
export const getCurrentCoordinates = (): Promise<Coordinates> =>
  new Promise<Coordinates>((resolve, reject) => {
    const geo = getGeolocation();
    if (!geo) {
      reject(new Error('Location services are not available. Enter coordinates manually.'));
      return;
    }
    geo.getCurrentPosition(
      position =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      err => reject(new Error(err.message ?? 'Unable to fetch your location.')),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 10_000 },
    );
  });
