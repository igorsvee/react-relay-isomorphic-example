import React from "react";
import Relay from 'react-relay'


import {withRouter} from 'react-router'
import R from'ramda';

import autobind from 'autobind-decorator'

const LOGIN_START = 'start';
const LOGIN_SUCCESS = 'success';
const LOGIN_FAIL = 'fail';

import {forceFetch, promisify} from'../utils/RelayUtils'

@autobind
class Login extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      loginStatus: null
    }

  }

  goUsers() {
    this.props.router.push({
      pathname: `/users`
      , state: {loginSuccess: true}
    })
  }

  onSubmit = (e)=> {
    e.preventDefault();

    const user = {
      username: this.refs.username.value,
      password: this.refs.password.value
    };

    promisify(this.setLoginStartStatus)
        .then(()=> {
          return fetch('/login', {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(user),
            credentials: 'include'
          })
        })
        .then(response => response.json()
            .then(json => ({json, response})))
        .then(({json, response}) => {
          if (!response.ok) {
            console.log("LOGIN NOT OK");
            return Promise.reject(json);
          }
          console.log("LOGIN OK");
          return json;
        })
        .then(forceFetch.curry(this.props.relay))
        .then(this.setSuccessfulLoginStatus)
        .then(this.goUsers)
        .catch(this.setLoginFailedStatus)


  };

  setSuccessfulLoginStatus = this._setLoginStatus.curry(LOGIN_SUCCESS);
  setLoginFailedStatus = this._setLoginStatus.curry(LOGIN_FAIL);
  setLoginStartStatus = this._setLoginStatus.curry(LOGIN_START);

  _setLoginStatus(status) {
    this.setState({loginStatus: status})
  }


  render() {
    const status = this.state.loginStatus;

    const getStatusMessage = (status)=> {
      switch (status) {
        case LOGIN_START:
          return 'Logging in...';
        case LOGIN_SUCCESS:
          return 'Login success! redirecting to users ...';
        case LOGIN_FAIL:
          return 'Login failed';


      }
    };

    return (<div>

          <form onSubmit={this.onSubmit}>
            <input name="username" type="text" ref="username"
                   placeholder="Username"/>
            <input name="password" type="password" ref="password"
                   placeholder="Password"/>
                {status != LOGIN_SUCCESS && <input type="submit" value="Log in"/> }
          </form>
          {getStatusMessage(status)}

        </div>



    )
  }
}


Login = Relay.createContainer(Login, {

  fragments: {
    store: () => Relay.QL`
     fragment UserInfo on Store{
      sessionId
       
     }
     `
  }
});


export default withRouter(Login);