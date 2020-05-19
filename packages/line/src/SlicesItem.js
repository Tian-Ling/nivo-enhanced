/*
 * This file is part of the nivo project.
 *
 * Copyright 2016-present, Raphaël Benitte.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import React, { memo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useTooltip } from '@nivo/tooltip'

const SlicesItem = ({ slice, axis, debug, tooltip, isCurrent, isMouseDown, setCurrent, setBrushStart, setBrushEnd, setIsMouseDown }) => {
    const { showTooltipFromEvent, hideTooltip } = useTooltip()


    const handleMouseDown = useCallback(
        () => {
            setBrushStart(slice);
            setBrushEnd(null);
            setIsMouseDown(true);
        },
        [slice]
    )

    const handleMouseUp = useCallback(
        () => {
            setBrushEnd(slice);
            setIsMouseDown(false);
        }
    )

    const handleMouseEnter = useCallback(
        event => {
            showTooltipFromEvent(React.createElement(tooltip, { slice, axis }), event, 'right')
            setCurrent(slice)
        },
        [showTooltipFromEvent, tooltip, slice]
    )

    const handleMouseMove = useCallback(
        event => {
            showTooltipFromEvent(React.createElement(tooltip, { slice, axis }), event, 'right')
            if (isMouseDown) {
                setBrushEnd(slice);
            }
        },
        [isMouseDown, showTooltipFromEvent, tooltip, slice]
    )

    const handleMouseLeave = useCallback(() => {
        hideTooltip()
        setCurrent(null)
    }, [hideTooltip])

    return (
        <rect
            x={slice.x0}
            y={slice.y0}
            width={slice.width}
            height={slice.height}
            stroke="red"
            strokeWidth={debug ? 1 : 0}
            strokeOpacity={0.75}
            fill="red"
            fillOpacity={isCurrent && debug ? 0.35 : 0}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        />
    )
}

SlicesItem.propTypes = {
    slice: PropTypes.object.isRequired,
    axis: PropTypes.oneOf(['x', 'y']).isRequired,
    debug: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    tooltip: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    isCurrent: PropTypes.bool.isRequired,
    setCurrent: PropTypes.func.isRequired,
    setBrushStart: PropTypes.func,
    setBrushEnd: PropTypes.func,
    isMouseDown: PropTypes.bool.isRequired,
    setIsMouseDown: PropTypes.func.isRequired,
}

export default memo(SlicesItem)
