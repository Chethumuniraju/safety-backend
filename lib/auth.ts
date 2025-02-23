import { jwtVerify } from 'jose';

export async function verifyAuth(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return null;
    }

    try {
      const verified = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET || 'your-secure-jwt-secret-key')
      );
      return verified.payload;
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return null;
    }
  } catch (err) {
    console.error('Auth error:', err);
    return null;
  }
} 