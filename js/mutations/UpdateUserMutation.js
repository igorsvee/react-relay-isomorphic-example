import Relay from 'react-relay';

class UpdateUserMutation extends Relay.Mutation {
  getMutation() {
    //the graphql operation for the mutation to invoke  on the server
    return Relay.QL`
          mutation { updateUser }
       `
  }

  getVariables() {
    //  prepare variables to be used for the mutation, allows to do some logic on the props before sending them to the server
    //  also has userBeforeUpdate
    return {
      username: this.props.username,
      id: this.props.id,
      address: this.props.address
    }

  }

  //  more explicit one also works
  // store{ userConnection(id: "${this.props.id}", first:1) {    edges{ node }   }     }   }
  getFatQuery() {
    return Relay.QL`
       fragment on UpdateUserPayload {
       store{ userConnection(id: "${this.props.id}")     }   }
       `
  }

  //  how to handle response from the server
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',

      fieldIDs: {
        store: this.props.storeId
      }
    }];
  }


  getOptimisticResponse(){
   return {
     store:{
       id : this.props.storeId,
       userConnection:{
         edgesPaginated : {
           node:{
             id: this.props.id,
             // set to previous values if not updated
             username: this.props.username ? this.props.username : this.props.userBeforeUpdate.username ,
             address: this.props.address ? this.props.address : this.props.userBeforeUpdate.address
           }
         }

       }
     }

   }
  }


}

export default UpdateUserMutation;