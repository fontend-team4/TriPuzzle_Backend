import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));
router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'consent',
    })(req, res, next);
  },
  (req, res) => {
    res.json({
      message: 'Logged in with Google',
      user: req.user,
    });
  }
);

router.get('/line-login', passport.authenticate('line', {
  scope: ['profile', 'openid', 'email'],
}));
router.get('/line/callback',
  passport.authenticate('line', { failureRedirect: '/' }),
  (req, res) => {
    res.json({
      message: 'Logged in with Line',
      user: req.user,
    });
  }
);

export default router;
