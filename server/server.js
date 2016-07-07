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

import   {graphql}   from 'graphql';
import {introspectionQuery} from 'graphql/utilities'
import setUpPassport from './setUpPassport';

import routes from './routes';
import database  from "../data/database";
let app = express();
app.use(cors());
//  schema development easing
process.devmode = process.argv.indexOf('development') != -1;
console.warn("process.devmode " + process.devmode)
var staticPath = path.join(__dirname, "static");
app.use(express.static(staticPath));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


(async() => {
  try {
    //  hardcoded pass
    let db = await MongoClient.connect("mongodb://root:1234@ds015849.mlab.com:15849/rgrs")


    let schema = UserSchema(db);

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
          })
        })
    )

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


})()


