const Component = require('..')

class CraftingComponentInputSlider extends Component
{
  schema    = __dirname + '/schema'
  template  = __dirname + '/template'

  input(low, high)
  {
    super.input({ low, high })
  }
}

module.exports = CraftingComponentInputSlider