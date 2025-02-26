import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function verifyAuth(request: Request) {
  const token = getToken(request);

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function signToken(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);
  
  return token;
}

function getToken(request: Request): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get token from query parameter
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token');
  if (queryToken) {
    return queryToken;
  }

  // Try to get token from cookie
  try {
    const cookieStore: ReadonlyRequestCookies = cookies();
    const token = cookieStore.get('token');
    return token?.value || null;
  } catch (error) {
    console.error('Error reading cookies:', error);
    return null;
  }
} 