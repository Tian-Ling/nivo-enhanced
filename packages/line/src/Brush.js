import React, { memo } from 'react'
import PropTypes from 'prop-types'

const BrushStyle = {
  display: 'block',
  marginLeft: '7%',
}

const BrushButtonStyle = {
  backgroundColor: 'white',
  display: 'inline-block',
  fontSize: 'small'
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

const BrushActionBar = memo(function BrushActionBar({ style, resetBrush }) {
  return (
    <div className={"brush-action-bar"} style={BrushStyle}>
      <button className={"brush-reset-button"} style={style ? style : BrushButtonStyle} onClick={resetBrush}>Reset</button>
    </div>
  )
})

Brush.propTypes = {
  brushStart: PropTypes.object.isRequired,
  brushEnd: PropTypes.object.isRequired,
}

BrushActionBar.propTypes = {
  style: PropTypes.object,
  resetBrush: PropTypes.func.isRequired,
}

export { BrushActionBar };
export default memo(Brush);