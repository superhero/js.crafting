const Component = require('..')

class CraftingComponentNotes extends Component
{
  schema    = __dirname + '/schema'
  template  = __dirname + '/template'

  input(input)
  {
    this.context = { input }
  }
}

module.exports = CraftingComponentNotes