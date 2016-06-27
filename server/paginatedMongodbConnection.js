import {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLBoolean
} from 'graphql'


import {toMongoId} from './serverUtils'
export const LIMIT_PER_PAGE = 1;
export const DEFAULT_START_PAGE = 1;

export const paginatedArgs = {
  page: {
    type: GraphQLInt
  },
  limit: {
    type: GraphQLInt
  }
  , id: {
    type: GraphQLString
  }
};

function calcPaginationParams({page = DEFAULT_START_PAGE, limit = LIMIT_PER_PAGE}) {
  if (page < 1) {
    throw new Error("Page starts with 1")
  }
  if (limit < 1) {
    throw new Error("Limit starts with 1")
  }

  return {
    offset: (page - 1) * limit,
    limit,
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
    }
  })
});

export function paginatedDefinitions(config) {
  const {nodeType} = config;
  const name = config.name || nodeType.name;
  var edgeFields = config.edgeFields || {};
  var connectionFields = config.connectionFields || {};
  var resolveNode = config.resolveNode;

  var edgeType = new GraphQLObjectType({
    name: name + 'Edge',
    description: 'An edge in a connection.',
    fields: () => ({
      node: {
        type: nodeType,
        resolve: resolveNode,
        description: 'The item at the end of the edge',
      },

      ...(resolveMaybeThunk(edgeFields))
    })
  })


  var connectionType = new GraphQLObjectType({
    name: name + 'ConnectionPaginated',
    description: 'A connection to a list of items.',
    fields: () => ({
      pageInfoPaginated: {  //  changed the name to avoid graphql internal validation that requires certain field arguments
        type: new GraphQLNonNull(pageInfoType),
        description: 'Information to aid in pagination.'
      },
      edgesPaginated: {      //  changed the name to avoid graphql internal validation that requires certain field arguments
        type: new GraphQLList(edgeType),
        description: 'A list of edges.'
      }

      , ...(resolveMaybeThunk(connectionFields))
    })
  });


  return {edgeType, connectionType};

}


export async function paginatedMongodbConnection(collection, args, findParams) {
  // const findParams = {};
  function requestEntities(findParams, offset, limit) {
    return collection.find(findParams).skip(offset).limit(limit).toArray()
  }

  let offset, limit, currentPage, totalNumRecordsPromise, totalNumRecords, entitiesPromise, pageInfo;

  const {id} = args;

  //  id takes precedence over other field arguments
  if (id) {
    findParams._id = toMongoId(id);
    //  multiple entities with the same id is not supported
    offset = 0;
    limit = 1;
    //currentPage - irrelevant
    //totalNumRecordsPromise - irrelevant

    entitiesPromise = requestEntities(findParams, offset, limit);

    pageInfo = {hasPreviousPage: false, hasNextPage: false};

  } else {
    totalNumRecordsPromise = collection.count();
    const params = calcPaginationParams(args);

    offset = params.offset;
    limit = params.limit;

    entitiesPromise = requestEntities(findParams, offset, limit);

    currentPage = params.currentPage;

    totalNumRecords = await totalNumRecordsPromise;
    pageInfo = {
      hasPreviousPage: totalNumRecords != 0 && currentPage > 1,
      hasNextPage: currentPage * limit < totalNumRecords
    };
  }

  const entities = await entitiesPromise;

  return {
    edgesPaginated: entities.map(node => ({node})),
    pageInfoPaginated: pageInfo
  }

}