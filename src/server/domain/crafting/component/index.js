class CraftingComponent
{
  constructor(cid, schemaComposer, handlebars, websocket)
  {
    this.cid            = cid
    this.schemaComposer = schemaComposer
    this.handlebars     = handlebars
    this.websocket      = websocket
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

  async render()
  {
    return await this.handlebars.composeFile(this.template, this.context)
  }
}

module.exports = CraftingComponent
