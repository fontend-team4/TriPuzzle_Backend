import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LineStrategy } from 'passport-line';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile:', profile);
        const email = profile.emails[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'), null);
        }
        let user = await prisma.users.findUnique({ where: { email } });
        if (user) {
          user = await prisma.users.update({
            where: { email },
            data: {
              name: profile.displayName,
              profile_pic_url: profile.photos ? profile.photos[0].value : null,
            },
          });
        } else {
          user = await prisma.users.create({
            data: {
              email,
              name: profile.displayName,
              profile_pic_url: profile.photos ? profile.photos[0].value : null,
              password: "",
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new LineStrategy(
    {
      channelID: process.env.LINE_CHANNEL_ID,
      channelSecret: process.env.LINE_CHANNEL_SECRET,
      callbackURL: 'http://localhost:3000/api/auth/line/callback',
      scope: ['profile', 'openid', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Line profile:', profile);
        const email = profile.email || `${profile.id}@line.com`;
        let user = await prisma.users.findUnique({ where: { email } });
        if (user) {
          user = await prisma.users.update({
            where: { email },
            data: {
              name: profile.displayName,
              profile_pic_url: profile.pictureUrl || null,
              login_way: 'LINE',
            },
          });
        } else {
          user = await prisma.users.create({
            data: {
              email,
              name: profile.displayName,
              profile_pic_url: profile.pictureUrl || null,
              password: "",
              login_way: 'LINE',
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserializing user with id:', id);
    const user = await prisma.users.findUnique({ where: { id } });
    if (user) {
      console.log('User deserialized:', user);
      done(null, user);
    } else {
      done(new Error('User not found'), null);
    }
  } catch (err) {
    console.error('Error during deserialization:', err);
    done(err, null);
  }
});
