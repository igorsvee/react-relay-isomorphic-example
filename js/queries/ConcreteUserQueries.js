import Relay from 'react-relay';

export default {
  store: (Component,{userId}) => {
    // console.log(Object.keys(Component))
    console.log("Component 2nd %O",userId)
    return Relay.QL`
        query {
          store{
           ${Component.getFragment("store", {userId})}
          }
        }
   `
  }
};

