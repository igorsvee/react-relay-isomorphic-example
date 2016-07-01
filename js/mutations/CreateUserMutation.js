import Relay from 'react-relay';
import User from '../components/User.react'

class CreateUserMutation extends Relay.Mutation {
  getMutation() {
    //the graphql operation for the mutation to invoke
    return Relay.QL`
          mutation{ createUser}
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
       fragment on CreateUserPayload {
           
          store{ id   userConnectionPaginated { pageInfoPaginated, edgesPaginated { node { id, username,address,password,activated } }      }     } 
          
       }
       `
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        store: this.props.store.id,
        // newUserEdge: this.props.newUserId,
      }
    }];
  }

  // how to handle response from the server
  // getConfigs() {
  //   return [{
  //     type: 'RANGE_ADD',
  //     //  comes from fat query
  //     parentName: 'store',
  //     parentID: this.props.store.id,
  //     connectionName: 'userConnectionPaginated',
  //     edgeName: 'newUserEdge',
  //     // edgeName: 'userEdge',
  //     rangeBehaviors: {
  //       '': 'append'
  //
  //     },
  //   }];
  // }

  // this.props.store.userConnectionPaginated.edgesPaginated


  getOptimisticResponse() {
    const currentEdges = this.props.store.userConnectionPaginated.edgesPaginated;
    const currentEdgesLength = currentEdges.length;

    const newEdge = {
      node: {
        id: this.props.newUserId, // irrelevant
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

        userConnectionPaginated: {
          edgesPaginated: currentEdgesLength < this.props.limit && currentEdges.push(newEdge)
        }

      }

    }

  }


}

export default CreateUserMutation;