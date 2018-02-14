
/** 1.- simple way, with a setTimeOut */
this.props.dispatch({ type: 'SHOW_NOTIFICATION', text: 'You logged in.' })
setTimeout(() => {
  this.props.dispatch({ type: 'HIDE_NOTIFICATION' })
}, 5000)


/** 2.- sample */
// actions.js
export function showNotification(text) {
    return { type: 'SHOW_NOTIFICATION', text }
}

export function hideNotification() {
    return { type: 'HIDE_NOTIFICATION' }
}

// component.js
import { showNotification, hideNotification } from '../actions'

this.props.dispatch(showNotification('You just logged in.'))
setTimeout(() => {
    this.props.dispatch(hideNotification())
}, 5000)



/** 3.- Extracting Async Action Creator */

// actions.js
function showNotification(id, text) {
  return { type: 'SHOW_NOTIFICATION', id, text }
}
function hideNotification(id) {
  return { type: 'HIDE_NOTIFICATION', id }
}

let nextNotificationId = 0
export function showNotificationWithTimeout(dispatch, text) {
// Assigning IDs to notifications lets reducer ignore HIDE_NOTIFICATION
// for the notification that is not currently visible.
// Alternatively, we could store the interval ID and call
// clearInterval(), but we’d still want to do it in a single place.
const id = nextNotificationId++
dispatch(showNotification(id, text))
  setTimeout(() => {
      dispatch(hideNotification(id))
  }, 5000)
}


// component.js
showNotificationWithTimeout(this.props.dispatch, 'You just logged in.')

// otherComponent.js
showNotificationWithTimeout(this.props.dispatch, 'You just logged out.') 



// 4.- sample -> This looks simpler but we don’t recommend this approach
// The main reason we dislike it is because it forces store to be a singleton
// This makes it very hard to implement server rendering. 
// A singleton store also makes testing harder.
// You can no longer mock a store when testing action creators because they reference a specific real store exported from a specific module. You can’t even reset its state from outside.

// store.js
export default createStore(reducer)

// actions.js
import store from './store'

// ...

let nextNotificationId = 0
export function showNotificationWithTimeout(text) {
  const id = nextNotificationId++
  store.dispatch(showNotification(id, text))

  setTimeout(() => {
    store.dispatch(hideNotification(id))
  }, 5000)
}

// component.js
showNotificationWithTimeout('You just logged in.')

// otherComponent.js
showNotificationWithTimeout('You just logged out.')  


// 4.2 .- Getting back to the previous version:

// actions.js

// ...

let nextNotificationId = 0
export function showNotificationWithTimeout(dispatch, text) {
  const id = nextNotificationId++
  dispatch(showNotification(id, text))

  setTimeout(() => {
    dispatch(hideNotification(id))
  }, 5000)
}

// component.js
showNotificationWithTimeout(this.props.dispatch, 'You just logged in.')

// otherComponent.js
showNotificationWithTimeout(this.props.dispatch, 'You just logged out.')    




/** 5.- Thunk Middleware */

import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

const store = createStore(
  reducer,
  applyMiddleware(thunk)
)

// It still recognizes plain object actions
store.dispatch({ type: 'INCREMENT' })

// But with thunk middleware, it also recognizes functions
store.dispatch(function (dispatch) {
  // ... which themselves may dispatch many times
  dispatch({ type: 'INCREMENT' })
  dispatch({ type: 'INCREMENT' })
  dispatch({ type: 'INCREMENT' })

  setTimeout(() => {
    // ... even asynchronously!
    dispatch({ type: 'DECREMENT' })
  }, 1000)
})


/** When this middleware is enabled, if you dispatch a function, Redux Thunk middleware will give it  dispatch as an argument. */

// Let's see in a real problem

// actions.js
function showNotification(id, text) {
  return { type: 'SHOW_NOTIFICATION', id, text }
}
function hideNotification(id) {
  return { type: 'HIDE_NOTIFICATION', id }
}

let nextNotificationId = 0
export function showNotificationWithTimeout(text) {
  return function (dispatch) {
    const id = nextNotificationId++
    dispatch(showNotification(id, text))

    setTimeout(() => {
      dispatch(hideNotification(id))
    }, 5000)
  }
}



// component.js - to use in our component
showNotificationWithTimeout('You just logged in.')(this.props.dispatch)
/** 
 * We are calling the async action creator to get the inner function that wants just dispatch, and then we pass dispatch.
 */


 /**
  * If Redux Thunk middleware is enabled, any time you attempt to dispatch a function instead of an action object, the middleware will call that function with dispatch method itself as the first argument.
  */

// So we can do this instead:
// component.js
this.props.dispatch(showNotificationWithTimeout('You just logged in.')) // I preffer to use this option over the above way



/**
 * Finally, dispatching an asynchronous action (really, a series of actions) looks no different than dispatching a single action synchronously to the component. Which is good because components shouldn’t care whether something happens synchronously or asynchronously. We just abstracted that away
 */


 // Other pretty way ti use is For example, we can use them with connect(), passing as a props
// actions.js

function showNotification(id, text) {
  return { type: 'SHOW_NOTIFICATION', id, text }
}
function hideNotification(id) {
  return { type: 'HIDE_NOTIFICATION', id }
}

let nextNotificationId = 0
export function showNotificationWithTimeout(text) {
  return function (dispatch) {
    const id = nextNotificationId++
    dispatch(showNotification(id, text))

    setTimeout(() => {
      dispatch(hideNotification(id))
    }, 5000)
  }
}

// component.js

import { connect } from 'react-redux'

// ...

this.props.showNotificationWithTimeout('You just logged in.')

// ...

export default connect(
  mapStateToProps,
  { showNotificationWithTimeout } 
)(MyComponent)


// Reading State in Thunks



// Without using the thunk middleware, you’d just do this check inside the component:

// component.js
if (this.props.areNotificationsEnabled) {
  showNotificationWithTimeout(this.props.dispatch, 'You just logged in.')
}


// However, the point of extracting an action creator was to centralize this repetitive logic across many components. 

/**
 * Fortunately, Redux Thunk offers you a way to read the current state of the Redux store. In addition to dispatch, it also passes getState as the second argument to the function you return from your thunk action creator. This lets the thunk read the current state of the store.
 */



 /**
  * However, the point of extracting an action creator was to centralize this repetitive logic across many components. Fortunately, Redux Thunk offers you a way to read the current state of the Redux store. In addition to dispatch, it also passes getState as the second argument to the function you return from your thunk action creator. This lets the thunk read the current state of the store.
  */


  let nextNotificationId = 0
export function showNotificationWithTimeout(text) {
  return function (dispatch, getState) {
    // Unlike in a regular action creator, we can exit early in a thunk
    // Redux doesn’t care about its return value (or lack of it)
    if (!getState().areNotificationsEnabled) {
      return
    }

    const id = nextNotificationId++
    dispatch(showNotification(id, text))

    setTimeout(() => {
      dispatch(hideNotification(id))
    }, 5000)
  }
}