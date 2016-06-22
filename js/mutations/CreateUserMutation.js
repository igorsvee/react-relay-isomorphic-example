import Relay from 'react-relay';

class CreateUserMutation extends Relay.Mutation {
  getMutation() {
    //the graphql operation for the mutation to invoke
    return Relay.QL`
          mutation{ createUser}
       `
  }

  getVariables() {
    //  prepare variables to be used for the mutation, allows to do some logic on the props before sending them to the server
    console.log("getVariables storeId "+this.props.store.id)
    console.log("this.props.username "+this.props.username)
    //todo doesnt have to be exactly like this in the constructor of   (CreateUserMutation) e.g. story and then story.id fetch manually in here
    return {
      username: this.props.username,
      address: this.props.address,
      password: this.props.password,
    }
  }
  //
  // console

  getFatQuery() {
    console.log("getFatQuery storeId "+this.props.store.id)
    return Relay.QL`
       fragment on CreateUserPayload  {
        
        store {  userConnection    }
       }
       `
  }

  console
  getConfigs() {
    console.log("getConfigs storeId "+this.props.store.id)
    return [{
      type: 'FIELDS_CHANGE',

      fieldIDs: {
        store: this.props.store.id

      }
    }];
  }

  // console
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

  // getOptimisticResponse(){
  //   return {
  //     store:{
  //       id : this.props.store.id,
  //       userConnectionPaginated:{
  //         edges : {
  //           node:{
  //             id: 'GENERATING....',
  //             username: this.props.username,
  //             address: this.props.address ,
  //             password: this.props.password
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