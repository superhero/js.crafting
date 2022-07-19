const Component = require('..')

class CraftingComponentLayoutColumns2 extends Component
{
  template  = __dirname + '/template'

  input(container1, container2)
  {
    this.column1 = container1
    this.column2 = container2
  }

  async render()
  {
    const context = 
    {
      column1:await this.column1.render(),
      column2:await this.column2.render()
    }

    return await this.handlebars.composeFile(this.template, context)
  }
}

module.exports = CraftingComponentLayoutColumns2
