import {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLBoolean
} from 'graphql'
import R from 'ramda'
import  {

    connectionFromArray,
    connectionFromPromisedArray

} from 'graphql-relay'

import {toMongoId} from './serverUtils'

export const DEFAULT_LIMIT_PER_PAGE = 1;
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

export function calcPaginationParams({page = DEFAULT_START_PAGE, limit = DEFAULT_LIMIT_PER_PAGE}) {
  if (page < 1) {
    throw new Error("Page arg must be positive, got "+page)
  }
  if (limit < 1) {
    throw new Error("Limit arg must be positive, got "+limit)
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
//deprecated
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
//deprecated
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

export const PageInfoPaginatedType = new GraphQLObjectType({
  name: 'PageInfoPaginated',
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
    totalNumPages: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Total number of pages.'
    },
  })
});

export async function calcHasNextPrevious(collection,args){

  const totalCountPromise = collection.count();

  const {limit,currentPage} = calcPaginationParams(args);

  const totalNumRecords = await totalCountPromise;

  return {
    hasNextPage: totalNumRecords != 0 && currentPage * limit < totalNumRecords,
    hasPreviousPage: totalNumRecords != 0 && currentPage > 1,
    totalNumPages: Math.ceil(totalNumRecords/limit)
  }
}

export function paginatedConnection(collection,args,config){
  console.log("paginatedConnection config %O",config)
  function buildConnectionByConfig(config) {
    console.log("buildConnectionByConfig : %O",config)
    const offset = config.offset || 0;
    const limit = config.limit || 0;
    const findParams = config.findParams || {};

    const sort = config.sort || undefined;
    const options = config.options || undefined;

    return connectionFromPromisedArray(collection.find(findParams, options).sort(sort).skip(offset).limit(limit).toArray(),args)
  }

  function mergeWithConfigAndReturn(obj){
    const resultObj =  Object.assign({},config,obj)
    console.log("mergeWithConfigAndReturn return resultObj %O",resultObj)
    return resultObj
  }

  return R.compose(buildConnectionByConfig, mergeWithConfigAndReturn, calcPaginationParams)(args) ;
}


//deprecated
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