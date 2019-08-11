import { h } from 'preact'
import './styles.css'

/**
 * Show a notification for a message when the message is defined
 *
 * @prop {string} message Message to be shown
 * @prop {function} onClose Called when the close button is clicked
 */
const Notifications = ({ message, onClose }) => {
  if (message) {
    function handleClick() {
      onClose()
    }
    return (
      <div className="Notifications">
        <div>
          <span>{message}</span>
        </div>
        <button onClick={handleClick} title="Close Notification">
          ✕
        </button>
      </div>
    )
  }
  return null
}

export default Notifications
