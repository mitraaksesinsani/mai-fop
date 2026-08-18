import { NextRequest } from 'next/server';

export const signToken = (payload: any) => {
  return 'dummy_token_123';
};

export const verifyToken = (token: string) => {
  return { id: '1', email: 'admin@foplp.com', name: 'Admin FOPLP', role: 'Admin' };
};

export const getUserFromRequest = (req: NextRequest) => {
  return verifyToken('dummy_token_123');
};
