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
// (limit: ${this.props.relayVariables.limit},page: ${this.props.relayVariables.page})
  getFatQuery() {

    // userEdgePaginated,
    return Relay.QL`
       fragment on DeleteUserPayload  {
          store{    userConnectionPaginated { pageInfoPaginated, edgesPaginated { node { id, username,address,password,activated } }      }     } 
           }
       
       `
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        store: this.props.store.id,
      }
    }];
  }

  // getConfigs() {
  //   return [{
  //     type: 'NODE_DELETE',
  //     parentName: 'store',
  //     parentID: this.props.store.id,
  //     connectionName: 'userConnectionPaginated',
  //
  //     //The field name in the server response  that contains the DataID of the deleted node
  //     deletedIDFieldName: 'userId',
  //
  //   }];
  // }

  getOptimisticResponse() {
    /*
     const newEdges = this.props.store.userConnectionPaginated.edgesPaginated.filter((userEdge) => {
     return userEdge.node.__dataID__ !== this.props.userId
     });

     newEdges.forEach(edge => {
     // edge.node.__fragments__  &&  delete edge.node.__fragments__['2::client']

     })
     this.props.store.userConnectionPaginated.edgesPaginated.forEach((edge) => {
     // edge.node.__fragments__  &&  delete edge.node.__fragments__['2::client']
     })

     const indexOfEdge = this.props.store.userConnectionPaginated.edgesPaginated.findIndex(userEdge => {
     return userEdge.node.__dataID__ == this.props.userId
     })

     console.log("before this.props.store.userConnectionPaginated.edgesPaginated %O", this.props.store.userConnectionPaginated.edgesPaginated)
     // this.props.store.userConnectionPaginated.edgesPaginated.splice(indexOfEdge,1);
     console.log("after this.props.store.userConnectionPaginated.edgesPaginated %O", this.props.store.userConnectionPaginated.edgesPaginated)

     */
    return {
      // userEdge : undefined,
      store: {
        id: this.props.store.id,

        userConnectionPaginated: {
          edgesPaginated: {
            node: {
              //  id == username ? ignore, else - render
              id: this.props.userId
              , username: this.props.userId
            }
          }
        }

      }
    };
  }

}

export default DeleteUserMutation;