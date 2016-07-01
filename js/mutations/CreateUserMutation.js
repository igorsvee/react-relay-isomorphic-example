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

  // userEdge,
  getFatQuery() {
    return Relay.QL`
       fragment on CreateUserPayload {
            userEdge,
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

  // how to handle response from the server
  // getConfigs() {
  //   return [{
  //     type: 'RANGE_ADD',
  //     //  comes from fat query
  //     parentName: 'store',
  //     parentID: this.props.store.id,
  //     connectionName: 'userConnectionPaginated',
  //     // edgeName: 'newUserEdge',
  //     edgeName: 'userEdge',
  //     rangeBehaviors: {
  //       '': 'append'
  //
  //     },
  //   }];
  // }

  // this.props.store.userConnectionPaginated.edgesPaginated

        
  getOptimisticResponse() {
    const newNode = {
      id: null,
      username: this.props.username,
      address: this.props.address,
      password: this.props.password,
      activated: false
    };

    const currentEdgesLength = this.props.store.userConnectionPaginated.edgesPaginated.length;

    return {
      store: {
        id: this.props.store.id,

        userConnectionPaginated: {
          edgesPaginated: currentEdgesLength + 1 <= this.props.limit && this.props.store.userConnectionPaginated.edgesPaginated.push({node:newNode,optimistic:true})
        }

      },
      // userEdge: {
      //   node: {
      //     id: null,
      //     username: this.props.username,
      //     address: this.props.address,
      //     password: this.props.password,
      //     activated: false
      //   } ,notCreated:true
      // }
    }

  }

  // getOptimisticResponse() {
  //   return {
  //     store: {
  //       id: this.props.store.id,
  //       userConnectionPaginated: {
  //         edgesPaginated: {
  //           node: {
  //             // id: 'fuck',
  //             username: this.props.username,
  //             address: this.props.address,
  //             password: this.props.password,
  //             activated: false
  //           }
  //         }
  //
  //       }
  //     }
  //
  //   }
  // }


}

export default CreateUserMutation;