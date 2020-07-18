import React, { memo } from 'react'
import PropTypes from 'prop-types'

const BrushStyle = {
  display: 'block',
  marginLeft: '7%',
}

const BrushButtonStyle = {
  backgroundColor: 'white',
  display: 'inline-block',
  height: '25px',
  width: '50px',
}

const Brush = ({ brushStart, brushEnd }) => {
  const { height } = brushStart;
  const width = Math.abs(brushStart.x-brushEnd.x);
  const brushStartX = Math.min(brushStart.x, brushEnd.x);

  return (
    <rect
      style={{fill:'blue', fillOpacity: 0.1}}
      height={height}
      width={width}
      x={brushStartX}
    />
  )
}

const BrushActionBar = memo(function BrushActionBar(props) {
  return (
    <div className={"brush-action-bar"} style={BrushStyle}>
      <button style={BrushButtonStyle} onClick={props.resetBrush}>Reset</button>
    </div>
  )
})

Brush.propTypes = {
  brushStart: PropTypes.object.isRequired,
  brushEnd: PropTypes.object.isRequired,
}

BrushActionBar.propTypes = {
  resetBrush: PropTypes.func.isRequired,
}

export { BrushActionBar };
export default memo(Brush);