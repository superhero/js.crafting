const Component = require('./component')

class Crafting extends Component
{
  schema    = __dirname + '/schema'
  template  = __dirname + '/template'

  constructor(cid, manager, schemaComposer, handlebars, websocket, builder)
  {
    super(cid, manager, schemaComposer, handlebars, websocket)
    this.builder  = builder
    this.sections = []
  }

  container()
  {
    const container = this.builder.build()
    this.sections.push(container)
    return container
  }

  async render()
  {
    let input = ''
    for(const section of this.sections)
    {
      input += await section.render()
    }
    this.input({ input })
    
    return await super.render()
  }

  details(summary, open = true)
  {
    const
      Component = require('./component/details'),
      component = new Component(++this.builder.cid, this.manager, this.schemaComposer, this.handlebars, this.websocket),
      content   = this.builder.build()

    component.input(summary, open)
    component.content = content

    this.sections.push(component)

    return component
  }

  layout_columns_2()
  {
    const
      Component   = require('./component/layout_columns_2'),
      component   = new Component(++this.builder.cid, this.manager, this.schemaComposer, this.handlebars, this.websocket),
      container1  = this.builder.build(),
      container2  = this.builder.build()

    component.input(container1, container2)

    this.sections.push(component)

    return component
  }

  layout_columns_3()
  {
    const 
      Component   = require('./component/layout_columns_3'),
      component   = new Component(++this.builder.cid, this.manager, this.schemaComposer, this.handlebars, this.websocket),
      container1  = this.builder.build(),
      container2  = this.builder.build(),
      container3  = this.builder.build()

    component.input(container1, container2, container3)

    this.sections.push(component)

    return component
  }

  random_integer(variance=10)
  {
    return Math.floor(Math.random() * variance)
  }

  random_walk(length=10, variance=10, entrence=0)
  {
    let accumulate = this.random_integer(entrence || variance)
    return Array.from({ length }, () => accumulate += (this.random_integer(variance) * (accumulate % 2 ? -1 : 1)))
  }

  random_walk_next(entrence=0, variance=10)
  {
    const
      random_integer  = this.random_integer(variance),
      next            = random_integer * (random_integer % 2 ? 1 : -1)

    return entrence + next
  }

  random_walk_candles(length=10, variance=10, entrence=0)
  {
    let accumulate = Math.floor(Math.random() * (entrence || variance))
    return Array.from({ length }, () =>
    {
      const next  = this.random_walk_candles_next(accumulate, variance)
      accumulate = next[1]
      return next
    })
  }

  random_walk_candles_next(entrence=0, variance=10)
  {
    const
      open  = entrence,
      close = entrence + (this.random_integer(variance) * (entrence % 2 ? -1 : 1)),
      high  = Math.max(open, close) + this.random_integer(variance / 2),
      low   = Math.min(open, close) - this.random_integer(variance / 2)
    
    return [ open, close, high, low ]
  }
}

module.exports = Crafting