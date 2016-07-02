import React from 'react';
import Relay from 'react-relay';

import {Link} from 'react-router';

import css from './UserApp.css'

import styleable from 'react-styleable'
@styleable(css)
class UserApp extends React.Component {

  shouldComponentUpdate(nextProps){
    return this.props.children != nextProps.children
  }

  render() {
    return (
        <div>
          <div className={this.props.css['main-header']}>
            <Link to="/users">Users</Link>

          </div>
          {this.props.children}
          </div>


    )
  }
}


export default UserApp;