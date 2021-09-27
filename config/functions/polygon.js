function count(array) {
  return array.length;
}

module.exports = {
  contains(point, polygon) {
    if (polygon[0] != polygon[count(polygon) - 1])
      polygon[count(polygon)] = polygon[0];
    let j = 0;
    let oddNodes = false;
    let x = point[1];
    let y = point[0];
    let n = count(polygon);
    for (i = 0; i < n; i++) {
      j++;
      if (j == n) {
        j = 0;
      }
      if (
        (polygon[i][0] < y && polygon[j][0] >= y) ||
        (polygon[j][0] < y && polygon[i][0] >= y)
      ) {
        if (
          polygon[i][1] +
            ((y - polygon[i][0]) / (polygon[j][0] - polygon[i][0])) *
              (polygon[j][1] - polygon[i][1]) <
          x
        ) {
          oddNodes = !oddNodes;
        }
      }
    }
    return oddNodes;
  },

  convertToNumbers(polygon) {
    let n = count(polygon);
    for (i = 0; i < n; i++) {
      polygon[i][0] = parseFloat(polygon[i][0]);
      polygon[i][1] = parseFloat(polygon[i][1]);
    }
    return polygon;
  },

  getMaxMinCoordinates(polygon) {
    var lat = polygon.map(function (p) {
      return p[0];
    });
    var lng = polygon.map(function (p) {
      return p[1];
    });

    var min_coords = {
      lat: Math.min(...lat),
      lng: Math.min(...lng),
    };

    var max_coords = {
      lat: Math.max(...lat),
      lng: Math.max(...lng),
    };

    let coordinates = {};
    coordinates.minValue = min_coords;
    coordinates.maxValue = max_coords;

    return coordinates;
  },
};
