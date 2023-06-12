const Dispatcher = require('superhero/core/http/server/dispatcher')

/**
 * @memberof Server.Api
 * @extends {superhero/core/http/server/dispatcher}
 */
class Read extends Dispatcher
{
  async dispatch()
  {
    const crafting = this.locator.locate('crafting')
    this.view.body.main = await crafting.page(this.route.dto.page).render()
  }
}

module.exports = Read