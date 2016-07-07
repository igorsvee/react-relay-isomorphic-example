import React from 'react';
import Relay from 'react-relay';

import {Link} from 'react-router';

import css from './UserApp.css'

import styleable from 'react-styleable'
@styleable(css)

class UserApp extends React.Component {


  handleLogout = ()=> {
    fetch('/logout', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },

      credentials: 'include'
    })
        .then(response => response.json()
            .then(json => ({json, response})))
        .then(({json, response}) => {
          if (!response.ok) {
            console.log("Logout NOT OK");

            return Promise.reject(json);
          }


          console.log("Logout OK !")
          this.props.relay.forceFetch();

          return json;
        });
  }

  render() {
    return (
        <div>
          <div className={this.props.css['main-header']}>
            <Link to="/">Home</Link>
            <Link to="/users">Users</Link>
               {this.props.store.sessionId ?
                   <a className={this.props.css.link} onClick={this.handleLogout}>Logout</a>
                   : <Link to="/login">Login</Link>}
          </div>
          {this.props.children}
        </div>


    )
  }
}


UserApp = Relay.createContainer(UserApp, {
  fragments: {
    store: () => Relay.QL`
     fragment UserInfo on Store{
      sessionId
     }
     `
  }
});


export default UserApp;