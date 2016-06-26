import React from 'react';
import Relay from 'react-relay';

import {Link} from 'react-router';

class UserApp extends React.Component {

  shouldComponentUpdate(nextProps){
    return this.props.children != nextProps.children
  }

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


export default UserApp;