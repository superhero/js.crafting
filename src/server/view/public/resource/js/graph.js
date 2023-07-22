class Graph
{
  constructor(canvas, hoover, width, height)
  {
    this.canvas   = d3.select(canvas)
    this.hoover   = d3.select(hoover)
    this.setSize(width, height)
  }

  setSize(width, height)
  {
    this.width  = width
    this.height = height
    this.xScale = d3.scaleTime().rangeRound([0, width])
    this.iScale = d3.scaleLinear().rangeRound([0, width])
    this.yScale = d3.scaleLinear().rangeRound([height, 0])

    this.xAxis  = d3.axisBottom(this.xScale)
    this.yAxis  = d3.axisLeft(this.yScale)

    this.canvas
      .attr('width',  width   + 'px')
      .attr('height', height  + 'px')

    this.hoover
      .attr('width',  width   + 'px')
      .attr('height', height  + 'px')
  }

  /**
   * @param {Array<number>} data [x, y]
   */
  setScale(data)
  {
    const
      xExtent   = d3.extent(data, d => d[0]),
      yExtent   = [Math.min(...data.map(d => d[4] || d[1])), Math.max(...data.map(d => d[3] || d[1]))],
      diffHours = data.length < 2 ? 0 : Math.abs(Math.round(((xExtent[0].getTime() - xExtent[1].getTime()) / 1e3) / (60 * 60)))

    this.xScale.domain(xExtent)
    this.yScale.domain(yExtent)
    this.iScale.domain([1, diffHours])
  }

  drawCircle(context, x, y, size, background, color, width, alpha = 1)
  {
    context.beginPath()

    context.globalAlpha  = alpha
    context.lineWidth    = width
    context.fillStyle    = background
    context.strokeStyle  = color

    context.arc(x, y, size, 0, 2 * Math.PI)
    context.fill()
    context.stroke()

    context.closePath()
  }

  drawTextBox(context, x, y, topAlign, leftAlign, background, padding, font, color, text, alphaBackground = 1, alpha = 1)
  {
    context.beginPath()

    context.globalAlpha  = alphaBackground
    context.font         = font
    context.textBaseline = 'top'
    context.fillStyle    = background

    const 
      rows        = text.split('\n'),
      height      = parseInt(font) + (padding * 2),
      totalHeight = height * rows.length,
      size        = Math.max(...rows.map((row) => context.measureText(row).width)),
      width       = size + (padding * 2)

    if(topAlign === 'mid')
    {
      y -= totalHeight / 2
    }
    else if(!topAlign)
    {
      y -= totalHeight
    }
    if(!leftAlign)
    {
      x -= width
    }

    context.fillRect(x, y, width, totalHeight)
    context.globalAlpha  = alpha
    context.fillStyle    = color
    
    for(const i in rows)
    {
      const row = rows[i]
      context.fillText(row, x + padding, (i * height) + y + padding)
    }

    context.stroke()

    context.closePath()
  }

  drawHorizontalLine(context, y, color, width, alpha = 1)
  {
    context.beginPath()

    context.globalAlpha  = alpha
    context.lineWidth    = width
    context.strokeStyle  = color

    context.moveTo(0, y)
    context.lineTo(this.width, y)
    context.stroke()

    context.closePath()
  }

  drawVerticalLine(context, x, color, width, alpha = 1)
  {
    context.beginPath()

    context.globalAlpha  = alpha
    context.lineWidth    = width
    context.strokeStyle  = color

    context.moveTo(x, 0)
    context.lineTo(x, this.height)
    context.stroke()

    context.closePath()
  }

  drawBox(context, color, x, y, width, height, alpha = 1)
  {
    context.beginPath()
    const
      scaledX       = this.xScale(x),
      scaledY       = this.yScale(y),
      scaledWidth   = this.xScale(x + width)  - scaledX,
      scaledHeight  = this.yScale(y + height) - scaledY

    context.globalAlpha  = alpha
    context.fillStyle    = color

    context.fillRect(scaledX, scaledY, scaledWidth, scaledHeight)
    context.closePath()
  }

  /**
   * @param {string} color
   * @param {Array<number>} data [x, y]
   * @param {number} alpha
   */
  drawTimebasedLine(context, color, data, width = 1, alpha = 1)
  {
    const line = d3.line()

    line.x(d => this.xScale(d[0]))
    line.y(d => this.yScale(d[1]))
    line.context(context)

    context.beginPath()

    line(data)

    context.globalAlpha  = alpha
    context.lineWidth    = width
    context.strokeStyle  = color

    context.stroke()
    context.closePath()
  }

  /**
   * @param {string} color
   * @param {Array<number>} data [x, y]
   * @param {number} [sibling=0] how many bars needs to be placed next to this one before the next one in this data series will be displayed again
   * @param {number} [width=1]
   * @param {number} [alpha=1]
   */
  drawTimebasedBars(context, color, data, sibling=0, width=1, alpha=1)
  {
    context.beginPath()

    context.globalAlpha  = alpha
    context.fillStyle    = color

    data.forEach((d) =>
    {
      const
        x       = this.xScale(d[0]),
        y       = this.yScale(d[1]),
        height  = this.height - y

      context.fillRect(x + (width * sibling), y, width, height)
    })

    context.closePath()
  }

  /**
   * @param {string} colorBull
   * @param {string} colorBear
   * @param {Array<number>} data
   * @param {number} width
   * @param {number} alpha
   */
  drawTimebasedCandels(context, colorBull, colorBear, colorShadow, data, width = 3, shadowWidth = 1, alpha = 1)
  {
    data.forEach((d) =>
    {
      const
      x         = this.xScale(d[0]) - (width / 2),
      y         = this.yScale(d[1]),
      height    = this.yScale(d[2]) - y,
      shadowTop = this.yScale(d[3]),
      shadowLow = this.yScale(d[4]),
      color     = height < 0 ? colorBull : colorBear

      context.beginPath()
      context.globalAlpha  = alpha
      context.fillStyle    = color
      context.strokeStyle  = colorShadow || color
      context.fillRect(x, y, width, height)
      context.lineWidth = shadowWidth
      context.moveTo(x + (width / 2), shadowTop)
      context.lineTo(x + (width / 2), shadowLow)
      context.stroke()
      context.closePath()
    })
  }

  /**
   * @param {string} color
   * @param {Array<number>} data [x, y_top, y_bot]
   * @param {number} alpha
   */
  drawTimebasedArea(context, color, data, alpha = 1)
  {
    const area = d3.area()

    area.x( d => this.xScale(d[0]))
    area.y0(d => this.yScale(d[1]))
    area.y1(d => this.yScale(d[2]))

    area.context(context)

    context.beginPath()

    area(data)

    context.globalAlpha  = alpha
    context.fillStyle    = color

    context.fill()
    context.closePath()
  }

  /**
   * @param {Array<number>} data [4,7,2]
   * @param {number} alpha
   */
  drawPie(context, data, colors, alpha = 1)
  {
    const
      center  = Math.min(this.width, this.height) / 2,
      d3Pie   = d3.pie(),
      pie     = d3Pie(data),
      color   = d3.scaleOrdinal(colors)

    for(let i = 0; i < pie.length; i++)
    {
      context.fillStyle    = color(i)
      context.strokeStyle  = color(i)
      context.globalAlpha  = alpha
      context.beginPath()
      // arg1: center-x-coordinate
      // arg2: center-y-coordinate
      // arg3: arc-radius-length
      // arg4: startAngle
      // arg5: endAngle
      context.arc(center, center, center - 1, pie[i].startAngle,  pie[i].endAngle)
      context.lineWidth = 1
      context.lineTo(center, center)
      context.fill()
      context.stroke()
      context.closePath()
    }
  }

  /**
   * @param {Array<number>} data [4,7,2]
   * @param {number} alpha
   */
  drawDonut(context, data, colors, alpha = 1)
  {
    const
      center  = Math.min(this.width, this.height) / 2,
      d3Pie   = d3.pie(),
      pie     = d3Pie(data),
      color   = d3.scaleOrdinal(colors)

    for(let i = 0; i < pie.length; i++)
    {
      context.fillStyle    = color(i)
      context.strokeStyle  = color(i)
      context.globalAlpha  = alpha
      context.beginPath()
      // arg1: center-x-coordinate
      // arg2: center-y-coordinate
      // arg3: arc-radius-length
      // arg4: startAngle
      // arg5: endAngle
      context.arc(center, center, center - 1, pie[i].startAngle,  pie[i].endAngle)
      context.lineWidth = 1
      context.lineTo(center, center)
      context.fill()
      context.stroke()
      context.closePath()
    }

    // clip the whole
    context.beginPath()
    context.arc(center, center, center - 33, 0, 2 * Math.PI)
    context.clip()
    this.clear(context)
    context.closePath()
  }

  clear(context)
  {
    context.clearRect(0, 0, this.width, this.height)
  }
}