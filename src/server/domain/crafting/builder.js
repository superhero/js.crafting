const Crafting = require('.')

class CraftingBuilder
{
  constructor(path, schema, handlebars, websocket, eventbus)
  {
    this.path       = path
    this.schema     = schema
    this.handlebars = handlebars
    this.websocket  = websocket
    this.eventbus   = eventbus
    this.cid        = 0
  }

  /**
   * @returns {Crafting}
   */
  build()
  {
    const
      crafting    = new Crafting(++this.cid, this.schema, this.handlebars, this.websocket, this),
      components  = this.path.directories(__dirname + '/component')

    for(const componentName of components)
    {
      if(componentName in crafting === false)
      {
        crafting[componentName] = (input) =>
        {
          const 
            Component = require('./component/' + componentName),
            component = new Component(++this.cid, this.schema, this.handlebars, this.websocket)
  
          component.input(input)
  
          this.eventbus.setObserver(component.id, component)
  
          crafting.sections.push(component)
  
          return component
        }
      }
    }

    return crafting
  }
}

module.exports = CraftingBuilder