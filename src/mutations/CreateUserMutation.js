import Relay from 'react-relay';
import User from '../components/User.react'

class CreateUserMutation extends Relay.Mutation {
  getMutation() {
    //the graphql operation for the mutation to invoke
    return Relay.QL`
          mutation{ createUser }
       `
  }


  getVariables() {
    //  prepare variables to be used for the mutation, allows to do some logic on the props before sending them to the server

    return {
      username: this.props.username,
      address: this.props.address,
      password: this.props.password
    }
  }


  //  newUserEdge ,newUserId  ,
  getFatQuery() {
    return Relay.QL`
       fragment on CreateUserPayload @relay(pattern: true) {
              newUserEdge,
          store{ id   userConnection { pageInfoPaginated, edges      }     } 
          
       }
       `
  }

  // how to handle response from the server
  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      //  comes from fat query
      parentName: 'store',
      parentID: this.props.store.id,
      connectionName: 'userConnection',
      edgeName: 'newUserEdge',
      // edgeName: 'userEdge',
      rangeBehaviors: {
        '': 'append'

      },
    }];
  }

  getOptimisticResponseQQQ() {
    if (this.props.store.userConnection) { // if the store isn't empty, modify it
      const currentEdges = this.props.store.userConnection.edges;
      const currentEdgesLength = currentEdges.length;

      const newEdge = {
        node: {
          // id: this.props.newUserId, // irrelevant
          id: null,
          username: this.props.username,
          address: this.props.address,
          password: this.props.password,
          activated: false
        }
        , optimistic: true
      };

      return {
        // newUserEdge: newEdge,
        store: {
          id: this.props.store.id,

          userConnection: {
            edges: currentEdgesLength < this.props.limit && currentEdges.push(newEdge)
          }

        }

      }
    } else {
      return {}
    }


  }


}

export default CreateUserMutation;