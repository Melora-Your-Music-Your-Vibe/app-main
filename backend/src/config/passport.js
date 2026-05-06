const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { googleId: profile.id } });
    if (!user) {
      user = await User.findOne({ where: { email: profile.emails[0].value } });
      if (user) {
        user.googleId = profile.id;
        user.authMethod = 'google';
        if (!user.profilePicture) user.profilePicture = profile.photos?.[0]?.value;
        await user.save();
      } else {
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          profilePicture: profile.photos?.[0]?.value,
          authMethod: 'google',
          isVerified: true,
        });
      }
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

module.exports = passport;
