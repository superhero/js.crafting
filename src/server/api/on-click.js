const Dispatcher = require('@superhero/core.websocket/src/server/dispatcher')

/**
 * @memberof Server.Api
 * @extends {superhero/core/http/server/dispatcher}
 */
class OnClick extends Dispatcher
{
  async dispatch()
  {
    const crafting = this.locator.locate('crafting')
    crafting.manager.components[this.dto.cid].emit('click', this.dto, this.session.socket)
  }

  async onError(error)
  {
    this.locator.locate('core/console').color('red').log('could not emit event', error)
  }
}

module.exports = OnClick