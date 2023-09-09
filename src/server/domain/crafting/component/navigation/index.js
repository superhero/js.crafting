const Component = require('..')

class CraftingComponentNavigation extends Component
{
  schema        = __dirname + '/schema'
  schemaEntity  = __dirname + '/schema-entity'
  template      = __dirname + '/template'

  input(input)
  {
    if((this.schemaEntity in this.schemaComposer.schemas) === false)
    {
      const schema = require(this.schemaEntity)
      this.schemaComposer.addSchema(this.schemaEntity, schema)
    }
    super.input({ input })
  }
}

module.exports = CraftingComponentNavigation