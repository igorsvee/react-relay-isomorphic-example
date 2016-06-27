require('promise.prototype.finally');

export function commitUpdate(RelayStore, mutation) {
  return new Promise((resolve, reject) => {
    RelayStore.commitUpdate(mutation,
        {
          onSuccess: resolve,
          onFailure: reject
        })
  })
}

// export default (RelayStore) => {
//
//   function commitUpdate(mutation) {
//     return new Promise((resolve, reject) => {
//       RelayStore.commitUpdate(mutation,
//           {
//             onSuccess: resolve,
//             onFailure: reject
//           })
//     })
//   }
//
//    return {
//
//    }
// }


