export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};