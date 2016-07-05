import React from "react";
import Relay from 'react-relay'

class UserLoading extends React.Component {

  static propTypes = {
    message: React.PropTypes.string.isRequired,
  };

  shouldComponentUpdate(nextProps) {
    return this.props.message != nextProps.message;
  }

  render() {
    const message = this.props.message;

    return (
        <h2>{message}</h2>
    )
  }
}


export default UserLoading;