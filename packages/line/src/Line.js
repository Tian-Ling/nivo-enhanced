/*
 * This file is part of the nivo project.
 *
 * Copyright 2016-present, Raphaël Benitte.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import React, { Fragment, useState, useMemo } from 'react'
import { withContainer, useDimensions, useTheme, SvgWrapper, CartesianMarkers } from '@nivo/core'
import { useInheritedColor } from '@nivo/colors'
import { Axes, Grid } from '@nivo/axes'
import { BoxLegendSvg } from '@nivo/legends'
import { Crosshair } from '@nivo/tooltip'
import { getDataPoints, useBrushTool, useLine } from './hooks'
import { LinePropTypes, LineDefaultProps } from './props'
import Areas from './Areas'
import Lines from './Lines'
import Slices from './Slices'
import Points from './Points'
import Mesh from './Mesh'
import Brush, { BrushActionBar } from './Brush'

const Line = props => {
    const {
        data,
        xScale: xScaleSpec,
        xFormat,
        yScale: yScaleSpec,
        yFormat,
        layers,
        curve,
        areaBaselineValue,

        colors,

        margin: partialMargin,
        width,
        height,

        axisTop,
        axisRight,
        axisBottom,
        axisLeft,
        enableGridX,
        enableGridY,
        gridXValues,
        gridYValues,

        lineWidth,
        enableArea,
        areaOpacity,
        areaBlendMode,

        enablePoints,
        pointSymbol,
        pointSize,
        pointColor,
        pointBorderWidth,
        pointBorderColor,
        enablePointLabel,
        pointLabel,
        pointLabelFormat,
        pointLabelYOffset,

        markers,

        legends,

        isInteractive,

        useMesh,
        debugMesh,

        useBrush,

        onMouseEnter,
        onMouseMove,
        onMouseLeave,
        onClick,

        tooltip,

        enableSlices,
        debugSlices,
        sliceTooltip,

        enableCrosshair,
        crosshairType,
    } = props

    const { margin, innerWidth, innerHeight, outerWidth, outerHeight } = useDimensions(
        width,
        height,
        partialMargin
    )

    const theme = useTheme()
    const getPointColor = useInheritedColor(pointColor, theme)
    const getPointBorderColor = useInheritedColor(pointBorderColor, theme)
    const [lineData, setLineData] = useState(getDataPoints({ maxNumberOfPoints: useBrush ? useBrush.maxNumberOfPoints : {}, data }));

    const { lineGenerator, areaGenerator, series, xScale, yScale, slices, points } = useLine({
        data: lineData,
        xScale: xScaleSpec,
        xFormat,
        yScale: yScaleSpec,
        yFormat,
        width: innerWidth,
        height: innerHeight,
        colors,
        curve,
        areaBaselineValue,
        pointColor,
        pointBorderColor,
        enableSlices,
    })

    const [currentPoint, setCurrentPoint] = useState(null)
    const [currentSlice, setCurrentSlice] = useState(null)
    const [brushStart, setBrushStart] = useState(null)
    const [brushEnd, setBrushEnd] = useState(null)
    const [isSettingBrushRange, setIsSettingBrushRange] = useState(false);
    const [brushPoints, setBrushPoints] = useState(points);
    const calculatedOuterHeight = useMemo(
        () => {
            if (useBrush) {
                return outerHeight - 30;
            }

            return outerHeight;
        },
        [outerHeight]
    )

    const legendData = useMemo(
        () =>
            series
                .map(line => ({
                    id: line.id,
                    label: line.id,
                    color: line.color,
                }))
                .reverse(),
        [series]
    )

    let resetBrush = () => {};

    if (useBrush) {
        const { brushDataCallback, maxNumberOfPoints } = useBrush;
        const brushCallback = brushDataCallback instanceof Function ? brushDataCallback : () => {};

        resetBrush = () => {
            setLineData(getDataPoints({ data, maxNumberOfPoints }));
            setBrushPoints(points);
            brushCallback(data);
        };

        useBrushTool({
            isSettingBrushRange,
            brushStart,
            brushEnd,
            brushDataCallback: brushCallback,
            originalData: data,
            maxNumberOfPoints,
            xScale: xScaleSpec,
            setLineData,
            setBrushStart,
            setBrushEnd,
            points,
            setBrushPoints,
        });
    }

    const layerById = {
        grid: (
            <Grid
                key="grid"
                theme={theme}
                width={innerWidth}
                height={innerHeight}
                xScale={enableGridX ? xScale : null}
                yScale={enableGridY ? yScale : null}
                xValues={gridXValues}
                yValues={gridYValues}
            />
        ),
        markers: (
            <CartesianMarkers
                key="markers"
                markers={markers}
                width={innerWidth}
                height={innerHeight}
                xScale={xScale}
                yScale={yScale}
                theme={theme}
            />
        ),
        axes: (
            <Axes
                key="axes"
                xScale={xScale}
                yScale={yScale}
                width={innerWidth}
                height={innerHeight}
                theme={theme}
                top={axisTop}
                right={axisRight}
                bottom={axisBottom}
                left={axisLeft}
            />
        ),
        areas: null,
        lines: (
            <Lines key="lines" lines={series} lineGenerator={lineGenerator} lineWidth={lineWidth} />
        ),
        slices: null,
        points: null,
        crosshair: null,
        mesh: null,
        legends: legends.map((legend, i) => (
            <BoxLegendSvg
                key={`legend.${i}`}
                {...legend}
                containerWidth={innerWidth}
                containerHeight={innerHeight}
                data={legend.data || legendData}
                theme={theme}
            />
        )),
    }

    if (enableArea) {
        layerById.areas = (
            <Areas
                key="areas"
                areaGenerator={areaGenerator}
                areaOpacity={areaOpacity}
                areaBlendMode={areaBlendMode}
                lines={series}
            />
        )
    }

    if (isInteractive && enableSlices !== false) {
        layerById.slices = (
            <Slices
                key="slices"
                slices={slices}
                axis={enableSlices}
                debug={debugSlices}
                height={innerHeight}
                tooltip={sliceTooltip}
                current={currentSlice}
                setCurrent={setCurrentSlice}
                isSettingBrushRange={useBrush ? isSettingBrushRange : null}
                setIsSettingBrushRange={useBrush ? setIsSettingBrushRange : null}
                setBrushStart={useBrush ? setBrushStart : null}
                setBrushEnd={useBrush ? setBrushEnd : null}
            />
        )
    }

    if (enablePoints) {
        layerById.points = (
            <Points
                key="points"
                points={useBrush ? brushPoints : points}
                symbol={pointSymbol}
                size={pointSize}
                color={getPointColor}
                borderWidth={pointBorderWidth}
                borderColor={getPointBorderColor}
                enableLabel={enablePointLabel}
                label={pointLabel}
                labelFormat={pointLabelFormat}
                labelYOffset={pointLabelYOffset}
            />
        )
    }

    if (isInteractive && enableCrosshair) {
        if (currentPoint !== null) {
            layerById.crosshair = (
                <Crosshair
                    key="crosshair"
                    width={innerWidth}
                    height={innerHeight}
                    x={currentPoint.x}
                    y={currentPoint.y}
                    type={crosshairType}
                />
            )
        }
        if (currentSlice !== null) {
            layerById.crosshair = (
                <Crosshair
                    key="crosshair"
                    width={innerWidth}
                    height={innerHeight}
                    x={currentSlice.x}
                    y={currentSlice.y}
                    type={enableSlices}
                />
            )
        }
    }

    if (isInteractive && useMesh && enableSlices === false) {
        layerById.mesh = (
            <Mesh
                key="mesh"
                points={useBrush ? brushPoints : points}
                width={innerWidth}
                height={innerHeight}
                margin={margin}
                current={currentPoint}
                setCurrent={setCurrentPoint}
                onMouseEnter={onMouseEnter}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                onClick={onClick}
                tooltip={tooltip}
                debug={debugMesh}
            />
        )
    }

    if (isInteractive && useBrush && enableSlices && brushStart && brushEnd) {
        layerById.brush = (
            <Brush
                key="brush"
                brushStart={brushStart}
                brushEnd={brushEnd}
            />
        )
    }

    return (
        <div>
            <SvgWrapper width={outerWidth} height={calculatedOuterHeight} margin={margin}>
                {layers.map((layer, i) => {
                    if (typeof layer === 'function') {
                        const layerPoints = useBrush ? brushPoints : points;

                        return (
                            <Fragment key={i}>
                                {layer({
                                    ...props,
                                    innerWidth,
                                    innerHeight,
                                    series,
                                    slices,
                                    layerPoints,
                                    xScale,
                                    yScale,
                                    lineGenerator,
                                    areaGenerator,
                                })}
                            </Fragment>
                        )
                    }

                    return layerById[layer]
                })}
            </SvgWrapper>
            {
                useBrush ? <BrushActionBar resetBrush={resetBrush} /> : null
            }
        </div>
    )
}

Line.propTypes = LinePropTypes
Line.defaultProps = LineDefaultProps

export default withContainer(Line)
