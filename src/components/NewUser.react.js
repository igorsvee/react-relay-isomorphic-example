import React from "react";
import Relay from 'react-relay'

//  doesnt have an id
class NewUser extends React.Component {

  static propTypes = {
    user: React.PropTypes.object.isRequired,
  };

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const {username, address, activated} = this.props.user;

    const getDisabledButtonWithTitle = (title) => <button disabled="disabled">{title}</button>;

    return (
        <tr >
          <td>generating...</td>
          <td>{username}</td>
          <td>{address}</td>
          <td>         {activated ? 'YES' : 'NO'}
                       {activated ? getDisabledButtonWithTitle('Deactivate') : getDisabledButtonWithTitle('Activate')}
          </td>
          <td>
            {getDisabledButtonWithTitle('Details')}
          </td>
          <td>
            {getDisabledButtonWithTitle('X')}
          </td>

        </tr>


    )
  }
}


export default NewUser;