const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

interface GeoapifyResponse {
  results?: Array<{
    address_line1?: string;
    address_line2?: string;
    formatted?: string;
    city?: string;
    state?: string;
    postcode?: string;
  }>;
}

export async function getAddressFromCoordinates(latitude: number, longitude: number) {
  try {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${GEOAPIFY_API_KEY}`;
    console.log('Calling Geoapify API:', url);

    const response = await fetch(url);
    const data: GeoapifyResponse = await response.json();
    console.log('API Response:', data);

    return data;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
} 