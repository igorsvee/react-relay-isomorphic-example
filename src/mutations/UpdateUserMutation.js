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
  // store{ userConnectionPaginated(id: "${this.props.id}", first:1) {    edges{ node }   }     }   }
  getFatQuery() {
    return Relay.QL`
       fragment on UpdateUserPayload {
       store{ userConnectionPaginated(id: "${this.props.id}")     }   }
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


  getOptimisticResponse() {
    return {
      store: {
        id: this.props.storeId,
        userConnectionPaginated: {
          edgesPaginated: {
            node: {
              id: this.props.id,
              username: this.props.username,
              address: this.props.address
            }
          }

        }
      }

    }
  }


}

export default UpdateUserMutation;