require('promise.prototype.finally');
import  {

    fromGlobalId,

} from 'graphql-relay'

// https://github.com/facebook/react/issues/5465#issuecomment-157888325
const makeCancelable = (promise) => {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then((val) =>
        hasCanceled_ ? reject({isCanceled: true}) : resolve(val)
    );
    promise.catch((error) =>
        hasCanceled_ ? reject({isCanceled: true}) : reject(error)
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    },
  };
};


export function commitUpdate(RelayStore, mutation) {
  return makeCancelable(new Promise((resolve, reject) => {
    RelayStore.commitUpdate(mutation,
        {
          onSuccess: resolve,
          onFailure: reject
        })
  }))
}

export function setRelayVariables(relay, partialVariables) {
  return new Promise((resolve, reject)=> {
    relay.setVariables(partialVariables, (readyState)=> {
      if (readyState.error) {
        reject(readyState.error)
      } else if (readyState.done) {
        resolve()
      }
    })
  })
}

export function promisify(cb){
  return new Promise((resolve, reject)=> {
    try {
      resolve(cb())
    } catch (err) {
      reject();
    }
  })
}

export function forceFetch(relay,partialVariables) {
  return new Promise((resolve, reject)=> {
    relay.forceFetch(partialVariables, (readyState)=> {
      if (readyState.error) {
        reject(readyState.error)
      } else if(readyState.done) {
        resolve()
      }
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



