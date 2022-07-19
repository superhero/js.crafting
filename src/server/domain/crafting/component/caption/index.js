const Component = require('..')

class CraftingComponentCaption extends Component
{
  schema    = __dirname + '/schema'
  template  = __dirname + '/template'

  input(input)
  {
    super.input({ input })
  }
}

module.exports = CraftingComponentCaption