require('./src/server').bootstrap().then((core) =>
{
  const crafting = core.locate('crafting')

  crafting.title('Crafting docs')
  {
    const layout = crafting.layout_columns_2()

    layout.column1.header('Text')
    layout.column1.caption('Crafting reports with ease')
    layout.column1.text('This is a demo that documents how to build a report using the "crafting framework". In this demo all availible components will be listed and explained.')

    layout.column2.header('Code')
    layout.column2.caption('Above representation in code')
    layout.column2.code(
    `crafting.title('Text')
crafting.caption('Crafting reports with ease')
crafting.text('This is a demo that documents how to build a report using the "crafting framework". In this demo all availible components will be listed and explained.')`)
  }
  {
    const layout = crafting.layout_columns_2()

    layout.column1.header('JSON')
    layout.column1.caption('To be able to see JSON representations')
    layout.column1.json(
    {
      foo:'bar',
      baz:'qux',
    })

    layout.column2.header('Exception')
    layout.column2.caption('Show exceptions and errors')
    layout.column2.exception(new Error('Error message'))
  }
  crafting.header('Metric')
  crafting.caption('Show and/or stream a number')
  {
    const layout = crafting.layout_columns_3()
    
    let i = 1
    const metric_column1 = layout.column1.metric(i)
    setInterval(() => 
    {
      const input = ++i < 10 ? i : i -= 9
      metric_column1.input(input)
    }, 1e3)

    layout.column2.metric(6)
    layout.column3.metric(0)
  }
  {
    crafting.header('Table')
    crafting.caption('Table of data')
    crafting.table({ head:['one', 'two', 'three'], body:[[1,2,3], [2,3,1], [3,1,2]] })
  }
  crafting.seperator()
  {
    crafting.header('Line chart')
    crafting.caption('Line chart appended data')
  
    const 
      random_walk_1 = crafting.random_walk(100),
      random_walk_2 = crafting.random_walk(100),
      chart_line    = crafting.chart_line({ dataset:[ random_walk_1, random_walk_2 ] })
  
    setInterval(() => 
    {
      const 
        input_1 = random_walk_1[random_walk_1.length] = crafting.random_walk_next(random_walk_1[random_walk_1.length - 1]),
        input_2 = random_walk_2[random_walk_2.length] = crafting.random_walk_next(random_walk_2[random_walk_2.length - 1])

      chart_line.input({ dataset:[ random_walk_1, random_walk_2 ] })
      chart_line.emit2all('input appended', { 'dataset.0':input_1, 'dataset.1':input_2 })
    }, 1e3)
  }
  crafting.seperator()
  {
    crafting.header('Bar chart')
    crafting.caption('Bar chart adjusted data')
    
    const 
      random_walk_1 = crafting.random_walk(100),
      random_walk_2 = crafting.random_walk(100),
      chart_bar     = crafting.chart_bar({ dataset:[ random_walk_1, random_walk_2 ] })

    setInterval(() => 
    {
      const
        input_1 = random_walk_1[random_walk_1.length] = crafting.random_walk_next(random_walk_1[random_walk_1.length - 1]),
        input_2 = random_walk_2[random_walk_2.length] = crafting.random_walk_next(random_walk_2[random_walk_2.length - 1])

      random_walk_1.shift()
      random_walk_2.shift()

      chart_bar.input({ dataset:[ random_walk_1, random_walk_2 ] })
      chart_bar.emit2all('input adjusted', { 'dataset.0':input_1, 'dataset.1':input_2 })
    }, 1e3)
  }
  crafting.seperator()
  {
    crafting.header('Area chart')
    crafting.caption('Area chart remove and append new data in a 10 sec interval')

    const 
      random_walk = crafting.random_walk(50).map((v) => [v, v + 15 + crafting.random_integer(5)]),
      chart_area  = crafting.chart_area({ dataset:[ random_walk ] })

    setInterval(() =>
    {
      if(Math.floor(Date.now() / 1e4) % 2)
      {
        const 
          walk_next = crafting.random_walk_next(random_walk[random_walk.length - 1][0]),
          input     = [walk_next, walk_next + 15 + crafting.random_integer(5)]

        random_walk[random_walk.length] = input
        chart_area.input({ dataset:[ random_walk ] })
        chart_area.emit2all('input appended', { 'dataset.0':input })
      }
      else
      {
        random_walk.pop()
        chart_area.input({ dataset:[ random_walk ] })
        chart_area.emit2all('input removed pop', { 'dataset.0':1 })
      }
    }, 1e3)
  }
  crafting.seperator()
  {
    crafting.header('Candle chart')
    crafting.caption('Candle chart remove and prepend new data in a 10 sec interval')

    const details = crafting.details()
    details.summary = 'Candle chart'

    const 
      random_walk   = crafting.random_walk_candles(100),
      chart_candle  = details.content.chart_candle({ dataset:[ random_walk ] })

    setInterval(() => 
    {
      if(Math.floor(Date.now() / 1e4) % 2)
      {
        const 
          walk_next = crafting.random_walk_candles_next(random_walk[0][0]),
          input     = [walk_next[1], walk_next[0], walk_next[2], walk_next[3]]

        random_walk.unshift(input)
        chart_candle.input({ dataset:[ random_walk ] })
        chart_candle.emit2all('input prepended', { 'dataset.0':input })
      }
      else
      {
        random_walk.shift()
        chart_candle.input({ dataset:[ random_walk ] })
        chart_candle.emit2all('input removed shift', { 'dataset.0':1 })
      }
    }, 1e3)
  }
  crafting.seperator()
  {
    crafting.header('Pie chart')
    crafting.caption('Pie chart generated with 12 random positive numbers')

    const 
      random_walk = crafting.random_walk(12).map((v) => Math.abs(v)),
      chart_pie   = crafting.chart_pie({ dataset:random_walk })
  }
  crafting.seperator()
  {
    crafting.header('Donut chart')
    crafting.caption('Pie chart generated with 4 random positive numbers')

    const 
      random_walk = crafting.random_walk(4).map((v) => Math.abs(v)),
      chart_donut = crafting.chart_donut({ dataset:random_walk })
  }
  crafting.seperator()
  {
    crafting.header('Google sankey chart')
    crafting.caption('Google sankey chart')

    const 
      dataset = 
      [
        [ 'A', 'X', 5 ],
        [ 'A', 'Y', 7 ],
        [ 'A', 'Z', 6 ],

        [ 'B', 'X', 2 ],
        [ 'B', 'Y', 9 ],
        [ 'B', 'Z', 4 ],

        [ 'X', '1', 8 ],
        [ 'X', '2', 1 ],
        [ 'X', '3', 6 ],

        [ 'Y', '1', 5 ],
        [ 'Y', '2', 2 ],
        [ 'Y', '3', 8 ],

        [ 'Z', '1', 2 ],
        [ 'Z', '2', 9 ],
        [ 'Z', '3', 0 ]
      ],
      chart_sankey = crafting.chart_google_sankey(dataset)

    let i = 1, n = 4
    setInterval(() => 
    {
      if(i > 3 
      && n > 6)
      {
        i = 1
        n = 4

        dataset.pop()
        dataset.pop()
        dataset.pop()
      }

      dataset.push([ `${i++}`, `${n++}`, 1 ])
      chart_sankey.input(dataset)
    }, 1e3)
  }
})
