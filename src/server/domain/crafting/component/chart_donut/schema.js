/**
 * @memberof Server.Domain
 * @typedef {Object} CraftingChartDonut
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