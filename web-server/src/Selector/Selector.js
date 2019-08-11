import { h } from 'preact'
import './styles.css'

/**
 * Allow user to select one choice given a list of choices
 *
 * @prop {function} onSelect Called with the selected choice when it's selected
 *                           (Choice) => void
 * @prop {Array<Choice>} choices List Objects to select.
 * @prop {string} selected Index for the selected choice
 * @prop {string} indexedKey Key that represents the index of the choice
 * @prop {function} labelFromChoice Create choice's label from a choice
 *                                  (Choice) => String
 */
const Selector = props => {
  const { choices, selected, onSelect, indexedKey, labelFromChoice } = props
  if (choices.length === 0) {
    return (
      <div className="Selector empty">
        <span>Nothing to choose</span>
      </div>
    )
  }
  return (
    <form className="Selector">
      {choices.map(choice => [
        <input
          type="radio"
          key={choice[indexedKey]}
          value={choice[indexedKey]}
          checked={selected === choice[indexedKey]}
          onChange={() => {
            onSelect(choice)
          }}
        />,
        <label
          for={choice[indexedKey]}
          onClick={() => {
            onSelect(choice)
          }}
        >
          {labelFromChoice(choice)}
        </label>,
        <br />
      ])}
    </form>
  )
}
export default Selector
