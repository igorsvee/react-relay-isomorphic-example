import  {
    connectionFromArraySlice
} from 'graphql-relay'
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


import {toMongoId} from '../utils/general'
export const LIMIT_PER_PAGE = 1;
export const DEFAULT_START_PAGE = 1;

export const paginatedArgs = {
  page: {
    // type: new GraphQLNonNull(GraphQLInt)
    type: GraphQLInt
  },
  records: {
    type: GraphQLInt

  }
  , id: {
    type: GraphQLString
  }
}

function calcPaginationParams({page = DEFAULT_START_PAGE, records = LIMIT_PER_PAGE}) {
  // if (page == null) {
  //   throw new Error("Page must exist")
  // }
  // if (records == null) {
  //   throw new Error("Page must exist")
  // }
  if (page < 1) {
    throw new Error("Page starts with 1")
  }
  if (records < 1) {
    throw new Error("Records starts with 1")
  }

  return {
    offset: (page - 1) * records,
    limit: records,
    currentPage: page
  }
}
// from facebook
function resolveMaybeThunk(thingOrThunk) {
  return typeof thingOrThunk === 'function' ? thingOrThunk() : thingOrThunk;
}

var pageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  description: 'Information about pagination in a connection.',
  fields: () => ({
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'When paginating forwards, are there more items?'
    },
    hasPreviousPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'When paginating backwards, are there more items?'
    },
    // startCursor: {
    //   type: GraphQLString,
    //   description: 'When paginating backwards, the cursor to continue.'
    // },
    // endCursor: {
    //   type: GraphQLString,
    //   description: 'When paginating forwards, the cursor to continue.'
    // }
  })
});

export function paginatedDefinitions(config) {
  const {nodeType} = config;
  const name = config.name || nodeType.name;
  var edgeFields = config.edgeFields || {};
  var connectionFields = config.connectionFields || {};
  var resolveNode = config.resolveNode;
  var resolveCursor = config.resolveCursor;


  var edgeType = new GraphQLObjectType({
    name: name + 'Edge',
    description: 'An edge in a connection.',
    fields: () => ({
      node: {
        type: nodeType,
        resolve: resolveNode,
        description: 'The item at the end of the edge',
      },
      cursor: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: resolveCursor,
        description: 'A cursor for use in pagination'
      },
      ...(resolveMaybeThunk(edgeFields))
    })
  })



  var connectionType = new GraphQLObjectType({
    name: name + 'Connection',
    description: 'A connection to a list of items.',
    fields: () => ({
      pageInfoPaginated: {
        type: new GraphQLNonNull(pageInfoType),
        description: 'Information to aid in pagination.'
      },
      edgesPaginated: {
        type: new GraphQLList(edgeType),
        description: 'A list of edges.'
      }

      ,...(resolveMaybeThunk(connectionFields))
    })
  });


  return {edgeType, connectionType};

}



export default async function paginatedMongodbConnection(collection, args) {
  const findParams = {};

  const {id} = args;

  let {offset, limit, currentPage} = calcPaginationParams(args);


  //  id takes precedence over pagination
  if (id) {
    findParams._id = toMongoId(id);
    offset = 0;
    limit = 1;
  }


  const entities = await collection.find(findParams).skip(offset).limit(limit).toArray();
  const totalNumRecords = id ? 0 : await collection.count();

  const edges = entities.map((entity) => ({
    node: entity,
    cursor: '' // not null, required, graphql auto queries this field along with the connection
  }));

  const pageInfo = id ?
  {
    hasPreviousPage: false,
    hasNextPage: false
  }
      :
  {
    hasPreviousPage: totalNumRecords != 0 && currentPage > 1,
    hasNextPage: currentPage * limit < totalNumRecords
  };


  return {
    edgesPaginated:edges,
    pageInfoPaginated: {...pageInfo,
      // startCursor: null, endCursor: null
    }
  }

}