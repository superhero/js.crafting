const Component = require('..')

class CraftingComponentChartGoogleSankey extends Component
{
  schema    = __dirname + '/schema'
  template  = __dirname + '/template'

  input(input)
  {
    input = JSON.stringify(input)
    super.input({ input })
    super.emit2all('input changed', { input })
  }
}

module.exports = CraftingComponentChartGoogleSankey