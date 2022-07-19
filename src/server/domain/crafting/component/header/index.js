const Component = require('..')

class CraftingComponentHeader extends Component
{
  schema    = __dirname + '/schema'
  template  = __dirname + '/template'

  input(input)
  {
    super.input({ input })
  }
}

module.exports = CraftingComponentHeader