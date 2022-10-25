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

  websocket.on('size changed', (dto) => 
  {
    const component = dom.select(`[data-cid="${dto.cid}"]`)
    component.setCss('width',   dto.data.width)
    component.setCss('height',  dto.data.height)
  })

  websocket.on('input changed', (dto) => 
  {
    const component = dom.select(`[data-cid="${dto.cid}"]`)
    Object.keys(dto.data).forEach((key) => component.select(`[data-value="${key}"]`).setContent(dto.data[key]))
  })

  websocket.on('input appended', (dto) => 
  {
    const component = dom.select(`[data-cid="${dto.cid}"]`)
    Object.keys(dto.data).forEach((key) => 
    {
      const 
        data          = component.select(`[data-value="${key}"]`),
        data_content  = data.getContent(),
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
        data_content  = data.getContent(),
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
        data_content  = data.getContent(),
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
        data_content  = data.getContent(),
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
        data_content  = data.getContent(),
        data_json     = JSON.parse(data_content)
  
      data_json.shift()
      data.setContent(JSON.stringify(data_json))
      dto.cid in dataset_renderer && dataset_renderer[dto.cid]()
    })
  })
})
  
function createGraph(element)
{
  const 
    chart   = dom.from(element),
    canvas  = chart.select('canvas').get(0),
    width   = chart.getWidth().offset, 
    height  = 300,
    graph   = new Graph(canvas, width, height)

  return graph
}

function getDataset(element)
{
  const 
    chart   = dom.from(element),
    dataset = chart.select('.dataset').get().map((element) => JSON.parse(dom.from(element).getContent()))

  return dataset
}

const dataset_renderer = {}

dom.on('DOMContentLoaded', () =>
{
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
      cid     = dom.from(element).getData('cid')

    dataset_renderer[cid] = () =>
    {
      const dataset = getDataset(element)
      for(let data of dataset)
      {
        data = data.map((v, i) => [new Date(i), v])
        graph.clear()
        graph.setScale(data)
        graph.drawTimebasedLine('#fff', data)
      }
    }
    dataset_renderer[cid]()
  })

  dom.select('.chart-bar').get().forEach((element) =>
  {
    const
      graph = createGraph(element),
      cid   = dom.from(element).getData('cid')

    dataset_renderer[cid] = () =>
    {
      const dataset = getDataset(element)
      for(let data of dataset)
      {
        data = data.map((v, i) => [new Date(i), v])
        graph.clear()
        graph.setScale(data)
        graph.drawTimebasedBars('#fff', data)
      }
    }
    dataset_renderer[cid]()
  })

  dom.select('.chart-area').get().forEach((element) =>
  {
    const
      graph = createGraph(element),
      cid   = dom.from(element).getData('cid')

    dataset_renderer[cid] = () =>
    {
      const dataset = getDataset(element)
      for(let data of dataset)
      {
        data = data.map((v, i) => [new Date(i), ...v])
        graph.clear()
        graph.setScale(data)
        graph.drawTimebasedArea('#ccc', data)
      }
    }
    dataset_renderer[cid]()
  })

  dom.select('.chart-candle').get().forEach((element) =>
  {
    const
      graph = createGraph(element),
      cid   = dom.from(element).getData('cid')

    dataset_renderer[cid] = () =>
    {
      const dataset = getDataset(element)

      for(let data of dataset)
      {
        data = data.map((v, i) => [new Date(i), ...v])
        graph.clear()
        graph.setScale(data)
        graph.drawTimebasedCandels('#fff', '#999', '#000', data)
      }
    }
    dataset_renderer[cid]()
  })

  dom.select('.chart-pie').get().forEach((element) =>
  {
    const
      graph = createGraph(element),
      cid   = dom.from(element).getData('cid')

    dataset_renderer[cid] = () =>
    {
      const dataset = getDataset(element)

      for(let data of dataset)
      {
        graph.clear()
        graph.drawPie(data)
      }
    }
    dataset_renderer[cid]()
  })

  dom.select('.chart-donut').get().forEach((element) =>
  {
    const
      graph = createGraph(element),
      cid   = dom.from(element).getData('cid')

    dataset_renderer[cid] = () =>
    {
      const dataset = getDataset(element)

      for(let data of dataset)
      {
        graph.clear()
        graph.drawDonut(data)
      }
    }
    dataset_renderer[cid]()
  })

  google.charts.load('current', { 'packages':['sankey'] })
  google.charts.setOnLoadCallback(() =>
  {
    // chart options
    const
      google_sankey_options_colors =
      [
        '#fff', '#ddd', '#bbb', '#999', '#777'
      ],
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
              color: '#000',
              bold: true
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
          dataset = getDataset(element),
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