const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
const GEOAPIFY_API_URL = 'https://api.geoapify.com/v1/geocode/reverse';

interface GeocodeResult {
  type: string;
  features: Array<{
    properties: {
      formatted: string;
      address_line1: string;
      address_line2: string;
      city: string;
      state: string;
      postcode: string;
      country: string;
    };
  }>;
}

export async function getAddressFromCoordinates(latitude: number, longitude: number) {
  try {
    const url = new URL(GEOAPIFY_API_URL);
    url.searchParams.append('lat', latitude.toString());
    url.searchParams.append('lon', longitude.toString());
    url.searchParams.append('apiKey', GEOAPIFY_API_KEY || '');
    url.searchParams.append('format', 'json');

    console.log('Geocoding API URL:', url.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Geocoding API response:', data);

    return {
      success: true,
      results: data.features.map((feature: any) => ({
        formatted: feature.properties.formatted,
        address_line1: feature.properties.address_line1,
        address_line2: feature.properties.address_line2,
        city: feature.properties.city,
        state: feature.properties.state,
        postcode: feature.properties.postcode,
        country: feature.properties.country
      }))
    };

  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results: []
    };
  }
} 