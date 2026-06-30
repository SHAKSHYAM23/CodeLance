import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:  `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email  = profile.emails?.[0]?.value;
        const name   = profile.displayName;
        const avatar = profile.photos?.[0]?.value;

        if (!email) return done(new Error('No email returned from Google'));

        const user = await prisma.user.upsert({
          where:  { googleId: profile.id },
          update: { name, avatar },
          create: { googleId: profile.id, email, name, avatar },
        });

        logger.info('Google OAuth success', { userId: user.id, email });
        return done(null, user);
      } catch (err) {
        logger.error('Google OAuth strategy error', { err });
        return done(err as Error);
      }
    }
  )
);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session:         false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge:   7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`${process.env.FRONTEND_URL}/app`);
    } catch (err) {
      logger.error('JWT signing failed', { err });
      res.redirect(`${process.env.FRONTEND_URL}/login?error=token_failed`);
    }
  }
);

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where:  { id: req.jwtUser!.userId },
        select: { id: true, email: true, name: true, avatar: true, createdAt: true },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }
);

export default router;