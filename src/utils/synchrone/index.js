// 配置
const BAIDU_AK = '您的百度地图AK'
const TIME_INTERVALS = [5, 10, 15, 20, 30] // 时间分组间隔（分钟）

// 存储数据
let travelResults = []
let currentRoutes = []

/**
 * 主函数：生成等时线
 */
async function generateIsochrones (parksData) {
  const housePoint = {
    lng: 106.58155011886394,
    lat: 29.556274915594646,
    name: '德艺大厦'
  }

  const parks = parksData // 使用您的公园数据

  // 1. 计算到所有公园的行程时间
  travelResults = await calculateAllTravelTimes(housePoint, parks)

  // 2. 按时间分组
  const timeGroups = groupByTime(travelResults, TIME_INTERVALS)

  // 3. 为每个时间组生成路径
  await generateRoutesForGroups(housePoint, timeGroups)

  // 4. 在地图上绘制
  drawRoutesOnMap(currentRoutes)

  // 5. 显示统计信息
  displayStatistics(timeGroups)
}

/**
 * 计算房源到所有公园的行程时间
 */
async function calculateAllTravelTimes (housePoint, parks) {
  const results = []

  for (const park of parks) {
    try {
      const travelTime = await getTravelTime(
        housePoint,
        {
          lng: park.longitude,
          lat: park.latitude,
          name: park.name
        }
      )

      if (travelTime !== null) {
        results.push({
          park: park,
          time: travelTime,
          coordinates: [park.longitude, park.latitude]
        })
        console.log(`到 ${park.name} 的时间: ${travelTime} 分钟`)
      }
    } catch (error) {
      console.warn(`计算 ${park.name} 路径失败:`, error)
    }

    // 添加延迟避免请求过快
    await delay(200)
  }

  return results.sort((a, b) => a.time - b.time)
}

/**
 * 获取单条路径的行程时间
 */
async function getTravelTime (origin, destination) {
  // 百度API坐标格式：纬度,经度
  const originStr = `${origin.lat},${origin.lng}`
  const destinationStr = `${destination.lat},${destination.lng}`

  const url = `https://api.map.baidu.com/directionlite/v1/driving?origin=${originStr}&destination=${destinationStr}&ak=${BAIDU_AK}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 0 && data.result) {
      const route = data.result.routes[0]
      return Math.round(route.duration / 60) // 转换为分钟
    } else {
      console.warn(`API返回错误: ${data.message}`)
      return null
    }
  } catch (error) {
    console.error('请求失败:', error)
    return null
  }
}

/**
 * 按时间间隔分组
 */
function groupByTime (travelResults, intervals) {
  const groups = {}

  // 初始化分组
  intervals.forEach(interval => {
    groups[interval] = []
  })
  groups['over'] = [] // 超时组

  // 分配公园到对应时间组
  travelResults.forEach(result => {
    let assigned = false
    for (let i = 0; i < intervals.length; i++) {
      if (result.time <= intervals[i]) {
        groups[intervals[i]].push(result)
        assigned = true
        break
      }
    }
    if (!assigned) {
      groups['over'].push(result)
    }
  })

  return groups
}

/**
 * 为每个时间组生成路径
 */
async function generateRoutesForGroups (housePoint, timeGroups) {
  currentRoutes = []

  for (const [timeInterval, parksInGroup] of Object.entries(timeGroups)) {
    if (parksInGroup.length === 0) continue

    // 为每个时间组选择不同的颜色
    const color = getColorForTimeInterval(parseInt(timeInterval) || 999)

    if (parksInGroup.length === 1) {
      // 单个公园，直接获取路径
      const route = await getRouteGeometry(housePoint, parksInGroup[0])
      if (route) {
        currentRoutes.push({
          points: route,
          color: color,
          time: timeInterval,
          count: 1
        })
      }
    } else {
      // 多个公园，选取第一个作为终点，其他作为途径点
      const waypoints = parksInGroup.slice(1).map(p => p.coordinates)
      const route = await getRouteWithWaypoints(housePoint, parksInGroup[0], waypoints)

      if (route) {
        currentRoutes.push({
          points: route,
          color: color,
          time: timeInterval,
          count: parksInGroup.length
        })
      }
    }

    await delay(400) // 请求间隔
  }
}

/**
 * 获取带途径点的路径几何
 */
async function getRouteWithWaypoints (origin, destination, waypoints) {
  if (waypoints.length === 0) {
    return await getRouteGeometry(origin, destination)
  }

  // 百度地图途径点格式：纬度,经度;纬度,经度...
  const waypointsStr = waypoints.map(wp => `${wp[1]},${wp[0]}`).join(';')
  const originStr = `${origin.lat},${origin.lng}`
  const destinationStr = `${destination.lat},${destination.lng}`

  const url = `https://api.map.baidu.com/directionlite/v1/driving?origin=${originStr}&destination=${destinationStr}&waypoints=${waypointsStr}&ak=${BAIDU_AK}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 0 && data.result) {
      const route = data.result.routes[0]
      return extractRouteGeometry(route)
    }
    return null
  } catch (error) {
    console.error('获取途径点路径失败:', error)
    return null
  }
}

/**
 * 获取简单路径几何
 */
async function getRouteGeometry (origin, destination) {
  const originStr = `${origin.lat},${origin.lng}`
  const destinationStr = `${destination.park.latitude},${destination.park.longitude}`

  const url = `https://api.map.baidu.com/directionlite/v1/driving?origin=${originStr}&destination=${destinationStr}&ak=${BAIDU_AK}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 0 && data.result) {
      const route = data.result.routes[0]
      return extractRouteGeometry(route)
    }
    return null
  } catch (error) {
    console.error('获取路径几何失败:', error)
    return null
  }
}

/**
 * 从路径结果中提取几何坐标
 */
function extractRouteGeometry (route) {
  if (!route || !route.steps) return null

  const points = []
  route.steps.forEach(step => {
    // 百度地图返回的路径点字符串，需要解析
    if (step.path) {
      const pathPoints = step.path.split(';')
      pathPoints.forEach(pointStr => {
        const [lng, lat] = pointStr.split(',').map(Number)
        points.push(new BMap.Point(lng, lat))
      })
    }
  })

  return points
}

/**
 * 在地图上绘制路径
 */
function drawRoutesOnMap (routes, map) {
  // 清除现有路径
  clearExistingRoutes()

  routes.forEach(route => {
    if (route.points && route.points.length > 1) {
      const polyline = new BMap.Polyline(route.points, {
        strokeColor: route.color,
        strokeWeight: 4,
        strokeOpacity: 0.7
      })

      map.addOverlay(polyline)
      currentPolylines.push(polyline)

      // 添加路径信息标签
      addRouteLabel(route, polyline.getBounds().getCenter())
    }
  })
}

/**
 * 添加路径标签
 */
function addRouteLabel (route, position, map) {
  const label = new BMap.Label(
    `≤${route.time}分钟: ${route.count}个公园`,
    { position: position }
  )

  label.setStyle({
    backgroundColor: route.color,
    border: 'none',
    color: 'white',
    fontSize: '12px',
    padding: '5px 10px',
    borderRadius: '3px'
  })

  map.addOverlay(label)
  currentLabels.push(label)
}

/**
 * 根据时间间隔获取颜色
 */
function getColorForTimeInterval (time) {
  const colors = {
    5: '#00FF00', // 绿色 - 5分钟内
    10: '#80FF00', // 黄绿色
    15: '#FFFF00', // 黄色
    20: '#FF8000', // 橙色
    30: '#FF0000', // 红色 - 30分钟内
    999: '#800080' // 紫色 - 超时
  }

  return colors[time] || '#CCCCCC'
}

/**
 * 显示统计信息
 */
function displayStatistics (timeGroups) {
  let statsHTML = '<h4>等时线统计</h4>'

  for (const [time, parks] of Object.entries(timeGroups)) {
    const displayTime = time === 'over' ? '30分钟以上' : `${time}分钟内`
    statsHTML += `<p>${displayTime}: ${parks.length}个公园</p>`
  }

  // 假设有一个div来显示统计信息
  const statsDiv = document.getElementById('isochrone-stats')
  if (statsDiv) {
    statsDiv.innerHTML = statsHTML
  }
}

// 工具函数
function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 存储当前覆盖物
let currentPolylines = []
let currentLabels = []

function clearExistingRoutes () {
  currentPolylines.forEach(polyline => map.removeOverlay(polyline))
  currentLabels.forEach(label => map.removeOverlay(label))
  currentPolylines = []
  currentLabels = []
}

// 初始化地图后调用
function initMap () {
  // 您的百度地图初始化代码
  map = new BMap.Map('map-container')
  // ... 其他初始化代码

  // 生成等时线
  generateIsochrones()
}
