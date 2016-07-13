require('promise.prototype.finally');
import  {

    fromGlobalId,
    toGlobalId
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
    getPromise(){
      return wrappedPromise
    },
    cancel() {
      hasCanceled_ = true;
    },
  };
};

// returns cancelable promise
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

export function promisify(cb) {
  return new Promise((resolve, reject)=> {
    try {
      resolve(cb())
    } catch (err) {
      reject(err.message);
    }
  })
}

export function forceFetch(relay, partialVariables) {
  return new Promise((resolve, reject)=> {
    relay.forceFetch(partialVariables, (readyState)=> {
      //  todo better logic?
      if (readyState.error) {
        reject(readyState.error)
      } else if (readyState.done) {
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
export function toUserRelayId(mongoId) {
  return toGlobalId("User", mongoId)
}



