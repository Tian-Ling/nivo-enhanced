/*
 * This file is part of the nivo project.
 *
 * Copyright 2016-present, Raphaël Benitte.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { useEffect, useLayoutEffect, useMemo } from 'react'
import { area, line } from 'd3-shape'
import { curveFromProp, useTheme, useValueFormatter } from '@nivo/core'
import { useOrdinalColorScale, useInheritedColor } from '@nivo/colors'
import { computeXYScalesForSeries, getSeriesDataParser } from 'nivo-enhanced-scales'
import { LineDefaultProps } from './props'

export const useLineGenerator = ({ curve }) => {
    return useMemo(
        () =>
            line()
                .defined(d => d.x !== null && d.y !== null)
                .x(d => d.x)
                .y(d => d.y)
                .curve(curveFromProp(curve)),
        [curve]
    )
}

export const useAreaGenerator = ({ curve, yScale, areaBaselineValue }) => {
    return useMemo(() => {
        return area()
            .defined(d => d.x !== null && d.y !== null)
            .x(d => d.x)
            .y1(d => d.y)
            .curve(curveFromProp(curve))
            .y0(yScale(areaBaselineValue))
    }, [curve, yScale, areaBaselineValue])
}

const usePoints = ({ series, getPointColor, getPointBorderColor, formatX, formatY }) => {
    return useMemo(() => {
        return series.reduce((acc, serie) => {
            return [
                ...acc,
                ...serie.data
                    .filter(datum => datum.position.x !== null && datum.position.y !== null)
                    .map((datum, i) => {
                        const point = {
                            id: `${serie.id}.${i}`,
                            index: acc.length + i,
                            serieId: serie.id,
                            serieColor: serie.color,
                            x: datum.position.x,
                            y: datum.position.y,
                        }
                        point.color = getPointColor(serie)
                        point.borderColor = getPointBorderColor(point)
                        point.data = {
                            ...datum.data,
                            xFormatted: formatX(datum.data.x),
                            yFormatted: formatY(datum.data.y),
                        }

                        return point
                    }),
            ]
        }, [])
    }, [series, getPointColor, getPointBorderColor, formatX, formatY])
}

export const useSlices = ({ enableSlices, points, width, height }) => {
    return useMemo(() => {
        if (enableSlices === false) return []

        if (enableSlices === 'x') {
            const map = new Map()
            points.forEach(point => {
                if (point.data.x === null || point.data.y === null) return
                if (!map.has(point.x)) map.set(point.x, [point])
                else map.get(point.x).push(point)
            })
            return Array.from(map.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([x, slicePoints], i, slices) => {
                    const prevSlice = slices[i - 1]
                    const nextSlice = slices[i + 1]

                    let x0
                    if (!prevSlice) x0 = x
                    else x0 = x - (x - prevSlice[0]) / 2

                    let sliceWidth
                    if (!nextSlice) sliceWidth = width - x0
                    else sliceWidth = x - x0 + (nextSlice[0] - x) / 2

                    return {
                        id: x,
                        x0,
                        x,
                        y0: 0,
                        y: 0,
                        width: sliceWidth,
                        height,
                        points: slicePoints.reverse(),
                    }
                })
        } else if (enableSlices === 'y') {
            const map = new Map()
            points.forEach(point => {
                if (point.data.x === null || point.data.y === null) return
                if (!map.has(point.y)) map.set(point.y, [point])
                else map.get(point.y).push(point)
            })
            return Array.from(map.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([y, slicePoints], i, slices) => {
                    const prevSlice = slices[i - 1]
                    const nextSlice = slices[i + 1]

                    let y0
                    if (!prevSlice) y0 = y
                    else y0 = y - (y - prevSlice[0]) / 2

                    let sliceHeight
                    if (!nextSlice) sliceHeight = height - y0
                    else sliceHeight = y - y0 + (nextSlice[0] - y) / 2

                    return {
                        id: y,
                        x0: 0,
                        x: 0,
                        y0,
                        y,
                        width,
                        height: sliceHeight,
                        points: slicePoints.reverse(),
                    }
                })
        }
    }, [enableSlices, points])
}

export const useLine = ({
    data,
    xScale: xScaleSpec = LineDefaultProps.xScale,
    xFormat,
    yScale: yScaleSpec = LineDefaultProps.yScale,
    yFormat,
    width,
    height,
    colors = LineDefaultProps.colors,
    curve = LineDefaultProps.curve,
    areaBaselineValue = LineDefaultProps.areaBaselineValue,
    pointColor = LineDefaultProps.pointColor,
    pointBorderColor = LineDefaultProps.pointBorderColor,
    enableSlices = LineDefaultProps.enableSlicesTooltip,
}) => {
    const formatX = useValueFormatter(xFormat)
    const formatY = useValueFormatter(yFormat)
    const getColor = useOrdinalColorScale(colors, 'id')
    const theme = useTheme()
    const getPointColor = useInheritedColor(pointColor, theme)
    const getPointBorderColor = useInheritedColor(pointBorderColor, theme)

    const { xScale, yScale, series: rawSeries } = useMemo(
        () => computeXYScalesForSeries(data, xScaleSpec, yScaleSpec, width, height),
        [data, xScaleSpec, yScaleSpec, width, height]
    )

    const series = useMemo(
        () =>
            rawSeries.map(serie => ({
                ...serie,
                color: getColor(serie),
            })),
        [rawSeries, getColor]
    )

    const points = usePoints({
        series,
        getPointColor,
        getPointBorderColor,
        formatX,
        formatY,
    })

    const slices = useSlices({
        enableSlices,
        points,
        width,
        height,
    })

    const lineGenerator = useLineGenerator({ curve })
    const areaGenerator = useAreaGenerator({
        curve,
        yScale,
        areaBaselineValue,
    })

    return {
        lineGenerator,
        areaGenerator,
        getColor,
        series,
        xScale,
        yScale,
        slices,
        points,
    }
}

export const useBrushTool = ({
    isSettingBrushRange,
    brushStart,
    brushEnd,
    brushDataCallback,
    originalData,
    xScale: xScaleSpec = LineDefaultProps.xScale,
    setLineData,
    setBrushStart,
    setBrushEnd,
    points,
    setBrushPoints,
}) => {
    useEffect(() => {
        if (!isSettingBrushRange && brushStart && brushEnd) {
            const brushes = [brushStart, brushEnd];
            const [startPoint, endPoint] = [...brushes].sort((brushA, brushB) => brushA.x - brushB.x).map(brush => brush.points[0]);
            const brushCallback = brushDataCallback instanceof Function ? brushDataCallback : () => {};

            if (startPoint === endPoint) {
                setLineData(originalData);
                brushCallback(originalData);
                return;
            }

            const dataParser = getSeriesDataParser(xScaleSpec);

            const filteredData = [];
            originalData.forEach(datum => {
                const dataPoints = datum.data.filter(dataPoint => dataParser(dataPoint.x) >= startPoint.data.x && dataParser(dataPoint.x) <= endPoint.data.x);
                const brushDatum = {...datum, data: dataPoints };
                filteredData.push(brushDatum);
            });

            brushCallback(filteredData);
            
            setLineData(filteredData);
            setBrushStart(null);
            setBrushEnd(null);
        }
    }, [brushStart, brushEnd, isSettingBrushRange])

    useEffect(() => {
        setBrushPoints(points);
    }, [points])
};

export const useLimitPoints = ({
    maxNumberOfPoints,
    lineData,
    setLineData,
}) => {
    useLayoutEffect(() => {
        if (maxNumberOfPoints && lineData.some(datum => datum.data.length > maxNumberOfPoints))
        {
            const newData = [];
    
            lineData.forEach(datum => {
                const dataSize = datum.data.length;
    
                if (dataSize > maxNumberOfPoints) {
                    const shrinkFactor = Math.ceil(dataSize/maxNumberOfPoints);
    
                    const originalData = datum.data;
                    const shrunkData = [];
        
                    for (let i = 0; i < dataSize; i += shrinkFactor) {
                        shrunkData.push(originalData[i]);    
                    }   
                    
                    // Always show the last point
                    if (dataSize % shrinkFactor !== 0) {
                        shrunkData.push(originalData[originalData.length-1]);
                    }
        
                    newData.push({ ...datum, data: shrunkData });
                } else {
                    newData.push(datum);
                }
            });
    
            setLineData(newData);
        }
    }, [lineData, maxNumberOfPoints])
}
