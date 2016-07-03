require('promise.prototype.finally');
import  {

    fromGlobalId,

} from 'graphql-relay'



export function commitUpdate(RelayStore, mutation) {
  return new Promise((resolve, reject) => {
    RelayStore.commitUpdate(mutation,
        {
          onSuccess: resolve,
          onFailure: reject
        })
  })
}

class MongoIdCached {

  constructor() {
    const cache = {};

    return (relayId) => {
      if (!cache[relayId]) {
        cache[relayId] = fromGlobalId(relayId).id
      }

      return cache[relayId];
    }

  }


}
//  singleton
export const toMongoId = new MongoIdCached();



