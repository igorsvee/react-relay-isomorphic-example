import Relay from 'react-relay';



   
export default {
  store: (Component) => Relay.QL`
        query MainQuery{
              store {${Component.getFragment('store')}}
      } 
   `
};