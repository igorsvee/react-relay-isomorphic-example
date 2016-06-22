import Relay from 'react-relay';


class DeleteUserMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`
          mutation { removeUser }
       `
  }

  getVariables() {
    //  prepare variables to be used for the mutation, allows to do some logic on the props before sending them to the server
    return {
      id: this.props.userId
    }
  }

  // Instead of the server specifying what is returned, the client needs to ask for what it wants
  // Instead of declaring exactly what data you want via a fragment, Relay tries to figure out the minimal amount of data you need in order to update your local graph.
  getFatQuery() {

    return Relay.QL`
       fragment on DeleteUserPayload @relay(pattern: true) {
          store{
          userConnection {
           pageInfoPaginated,
           edgesPaginated{ node }
          }
          }
       }
       
       `
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        store: this.props.store.id
      }
    }];
  }

  // getConfigs() {
  //   return [{
  //     type: 'NODE_DELETE',
  //     parentName: 'store',
  //     parentID: this.props.store.id,
  //     connectionName: 'userConnection',
  //
  //     //The field name in the server response  that contains the DataID of the deleted node
  //     deletedIDFieldName: 'userId',
  //
  //   }];
  // }

  // getOptimisticUpdate() {
  //   return {
  //     store: {
  //       id: this.props.store.id,
  //
  //       userConnection: {
  //         edges: this.props.store.userConnection.edges.filter((userEdge) => {
  //           console.log("userEdge.node.id === this.props.userId:" + (userEdge.node.id === this.props.userId))
  //
  //           return userEdge.node.id !== this.props.userId
  //         })
  //       }
  //
  //     }
  //   };
  // }

}

export default DeleteUserMutation;