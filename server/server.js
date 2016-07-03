import express from 'express';
import cors from 'cors';
import fs from 'fs'
import {MongoClient}  from 'mongodb';
import UserSchema from '../data/userschema'
import GraphQLHTTP from 'express-graphql'

import   {graphql}   from 'graphql';
import {introspectionQuery} from 'graphql/utilities'

let app = express();
app.use(cors());

(async() => {
  try {
    //  hardcoded pass
    let db = await MongoClient.connect("mongodb://root:1234@ds015849.mlab.com:15849/rgrs")

    // let schema = Schema(db)
    let schema = UserSchema(db);
    app.use('/graphql', GraphQLHTTP({
      schema,
      graphiql: true,
      formatError: error => ({
        message: error.message,
        locations: error.locations,
        stack: error.stack
      })
    }))

    app.listen(3000, () => {
      console.log("listening on port 3000")
    });


    //generate schema.json
    let json = await graphql(schema, introspectionQuery);
    // transpile graphql queries before shipping them client side
    fs.writeFile('./data/schema.json', JSON.stringify(json, null, 2), err => {
      if (err) throw err;

      console.log("JSON schema created ")
    })
  } catch (e) {
    console.log(e)
  }


})()


