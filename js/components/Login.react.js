import React from "react";
import Relay from 'react-relay'


import {withRouter} from 'react-router'

const LOGIN_START = 'start';
const LOGIN_SUCCESS = 'success';
const LOGIN_FAIL = 'fail';


class Login extends React.Component {

  constructor(props, context) {
    super(props, context);


    this.state = {
      loginStatus: null
    }

  }

  onSubmit =(e)=> {
    e.preventDefault();

    const user = {
      username: this.refs.username.value,
      password: this.refs.password.value
    };
    console.log("sending user: %O", user)

    this.setState({
      loginStatus: LOGIN_START
    });

    fetch('/login', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user),

      credentials: 'include'
    })
        .then(response => response.json()
            .then(json => ({json, response})))
        .then(({json, response}) => {
          if (!response.ok) {
            console.log("NOT OK");

            this.setState({
              loginStatus: LOGIN_FAIL
            });
            return Promise.reject(json);
          }

          console.log("OK !")

          this.setState({
            loginStatus: LOGIN_SUCCESS
          },
              ()=> {
                this.props.router.push({
                  pathname: `/users`
                  ,  state: {forceFetch: true}
                })
          });


          return json;
        });


  }

  handleTestEndpoint=() => {
    fetch('/ajax', {
      method: 'get',
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
            console.log("NOT OK")

            return Promise.reject(json);
          }

          console.log("OK!")


          return json;
        });
  }


  getStatusMessage =(status)=> {
    switch (status) {
      case LOGIN_START:
        return 'Logging in...'
      case LOGIN_SUCCESS:
        return 'Login success! redirecting to users ...'
      case LOGIN_FAIL:
        return 'Login fail'

    }
  }

  render() {
    const status = this.state.loginStatus;

    return (<div>

          <form onSubmit={this.onSubmit}>
            <input name="username" type="text" ref="username"
                   placeholder="Username"/>
            <input name="password" type="password" ref="password"
                   placeholder="Password"/>
                {status != LOGIN_SUCCESS && <input type="submit" value="Log in"/> }
          </form>
          {this.getStatusMessage(status)}

          <button onClick={this.handleTestEndpoint}>Test</button>


        </div>



    )
  }
}


export default withRouter(Login);