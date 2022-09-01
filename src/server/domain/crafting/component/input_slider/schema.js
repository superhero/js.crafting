/**
 * @memberof Server.Domain
 * @typedef {Object} CraftingInputSlider
 */
const schema =
{
  cid:
  {
    'type' : 'integer'
  },
  low:
  {
    'type' : 'decimal'
  },
  high:
  {
    'type' : 'decimal'
  }
}

module.exports = schema