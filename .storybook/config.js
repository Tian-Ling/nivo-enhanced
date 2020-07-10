/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */

import { configure, addParameters, addDecorator } from '@storybook/react'
import { withInfo } from '@storybook/addon-info'
import theme from './theme'

addParameters({
    options: {
        theme,
    }
})

addDecorator(withInfo({
    header: true,
    inline: true,
    propTables: false,
    source: false,
    maxPropObjectKeys: 10000,
    maxPropArrayLength: 10000,
    maxPropStringLength: 10000,
    styles: {
        infoBody: {
            border: 'none',
            borderRadius: 0,
            padding: '0 30px 20px',
            marginTop: '0',
            marginBottom: '0',
            boxShadow: 'none',
        },
        header: {
            h1: {
                fontSize: '28px',
            },
            h2: {
                fontSize: '16px',
            },
        },
        source: {
            h1: {
                fontSize: '22px',
            },
        },
    },
}))

function loadStories() {
    require('../packages/line/stories/line.stories')
    require('../packages/line/stories/LineCanvas.stories')
}

configure(loadStories, module)
