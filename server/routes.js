import express from 'express';
import passport from 'passport';

import { renderToString } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
var router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("info", "You must be logged in to see this page.");
    res.redirect("/login");
  }
}

router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});


router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/login",

    function (req, res, next) {

      passport.authenticate('local', function (err, user, info) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).send({"ok": false});
        }
        req.logIn(user, function (err) {
          if (err) {
            return res.status(401).send({"ok": false});
          }
          return res.status(200).send({"ok": true});
        });
      })(req, res, next)


    }

);

// router.get("/",function (req, res, next) {
//     console.log("MAIN %O"+req)
//   res.sendFile(path.join(__dirname + '/index.html'));
// })


router.post("/logout", function (req, res) {
  if (req.isAuthenticated()) {
    req.logout();
    res.status(200).send({"ok": true});
  } else {
    res.status(406).send({"ok": false});
  }

});


router.get("/ajax", function (req, res) {
  if (req.isAuthenticated()) {
    res.status(200).send({"ok": true})
  } else {
    res.status(401).send({"ok": false})
  }
});


router.get("/success", function (req, res) {
  res.render("success");
});

router.get("/protected", ensureAuthenticated, function (req, res) {
  res.render("protected");
});

export default router;