import Relay from 'react-relay';




export default {
  store: (Component) => {
    return Relay.QL`
        query MainQuery{
              store {${Component.getFragment('store')}}
      } 
   `
  }
};