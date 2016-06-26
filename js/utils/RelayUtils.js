export function commitUpdate(RelayStore, mutation) {
  return new Promise((resolve, reject) => {
    RelayStore.commitUpdate(mutation,
        {
          onSuccess: resolve,
          onFailure: reject
        })
  })
}
