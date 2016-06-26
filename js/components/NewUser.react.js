import React from "react";
import Relay from 'react-relay'

//  doesnt have an id
class NewUser extends React.Component {

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const {user} = this.props;

    return (
        <tr >
          <td>generating...</td>
          <td>{user.username}</td>
          <td>{user.address}</td>
          <td>         {user.activated === true ? 'YES' : 'NO'} {user.activated ?
              <button disabled="disabled">Deactivate</button>
              : <button disabled="disabled">Activate</button>

          }</td>
          <td>
            <button disabled="disabled">Details</button>
          </td>
          <td>
            <button disabled="disabled">X</button>
          </td>

        </tr>


    )
  }
}



export default NewUser;