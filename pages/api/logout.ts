
import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  const expiredCookies = [
    serialize('token', '', {
      path: '/',
      expires: new Date(0),
    }),
    serialize('role', '', {
      path: '/',
      expires: new Date(0),
    }),
  ];

  res.setHeader('Set-Cookie', expiredCookies);
  return res.status(200).json({ success: true });
}

