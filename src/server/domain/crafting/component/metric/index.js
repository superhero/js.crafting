const Component = require('..')

class CraftingComponentMetric extends Component
{
  schema    = __dirname + '/schema'
  template  = __dirname + '/template'

  input(input)
  {
    super.input({ input })
    super.emit2all('input changed', { input })
  }
}

module.exports = CraftingComponentMetric