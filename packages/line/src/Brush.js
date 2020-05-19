import React, { memo } from 'react'
import PropTypes from 'prop-types'

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

Brush.propTypes = {
  brushStart: PropTypes.object.isRequired,
  brushEnd: PropTypes.object.isRequired,
}

export default memo(Brush);