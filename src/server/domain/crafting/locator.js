const
  Crafting            = require('.'),
  CraftingBuilder     = require('./builder'),
  CraftingEventbus    = require('./eventbus'),
  LocatorConstituent  = require('superhero/core/locator/constituent')

/**
 * @memberof Server.Domain
 */
class CraftingLocator extends LocatorConstituent
{
  /**
   * @returns {Crafting}
   */
  locate()
  {
    const 
      schema      = this.locator.locate('core/schema/composer'),
      path        = this.locator.locate('core/path'),
      handlebars  = this.locator.locate('@superhero/core.handlebars'),
      websocket   = this.locator.locate('websocket/server').websocket,
      eventbus    = new CraftingEventbus(),
      builder     = new CraftingBuilder(path, schema, handlebars, websocket, eventbus),
      crafting    = builder.build()

    return crafting
  }
}

module.exports = CraftingLocator