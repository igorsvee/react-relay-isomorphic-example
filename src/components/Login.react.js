import React from "react";
import Relay from 'react-relay'


import {withRouter} from 'react-router'

import autobind from 'autobind-decorator'

const LOGIN_START = 'start';
const LOGIN_SUCCESS = 'success';
const LOGIN_FAIL = 'fail';

import {forceFetch, promisify,checkResponseOk} from'../utils/RelayUtils'
import {toUserRelayId} from '../utils/RelayUtils'
@autobind
class Login extends React.Component {


  constructor(props, context) {
    super(props, context);

    this.state = {
      loginStatus: null
    }
  }

  onSubmit = (e)=> {
    e.preventDefault();

    const user = {
      username: this.refs.username.value,
      password: this.refs.password.value
    };

    const goUsers = () => (
        this.props.router.push({
          pathname: `/users`
          , state: {loginSuccess: true}
        })
    );

    const setLoginStatus = (loginStatus) => {
      this.setState({loginStatus})
    };

    const forceFetchWithEmptyPartialVariables = forceFetch.curry(this.props.relay, {});
    const setSuccessfulLoginStatus = setLoginStatus.curry(LOGIN_SUCCESS);
    const setLoginFailedStatus = setLoginStatus.curry(LOGIN_FAIL);
    const setLoginStartStatus = setLoginStatus.curry(LOGIN_START);

    promisify(setLoginStartStatus)
        .then(() => (
            fetch('/login', {
              method: 'post',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(user),
              credentials: 'include'
            })
        ))
        .then(checkResponseOk)
        .then(forceFetchWithEmptyPartialVariables)
        .then(setSuccessfulLoginStatus)
        .then(goUsers)
        .catch(setLoginFailedStatus)
  };

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