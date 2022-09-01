const Dispatcher = require('superhero/core/http/server/dispatcher')

/**
 * @memberof Server.Api
 * @extends {superhero/core/http/server/dispatcher}
 */
class Configuration extends Dispatcher
{
  async dispatch()
  {
    const configuration = this.locator.locate('core/configuration')
    this.view.body      = await configuration.find('view')
  }
}

module.exports = Configuration