import { h, render } from 'preact'
import Application from './Application'

if (process.env.NODE_ENV === 'development') {
  require('preact/devtools')
}

render(<Application />, document.getElementById('app'))
