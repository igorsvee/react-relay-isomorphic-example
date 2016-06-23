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
       fragment on DeleteUserPayload  {
       userEdge,
          store{    userConnection { edgesPaginated { node { username,address,password,activated } }      }     } 
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
     
  //  todo doesnt work
  getOptimisticResponse() {
    // console.log("DELETE  getOptimisticResponse this.props.store  ,%O",this.props.store)
    const newEdges = this.props.store.userConnection.edgesPaginated.filter((userEdge) => {
      // console.log("userEdge.node.id !== this.props.userId %s , username - %s" ,(userEdge.node.id !== this.props.userId),userEdge.node.username)
      //      console.log("userEdge.node %O ",userEdge.node)
      return userEdge.node.__dataID__ !== this.props.userId
    });

    newEdges.forEach(edge =>{
      edge.node.__fragments__  &&  delete edge.node.__fragments__['2::client']

    })
    console.log("edges length %s newEdges Delete: %O",this.props.store.userConnection.edgesPaginated.length,newEdges)
    return {
      store: {
        id: this.props.store.id,

        userConnection: {
          edgesPaginated: newEdges
        }

      }
    };
  }

}

export default DeleteUserMutation;