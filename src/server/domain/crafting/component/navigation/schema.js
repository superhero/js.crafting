/**
 * @memberof Server.Domain
 * @typedef {Object} CraftingNavigation
 */
const schema =
{
  input:
  {
    'type'        : 'schema',
    'schema'      : __dirname + '/schema-entity',
    'collection'  : true
  }
}

module.exports = schema