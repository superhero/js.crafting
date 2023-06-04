const Component = require('..')

class CraftingComponentDetails extends Component
{
  template = __dirname + '/template'

  input(summary, open)
  {
    this.summary  = summary
    this.open     = open
  }

  async render()
  {
    const context = 
    {
      open    : this.open,
      summary : this.summary,
      content : await this.content.render()
    }

    return await this.handlebars.composeFile(this.template, context)
  }
}

module.exports = CraftingComponentDetails
