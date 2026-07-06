const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.OAUTH_GOOGLE_CLIENT_ID || 'placeholder',
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET || 'placeholder',
      callbackURL: '/api/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            user.googleId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              profileImage: profile.photos[0].value,
              role: 'student',
              isVerified: true,
            });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'placeholder',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'placeholder',
      callbackURL: '/api/auth/github/callback',
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          const email = profile.emails && profile.emails.length > 0 
            ? profile.emails[0].value 
            : `${profile.username}@github.com`;

          user = await User.findOne({ email });

          if (user) {
            user.githubId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              name: profile.displayName || profile.username,
              email: email,
              githubId: profile.id,
              githubUsername: profile.username,
              profileImage: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
              role: 'student',
              isVerified: true,
            });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
