import fs from 'fs'
import {MongoClient}  from 'mongodb';
import UserSchema from './data/userschema'
//generate schema.json
import   {graphql}   from 'graphql';
import {introspectionQuery} from 'graphql/utilities'
( async()=> {
  //  hardcoded pass

  let db = await MongoClient.connect("mongodb://root:1234@ds015849.mlab.com:15849/rgrs");

  let schema = UserSchema(db);
  let json = await graphql(schema, introspectionQuery);

  // transpile graphql queries before shipping them client side
  fs.writeFile('./data/schema.json', JSON.stringify(json, null, 2), err => {
    if (err) throw err;

    console.log("JSON schema created")
    db.close();
  })

})()