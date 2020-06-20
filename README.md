**nivo enhanced** Fork of nivo adding extra functionality

## Added Features

### Line Component

**Brush Tool**

The brush tool allows zooming in on a data range to view certain data points within large data sets with greater detail.

Parameters:
In its simplest form the brush tool can be used by adding the `useBrush` attribute to the Line component. Optional parameters for the brush tool can be used by setting the `useBrush` attribute to an object containing values for any paramters that are required.

Optional parameters are:

`brushDataCallback`

A function that is passed the value of the filtered data set after the brush tool is used. For example if the domain of the data set ranges from x=0 to x=100 and the brush tool is used to select the range between x=40 and x=60 this function will be passed the dataset of the brush tool range selected.

`maxNumberOfPoints`

This parameter sets the maximum number of points that are displayed on the graph at any one time. When the brush tool is used to select a particular range this parameter will still limit the number of points shown if it greater than the value provided.


Usage Example:
```
<Line
  data={dataSet}
  enableSlices={'x'}
  useBrush={{
    brushDataCallback: (filteredData) => { console.log(filteredData) }
    maxNumberOfPoints: 100
  }}
</Line>
```


## Installation

**Line Component**

Install the scoped `@nivo-enhanced/line` package through yarn or NPM.

With yarn:
```
yarn add @nivo-enhanced/line
```

With npm:
```
npm install @nivo-enhanced/line
```
