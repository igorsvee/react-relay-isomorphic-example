import Relay from 'react-relay';

class ToggleUserActivatedMutation extends Relay.Mutation {
  getMutation() {
    //the graphql operation for the mutation to invoke  on the server
    return Relay.QL`
          mutation { toggleUserActivated }
       `
  }

  getVariables() {
    //  prepare variables to be used for the mutation, allows to do some logic on the props before sending them to the server
    //  also has userBeforeUpdate
    return {
      activated: this.props.activated,
      id: this.props.userId,
    }

  }
          console
  //  more explicit one also works
  // store{ userConnection(id: "${this.props.id}", first:1) {    edges{ node }   }     }   }
  getFatQuery() {
    return Relay.QL`
       fragment on ToggleUserActivatedPayload {
       store{ userConnection(id: "${this.props.userId}", first:1) {   edgesPaginated{ node { activated } }   }    }   }
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
              id: this.props.userId,
              activated: this.props.activated

            }
          }

        }
      }

    }
  }


}

export default ToggleUserActivatedMutation;