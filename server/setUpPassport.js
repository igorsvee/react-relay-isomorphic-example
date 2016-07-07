import passport from 'passport';
var LocalStrategy = require("passport-local").Strategy;

import { compare} from '../data/dbUtils'

export default (dbManager) => {

  return function () {
    passport.serializeUser(function (user, done) {
      done(null, user._id);
    });

    passport.deserializeUser(async function (id, done) {
      let user, error;
      try {
        user = await dbManager.findUserById(id);
      }
      catch (err) {
        error = err;
      }

      done(error, user)
    });

    passport.use(new LocalStrategy(
        async function (username, password, done) {

          let user, userError;
          try {
            user = await dbManager.findUserByName(username)
          } catch (err) {
            userError = err
          }

          if (userError) {
            return done(userError)
          }
          if (!user) {
            return done(null, false,
                {message: "No user has that username!"});
          }
          console.log("provided password " + password)
          console.log("user database password hash: " + user.password)
          let passwordOk, compareError;
          try {
            passwordOk = await compare(password, user.password)
          } catch (err) {
            compareError = err;
          }

          if (compareError) {
            return done(compareError);
          }
          if (passwordOk) {
            return done(null, user);
          } else {
            return done(null, false,
                {message: "Invalid password."});
          }


        }))


    ;

  }


}
