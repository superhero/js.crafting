const Component = require('..')

class CraftingComponentTitle extends Component
{
  schema    = __dirname + '/schema'
  template  = __dirname + '/template'

  input(input)
  {
    super.input({ input })
  }
}

module.exports = CraftingComponentTitle