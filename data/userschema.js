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
    connectionFromArray,
    connectionFromPromisedArray
    , connectionFromArraySlice
    , mutationWithClientMutationId
} from 'graphql-relay'
import database from './database';
import User from '../js/models/User';
import paginatedMongodbConnection, {paginatedDefinitions, paginatedArgs} from '../js/utils/paginatedMongodbConnection';

var ObjectID = require('mongodb').ObjectID;
import {toMongoId} from '../js/utils/general'


function customConnection(obj) {
  console.log(obj)
  console.log("yo")
  console.log(Object.keys(obj.connectionType))
  console.log(obj.connectionType)
  console.log("yo 2")
  console.log(obj.connectionType._typeConfig.fields())

  const currentEdgeType = obj.edgeType;

  let customPageInfoType = new GraphQLObjectType({
    name: 'PageInfoCustom',
    description: 'Information about pagination in a connection.',
    fields: () => ({
      hasNextPage: {
        type: new GraphQLNonNull(GraphQLBoolean),
        description: 'When paginating forwards, are there more items?'
      },
      hasPreviousPage: {
        type: new GraphQLNonNull(GraphQLBoolean),
        description: 'When paginating backwards, are there more items?'
      }
      ,
      empty: {
        type: new GraphQLNonNull(GraphQLBoolean),
        description: 'Result does not contain any items?'
      }

    })
  });


  // obj.connectionType._typeConfig.fields
  //
  //
  obj.connectionType._typeConfig.fields = () => ({
    pageInfo: {
      type: new GraphQLNonNull(customPageInfoType),
      description: 'Information to aid in pagination.'
    },
    edges: {
      type: new GraphQLList(currentEdgeType),
      description: 'A list of edges.'
    },
    //  omitting thunks
  })


  return obj

}


const UserSchema = (db) => {
  class Store {
  }
  const store = new Store();

  const UserDao = database(db);


  const {nodeInterface, nodeField} =  nodeDefinitions(
      // globalId  => {
      // async function (globalId) {
      async(globalId) => {
        const {type, id} = fromGlobalId(globalId);

        switch (type) {
          case 'Store':
            console.log("in Store");
            return store;
          case 'User':
            console.log("in User, id:" + id);
            const userDb = await UserDao.getUserById(toMongoId(id));

            const userEntity = new User(userDb);

            console.log(userEntity);
            return userEntity;
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
          console.log("unknown instance %O", obj)
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
          ...connectionArgs,  //first.. last etc
          ...paginatedArgs
          // , id: {type: GraphQLID}


        },

        resolve: async(_, args) => {
          let findParams = {};

          // const {id} = args;
          // console.log(args)


          // let sort = 1;
          // if(last){
          //    sort = -1;
          // }

          // if (after) {
          //   console.log("HERE")
          //   const mongoId = toMongoId(after);
          //   findParams._id = {$gt: mongoId}
          // }


          // console.log(Object.keys(connectionDefinitions({
          //   name: 'User',
          //   nodeType: GraphQLUser
          // })))
          // console.log(connectionDefinitions({
          //   name: 'User',
          //   nodeType: GraphQLUser
          // }))


          // console.log(customConnection(connectionDefinitions({
          //   name: 'User',
          //   nodeType: GraphQLUser
          // })))

          return await paginatedMongodbConnection(db.collection("users"), args)


          //  connectionFromPromisedArray(
          //     db.collection('users')
          //         .find({})
          //     // .sort({_id: sort})
          //         .skip(offset)
          //         .limit(limit)
          //         .toArray(),
          //     args
          // );


          // return connectionFromPromisedArray(cursor, args)
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
      ,
      activated: {
        type: new GraphQLNonNull(GraphQLBoolean),
        resolve: (obj) => obj.activated
      }


    },
    interfaces: [nodeInterface]
  });

  // let userConnection = connectionDefinitions({
  //   name: 'User',
  //   nodeType: GraphQLUser
  // });

  let userConnection = paginatedDefinitions({
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
        // receives obj from below         

        // Edge types must have fields named node and cursor. They may have additional fields related to the edge, as the schema designer sees fit.
        resolve: (obj) => ({node: obj.ops[0]})

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

      return db.collection("users").insertOne({username, address, password, activated: false});
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
          console.log("userId:obj.value._id: " + obj.value._id)
          const relayId = toGlobalId('User', obj.value._id)
          console.log("relayId " + relayId)
          return (relayId)
        }
      },
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
      console.log("id %s username %s address %s password %s ", id, username, address, password)
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


    , mutateAndGetPayload: ({id, activated}) => {
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