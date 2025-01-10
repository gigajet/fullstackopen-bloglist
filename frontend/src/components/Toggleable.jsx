import {forwardRef, useImperativeHandle, useState} from 'react'

/*
<Toggleable buttonLabel="labelSomething">
    <Child/>
</Toggleable>
*/
const Toggleable=forwardRef((props,ref)=>{
  const [visible, setVisible]=useState(false)
  const showIfVisible={display: visible ? '' : 'none'}
  const showIfNotVisible={display: visible ? 'none' : ''}

  useImperativeHandle(ref, ()=>{
    return {
      setVisibility: (v)=>{setVisible(v)}
    }
  })

  return (
    <>
      <div style={showIfVisible}>
        {props.children}
        <button onClick={()=>setVisible(false)}>cancel</button>
      </div>
      <div style={showIfNotVisible}>
        <button onClick={()=>setVisible(true)}>{props.buttonLabel}</button>
      </div>
    </>
  )
})

export default Toggleable
