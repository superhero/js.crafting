class CraftingComponent
{
  constructor(cid, manager, schemaComposer, handlebars, websocket)
  {
    this.cid            = cid
    this.manager        = manager
    this.schemaComposer = schemaComposer
    this.handlebars     = handlebars
    this.websocket      = websocket
    this.observers      = {}
  }

  input(input)
  {
    if(this.schema in this.schemaComposer.schemas === false)
    {
      const schema = require(this.schema)
      this.schemaComposer.addSchema(this.schema, schema)
    }
    this.context = this.schemaComposer.compose(this.schema, { ...input, cid:this.cid })
  }

  emit2socket(name, data, socket)
  {
    this.websocket.emit(socket, name, { cid:this.cid, data })
  }

  emit2all(name, data)
  {
    const
      socket  = null,
      toAll   = true

    this.websocket.emit(socket, name, { cid:this.cid, data }, toAll)
  }

  emit(name, event)
  {
    if(name in this.observers)
    {
      for(const observer of this.observers[name])
      {
        observer(event)
      }
    }
  }

  on(name, observer)
  {
    if(name in this.observers)
    {
      this.observers[name].push(observer)
    }
    else
    {
      this.observers[name] = [observer]
    }
  }

  async render()
  {
    return await this.handlebars.composeFile(this.template, this.context)
  }
}

module.exports = CraftingComponent
