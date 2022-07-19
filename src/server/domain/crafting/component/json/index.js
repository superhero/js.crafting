const Component = require('..')

class CraftingComponentJson extends Component
{
  schema    = __dirname + '/schema'
  template  = __dirname + '/template'

  input(input)
  {
    input = JSON.stringify(input, null, 2)
    super.input({ input })
  }
}

module.exports = CraftingComponentJson