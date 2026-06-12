const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value.toLowerCase() : null;
        const googleId = profile.id;
        const name = profile.displayName || 'Google User';
        const profileImage = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

        if (!email) {
          return done(new Error('No email associated with this Google account'), null);
        }

        // Find user by Google ID or by email
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
          let updated = false;
          // If user exists but googleId is not linked, link it
          if (!user.googleId) {
            user.googleId = googleId;
            updated = true;
          }
          // If profile image is empty, update it
          if (!user.profileImage && profileImage) {
            user.profileImage = profileImage;
            updated = true;
          }
          if (updated) {
            await user.save();
          }
        } else {
          // Create new user
          user = await User.create({
            name,
            email,
            googleId,
            profileImage,
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
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
