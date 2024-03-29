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

    const style = document.createElement('style')
    document.head.appendChild(style)

    for(const i in config.color.graph)
    {
      const color = config.color.graph[i]
      style.textContent += `.color-${i} { color: ${color} } `, 0
      style.textContent += `.color-${i}-bg { background-color: ${color} }`, 0
    }

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

    websocket.on('dialog', (dto) => 
    {
      const 
        dialog_background = dom.new('div'),
        dialog            = dom.new('div'),
        dialog_terminate  = dom.new('div')
        
      dialog_background.addClass('dialog--background')
      dialog_background.append(dialog)
      dialog.append(dialog_terminate)
      dialog.addClass('dialog')
      dialog_terminate.setContent('✕')
      dialog_terminate.addClass('dialog--terminate')
      dialog_terminate.on('click', () => dialog_background.remove())

      if(dto.message)
      {
        const dialog_message = dom.new('p')
        dialog_message.setContent(dto.message)
        dialog_message.addClass('dialog--message')
        dialog.append(dialog_message)
      }

      if(dto.ok)
      {
        const ok_button = dom.new('button')
        dialog.append(ok_button)
        ok_button.setContent(dto.ok)
        ok_button.addClass('dialog--button')
        ok_button.on('click', () => 
        {
          websocket.emit('click', { ok:dto.id })
          dialog.remove()
        })
      }

      dom.select('body').append(dialog_background)
    })

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

        return
      }

      const button = dom.from(event.target).parent('button[class="btn"]', true)
      if(button)
      {
        const
          cid   = button.getData('cid'),
          value = button.getValue()

        websocket.emit('click', { cid, value })

        return
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
        const dataset = getDataset(element).map((data) => data.map((v, i) => [new Date(i), v]))
        let n = 0

        {
          const 
            data  = dataset.shift(),
            color = config.color.graph[n = graphColor(n)]

          graph.setScale(data.concat(...dataset))
          graph.drawTimebasedLine(context, color, data)
        }

        for(const data of dataset)
        {
          const color = config.color.graph[n = graphColor(n)]
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

        {
          let data  = dataset.shift()
          const color = config.color.graph[n = graphColor(n)]
          data = data.map((v, i) => [new Date(i), v])
          graph.setScale(data)
          graph.drawTimebasedBars(context, color, data, i++, 1)
        }

        for(let data of dataset)
        {
          const color = config.color.graph[n = graphColor(n)]
          data = data.map((v, i) => [new Date(i), v])
          graph.drawTimebasedBars(context, color, data, i++, 1)
        }
      }

      /*
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
      */

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

        {
          let data  = dataset.shift()
          const color = config.color.graph[n = graphColor(n)]
          data = data.map((v, i) => [new Date(i), ...v])
          graph.setScale(data)
          graph.drawTimebasedArea(context, color, data)
        }

        for(let data of dataset)
        {
          const color = config.color.graph[n = graphColor(n)]
          data = data.map((v, i) => [new Date(i), ...v])
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

        {
          let data = dataset.shift()
          data = data.map((v, i) => [new Date(i), ...v])
          graph.setScale(data)
          graph.drawTimebasedCandels(context, config.color.graph[0], config.color.graph[1], config.color.graph[2], data)
        }

        for(let data of dataset)
        {
          data = data.map((v, i) => [new Date(i), ...v])
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
          const 
            data  = dataset_candles.map((v, i) => [new Date(i), ...v]),
            width = data.length * 6

          if(width > graph.width)
          {
            graph.setSize(width, graph.height)
          }

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

    dom.select('.chart-candle-and-line-with-postmortem').get().forEach((element) =>
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
          const
            data  = dataset_candles.map((v, i) => [new Date(i), ...v]),
            width = data.length * 6

          if(width > graph.width)
          {
            graph.setSize(width, graph.height)
          }

          graph.setScale(data)
          graph.drawTimebasedCandels(context, config.color.graph[0], config.color.graph[1], config.color.graph[2], data)
        }

        let n = 2
        for(let data of dataset)
        {
          const color = config.color.graph[n = graphColor(n)]
          // data = data.map((v, i) => [new Date(i), v])
          // graph.setScale(data)
          const postmortem = data.pop()
          graph.drawTimebasedLine(context, color, data)

          {
            const
              x       = postmortem[0],
              y       = postmortem[1],
              width   = postmortem[2],
              height  = postmortem[3],
              lowest  = postmortem[4],
              alpha   = 0.25
  
            graph.drawBox(context, '#090', x, y, width, height, alpha)
            graph.drawBox(context, '#900', x, y - lowest, width, lowest, alpha)
          }
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

    if(google)
    {
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
    }
  })
})