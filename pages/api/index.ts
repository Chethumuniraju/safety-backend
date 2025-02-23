import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    status: 'API is running',
    message: 'Welcome to the Emergency Alert API'
  });
} 