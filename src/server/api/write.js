const Dispatcher = require('@superhero/core.websocket/src/server/dispatcher')

/**
 * @memberof Server.Api
 * @extends {superhero/core/http/server/dispatcher}
 */
class Write extends Dispatcher
{
  async dispatch()
  {
    const crafting = this.locator.locate('crafting')
    await crafting.eventbus.emit(this.dto.cid, this.dto.name, this.dto.data, this.session)
  }

  async onError(error)
  {
    this.locator.locate('core/console').color('red').log('could not emit event', error)
  }
}

module.exports = Write