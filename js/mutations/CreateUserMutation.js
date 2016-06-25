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
  // store { userConnection { pageInfoPaginated, edgesPaginated { node { username,address,password,activated } } } }
  getFatQuery() {
    return Relay.QL`
       fragment on CreateUserPayload {
            userEdge,
          store{    userConnection { edgesPaginated { node { id, username,address,password,activated } }      }     } 
          
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

        
  getOptimisticResponse() {
    const newNode = {
      id: null,
      username: this.props.username,
      address: this.props.address,
      password: this.props.password,
      activated: false
    };

    const currentEdgesLength = this.props.store.userConnection.edgesPaginated.length;

    return {
      store: {
        id: this.props.store.id,

        userConnection: {
          edgesPaginated: currentEdgesLength + 1 <= this.props.limit && this.props.store.userConnection.edgesPaginated.push({node:newNode,notCreated:true})

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