const Component = require('..')

class CraftingComponentTable extends Component
{
  schema    = __dirname + '/schema'
  template  = __dirname + '/template'

  input({ head, body })
  {
    super.input({ head, body })
  }
}

module.exports = CraftingComponentTable