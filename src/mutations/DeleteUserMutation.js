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
// { pageInfoPaginated, edges    }   @relay(pattern: true)
getFatQuery() {

    // userEdgePaginated,
    return Relay.QL`
       fragment on DeleteUserPayload   {
          deletedUserId,
          store { id,  userConnection    } 
           }
       
       `
  }


  getConfigs() {
    return [{
      type: 'NODE_DELETE',
      parentName: 'store',
      parentID: this.props.store.id,
      connectionName: 'userConnection',

      //The field name in the server response  that contains the DataID of the deleted node
      deletedIDFieldName: 'deletedUserId',

    }];
  }

  getOptimisticResponseQQQ() {
        console.log("this.props.store DELETE getOptimisticResponse %O",this.props.store)
    return{
      deletedUserId: this.props.userId,
      store:{
        userConnection:{
          edges:{
            node:{
              id: this.props.userId ,
              username: this.props.userId
            }
          }
        }
      }
      // ,store:{
      //   // id: this.props.store.id,
      //   userConnection: this.props.store.userConnection
      // }
    }

    // return {
    //     store:{
    //       id: this.props.store.id,
    //       userConnection :{
    //         edges: this.props.store.userConnection.edges.filter((edge)=>{return edge.node.id !== this.props.userId})
    //       }
    //     }
    // }


    // return {
    //   // userEdge : undefined,
    //   store: {
    //     id: this.props.store.id,
    //
    //     userConnection: {
    //       edges: {
    //         node: {
    //           //  id == username ? ignore, else - render
    //           id: this.props.userId
    //           , username: this.props.userId
    //         }
    //       }
    //     }
    //
    //   }
    // };
  }

}

export default DeleteUserMutation;