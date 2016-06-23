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

  // console
  // userEdge,
  // store { userConnection { pageInfoPaginated, edgesPaginated { node { username,address,password,activated } } } }
  getFatQuery() {
    return Relay.QL`
       fragment on CreateUserPayload {
        userEdge  , 
           store { userConnection}
          
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
  //     connectionName: 'userConnection',
  //     // edgeName: 'newUserEdge',
  //     edgeName: 'userEdge',
  //     rangeBehaviors: {
  //       '': 'append'
  //
  //     },
  //   }];
  // }

  // this.props.store.userConnection.edgesPaginated

  getOptimisticResponse() {  //todo if currentNumRecords + 1 < currentlimit
    //  todo doesnt work
    return {
      userEdge: {
        node: {
          // id: '123',
          username: this.props.username,
          address: this.props.address,
          password: this.props.password,
          activated: false
        }
      }
    }

  }

  // getOptimisticResponse() {
  //   return {
  //     store: {
  //       id: this.props.store.id,
  //       userConnection: {
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