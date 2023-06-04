const Component = require('..')

class CraftingComponentDetails extends Component
{
  template = __dirname + '/template'

  input(summary)
  {
    this.summary = summary
  }

  async render()
  {
    const context = 
    {
      summary : this.summary,
      content : await this.content.render()
    }

    return await this.handlebars.composeFile(this.template, context)
  }
}

module.exports = CraftingComponentDetails
