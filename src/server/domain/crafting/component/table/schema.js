/**
 * @memberof Server.Domain
 * @typedef {Object} CraftingTable
 */
const schema =
{
  head:
  {
    'type'        : 'string',
    'collection'  : true,
    'optional'    : true
  },
  body:
  {
    'type' : 'csv'
  }
}

module.exports = schema