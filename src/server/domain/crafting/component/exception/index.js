const Component = require('..')

class CraftingComponentException extends Component
{
  schema    = __dirname + '/schema'
  template  = __dirname + '/template'

  input(exception)
  {
    exception instanceof Error
    ? super.input({ name:exception.name, message:exception.message })
    : super.input(exception)
  }
}

module.exports = CraftingComponentException