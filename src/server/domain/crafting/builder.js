const Crafting = require('.')

class CraftingBuilder
{
  constructor(manager, path, schema, handlebars, websocket)
  {
    this.manager    = manager
    this.path       = path
    this.schema     = schema
    this.handlebars = handlebars
    this.websocket  = websocket
    this.cid        = 0
  }

  /**
   * @returns {Crafting}
   */
  build()
  {
    const
      crafting    = new Crafting(++this.cid, this.manager, this.schema, this.handlebars, this.websocket, this),
      components  = this.path.directories(__dirname + '/component')

    for(const componentName of components)
    {
      if(componentName in crafting === false)
      {
        crafting[componentName] = (input, push2sections=true) =>
        {
          const 
            Component = require('./component/' + componentName),
            component = new Component(++this.cid, this.manager, this.schema, this.handlebars, this.websocket)

          component.input(input)

          if(push2sections)
          {
            crafting.sections.push(component)
          }

          this.manager.components[this.cid] = component
  
          return component
        }
      }
    }

    return crafting
  }
}

module.exports = CraftingBuilder