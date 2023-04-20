const isValidDate = (s) => new Date(s).toString() !== 'Invalid Date'

dom.on('DOMContentLoaded', () =>
{
  fetch('//' + window.location.hostname + '/_configuration').then(async (response) =>
  {
    if(false === !!response.ok)
    {
      // if HTTP-status is 200-299
      // get the response body (the method explained below)
      const error = new Error('could not locate the configuration')
      error.chain = { status:response.status }
      throw error
    }

    const config = await response.json()

    console.log(config)

    const
      websocket = new WebSocketStream(
      {
        protocol    : config.websocket.protocol || 'ws',
        host        : config.websocket.host     || window.location.hostname,
        port        : config.websocket.port     || 8080,
        reconnect   : true,
        silent      : true,
        onReconnect : () => document.location.href = document.location.href
      })

    websocket.connect()

    websocket.on('foobar', (dto) => console.log('foobar', dto))

    websocket.on('input changed', (dto) => 
    {
      const component = dom.select(`[data-cid="${dto.cid}"]`)

      Object.keys(dto.data).forEach(
        (key) => Array.isArray(dto.data[key])
          ? dto.data[key].forEach((_, i) => component.select(`[data-value="${key}.${i}"]`).setContent(dto.data[key][i]))
          : component.select(`[data-value="${key}"]`).setContent(dto.data[key]))

      dto.cid in dataset_renderer && dataset_renderer[dto.cid]()
    })

    websocket.on('input appended', (dto) => 
    {
      const component = dom.select(`[data-cid="${dto.cid}"]`)
      Object.keys(dto.data).forEach((key) => 
      {
        const 
          data          = component.select(`[data-value="${key}"]`),
          data_content  = data.getContent() || '[]',
          data_json     = JSON.parse(data_content)
    
        data_json.push(dto.data[key])
        data.setContent(JSON.stringify(data_json))
        dto.cid in dataset_renderer && dataset_renderer[dto.cid]()
      })
    })
    
    websocket.on('input prepended', (dto) => 
    {
      const component = dom.select(`[data-cid="${dto.cid}"]`)
      Object.keys(dto.data).forEach((key) => 
      {
        const 
          data          = component.select(`[data-value="${key}"]`),
          data_content  = data.getContent() || '[]',
          data_json     = JSON.parse(data_content)
    
        data_json.unshift(dto.data[key])
        data.setContent(JSON.stringify(data_json))
        dto.cid in dataset_renderer && dataset_renderer[dto.cid]()
      })
    })
    
    websocket.on('input adjusted', (dto) => 
    {
      const component = dom.select(`[data-cid="${dto.cid}"]`)
      Object.keys(dto.data).forEach((key) => 
      {
        const 
          data          = component.select(`[data-value="${key}"]`),
          data_content  = data.getContent() || '[]',
          data_json     = JSON.parse(data_content)
    
        data_json.shift()
        data_json.push(dto.data[key])
        data.setContent(JSON.stringify(data_json))
        dto.cid in dataset_renderer && dataset_renderer[dto.cid]()
      })
    })
    
    websocket.on('input removed pop', (dto) => 
    {
      const component = dom.select(`[data-cid="${dto.cid}"]`)
      Object.keys(dto.data).forEach((key) => 
      {
        const 
          data          = component.select(`[data-value="${key}"]`),
          data_content  = data.getContent() || '[]',
          data_json     = JSON.parse(data_content)
    
        data_json.pop()
        data.setContent(JSON.stringify(data_json))
        dto.cid in dataset_renderer && dataset_renderer[dto.cid]()
      })
    })
    
    websocket.on('input removed shift', (dto) => 
    {
      const component = dom.select(`[data-cid="${dto.cid}"]`)
      Object.keys(dto.data).forEach((key) => 
      {
        const 
          data          = component.select(`[data-value="${key}"]`),
          data_content  = data.getContent() || '[]',
          data_json     = JSON.parse(data_content)
    
        data_json.shift()
        data.setContent(JSON.stringify(data_json))
        dto.cid in dataset_renderer && dataset_renderer[dto.cid]()
      })
    })

    dom.on('mousemove', (event) => 
    {
      const chart = dom.from(event.target).parent('[class^="chart-"]', true)
      if(chart)
      {
        const cid = chart.getData('cid')
        cid in mouse_moved && mouse_moved[cid](event)
      }
    })

    dom.on('click', (event) => 
    {
      const chart = dom.from(event.target).parent('[class^="chart-"]', true)
      if(chart)
      {
        const 
          cid   = chart.getData('cid'),
          graph = charts[cid],
          x     = graph.xScale.invert(event.offsetX)

        websocket.emit('click', { cid, x })
      }
    })

    function createGraph(element)
    {
      const
        chart   = dom.from(element),
        canvas  = chart.select('canvas.chart').get(0),
        hoover  = chart.select('canvas.hoover').get(0),
        width   = chart.getWidth().offset, 
        height  = 300,
        graph   = new Graph(canvas, hoover, width, height)

      return graph
    }

    function getDataset(element)
    {
      const 
        chart   = dom.from(element),
        dataset = chart.select('.dataset').get().map((element) => JSON.parse(dom.from(element).getContent()))

      return dataset
    }

    function graphColor(n)
    {
      return n > config.color.graph.length - 1 ? 0 : n + 1
    }

    const 
      dataset_renderer  = {},
      mouse_moved       = {},
      charts            = {}

    /*
    dom.select('.input-slider').get().forEach((element) =>
    {
      const
        input = dom.from(element),
        cid   = input.getData('cid')

      dataset_renderer[cid] = () =>
      {
        const
          high  = input.select('[data-value="high"]'),
          low   = input.select('[data-value="low"]')

        // emit somehow...
      }
      dataset_renderer[cid]()
    })
    */

    dom.select('.chart-line').get().forEach((element) =>
    {
      const
        graph   = createGraph(element),
        context = dom.from(element).select('canvas.chart').get(0).getContext('2d'),
        cid     = dom.from(element).getData('cid')

      charts[cid] = graph

      dataset_renderer[cid] = () =>
      {
        graph.clear(context)
        const dataset = getDataset(element)
        let n = 0
        for(let data of dataset)
        {
          const color = config.color.graph[n = graphColor(n)]
          data = data.map((v, i) => [new Date(i), v])
          graph.setScale(data)
          graph.drawTimebasedLine(context, color, data)
        }
      }
      dataset_renderer[cid]()
    })

    dom.select('.chart-bar').get().forEach((element) =>
    {
      const
        graph   = createGraph(element),
        context = dom.from(element).select('canvas.chart').get(0).getContext('2d'),
        hoover  = dom.from(element).select('canvas.hoover').get(0).getContext('2d'),
        cid     = dom.from(element).getData('cid')

      charts[cid] = graph

      dataset_renderer[cid] = () =>
      {
        graph.clear(context)
        const dataset = getDataset(element)
        let n = 0, i = 0
        for(let data of dataset)
        {
          const color = config.color.graph[n = graphColor(n)]
          data = data.map((v, i) => [new Date(i), v])
          graph.setScale(data)
          graph.drawTimebasedBars(context, color, data, i++, 1)
        }
      }

      mouse_moved[cid] = (event) =>
      {
        graph.clear(hoover)

        const 
          invertedX = graph.xScale.invert(event.offsetX),
          x         = graph.xScale(invertedX),
          dataset   = getDataset(element),
          width     = dataset.length,
          offset    = Math.floor(width / 2)

        graph.drawVerticalLine(hoover, x + offset, '#fff', width, 0.3)
      }

      dataset_renderer[cid]()
    })

    dom.select('.chart-area').get().forEach((element) =>
    {
      const
        graph   = createGraph(element),
        context = dom.from(element).select('canvas.chart').get(0).getContext('2d'),
        cid     = dom.from(element).getData('cid')

      charts[cid] = graph

      dataset_renderer[cid] = () =>
      {
        graph.clear(context)
        const dataset = getDataset(element)
        let n = 0
        for(let data of dataset)
        {
          const color = config.color.graph[n = graphColor(n)]
          data = data.map((v, i) => [new Date(i), ...v])
          graph.setScale(data)
          graph.drawTimebasedArea(context, color, data)
        }
      }
      dataset_renderer[cid]()
    })

    dom.select('.chart-candle').get().forEach((element) =>
    {
      const
        graph   = createGraph(element),
        context = dom.from(element).select('canvas.chart').get(0).getContext('2d'),
        cid     = dom.from(element).getData('cid')

      charts[cid] = graph

      dataset_renderer[cid] = () =>
      {
        graph.clear(context)
        const dataset = getDataset(element)
        for(let data of dataset)
        {
          data = data.map((v, i) => [new Date(i), ...v])
          graph.setScale(data)
          graph.drawTimebasedCandels(context, config.color.graph[0], config.color.graph[1], config.color.graph[2], data)
        }
      }
      dataset_renderer[cid]()
    })

    dom.select('.chart-candle-and-line').get().forEach((element) =>
    {
      const
        graph   = createGraph(element),
        context = dom.from(element).select('canvas.chart').get(0).getContext('2d'),
        cid     = dom.from(element).getData('cid')

      charts[cid] = graph

      dataset_renderer[cid] = () =>
      {
        graph.clear(context)
        
        const 
          dataset         = getDataset(element),
          dataset_candles = dataset.shift()

        {
          const data = dataset_candles.map((v, i) => [new Date(i), ...v])
          graph.setScale(data)
          graph.drawTimebasedCandels(context, config.color.graph[0], config.color.graph[1], config.color.graph[2], data)
        }

        let n = 2
        for(let data of dataset)
        {
          const color = config.color.graph[n = graphColor(n)]
          // data = data.map((v, i) => [new Date(i), v])
          //graph.setScale(data)
          graph.drawTimebasedLine(context, color, data)
        }
      }
      dataset_renderer[cid]()
    })

    dom.select('.chart-pie').get().forEach((element) =>
    {
      const
        graph   = createGraph(element),
        context = dom.from(element).select('canvas.chart').get(0).getContext('2d'),
        cid     = dom.from(element).getData('cid')

      charts[cid] = graph

      dataset_renderer[cid] = () =>
      {
        const dataset = getDataset(element)

        graph.clear(context)
        for(let data of dataset)
        {
          graph.drawPie(context, data, config.color.graph)
        }
      }
      dataset_renderer[cid]()
    })

    dom.select('.chart-donut').get().forEach((element) =>
    {
      const
        graph   = createGraph(element),
        context = dom.from(element).select('canvas.chart').get(0).getContext('2d'),
        cid     = dom.from(element).getData('cid')

      charts[cid] = graph

      dataset_renderer[cid] = () =>
      {
        const dataset = getDataset(element)

        graph.clear(context)
        for(let data of dataset)
        {
          graph.drawDonut(context, data, config.color.graph)
        }
      }
      dataset_renderer[cid]()
    })

    google.charts.load('current', { 'packages':['sankey'] })
    google.charts.setOnLoadCallback(() =>
    {
      // chart options
      const
        google_sankey_options_colors = config.color.graph,
        google_sankey_options =
        {
          tooltip : { isHtml: true },
          sankey  :
          {
            node:
            {
              colors: google_sankey_options_colors,
              width: 4,
              interactivity: false,
              nodePadding: 32,
              labelPadding: 8,
              label:
              {
                fontName: 'Roboto Condensed',
                fontSize: 14,
                color: config.color.label, // '#11f8fb',
                bold: false
              }
            },
            link:
            {
              colorMode: 'gradient',
              colors: google_sankey_options_colors
            }
          }
        }

      dom.select('.chart-google-sankey').get().forEach((element) =>
      {
        const
          root  = dom.from(element),
          chart = root.select('.sankey-graph'),
          graph = new google.visualization.Sankey(chart.get(0)),
          cid   = root.getData('cid')

        dataset_renderer[cid] = () =>
        {
          const
            input   = root.select('[data-value="input"]').getContent(),
            dataset = JSON.parse(input),
            data    = new google.visualization.DataTable()

          data.addColumn('string', 'From')
          data.addColumn('string', 'To')
          data.addColumn('number', 'Weight')
          data.addRows(dataset)
    
          google_sankey_options.width   = 1500 // root.getWidth().client
          google_sankey_options.height  =  500 // root.getHeight().client
          // instantiates and draws our chart, passing in some options.
          graph.draw(data, google_sankey_options)
        }
        dataset_renderer[cid]()
      })
    })
  })
})