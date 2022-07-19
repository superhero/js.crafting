/**
 * @memberof Server.Domain
 * @typedef {Object} CraftingChartPie
 */
const schema =
{
  cid:
  {
    'type' : 'integer'
  },
  dataset:
  {
    'type'        : 'decimal',
    'collection'  : true
  }
}

module.exports = schema