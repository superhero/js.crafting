A library for backend engineers to craft reports without writing any frontend code...

# Screenshot

![Image](./docs/screenshot.png?raw=true)

# Run - CLI

To try,test the library, from the folder of the downloaded reposotory, type in the terminal:

```bash
npm install
npm start
```

Then go to the browser: http://localhost

If your port 80 and/or 8080 is busy, then you can change the port used by crafting by changing the values of the environment variables: 
 - **HTTP_PORT** <sub><sup> - default: 80</sup></sub>
 - **WS_PORT** <sub><sup> - default: 8080</sup></sub>
 
 To specify the websocket host:
 - **WS_HOST**

# Run - Docker <sub><sup>(optional)</sup></sub>

You can also build and run a docker image, if you preffer to use docker instead:

```bash
docker build -t crafting .
docker run -p 80:80 -p 8080:8080 -d crafting
```

---

# How to use

In your nodejs application, install the package through npm: `npm install crafting`, or simply by defining the dependency in your package.json file:

```json
{
  "dependencies":
  {
    "superhero": "*"
  }
}
```

```js
const
  Graph                     = require('./graph'),
  EventsourceClientFactory  = require('@superhero/core.eventsource/src/client/factory'),
  EventsourceMapper         = require('@superhero/core.eventsource/src/mapper'),
  redisOptions              = 
  { 
    auth    : '3f5fc649-39d0-4c42-8c56-08fc490a2873', 
    gateway : 
    { 
      url:'redis://10.237.61.100:6379' // pfi-sit:10.237.61.100
    }
  }

require('crafting').then(async (core) =>
{
  // service location
  // constants

  const
    graph       = new Graph(),
    graph_dto   = graph.create(),
    crafting    = core.locate('crafting'),
    eventbus    = core.locate('core/eventbus'),
    deepmerge   = core.locate('core/deepmerge'),
    console     = core.locate('core/console'),
    schema      = core.locate('core/schema/composer'),
    string      = core.locate('core/string'),
    mapper      = new EventsourceMapper(schema, string),
    factory     = new EventsourceClientFactory(console, mapper, eventbus, deepmerge),
    eventsource = factory.create(redisOptions),
    group       = 'system-report-' + process.env.COMMIT

  await eventsource.redis.auth()

  // report

  crafting.title('Fiber provision')
  crafting.caption('Adamo fiber provision interactive report')

  const 
    layout1                     = crafting.layout_columns_3(),
    metric_reserved             = layout1.column1.metric(0),
    metric_reservation_updated  = layout1.column2.metric(0),
    metric_reservation_failed   = layout1.column3.metric(0)

  layout1.column1.caption('Reservations')
  layout1.column2.caption('Reservation updates')
  layout1.column3.caption('Reservation failed')

  const 
    layout2               = crafting.layout_columns_3(),
    metric_activations    = layout2.column1.metric(0),
    metric_updates        = layout2.column2.metric(0),
    metric_deactivations  = layout2.column3.metric(0)

  layout2.column1.caption('Completed activate')
  layout2.column2.caption('Completed update/cto change')
  layout2.column3.caption('Completed deactivate')

  const chart_sankey = crafting.chart_google_sankey(
  {
    dataset: []
  })

  while(event = await eventsource.readStream(group))
  {
    console.color('blue').log(`- ${event.pid} - ${event.name}`)

    switch(event.name)
    {
      case 'reserved':
      {
        metric_reserved.input(++metric_reserved.context.input)
        metric_reserved.emit2all('input changed', metric_reserved.context)
        break
      }
      case 'reservation updated':
      {
        metric_reservation_updated.input(++metric_reservation_updated.context.input)
        metric_reservation_updated.emit2all('input changed', metric_reservation_updated.context)
        break
      }
      case 'reservation aggregate failed':
      {
        metric_reservation_failed.input(++metric_reservation_failed.context.input)
        metric_reservation_failed.emit2all('input changed', metric_reservation_failed.context)
        break
      }
      case 'completed activate':
      {
        metric_activations.input(++metric_activations.context.input)
        metric_activations.emit2all('input changed', metric_activations.context)
        break
      }
      case 'completed update':
      case 'completed cto change':
      {
        metric_updates.input(++metric_updates.context.input)
        metric_updates.emit2all('input changed', metric_updates.context)
        break
      }
      case 'completed deactivate':
      {
        metric_deactivations.input(++metric_deactivations.context.input)
        metric_deactivations.emit2all('input changed', metric_deactivations.context)
        break
      }
      /*
      case 'completed deactivate cto change':
      {
        metric_deactivations.input(++metric_deactivations.context.input)
        metric_deactivations.emit2all('input changed', metric_deactivations.context)
        break
      }
      */
    }

    if(event.rid)
    {
      const refferenced = await eventsource.readEventById(event.rid)

      graph.addEdge(graph_dto, refferenced.name, event.name)

      const
        unidirectional = graph.unidirectional(graph_dto),
        dataset        = []

      // mapping - from graph structure to google sankey structure
      for(const parent in unidirectional)
      {
        for(const child in unidirectional[parent])
        {
          const weight = unidirectional[parent][child]
          dataset.push([ parent, child, weight ])
        }
      }

      console.color('blue').log(`- ${event.pid} - ${event.name} - ${event.rid} - ${refferenced.name}`, dataset)
      chart_sankey.input({ dataset })
      chart_sankey.emit2all('input adjusted', { 'dataset.0':dataset })
      console.color('green').log(`✔ ${event.pid} - ${event.name} - ${event.rid} - ${refferenced.name}`)
    }
    else
    {
      console.color('red').log(`✗ ${event.pid} - ${event.name} - has no rid`)
    }
  }

  console.log('ended')
})
```