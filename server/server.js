import express from 'express';
import cors from 'cors';
import fs from 'fs'
import {MongoClient}  from 'mongodb';
import UserSchema from '../data/userschema'
import GraphQLHTTP from 'express-graphql'
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import passport from 'passport';
import session from 'express-session'
import ejs from 'ejs';
import   {graphql}   from 'graphql';
import {introspectionQuery} from 'graphql/utilities'
import setUpPassport from './setUpPassport';

import routes from './routes';
import database  from "../data/database";
import renderOnServer from './renderOnServer'
let app = express();
app.use(cors());
//  schema development easing
//todo find a better way to set a global variable
process.devmode = process.env.NODE_ENV === "development";
console.warn("process.devmode " + process.devmode);

// const staticPath = path.join(__dirname, "static");
// app.use(express.static(staticPath));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


(async() => {
  try {
    //  hardcoded pass
    let db = await MongoClient.connect("mongodb://root:1234@ds015849.mlab.com:15849/rgrs")
    let schema = UserSchema(db);

    // Serve CSS
    app.use('/css/', express.static(path.resolve(__dirname, './static')));


    const dbManager = database(db);
    setUpPassport(dbManager)();
    app.use(/\/((?!graphql).)*/, bodyParser.urlencoded({extended: true}));
    app.use(/\/((?!graphql).)*/, bodyParser.json());
    app.use(cookieParser());
    app.use(session({
      secret: "aaa",
      resave: true,
      saveUninitialized: true
    }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    //
    app.use(routes);
    app.use('/graphql', GraphQLHTTP(request => {
          return ({
            schema,
            context: request.session,
            graphiql: true,
            formatError: error => ({
              message: error.message,
              locations: error.locations,
              stack: error.stack
            })
            , pretty: true
          })
        })
    )

    // Serve JavaScript
    app.get('/app.js', (req, res) => {
      res.setHeader('Content-Type', 'application/javascript');
      res.sendFile('app.js', {root: __dirname + '/static/'});
    });
    //
    app.get('/vendor.js', (req, res) => {
      res.setHeader('Content-Type', 'application/javascript');
      res.sendFile('vendor.js', {root: __dirname + '/static/'});
    });

    // Serve HTML
    app.get('/*', (req, res, next) => {
      renderOnServer(req, res, next);
    });

    /// catch 404 and forwarding to error handler
    app.use(function (req, res, next) {
      const err = new Error('Not Found');
      err.status = 404;
      next(err);
    });


//     development error handler
// will print stacktrace
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.send({
        message: err.message,
        error: err
      });
    });


    // production error handler
    // no stacktraces leaked to user
    // app.use(function (err, req, res, next) {
    //   res.status(err.status || 500);
    //   res.send({
    //     message: err.message,
    //     error: {}
    //   });
    // });

    app.set("port", process.env.PORT || 3000);

    app.listen(app.get("port"), () => {
      console.log("listening on port " + app.get("port"))
    });


    //generate schema.json
    let json = await graphql(schema, introspectionQuery);
    // transpile graphql queries before shipping them client side
    fs.writeFile('./data/schema.json', JSON.stringify(json, null, 2), err => {
      if (err) throw err;

      console.log("JSON schema created")
    })
  } catch (e) {
    console.log(e)
  }


}) ()


