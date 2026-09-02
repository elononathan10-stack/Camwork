/**
 * LOCATION UTILITIES
 * Mock utilities for geocoding and location-based matching
 */

import { Location, GeocodeResult } from "@/types/domain";

// Mock Cameroon regions/divisions
const CAMEROON_LOCATIONS: Record<string, string[]> = {
  Littoral: ["Douala", "Edea", "Manfe", "Buea"],
  Centre: ["Yaoundé", "Mbalmayo", "Soa", "Monatele"],
  South: ["Ebolowa", "Kribi", "Djoum"],
  East: ["Bertoua", "Batouri", "Abong-Mbang"],
  North: ["Garoua", "Maroua", "Ngaoundéré"],
  West: ["Bafoussam", "Dschang", "Kumba"],
  "North-West": ["Bamenda", "Kumbo", "Mamfe"],
  "South-West": ["Buea", "Kumba", "Limbé"],
};

/**
 * Mock geocoding - returns coordinates for a location
 * In production, integrate with a real geocoding service (Google Maps, etc.)
 */
export const geocodeLocation = async (
  location: Location,
): Promise<GeocodeResult> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock coordinates (centered around Cameroon)
  const baseLatitude = 3.8667;
  const baseLongitude = 11.5167;

  // Add some variation based on location
  const latVariation = Math.random() * 0.2 - 0.1;
  const longVariation = Math.random() * 0.2 - 0.1;

  return {
    coordinates: {
      latitude: baseLatitude + latVariation,
      longitude: baseLongitude + longVariation,
    },
    address: `${location.town}, ${location.division}, ${location.region}, Cameroon`,
    town: location.town,
    region: location.region,
    division: location.division,
  };
};

/**
 * Get full address string from location components
 */
export const getFullAddress = (location: Location): string => {
  const parts = [
    location.town,
    location.division,
    location.region,
    "Cameroon",
  ].filter(Boolean);
  return parts.join(", ");
};

/**
 * Calculate distance between two locations (mock implementation)
 * Returns distance in kilometers
 */
export const calculateDistance = (
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number },
): number => {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Get suggestions for regions/divisions (for autocomplete)
 */
export const getLocationSuggestions = (input: string): string[] => {
  const lower = input.toLowerCase();
  const suggestions: string[] = [];

  // Check regions
  Object.keys(CAMEROON_LOCATIONS).forEach((region) => {
    if (region.toLowerCase().includes(lower)) {
      suggestions.push(region);
    }
  });

  // Check divisions
  Object.values(CAMEROON_LOCATIONS).forEach((divisions) => {
    divisions.forEach((division) => {
      if (division.toLowerCase().includes(lower)) {
        suggestions.push(division);
      }
    });
  });

  return Array.from(new Set(suggestions)).slice(0, 10);
};

/**
 * Find jobs within a proximity radius
 */
export const findJobsWithinRadius = (
  jobLocations: Array<
    Location & { coordinates?: { latitude: number; longitude: number } }
  >,
  userCoordinates: { latitude: number; longitude: number },
  radiusKm: number = 50,
): typeof jobLocations => {
  return jobLocations.filter((jobLocation) => {
    if (!jobLocation.coordinates) return false;
    const distance = calculateDistance(
      userCoordinates,
      jobLocation.coordinates,
    );
    return distance <= radiusKm;
  });
};

/**
 * Get mock user's current location
 * In production, use expo-location or similar
 */
export const getMockUserLocation = async (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Return a mock location in Yaoundé, Cameroon
  return {
    latitude: 3.8667 + (Math.random() * 0.1 - 0.05),
    longitude: 11.5167 + (Math.random() * 0.1 - 0.05),
  };
};
