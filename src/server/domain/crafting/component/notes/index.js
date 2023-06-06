const Component = require('..')

class CraftingComponentNotes extends Component
{
  schema    = __dirname + '/schema'
  template  = __dirname + '/template'

  input(input)
  {
    super.input({ input })
  }
}

module.exports = CraftingComponentNotes