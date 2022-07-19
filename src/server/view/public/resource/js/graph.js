class Graph
{
  constructor(canvas, width, height)
  {
    this.canvas   = d3.select(canvas)
    this.context  = this.canvas.node().getContext('2d')
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

    this.canvas.attr('width', width + 'px').attr('height', height + 'px')
  }

  /**
   * @param {Array<number>} data [x, y]
   */
  setScale(data)
  {
    const
      xExtent   = d3.extent(data, d => d[0]),
      yExtent   = [Math.min(...data.map(d => d[4] || d[1])), Math.max(...data.map(d => d[3] || d[1]))],
      diffHours = Math.abs(Math.round(((xExtent[0].getTime() - xExtent[1].getTime()) / 1e3) / (60 * 60)))

    this.xScale.domain(xExtent)
    this.yScale.domain(yExtent)
    this.iScale.domain([1, diffHours])
  }

  drawCircle(x, y, size, background, color, width, alpha = 1)
  {
    this.context.beginPath()

    this.context.globalAlpha  = alpha
    this.context.lineWidth    = width
    this.context.fillStyle    = background
    this.context.strokeStyle  = color

    this.context.arc(x, y, size, 0, 2 * Math.PI)
    this.context.fill()
    this.context.stroke()
  }

  drawTextBox(x, y, topAlign, leftAlign, background, padding, font, color, text, alphaBackground = 1, alpha = 1)
  {
    this.context.beginPath()

    this.context.globalAlpha  = alphaBackground
    this.context.font         = font
    this.context.textBaseline = 'top'
    this.context.fillStyle    = background

    const 
      rows        = text.split('\n'),
      height      = parseInt(font) + (padding * 2),
      totalHeight = height * rows.length,
      size        = Math.max(...rows.map((row) => this.context.measureText(row).width)),
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

    this.context.fillRect(x, y, width, totalHeight)
    this.context.globalAlpha  = alpha
    this.context.fillStyle    = color
    
    for(const i in rows)
    {
      const row = rows[i]
      this.context.fillText(row, x + padding, (i * height) + y + padding)
    }

    this.context.stroke()
  }

  drawHorizontalLine(y, color, width, alpha = 1)
  {
    this.context.beginPath()

    this.context.globalAlpha  = alpha
    this.context.lineWidth    = width
    this.context.strokeStyle  = color

    this.context.moveTo(0, y)
    this.context.lineTo(this.width, y)
    this.context.stroke()
  }

  drawVerticalLine(x, color, width, alpha = 1)
  {
    this.context.beginPath()

    this.context.globalAlpha  = alpha
    this.context.lineWidth    = width
    this.context.strokeStyle  = color

    this.context.moveTo(x, 0)
    this.context.lineTo(x, this.height)
    this.context.stroke()
  }

  /**
   * @param {string} color
   * @param {Array<number>} data [x, y]
   * @param {number} alpha
   */
  drawTimebasedLine(color, data, width = 1, alpha = 1)
  {
    const line = d3.line()

    line.x(d => this.xScale(d[0]))
    line.y(d => this.yScale(d[1]))
    line.context(this.context)

    this.context.beginPath()

    line(data)

    this.context.globalAlpha  = alpha
    this.context.lineWidth    = width
    this.context.strokeStyle  = color

    this.context.stroke()
    this.context.closePath()
  }

  /**
   * @param {string} color
   * @param {Array<number>} data [x, y]
   * @param {number} width
   * @param {number} alpha
   */
  drawTimebasedBars(color, data, width = 1, alpha = 1)
  {
    this.context.beginPath()

    this.context.globalAlpha  = alpha
    this.context.fillStyle    = color

    data.forEach((d) =>
    {
      const
      x       = this.xScale(d[0]),
      y       = this.yScale(d[1]),
      height  = this.height - y

      this.context.fillRect(x, y, width, height)
    })

    this.context.closePath()
  }

  /**
   * @param {string} colorBull
   * @param {string} colorBear
   * @param {Array<number>} data
   * @param {number} width
   * @param {number} alpha
   */
  drawTimebasedCandels(colorBull, colorBear, colorShadow, data, width = 3, shadowWidth = 1, alpha = 1)
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

      this.context.beginPath()
      this.context.globalAlpha  = alpha
      this.context.fillStyle    = color
      this.context.strokeStyle  = colorShadow || color
      this.context.fillRect(x, y, width, height)
      this.context.lineWidth = shadowWidth
      this.context.moveTo(x + (width / 2), shadowTop)
      this.context.lineTo(x + (width / 2), shadowLow)
      this.context.stroke()
      this.context.closePath()
    })
  }

  /**
   * @param {string} color
   * @param {Array<number>} data [x, y_top, y_bot]
   * @param {number} alpha
   */
  drawTimebasedArea(color, data, alpha = 1)
  {
    const area = d3.area()

    area.x( d => this.xScale(d[0]))
    area.y0(d => this.yScale(d[1]))
    area.y1(d => this.yScale(d[2]))

    area.context(this.context)

    this.context.beginPath()

    area(data)

    this.context.globalAlpha  = alpha
    this.context.fillStyle    = color

    this.context.fill()
    this.context.closePath()
  }

  /**
   * @param {Array<number>} data [4,7,2]
   * @param {number} alpha
   */
  drawPie(data, alpha = 1)
  {
    const
      center  = Math.min(this.width, this.height) / 2,
      d3Pie   = d3.pie(),
      pie     = d3Pie(data),
      color   = d3.scaleOrdinal(['#fff','#ccc','#aaa','#888','#666'])

    for(let i = 0; i < pie.length; i++)
    {
      this.context.fillStyle    = color(i)
      this.context.strokeStyle  = color(i)
      this.context.globalAlpha  = alpha
      this.context.beginPath()
      // arg1: center-x-coordinate
      // arg2: center-y-coordinate
      // arg3: arc-radius-length
      // arg4: startAngle
      // arg5: endAngle
      this.context.arc(center, center, center - 1, pie[i].startAngle,  pie[i].endAngle)
      this.context.lineWidth = 1
      this.context.lineTo(center, center)
      this.context.fill()
      this.context.stroke()
      this.context.closePath()
    }
  }

  /**
   * @param {Array<number>} data [4,7,2]
   * @param {number} alpha
   */
  drawDonut(data, alpha = 1)
  {
    const
      center  = Math.min(this.width, this.height) / 2,
      d3Pie   = d3.pie(),
      pie     = d3Pie(data),
      color   = d3.scaleOrdinal(['#fff','#ccc','#aaa','#888','#666'])

    for(let i = 0; i < pie.length; i++)
    {
      this.context.fillStyle    = color(i)
      this.context.strokeStyle  = color(i)
      this.context.globalAlpha  = alpha
      this.context.beginPath()
      // arg1: center-x-coordinate
      // arg2: center-y-coordinate
      // arg3: arc-radius-length
      // arg4: startAngle
      // arg5: endAngle
      this.context.arc(center, center, center - 1, pie[i].startAngle,  pie[i].endAngle)
      this.context.lineWidth = 1
      this.context.lineTo(center, center)
      this.context.fill()
      this.context.stroke()
      this.context.closePath()
    }

    // clip the whole
    this.context.beginPath()
    this.context.arc(center, center, center - 33, 0, 2 * Math.PI)
    this.context.clip()
    this.clear()
    this.context.closePath()
  }

  clear()
  {
    this.context.clearRect(0, 0, this.width, this.height)
  }
}