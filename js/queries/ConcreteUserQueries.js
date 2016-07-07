import Relay from 'react-relay';

export default {
  store: (Component,{userId}) => {
    return Relay.QL`
        query {
          store{
           ${Component.getFragment("store", {userId})}
          }
        }
   `
  }
};

