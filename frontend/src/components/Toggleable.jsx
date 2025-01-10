import { forwardRef, useImperativeHandle, useState } from 'react'
import PropTypes from 'prop-types'

/*
<Toggleable buttonLabel="labelSomething">
    <Child/>
</Toggleable>
*/
const Toggleable=forwardRef((props,ref) => {
  const [visible, setVisible]=useState(false)
  const showIfVisible={ display: visible ? '' : 'none' }
  const showIfNotVisible={ display: visible ? 'none' : '' }

  useImperativeHandle(ref, () => {
    return {
      setVisibility: (v) => {setVisible(v)}
    }
  })

  return (
    <>
      <div style={showIfVisible}>
        {props.children}
        <button onClick={ () => setVisible(false) }>cancel</button>
      </div>
      <div style={showIfNotVisible}>
        <button onClick={ () => setVisible(true) }>{props.buttonLabel}</button>
      </div>
    </>
  )
})

Toggleable.displayName='Toggleable'
Toggleable.propTypes={
  buttonLabel: PropTypes.string.isRequired,
}

export default Toggleable
