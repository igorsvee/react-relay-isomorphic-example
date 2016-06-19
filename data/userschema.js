import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLID
    , GraphQLBoolean
} from 'graphql'
import  {
    globalIdField,
    fromGlobalId,
    toGlobalId,
    nodeDefinitions,   // map globally defined ids into actual data objects and their graphql types
    connectionDefinitions,
    connectionArgs,
    connectionFromPromisedArray
    , mutationWithClientMutationId
} from 'graphql-relay'

import database from './database';
import User from '../js/models/User';


var ObjectID = require('mongodb').ObjectID;


const UserSchema = (db) => {
  class Store {
  }
  const store = new Store();

  const UserDao = database(db);


  const {nodeInterface, nodeField} =  nodeDefinitions(
      // globalId  => {
      async function (globalId) {
        const {type, id} = fromGlobalId(globalId);
        // const {type, id} = globalId;

        switch (type) {
          case 'Store':
            console.log("in Store");
            return store;
          case 'User':
            console.log("in User, id:" + id);
            const userDb = await UserDao.getUserById(id); //  toArray()

            const user = new User(userDb[0]);

            console.log(user);
            // console.log(user._id)

            return user;
          default:
            return null;
        }


      },
      //  resolves and obj, relay uses it to map it ot GraphQL type
      obj => {
        if (obj instanceof Store) {
          return GraphQLStore;
        } else if (obj instanceof User) {
          return GraphQLUser;
        } else {
          return null;
        }
      }
  );

  const GraphQLStore = new GraphQLObjectType({
    name: 'Store',

    fields: () =>({
      // relay helper to generate
      id: globalIdField("Store"),
      userConnection: {
        type: userConnection.connectionType,
        //relay helper ,extend it
        args: {
          ...connectionArgs  //first.. last etc
          // , query: {type: GraphQLString}

          , id: {type: GraphQLString}
          // , id: {type: GraphQLID}
        },

        resolve: (_, args) => {
          let findParams = {};

          const {id} = args;

          if (id) {
            const fromId = fromGlobalId(id).id;
            console.log("fromId " + fromId);
            findParams._id = new ObjectID(fromId);
            if (!args.first) {
              args.first = 1;
            }
          }

          return connectionFromPromisedArray(
              db.collection("users")
                  .find(findParams)
                  // .sort({createdAt: -1})  //desc
                  .limit(args.first)
                  .toArray(),
              args)
        }
      }


    })
    ,
    interfaces: [nodeInterface]

  });


  const GraphQLUser = new GraphQLObjectType({
    name: 'User',
    fields: {
      //  for connection it requires id
      id: globalIdField('User', user => user._id),
      // id: {
      //   type: new GraphQLNonNull(GraphQLID),
      //   resolve: (obj) => obj._id
      // },
      username: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: (obj) => obj.username
      }
      ,
      password: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: (obj) => obj.password
      }
      ,
      address: {
        type: GraphQLString,
        resolve: (obj) => obj.address
      }


    },
    interfaces: [nodeInterface]
  });

  let userConnection = connectionDefinitions({
    name: 'User',
    nodeType: GraphQLUser
  });

  let createUserMutation = mutationWithClientMutationId({
    name: 'CreateUser',

    inputFields: {
      username: {type: new GraphQLNonNull(GraphQLString)},
      address: {type: GraphQLString},
      password: {type: new GraphQLNonNull(GraphQLString)}
    },

    //  after mutation

    outputFields: {
      //todo appears on the left in the graphiql
      userEdge: {
        type: userConnection.edgeType,
        // receives obj from below          insertedCount

        // Edge types must have fields named node and cursor. They may have additional fields related to the edge, as the schema designer sees fit.
        resolve: (obj) => ({node: obj.ops[0], cursor: obj.insertedId})

      }
      //  user connections are rendered under the store type
      ,
      store: {
        type: GraphQLStore,
        resolve: () => store

      }
    }


    , mutateAndGetPayload: ({username, address, password}) => {
      console.log("inserting: " + {username, address, password})
      //  we nee dot return a promise
      return db.collection("users").insertOne({username, address, password});
    }
  })

  let removeUserMutation = mutationWithClientMutationId({
    name: 'DeleteUser',
    inputFields: {
      id: {type: new GraphQLNonNull(GraphQLID)}
    },

    outputFields: {
      
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        resolve: (obj) => {
          // console.log("userId:obj.value._id: " + obj.value._id)
          return ({userId:obj.value._id})
      
        }
      } ,
      userEdge: {
        type: userConnection.edgeType,
        // receives obj from below          insertedCount

        // Edge types must have fields named node and cursor. They may have additional fields related to the edge, as the schema designer sees fit.
        resolve: (obj) => ({node: obj.value, cursor: obj.value._id})

      },
      
      store: {
        type: GraphQLStore,
        resolve: () => store

      }

 
    }

    ,

    mutateAndGetPayload: ({id}) => {
      const objId = fromGlobalId(id).id;

      // return db.collection("users")
      //     .deleteOne(
      //         {_id: new ObjectID(objId)}
      //     );
      return db.collection("users")
          .findOneAndDelete(
              {_id: new ObjectID(objId)}
      
          );
    }

  });

  let updateUserMutation = mutationWithClientMutationId({
    name: 'UpdateUser',

    inputFields: {
      id: {type: new GraphQLNonNull(GraphQLID)},
      username: {type: GraphQLString},
      address: {type: GraphQLString}
    },

    //  after mutation
    outputFields: {
      //todo its a description of the query on the left
      userEdge: {
        type: userConnection.edgeType,
        //todo receives obj from result of the mongodb operation below
        resolve: (obj) => {
          return ({node: obj.value, cursor: obj.value._id})
        }
      }

      //  user connections are rendered under the store type
      ,
      store: {
        type: GraphQLStore,
        resolve: () => store

      }
    }


    , mutateAndGetPayload: ({id, username, address, password}) => {
      const realObjId = fromGlobalId(id).id;
          console.log("id %s username %s address %s password %s ",id,username,address,password)
      const setObj = {
        $set: {}
      };
      if (username) {
        setObj.$set.username = username;
      }
      if (address) {
        setObj.$set.address = address;
      }
      if (password) {
        setObj.$set.password = password;
      }


      console.log(setObj)

      return db.collection("users")
          .findOneAndUpdate(
              {_id: new ObjectID(realObjId)}
              , setObj
              , {
                returnNewDocument: true
                , returnOriginal: false
              }
          );

    }
  })


  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',

      fields: () =>({
        node: nodeField,
        store: {
          type: GraphQLStore,
          resolve: () => store
        }
      })
    })

    , mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: ()=>({
        createUser: createUserMutation,
        updateUser: updateUserMutation,
        removeUser: removeUserMutation
      })

    })

  })
}

export default UserSchema;