import React from 'react';
import Relay from 'react-relay';

import {Link} from 'react-router';

class UserApp extends React.Component {


  render() {

    return (
        <div>
          <h1>User app root</h1>
          <ul>
            <li><Link to="/users">Users</Link></li>
          </ul>
          {this.props.children}
        </div>
    )
  }
}

UserApp = Relay.createContainer(UserApp, {
  fragments: {
// # This fragment only applies to objects of type 'Store'.
    store: (Component) => Relay.QL `
  
      fragment on Store {
         id
      }
      `
  }
})

export default UserApp;