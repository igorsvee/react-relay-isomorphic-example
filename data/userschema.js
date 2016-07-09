import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLID, GraphQLFloat
    , GraphQLBoolean
} from 'graphql'
import  {
    globalIdField,
    fromGlobalId,
    toGlobalId,
    nodeDefinitions,   // map globally defined ids into actual data objects and their graphql types
    connectionDefinitions,
    connectionArgs,
    connectionFromArray,
    connectionFromPromisedArray
    , connectionFromArraySlice
    , mutationWithClientMutationId
} from 'graphql-relay'
import database from './database';
import User from '../js/models/User';
import Product from '../js/models/Product';
import  {
    paginatedDefinitions,
    paginatedArgs,
    paginatedMongodbConnection
} from '../server/paginatedMongodbConnection';

var ObjectID = require('mongodb').ObjectID;
import {toMongoId} from '../server/serverUtils'

import {genHash} from './dbUtils'


const UserSchema = (db) => {
  class Store {
  }
  const store = new Store();

  const dbManager = database(db);

  console.log("process.env.NODE_ENV " + process.env.NODE_ENV)

  const {nodeInterface, nodeField} =  nodeDefinitions(
      async(globalId) => {
        const {type, id} = fromGlobalId(globalId);

        switch (type) {
          case 'Store':
            console.log("in Store");
            return store;
          case 'User':
            console.log("in User, id:" + id);
            const userDb = await dbManager.findUserById(toMongoId(id));

            const userEntity = new User(userDb);

            console.log(userEntity);
            return userEntity;

          case 'Product':
            console.log("in Product, id:" + id);
            const productDB = await dbManager.getProductById(toMongoId(id));

            const productEntity = new Product(productDB);

            console.log(productEntity);
            return productEntity;
          default:
            return null;
        }


      },
      //  resolves and obj, relay uses it to map it ot GraphQL type
      obj => {
        if (obj instanceof Store) {
          return GraphQLStore;
        } else if (obj instanceof Product) {
          return GraphQLProduct
        }
        else if (obj instanceof User) {
          return GraphQLUser;
        }

        else {
          console.log("unknown instance %O", obj)
          return null;
        }
      }
  );

  function _unauthorized(session) {
    return !session || !session.passport || !session.passport.user
  }

  function getSessionId(session) {
    return session && session.passport && session.passport.user && toGlobalId('User', session.passport.user)
  }

  const errorObj = obj => {
    return new Error(JSON.stringify(obj));
  };

  function ensureAuthorization(session) {
    if (!process.devmode && _unauthorized(session)) {
      throw errorObj({error: 'Unauthorized'});
    }
  }

  const GraphQLStore = new GraphQLObjectType({
    name: 'Store',

    fields: () =>({
      // relay helper to generate
      id: globalIdField("Store"),
      userConnectionPaginated: {
        type: userConnectionPaginated.connectionType,
        //relay helper ,extend it
        args: {
          // ...connectionArgs,  //first.. last etc
          ...paginatedArgs
        },

        resolve: async(_, args, session) => {
          ensureAuthorization(session);

          return await paginatedMongodbConnection(db.collection("users"), args, {})
        }
      },

      //  session id == user id from the back end, we convert it to relay id
      sessionId: {
        type: GraphQLString,
        resolve: (obj, args, session) => {
          const realSessionId = getSessionId(session);
          if (!realSessionId && process.devmode) {
            return 'mockSession'
          }

          return realSessionId;
        }
      }
    })
    ,
    interfaces: [nodeInterface]

  });

  const GraphQLSession = new GraphQLObjectType({
    name: 'Session',
    fields: {
      weight: {
        type: GraphQLFloat,
        resolve: (obj) => obj.weight
      }
      ,
      inStock: {
        type: GraphQLInt,
        resolve: (obj) => obj.inStock
      }


    },
    // interfaces: [nodeInterface]
  });

  //todo to be used
  const GraphQLDetails = new GraphQLObjectType({
    name: 'Details',
    fields: {
      weight: {
        type: GraphQLFloat,
        resolve: (obj) => obj.weight
      }
      ,
      inStock: {
        type: GraphQLInt,
        resolve: (obj) => obj.inStock
      }


    },
    // interfaces: [nodeInterface]
  });

  const GraphQLProduct = new GraphQLObjectType({
    name: 'Product',
    fields: {
      //  for connection it requires an id
      id: globalIdField('Product', product => product._id),

      name: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: (obj) => obj.name
      }
      ,
      description: {
        type: GraphQLString,
        resolve: (obj) => obj.description
      }

      ,
      details: {
        type: GraphQLDetails,
        resolve: (obj) => obj.details
      }
      ,
      reviews: {
        type: new GraphQLList(GraphQLID),
        resolve: (obj) => obj.reviews
      },
      category_ids: {
        type: new GraphQLList(GraphQLID),
        resolve: (obj) => obj.category_ids
      }
      // total_reviews: {
      //   type: new GraphQLInt,
      //   resolve: (obj) => obj.total_reviews
      // }
      // , average_review: {
      //   type: new GraphQLFloat,
      //   resolve: (obj) => obj.average_review
      // }
      // ,total_reviews: 4,
      // average_review: 4.5,

    },
    interfaces: [nodeInterface]
  });

  //  --  //

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
        type: GraphQLString,
        resolve: (obj) => obj.username
      }
      ,
      password: {
        type: GraphQLString,
        resolve: (obj) => obj.password
      }
      ,
      address: {
        type: GraphQLString,
        resolve: (obj) => obj.address
      }
      ,
      activated: {
        type: new GraphQLNonNull(GraphQLBoolean),
        resolve: (obj) => obj.activated
      }


    },
    interfaces: [nodeInterface]
  });

  // let userConnection= connectionDefinitions({
  //   name: 'User',
  //   nodeType: GraphQLUser
  // });

  let userConnectionPaginated = paginatedDefinitions({
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

      newUserEdge: {
        // userEdge: {
        type: userConnectionPaginated.edgeType,
        // receives obj from below         

        // Edge types must have fields named node and cursor. They may have additional fields related to the edge, as the schema designer sees fit.
        // resolve: (obj,contextt,info) => ({node: obj.ops[0], cursor: obj.insertedId})
        resolve: (obj) => {
          return ({node: obj.ops[0]})
        }

      },
      //   ,
      newUserId: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: (obj) => {
          console.log('newUserId ' + obj.insertedId)

          const relayId = toGlobalId('User', obj.insertedId)
          console.log("relayId " + relayId)
          return relayId;
        }
      }
      //  user connections are rendered under the store type
      ,
      store: {
        type: GraphQLStore,
        resolve: () => store

      }
    }


    , mutateAndGetPayload: async({username, address, password}, session) => {


      console.log("inserting: %O", {username, address, password})


      const hash = await genHash(password);

      return db.collection("users").insertOne({username, address, password: hash, activated: false}, {
        safe: false, db: {forceServerObjectId: true}
      });
    }
  })


  let removeUserMutation = mutationWithClientMutationId({
    name: 'DeleteUser',
    inputFields: {
      id: {type: new GraphQLNonNull(GraphQLID)}
    },

    outputFields: {

      sessionId: {
        type: new GraphQLNonNull(GraphQLID),
        resolve: (obj) => {
          console.log("userId:obj.value._id: " + obj.value._id)
          const relayId = toGlobalId('User', obj.value._id)
          console.log("relayId " + relayId)
          return (relayId)
        }
      },
      userEdge: {
        type: userConnectionPaginated.edgeType,
        // receives obj from below          insertedCount

        // Edge types must have fields named node and cursor. They may have additional fields related to the edge, as the schema designer sees fit.
        resolve: (obj) => ({node: obj.value, cursor: obj.value._id})
        // resolve: (obj) => ({node: obj.value})

      },

      store: {
        type: GraphQLStore,
        resolve: () => store

      }


    }

    ,

    mutateAndGetPayload: ({id}, session) => {
      ensureAuthorization(session);
      if (getSessionId(session) == id) {
        throw errorObj({error: 'Can\'t delete yourself'});
      }

      const objId = fromGlobalId(id).id;


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
        type: userConnectionPaginated.edgeType,
        //todo receives obj from result of the mongodb operation below
        resolve: (obj) => {
          // return ({node: obj.value, cursor: obj.value._id})
          return ({node: obj.value})
        }
      }

      //  user connections are rendered under the store type
      ,
      store: {
        type: GraphQLStore,
        resolve: () => store

      }
    }


    , mutateAndGetPayload: async({id, username, address, password}, session) => {
      ensureAuthorization(session);

      const realObjId = fromGlobalId(id).id;
      console.log("id %s username %s address %s password %s ", id, username, address, password
      )
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
        setObj.$set.password = await(genHash(password));
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

  let toggleUserActivatedMutation = mutationWithClientMutationId({
    name: 'ToggleUserActivated',

    inputFields: {
      id: {type: new GraphQLNonNull(GraphQLID)},
      activated: {type: new GraphQLNonNull(GraphQLBoolean)}
    },

    //  after mutation
    outputFields: {
      //todo its a description of the query on the left
      userEdge: {
        type: userConnectionPaginated.edgeType,
        //todo receives obj from result of the mongodb operation below
        resolve: (obj) => {
          // return ({node: obj.value, cursor: obj.value._id})
          return ({node: obj.value})
        }
      }

      //  user connections are rendered under the store type
      ,
      store: {
        type: GraphQLStore,
        resolve: () => store

      }
    }


    , mutateAndGetPayload: ({id, activated}, session) => {
      ensureAuthorization(session);

      const realObjId = fromGlobalId(id).id;

      return db.collection("users")
          .findOneAndUpdate(
              {_id: new ObjectID(realObjId)}
              , {$set: {activated}}
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
        removeUser: removeUserMutation,
        toggleUserActivated: toggleUserActivatedMutation
      })

    })

  })
}

export default UserSchema;