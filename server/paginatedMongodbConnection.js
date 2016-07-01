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

const pageInfoType = new GraphQLObjectType({
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
  const edgeFields = config.edgeFields || {};
  const connectionFields = config.connectionFields || {};
  const resolveNode = config.resolveNode;

  const edgeType = new GraphQLObjectType({
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


  const connectionType = new GraphQLObjectType({
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


export async function paginatedMongodbConnection(collection, args, config) {

  function requestEntities(config) {
    const offset = config.offset || 0;
    const limit = config.limit || 0;
    const findParams = config.findParams || {};

    const sort = config.sort || undefined;
    const options = config.options || undefined;

    return collection.find(findParams, options).sort(sort).skip(offset).limit(limit).toArray()
  }

  function requestTotalNumRecords() {
    return collection.count();
  }

  let offset, limit, currentPage, totalNumRecordsPromise, totalNumRecords, entitiesPromise, pageInfo;

  const findParams = config && config.findParams || {};
  const {id} = args;

  //  id takes precedence over other field arguments
  if (id) {
    pageInfo = {hasPreviousPage: false, hasNextPage: false};

    findParams._id = toMongoId(id);
    offset = 0;
    //  multiple entities with the same id is not supported
    limit = 1;
    entitiesPromise = requestEntities({
      findParams, offset, limit
    });

  } else {
    totalNumRecordsPromise = requestTotalNumRecords();
    const params = calcPaginationParams(args);

    offset = params.offset;
    limit = params.limit;

    entitiesPromise = requestEntities({findParams, offset, limit});

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