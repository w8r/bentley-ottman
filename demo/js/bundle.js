(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var findIntersections = require('../../index.js');

var osm = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
    maxZoom: 22,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
}),
    point = L.latLng([55.753210, 37.621766]),
    map = new L.Map('map', { layers: [osm], center: point, zoom: 12, maxZoom: 22 }),
    root = document.getElementById('content');

var bounds = map.getBounds(),
    n = bounds._northEast.lat,
    e = bounds._northEast.lng,
    s = bounds._southWest.lat,
    w = bounds._southWest.lng,
    height = n - s,
    width = e - w,
    qHeight = height / 4,
    qWidth = width / 4,
    lines = [];

var points = turf.random('points', 10, {
    bbox: [w + qWidth, s + qHeight, e - qWidth, n - qHeight]
});

var coords = points.features.map(function (feature) {
    return feature.geometry.coordinates;
});

for (var i = 0; i < coords.length; i += 2) {
    lines.push([coords[i], coords[i + 1]]);

    var begin = [coords[i][1], coords[i][0]],
        end = [coords[i + 1][1], coords[i + 1][0]];

    L.circleMarker(L.latLng(begin), { radius: 2, fillColor: "#FFFF00", weight: 2 }).addTo(map);
    L.circleMarker(L.latLng(end), { radius: 2, fillColor: "#FFFF00", weight: 2 }).addTo(map);
    L.polyline([begin, end], { weight: 1 }).addTo(map);
}

findIntersections(lines, map);
window.map = map;

},{"../../index.js":2}],2:[function(require,module,exports){
var findIntersections = require('./src/sweepline.js');

module.exports = findIntersections;

},{"./src/sweepline.js":5}],3:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.avl = factory());
}(this, (function () { 'use strict';

function print(root, printNode) {
  if ( printNode === void 0 ) printNode = function (n) { return n.key; };

  var out = [];
  row(root, '', true, function (v) { return out.push(v); }, printNode);
  return out.join('');
}

function row(root, prefix, isTail, out, printNode) {
  if (root) {
    out(("" + prefix + (isTail ? '└── ' : '├── ') + (printNode(root)) + "\n"));
    var indent = prefix + (isTail ? '    ' : '│   ');
    if (root.left)  { row(root.left,  indent, false, out, printNode); }
    if (root.right) { row(root.right, indent, true,  out, printNode); }
  }
}


function isBalanced(root) {
  // If node is empty then return true
  if (root === null) { return true; }

  // Get the height of left and right sub trees
  var lh = height(root.left);
  var rh = height(root.right);

  if (Math.abs(lh - rh) <= 1 &&
      isBalanced(root.left)  &&
      isBalanced(root.right)) { return true; }

  // If we reach here then tree is not height-balanced
  return false;
}

/**
 * The function Compute the 'height' of a tree.
 * Height is the number of nodes along the longest path
 * from the root node down to the farthest leaf node.
 *
 * @param  {Node} node
 * @return {Number}
 */
function height(node) {
  return node ? (1 + Math.max(height(node.left), height(node.right))) : 0;
}

// function createNode (parent, left, right, height, key, data) {
//   return { parent, left, right, balanceFactor: height, key, data };
// }


function DEFAULT_COMPARE (a, b) { return a > b ? 1 : a < b ? -1 : 0; }


function rotateLeft (node) {
  var rightNode = node.right;
  node.right    = rightNode.left;

  if (rightNode.left) { rightNode.left.parent = node; }

  rightNode.parent = node.parent;
  if (rightNode.parent) {
    if (rightNode.parent.left === node) {
      rightNode.parent.left = rightNode;
    } else {
      rightNode.parent.right = rightNode;
    }
  }

  node.parent    = rightNode;
  rightNode.left = node;

  node.balanceFactor += 1;
  if (rightNode.balanceFactor < 0) {
    node.balanceFactor -= rightNode.balanceFactor;
  }

  rightNode.balanceFactor += 1;
  if (node.balanceFactor > 0) {
    rightNode.balanceFactor += node.balanceFactor;
  }
  return rightNode;
}


function rotateRight (node) {
  var leftNode = node.left;
  node.left = leftNode.right;
  if (node.left) { node.left.parent = node; }

  leftNode.parent = node.parent;
  if (leftNode.parent) {
    if (leftNode.parent.left === node) {
      leftNode.parent.left = leftNode;
    } else {
      leftNode.parent.right = leftNode;
    }
  }

  node.parent    = leftNode;
  leftNode.right = node;

  node.balanceFactor -= 1;
  if (leftNode.balanceFactor > 0) {
    node.balanceFactor -= leftNode.balanceFactor;
  }

  leftNode.balanceFactor -= 1;
  if (node.balanceFactor < 0) {
    leftNode.balanceFactor += node.balanceFactor;
  }

  return leftNode;
}


// function leftBalance (node) {
//   if (node.left.balanceFactor === -1) rotateLeft(node.left);
//   return rotateRight(node);
// }


// function rightBalance (node) {
//   if (node.right.balanceFactor === 1) rotateRight(node.right);
//   return rotateLeft(node);
// }


var Tree = function Tree (comparator) {
  this._comparator = comparator || DEFAULT_COMPARE;
  this._root = null;
  this._size = 0;
};

var prototypeAccessors = { size: {} };


Tree.prototype.destroy = function destroy () {
  this._root = null;
};

prototypeAccessors.size.get = function () {
  return this._size;
};


Tree.prototype.contains = function contains (key) {
  if (this._root){
    var node     = this._root;
    var comparator = this._comparator;
    while (node){
      var cmp = comparator(key, node.key);
      if    (cmp === 0)   { return true; }
      else if (cmp === -1) { node = node.left; }
      else                  { node = node.right; }
    }
  }
  return false;
};


/* eslint-disable class-methods-use-this */
Tree.prototype.next = function next (node) {
  var sucessor = node.right;
  while (sucessor && sucessor.left) { sucessor = sucessor.left; }
  return sucessor;
};


Tree.prototype.prev = function prev (node) {
  var predecessor = node.left;
  while (predecessor && predecessor.right) { predecessor = predecessor.right; }
  return predecessor;
};
/* eslint-enable class-methods-use-this */


Tree.prototype.forEach = function forEach (fn) {
  var current = this._root;
  var s = [], done = false, i = 0;

  while (!done) {
    // Reach the left most Node of the current Node
    if (current) {
      // Place pointer to a tree node on the stack
      // before traversing the node's left subtree
      s.push(current);
      current = current.left;
    } else {
      // BackTrack from the empty subtree and visit the Node
      // at the top of the stack; however, if the stack is
      // empty you are done
      if (s.length > 0) {
        current = s.pop();
        fn(current, i++);

        // We have visited the node and its left
        // subtree. Now, it's right subtree's turn
        current = current.right;
      } else { done = true; }
    }
  }
  return this;
};


Tree.prototype.keys = function keys () {
  var current = this._root;
  var s = [], r = [], done = false;

  while (!done) {
    if (current) {
      s.push(current);
      current = current.left;
    } else {
      if (s.length > 0) {
        current = s.pop();
        r.push(current.key);
        current = current.right;
      } else { done = true; }
    }
  }
  return r;
};


Tree.prototype.values = function values () {
  var current = this._root;
  var s = [], r = [], done = false;

  while (!done) {
    if (current) {
      s.push(current);
      current = current.left;
    } else {
      if (s.length > 0) {
        current = s.pop();
        r.push(current.data);
        current = current.right;
      } else { done = true; }
    }
  }
  return r;
};


Tree.prototype.minNode = function minNode () {
  var node = this._root;
  while (node && node.left) { node = node.left; }
  return node;
};


Tree.prototype.maxNode = function maxNode () {
  var node = this._root;
  while (node && node.right) { node = node.right; }
  return node;
};


Tree.prototype.min = function min () {
  return this.minNode().key;
};


Tree.prototype.max = function max () {
  return this.maxNode().key;
};


Tree.prototype.isEmpty = function isEmpty () {
  return !this._root;
};


Tree.prototype.pop = function pop () {
  var node = this._root;
  while (node.left) { node = node.left; }
  var returnValue = { key: node.key, data: node.data };
  this.remove(node.key);
  return returnValue;
};


Tree.prototype.find = function find (key) {
  var root = this._root;
  if (root === null)  { return null; }
  if (key === root.key) { return root; }

  var subtree = root, cmp;
  var compare = this._comparator;
  while (subtree) {
    cmp = compare(key, subtree.key);
    if    (cmp === 0) { return subtree; }
    else if (cmp < 0) { subtree = subtree.left; }
    else              { subtree = subtree.right; }
  }

  return null;
};


Tree.prototype.insert = function insert (key, data) {
    var this$1 = this;

  // if (this.contains(key)) return null;

  if (!this._root) {
    this._root = {
      parent: null, left: null, right: null, balanceFactor: 0,
      key: key, data: data
    };
    this._size++;
    return this._root;
  }

  var compare = this._comparator;
  var node  = this._root;
  var parent= null;
  var cmp   = 0;

  while (node) {
    cmp = compare(key, node.key);
    parent = node;
    if    (cmp === 0) { return null; }
    else if (cmp < 0) { node = node.left; }
    else              { node = node.right; }
  }

  var newNode = {
    left: null, right: null, balanceFactor: 0,
    parent: parent, key: key, data: data,
  };
  if (cmp < 0) { parent.left= newNode; }
  else       { parent.right = newNode; }

  while (parent) {
    if (compare(parent.key, key) < 0) { parent.balanceFactor -= 1; }
    else                            { parent.balanceFactor += 1; }

    if      (parent.balanceFactor === 0) { break; }
    else if (parent.balanceFactor < -1) {
      //let newRoot = rightBalance(parent);
      if (parent.right.balanceFactor === 1) { rotateRight(parent.right); }
      var newRoot = rotateLeft(parent);

      if (parent === this$1._root) { this$1._root = newRoot; }
      break;
    } else if (parent.balanceFactor > 1) {
      // let newRoot = leftBalance(parent);
      if (parent.left.balanceFactor === -1) { rotateLeft(parent.left); }
      var newRoot$1 = rotateRight(parent);

      if (parent === this$1._root) { this$1._root = newRoot$1; }
      break;
    }
    parent = parent.parent;
  }

  this._size++;
  return newNode;
};


Tree.prototype.remove = function remove (key) {
    var this$1 = this;

  if (!this._root) { return null; }

  // if (!this.contains(key)) return null;

  var node = this._root;
  var compare = this._comparator;

  while (node) {
    var cmp = compare(key, node.key);
    if    (cmp === 0) { break; }
    else if (cmp < 0) { node = node.left; }
    else              { node = node.right; }
  }
  if (!node) { return null; }
  var returnValue = node.key;

  if (node.left) {
    var max = node.left;

    while (max.left || max.right) {
      while (max.right) { max = max.right; }

      node.key = max.key;
      node.data = max.data;
      if (max.left) {
        node = max;
        max = max.left;
      }
    }

    node.key= max.key;
    node.data = max.data;
    node = max;
  }

  if (node.right) {
    var min = node.right;

    while (min.left || min.right) {
      while (min.left) { min = min.left; }

      node.key= min.key;
      node.data = min.data;
      if (min.right) {
        node = min;
        min = min.right;
      }
    }

    node.key= min.key;
    node.data = min.data;
    node = min;
  }

  var parent = node.parent;
  var pp   = node;

  while (parent) {
    if (parent.left === pp) { parent.balanceFactor -= 1; }
    else                  { parent.balanceFactor += 1; }

    if      (parent.balanceFactor < -1) {
      //let newRoot = rightBalance(parent);
      if (parent.right.balanceFactor === 1) { rotateRight(parent.right); }
      var newRoot = rotateLeft(parent);

      if (parent === this$1._root) { this$1._root = newRoot; }
      parent = newRoot;
    } else if (parent.balanceFactor > 1) {
      // let newRoot = leftBalance(parent);
      if (parent.left.balanceFactor === -1) { rotateLeft(parent.left); }
      var newRoot$1 = rotateRight(parent);

      if (parent === this$1._root) { this$1._root = newRoot$1; }
      parent = newRoot$1;
    }

    if (parent.balanceFactor === -1 || parent.balanceFactor === 1) { break; }

    pp   = parent;
    parent = parent.parent;
  }

  if (node.parent) {
    if (node.parent.left === node) { node.parent.left= null; }
    else                         { node.parent.right = null; }
  }

  if (node === this._root) { this._root = null; }

  this._size--;
  return returnValue;
};


Tree.prototype.isBalanced = function isBalanced$1 () {
  return isBalanced(this._root);
};


Tree.prototype.toString = function toString (printNode) {
  return print(this._root, printNode);
};

Object.defineProperties( Tree.prototype, prototypeAccessors );

return Tree;

})));


},{}],4:[function(require,module,exports){
var utils = require('./utils');

function handleEventPoint(point, queue, status) {
    var p = point.data.point;
    // 1
    var up = point.data.segment;
    var ups = up ? [up] : [];
    var lps = [];
    var cps = [];

    var result = [];

    // 1. Initialize event queue EQ = all segment endpoints
    status.forEach(function (node) {
        var segment = node.data,
            begin = segment[0],
            end = segment[1];

        // find lower intersection
        if (p[0] === end[0] && p[1] === end[1]) {
            lps.push(segment);
        }

        // find inner intersections
        if (utils.pointOnLine(segment, p)) {
            cps.push(segment);
        }
    });

    // 3
    if (ups.concat(lps).concat(cps).length > 1) {
        // 4
        result.push(p);
    }

    // 5
    removeFromTree(lps, status);
    removeFromTree(cps, status);

    // 6
    insertIntoTree(ups, status);
    insertIntoTree(cps, status);

    // console.log(status);

    return result;
}

function removeFromTree(arr, tree) {
    arr.forEach(function (item) {
        tree.remove(item);
    });
}

function insertIntoTree(arr, tree) {
    arr.forEach(function (item) {
        tree.insert(item);
    });
}

module.exports = handleEventPoint;

},{"./utils":6}],5:[function(require,module,exports){
// first we define a sweepline
// sweepline has to update its status

/**
 *  balanced AVL BST for storing an event queue and sweepline status
 */

// (1) Initialize event queue EQ = all segment endpoints;
// (2) Sort EQ by increasing x and y;
// (3) Initialize sweep line SL to be empty;
// (4) Initialize output intersection list IL to be empty;
//
// (5) While (EQ is nonempty) {
//     (6) Let E = the next event from EQ;
//     (7) If (E is a left endpoint) {
//             Let segE = E's segment;
//             Add segE to SL;
//             Let segA = the segment Above segE in SL;
//             Let segB = the segment Below segE in SL;
//             If (I = Intersect( segE with segA) exists)
//                 Insert I into EQ;
//             If (I = Intersect( segE with segB) exists)
//                 Insert I into EQ;
//         }
//         Else If (E is a right endpoint) {
//             Let segE = E's segment;
//             Let segA = the segment Above segE in SL;
//             Let segB = the segment Below segE in SL;
//             Delete segE from SL;
//             If (I = Intersect( segA with segB) exists)
//                 If (I is not in EQ already)
//                     Insert I into EQ;
//         }
//         Else {  // E is an intersection event
//             Add E’s intersect point to the output list IL;
//             Let segE1 above segE2 be E's intersecting segments in SL;
//             Swap their positions so that segE2 is now above segE1;
//             Let segA = the segment above segE2 in SL;
//             Let segB = the segment below segE1 in SL;
//             If (I = Intersect(segE2 with segA) exists)
//                 If (I is not in EQ already)
//                     Insert I into EQ;
//             If (I = Intersect(segE1 with segB) exists)
//                 If (I is not in EQ already)
//                     Insert I into EQ;
//         }
//         remove E from EQ;
//     }
//     return IL;
// }


var Tree = require('avl');
var handleEventPoint = require('./handleeventpoint');
var utils = require('./utils');

/**
 * @param {Array} segments set of segments intersecting sweepline [[[x1, y1], [x2, y2]] ... [[xm, ym], [xn, yn]]]
 */

function findIntersections(segments, map) {

    // (1) Initialize event queue EQ = all segment endpoints;
    // (2) Sort EQ by increasing x and y;
    var queue = new Tree(utils.comparePoints);

    // (3) Initialize sweep line SL to be empty;
    var status = new Tree(utils.compareSegments);

    // (4) Initialize output intersection list IL to be empty;
    var result = [];

    // store event points corresponding to their coordinates
    segments.forEach(function (segment) {
        // 2. Sort EQ by increasing x and y;
        segment.sort(utils.comparePoints);
        var begin = segment[0],
            end = segment[1],
            beginData = {
            point: begin,
            type: 'begin',
            segment: segment
        },
            endData = {
            point: end,
            type: 'end',
            segment: segment
        };
        queue.insert(begin, beginData);
        queue.insert(end, endData);

        // status.insert(segment, segment);
    });

    // console.log(queue.values());
    // console.log(queue);
    var values = queue.values();
    var v = values[0];
    // vv = [v.point[0], v.point[1]];
    // console.log(v.point);
    // // console.log(vv);
    // // console.log(v);
    // console.log(queue.next(v.point));
    // console.log(queue.find(v.point));
    // queue.forEach(function (n) {
    //     console.log(n.left, n.right);
    // });
    // console.log(queue.toString());

    values.forEach(function (value, index, array) {
        var p = value.point;
        var ll = L.latLng([p[1], p[0]]);
        var mrk = L.circleMarker(ll, { radius: 4, color: 'red', fillColor: 'FF00' + 2 ** index }).addTo(map);
        mrk.bindPopup('' + index + '\n' + p[0] + '\n' + p[1]);
    });

    // (5) While (EQ is nonempty) {
    while (!queue.isEmpty()) {
        //     (6) Let E = the next event from EQ;
        var event = queue.pop();

        //     (7) If (E is a left endpoint) {
        if (event.data.type === 'begin') {

            // когда мы помещаем отрезок в множество статуса, мы сравниваем его в данной точке
            // с уже существующими.
            // это множество динамическое,
            // то есть отрезки меняют свое положение.

            // если в некоторой точке x у этого отрезка больше y, то он помещается после первого


            // status.x = event.data.point[0];
            //             Let segE = E's segment;
            var segE = event.data.segment;
            //             Add segE to SL;
            status.insert(segE, segE);
            //             Let segA = the segment Above segE in SL;
            // var segA = status.prev(segE);
            //             Let segB = the segment Below segE in SL;
            // var segB = status.next(segE);

            // console.log(status.toString());

            // console.log(status.values());
            var ss = status.find(segE);
            // console.log(ss);
            // console.log(ss);

            // console.log(segE);
            // console.log(tree);
            status.forEach(function (n) {
                console.log(utils.findEquation(n.data));
                // console.log(n);
            });
            //
            //
            // console.log(segA);
            // console.log(segB);
            // console.log('----');
        }
        //             If (I = Intersect( segE with segA) exists)
        //                 Insert I into EQ;
        //             If (I = Intersect( segE with segB) exists)
        //                 Insert I into EQ;
        //         }
    }

    var sValues = status.values();
    var f = sValues[0];
    // console.log(status.next(f));

    // status.forEach(function (n) {
    // console.log(n);
    // });

    // console.log(status);

    // console.log(status.toString());

    sValues.forEach(function (value, index, array) {
        lls = value.map(function (p) {
            return L.latLng(p.slice().reverse());
        });

        var line = L.polyline(lls).addTo(map);
        line.bindPopup('' + index);
    });
    // console.log(status.values());

}

module.exports = findIntersections;

},{"./handleeventpoint":4,"./utils":6,"avl":3}],6:[function(require,module,exports){
var utils = {
    // points comparator
    comparePoints: function (a, b) {
        var x1 = a[0],
            y1 = a[1],
            x2 = b[0],
            y2 = b[1];

        if (x1 > x2 || x1 === x2 && y1 > y2) {
            return 1;
        } else if (x1 < x2 || x1 === x2 && y1 < y2) {
            return -1;
        } else if (x1 === x2 && y1 === y2) {
            return 0;
        }
    },

    compareSegments: function (a, b) {
        // нужно вернуть сегмент, который в данной точке
        // является первым ближайшим по x или y

        // сортировка по y в точке с данной координатой x

        var x1 = a[0][0],
            y1 = a[0][1],
            x2 = a[1][0],
            y2 = a[1][1],
            x3 = b[0][0],
            y3 = b[0][1],
            x4 = b[1][0],
            y4 = b[1][1];

        var v1 = [x2 - x1, y2 - y1],
            v2 = [x4 - x3, y4 - y3];

        var mult = v1[0] * v2[1] - v1[1] * v2[0];

        if (y1 > y3) {
            return 1;
        } else if (y1 < y3) {
            return -1;
        } else if (y1 === y3) {
            return 0;
        }
        // if (mult > 0) {
        //     return 1;
        // } else if (mult < 0) {
        //     return -1;
        // } else if (mult === 0) {
        //     return 0;
        // }
    },

    findEquation: function (segment) {
        var x1 = segment[0][0],
            y1 = segment[0][1],
            x2 = segment[1][0],
            y2 = segment[1][1],
            a = y1 - y2,
            b = x2 - x1,
            c = x1 * y2 - x2 * y1;

        console.log(a + 'x + ' + b + 'y + ' + c + ' = 0');
    },

    pointOnLine: function (line, point) {
        var begin = line[0],
            end = line[1],
            x1 = begin[0],
            y1 = begin[1],
            x2 = end[0],
            y2 = end[1],
            x = point[0],
            y = point[1];

        return (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1) === 0 && (x > x1 && x < x2 || x > x2 && x < x1);
    }
};

module.exports = utils;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZW1vXFxqc1xcYXBwLmpzIiwiaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXZsL2Rpc3QvYXZsLmpzIiwic3JjXFxoYW5kbGVldmVudHBvaW50LmpzIiwic3JjXFxzd2VlcGxpbmUuanMiLCJzcmNcXHV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBSSxvQkFBb0IsUUFBUSxnQkFBUixDQUF4Qjs7QUFFQSxJQUFJLE1BQU0sRUFBRSxTQUFGLENBQVksaUVBQVosRUFBK0U7QUFDakYsYUFBUyxFQUR3RTtBQUVqRixpQkFBYTtBQUZvRSxDQUEvRSxDQUFWO0FBQUEsSUFJSSxRQUFRLEVBQUUsTUFBRixDQUFTLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FBVCxDQUpaO0FBQUEsSUFLSSxNQUFNLElBQUksRUFBRSxHQUFOLENBQVUsS0FBVixFQUFpQixFQUFDLFFBQVEsQ0FBQyxHQUFELENBQVQsRUFBZ0IsUUFBUSxLQUF4QixFQUErQixNQUFNLEVBQXJDLEVBQXlDLFNBQVMsRUFBbEQsRUFBakIsQ0FMVjtBQUFBLElBTUksT0FBTyxTQUFTLGNBQVQsQ0FBd0IsU0FBeEIsQ0FOWDs7QUFRQSxJQUFJLFNBQVMsSUFBSSxTQUFKLEVBQWI7QUFBQSxJQUNJLElBQUksT0FBTyxVQUFQLENBQWtCLEdBRDFCO0FBQUEsSUFFSSxJQUFJLE9BQU8sVUFBUCxDQUFrQixHQUYxQjtBQUFBLElBR0ksSUFBSSxPQUFPLFVBQVAsQ0FBa0IsR0FIMUI7QUFBQSxJQUlJLElBQUksT0FBTyxVQUFQLENBQWtCLEdBSjFCO0FBQUEsSUFLSSxTQUFTLElBQUksQ0FMakI7QUFBQSxJQU1JLFFBQVEsSUFBSSxDQU5oQjtBQUFBLElBT0ksVUFBVSxTQUFTLENBUHZCO0FBQUEsSUFRSSxTQUFTLFFBQVEsQ0FSckI7QUFBQSxJQVNJLFFBQVEsRUFUWjs7QUFXQSxJQUFJLFNBQVMsS0FBSyxN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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuZUEsSUFBSSxRQUFRLFFBQVEsU0FBUixDQUFaOztBQUVBLFNBQVMsZ0JBQVQsQ0FBMEIsS0FBMUIsRUFBaUMsS0FBakMsRUFBd0MsTUFBeEMsRUFBZ0Q7QUFDNUMsUUFBSSxJQUFJLE1BQU0sSUFBTixDQUFXLEtBQW5CO0FBQ0E7QUFDQSxRQUFJLEtBQUss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RU8sQ0FBWjs7QUFpRkEsT0FBTyxPQUFQLEdBQWlCLEtBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBmaW5kSW50ZXJzZWN0aW9ucyA9IHJlcXVpcmUoJy4uLy4uL2luZGV4LmpzJyk7XG5cbnZhciBvc20gPSBMLnRpbGVMYXllcignaHR0cDovL3tzfS5iYXNlbWFwcy5jYXJ0b2Nkbi5jb20vbGlnaHRfbm9sYWJlbHMve3p9L3t4fS97eX0ucG5nJywge1xuICAgICAgICBtYXhab29tOiAyMixcbiAgICAgICAgYXR0cmlidXRpb246ICdNYXAgZGF0YSAmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vcGVuc3RyZWV0bWFwLm9yZ1wiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycywgPGEgaHJlZj1cImh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LXNhLzIuMC9cIj5DQy1CWS1TQTwvYT4nXG4gICAgfSksXG4gICAgcG9pbnQgPSBMLmxhdExuZyhbNTUuNzUzMjEwLCAzNy42MjE3NjZdKSxcbiAgICBtYXAgPSBuZXcgTC5NYXAoJ21hcCcsIHtsYXllcnM6IFtvc21dLCBjZW50ZXI6IHBvaW50LCB6b29tOiAxMiwgbWF4Wm9vbTogMjJ9KSxcbiAgICByb290ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbnQnKTtcblxudmFyIGJvdW5kcyA9IG1hcC5nZXRCb3VuZHMoKSxcbiAgICBuID0gYm91bmRzLl9ub3J0aEVhc3QubGF0LFxuICAgIGUgPSBib3VuZHMuX25vcnRoRWFzdC5sbmcsXG4gICAgcyA9IGJvdW5kcy5fc291dGhXZXN0LmxhdCxcbiAgICB3ID0gYm91bmRzLl9zb3V0aFdlc3QubG5nLFxuICAgIGhlaWdodCA9IG4gLSBzLFxuICAgIHdpZHRoID0gZSAtIHcsXG4gICAgcUhlaWdodCA9IGhlaWdodCAvIDQsXG4gICAgcVdpZHRoID0gd2lkdGggLyA0LFxuICAgIGxpbmVzID0gW107XG5cbnZhciBwb2ludHMgPSB0dXJmLnJhbmRvbSgncG9pbnRzJywgMTAsIHtcbiAgICBiYm94OiBbdyArIHFXaWR0aCwgcyArIHFIZWlnaHQsIGUgLSBxV2lkdGgsIG4gLSBxSGVpZ2h0XVxufSk7XG5cbnZhciBjb29yZHMgPSBwb2ludHMuZmVhdHVyZXMubWFwKGZ1bmN0aW9uKGZlYXR1cmUpIHtcbiAgICByZXR1cm4gZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcztcbn0pXG5cbmZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSs9Mikge1xuICAgIGxpbmVzLnB1c2goW2Nvb3Jkc1tpXSwgY29vcmRzW2krMV1dKTtcblxuICAgIHZhciBiZWdpbiA9IFtjb29yZHNbaV1bMV0sIGNvb3Jkc1tpXVswXV0sXG4gICAgICAgIGVuZCA9IFtjb29yZHNbaSsxXVsxXSwgY29vcmRzW2krMV1bMF1dO1xuXG4gICAgTC5jaXJjbGVNYXJrZXIoTC5sYXRMbmcoYmVnaW4pLCB7cmFkaXVzOiAyLCBmaWxsQ29sb3I6IFwiI0ZGRkYwMFwiLCB3ZWlnaHQ6IDJ9KS5hZGRUbyhtYXApO1xuICAgIEwuY2lyY2xlTWFya2VyKEwubGF0TG5nKGVuZCksIHtyYWRpdXM6IDIsIGZpbGxDb2xvcjogXCIjRkZGRjAwXCIsIHdlaWdodDogMn0pLmFkZFRvKG1hcCk7XG4gICAgTC5wb2x5bGluZShbYmVnaW4sIGVuZF0sIHt3ZWlnaHQ6IDF9KS5hZGRUbyhtYXApO1xufVxuXG5maW5kSW50ZXJzZWN0aW9ucyhsaW5lcywgbWFwKTtcbndpbmRvdy5tYXAgPSBtYXA7XG4iLCJ2YXIgZmluZEludGVyc2VjdGlvbnMgPSByZXF1aXJlKCcuL3NyYy9zd2VlcGxpbmUuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmaW5kSW50ZXJzZWN0aW9ucztcbiIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG5cdHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcblx0dHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcblx0KGdsb2JhbC5hdmwgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHByaW50KHJvb3QsIHByaW50Tm9kZSkge1xuICBpZiAoIHByaW50Tm9kZSA9PT0gdm9pZCAwICkgcHJpbnROb2RlID0gZnVuY3Rpb24gKG4pIHsgcmV0dXJuIG4ua2V5OyB9O1xuXG4gIHZhciBvdXQgPSBbXTtcbiAgcm93KHJvb3QsICcnLCB0cnVlLCBmdW5jdGlvbiAodikgeyByZXR1cm4gb3V0LnB1c2godik7IH0sIHByaW50Tm9kZSk7XG4gIHJldHVybiBvdXQuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIHJvdyhyb290LCBwcmVmaXgsIGlzVGFpbCwgb3V0LCBwcmludE5vZGUpIHtcbiAgaWYgKHJvb3QpIHtcbiAgICBvdXQoKFwiXCIgKyBwcmVmaXggKyAoaXNUYWlsID8gJ+KUlOKUgOKUgCAnIDogJ+KUnOKUgOKUgCAnKSArIChwcmludE5vZGUocm9vdCkpICsgXCJcXG5cIikpO1xuICAgIHZhciBpbmRlbnQgPSBwcmVmaXggKyAoaXNUYWlsID8gJyAgICAnIDogJ+KUgiAgICcpO1xuICAgIGlmIChyb290LmxlZnQpICB7IHJvdyhyb290LmxlZnQsICBpbmRlbnQsIGZhbHNlLCBvdXQsIHByaW50Tm9kZSk7IH1cbiAgICBpZiAocm9vdC5yaWdodCkgeyByb3cocm9vdC5yaWdodCwgaW5kZW50LCB0cnVlLCAgb3V0LCBwcmludE5vZGUpOyB9XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBpc0JhbGFuY2VkKHJvb3QpIHtcbiAgLy8gSWYgbm9kZSBpcyBlbXB0eSB0aGVuIHJldHVybiB0cnVlXG4gIGlmIChyb290ID09PSBudWxsKSB7IHJldHVybiB0cnVlOyB9XG5cbiAgLy8gR2V0IHRoZSBoZWlnaHQgb2YgbGVmdCBhbmQgcmlnaHQgc3ViIHRyZWVzXG4gIHZhciBsaCA9IGhlaWdodChyb290LmxlZnQpO1xuICB2YXIgcmggPSBoZWlnaHQocm9vdC5yaWdodCk7XG5cbiAgaWYgKE1hdGguYWJzKGxoIC0gcmgpIDw9IDEgJiZcbiAgICAgIGlzQmFsYW5jZWQocm9vdC5sZWZ0KSAgJiZcbiAgICAgIGlzQmFsYW5jZWQocm9vdC5yaWdodCkpIHsgcmV0dXJuIHRydWU7IH1cblxuICAvLyBJZiB3ZSByZWFjaCBoZXJlIHRoZW4gdHJlZSBpcyBub3QgaGVpZ2h0LWJhbGFuY2VkXG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBUaGUgZnVuY3Rpb24gQ29tcHV0ZSB0aGUgJ2hlaWdodCcgb2YgYSB0cmVlLlxuICogSGVpZ2h0IGlzIHRoZSBudW1iZXIgb2Ygbm9kZXMgYWxvbmcgdGhlIGxvbmdlc3QgcGF0aFxuICogZnJvbSB0aGUgcm9vdCBub2RlIGRvd24gdG8gdGhlIGZhcnRoZXN0IGxlYWYgbm9kZS5cbiAqXG4gKiBAcGFyYW0gIHtOb2RlfSBub2RlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGhlaWdodChub2RlKSB7XG4gIHJldHVybiBub2RlID8gKDEgKyBNYXRoLm1heChoZWlnaHQobm9kZS5sZWZ0KSwgaGVpZ2h0KG5vZGUucmlnaHQpKSkgOiAwO1xufVxuXG4vLyBmdW5jdGlvbiBjcmVhdGVOb2RlIChwYXJlbnQsIGxlZnQsIHJpZ2h0LCBoZWlnaHQsIGtleSwgZGF0YSkge1xuLy8gICByZXR1cm4geyBwYXJlbnQsIGxlZnQsIHJpZ2h0LCBiYWxhbmNlRmFjdG9yOiBoZWlnaHQsIGtleSwgZGF0YSB9O1xuLy8gfVxuXG5cbmZ1bmN0aW9uIERFRkFVTFRfQ09NUEFSRSAoYSwgYikgeyByZXR1cm4gYSA+IGIgPyAxIDogYSA8IGIgPyAtMSA6IDA7IH1cblxuXG5mdW5jdGlvbiByb3RhdGVMZWZ0IChub2RlKSB7XG4gIHZhciByaWdodE5vZGUgPSBub2RlLnJpZ2h0O1xuICBub2RlLnJpZ2h0ICAgID0gcmlnaHROb2RlLmxlZnQ7XG5cbiAgaWYgKHJpZ2h0Tm9kZS5sZWZ0KSB7IHJpZ2h0Tm9kZS5sZWZ0LnBhcmVudCA9IG5vZGU7IH1cblxuICByaWdodE5vZGUucGFyZW50ID0gbm9kZS5wYXJlbnQ7XG4gIGlmIChyaWdodE5vZGUucGFyZW50KSB7XG4gICAgaWYgKHJpZ2h0Tm9kZS5wYXJlbnQubGVmdCA9PT0gbm9kZSkge1xuICAgICAgcmlnaHROb2RlLnBhcmVudC5sZWZ0ID0gcmlnaHROb2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICByaWdodE5vZGUucGFyZW50LnJpZ2h0ID0gcmlnaHROb2RlO1xuICAgIH1cbiAgfVxuXG4gIG5vZGUucGFyZW50ICAgID0gcmlnaHROb2RlO1xuICByaWdodE5vZGUubGVmdCA9IG5vZGU7XG5cbiAgbm9kZS5iYWxhbmNlRmFjdG9yICs9IDE7XG4gIGlmIChyaWdodE5vZGUuYmFsYW5jZUZhY3RvciA8IDApIHtcbiAgICBub2RlLmJhbGFuY2VGYWN0b3IgLT0gcmlnaHROb2RlLmJhbGFuY2VGYWN0b3I7XG4gIH1cblxuICByaWdodE5vZGUuYmFsYW5jZUZhY3RvciArPSAxO1xuICBpZiAobm9kZS5iYWxhbmNlRmFjdG9yID4gMCkge1xuICAgIHJpZ2h0Tm9kZS5iYWxhbmNlRmFjdG9yICs9IG5vZGUuYmFsYW5jZUZhY3RvcjtcbiAgfVxuICByZXR1cm4gcmlnaHROb2RlO1xufVxuXG5cbmZ1bmN0aW9uIHJvdGF0ZVJpZ2h0IChub2RlKSB7XG4gIHZhciBsZWZ0Tm9kZSA9IG5vZGUubGVmdDtcbiAgbm9kZS5sZWZ0ID0gbGVmdE5vZGUucmlnaHQ7XG4gIGlmIChub2RlLmxlZnQpIHsgbm9kZS5sZWZ0LnBhcmVudCA9IG5vZGU7IH1cblxuICBsZWZ0Tm9kZS5wYXJlbnQgPSBub2RlLnBhcmVudDtcbiAgaWYgKGxlZnROb2RlLnBhcmVudCkge1xuICAgIGlmIChsZWZ0Tm9kZS5wYXJlbnQubGVmdCA9PT0gbm9kZSkge1xuICAgICAgbGVmdE5vZGUucGFyZW50LmxlZnQgPSBsZWZ0Tm9kZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGVmdE5vZGUucGFyZW50LnJpZ2h0ID0gbGVmdE5vZGU7XG4gICAgfVxuICB9XG5cbiAgbm9kZS5wYXJlbnQgICAgPSBsZWZ0Tm9kZTtcbiAgbGVmdE5vZGUucmlnaHQgPSBub2RlO1xuXG4gIG5vZGUuYmFsYW5jZUZhY3RvciAtPSAxO1xuICBpZiAobGVmdE5vZGUuYmFsYW5jZUZhY3RvciA+IDApIHtcbiAgICBub2RlLmJhbGFuY2VGYWN0b3IgLT0gbGVmdE5vZGUuYmFsYW5jZUZhY3RvcjtcbiAgfVxuXG4gIGxlZnROb2RlLmJhbGFuY2VGYWN0b3IgLT0gMTtcbiAgaWYgKG5vZGUuYmFsYW5jZUZhY3RvciA8IDApIHtcbiAgICBsZWZ0Tm9kZS5iYWxhbmNlRmFjdG9yICs9IG5vZGUuYmFsYW5jZUZhY3RvcjtcbiAgfVxuXG4gIHJldHVybiBsZWZ0Tm9kZTtcbn1cblxuXG4vLyBmdW5jdGlvbiBsZWZ0QmFsYW5jZSAobm9kZSkge1xuLy8gICBpZiAobm9kZS5sZWZ0LmJhbGFuY2VGYWN0b3IgPT09IC0xKSByb3RhdGVMZWZ0KG5vZGUubGVmdCk7XG4vLyAgIHJldHVybiByb3RhdGVSaWdodChub2RlKTtcbi8vIH1cblxuXG4vLyBmdW5jdGlvbiByaWdodEJhbGFuY2UgKG5vZGUpIHtcbi8vICAgaWYgKG5vZGUucmlnaHQuYmFsYW5jZUZhY3RvciA9PT0gMSkgcm90YXRlUmlnaHQobm9kZS5yaWdodCk7XG4vLyAgIHJldHVybiByb3RhdGVMZWZ0KG5vZGUpO1xuLy8gfVxuXG5cbnZhciBUcmVlID0gZnVuY3Rpb24gVHJlZSAoY29tcGFyYXRvcikge1xuICB0aGlzLl9jb21wYXJhdG9yID0gY29tcGFyYXRvciB8fCBERUZBVUxUX0NPTVBBUkU7XG4gIHRoaXMuX3Jvb3QgPSBudWxsO1xuICB0aGlzLl9zaXplID0gMDtcbn07XG5cbnZhciBwcm90b3R5cGVBY2Nlc3NvcnMgPSB7IHNpemU6IHt9IH07XG5cblxuVHJlZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uIGRlc3Ryb3kgKCkge1xuICB0aGlzLl9yb290ID0gbnVsbDtcbn07XG5cbnByb3RvdHlwZUFjY2Vzc29ycy5zaXplLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuX3NpemU7XG59O1xuXG5cblRyZWUucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24gY29udGFpbnMgKGtleSkge1xuICBpZiAodGhpcy5fcm9vdCl7XG4gICAgdmFyIG5vZGUgICAgID0gdGhpcy5fcm9vdDtcbiAgICB2YXIgY29tcGFyYXRvciA9IHRoaXMuX2NvbXBhcmF0b3I7XG4gICAgd2hpbGUgKG5vZGUpe1xuICAgICAgdmFyIGNtcCA9IGNvbXBhcmF0b3Ioa2V5LCBub2RlLmtleSk7XG4gICAgICBpZiAgICAoY21wID09PSAwKSAgIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgIGVsc2UgaWYgKGNtcCA9PT0gLTEpIHsgbm9kZSA9IG5vZGUubGVmdDsgfVxuICAgICAgZWxzZSAgICAgICAgICAgICAgICAgIHsgbm9kZSA9IG5vZGUucmlnaHQ7IH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuXG4vKiBlc2xpbnQtZGlzYWJsZSBjbGFzcy1tZXRob2RzLXVzZS10aGlzICovXG5UcmVlLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gbmV4dCAobm9kZSkge1xuICB2YXIgc3VjZXNzb3IgPSBub2RlLnJpZ2h0O1xuICB3aGlsZSAoc3VjZXNzb3IgJiYgc3VjZXNzb3IubGVmdCkgeyBzdWNlc3NvciA9IHN1Y2Vzc29yLmxlZnQ7IH1cbiAgcmV0dXJuIHN1Y2Vzc29yO1xufTtcblxuXG5UcmVlLnByb3RvdHlwZS5wcmV2ID0gZnVuY3Rpb24gcHJldiAobm9kZSkge1xuICB2YXIgcHJlZGVjZXNzb3IgPSBub2RlLmxlZnQ7XG4gIHdoaWxlIChwcmVkZWNlc3NvciAmJiBwcmVkZWNlc3Nvci5yaWdodCkgeyBwcmVkZWNlc3NvciA9IHByZWRlY2Vzc29yLnJpZ2h0OyB9XG4gIHJldHVybiBwcmVkZWNlc3Nvcjtcbn07XG4vKiBlc2xpbnQtZW5hYmxlIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXMgKi9cblxuXG5UcmVlLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaCAoZm4pIHtcbiAgdmFyIGN1cnJlbnQgPSB0aGlzLl9yb290O1xuICB2YXIgcyA9IFtdLCBkb25lID0gZmFsc2UsIGkgPSAwO1xuXG4gIHdoaWxlICghZG9uZSkge1xuICAgIC8vIFJlYWNoIHRoZSBsZWZ0IG1vc3QgTm9kZSBvZiB0aGUgY3VycmVudCBOb2RlXG4gICAgaWYgKGN1cnJlbnQpIHtcbiAgICAgIC8vIFBsYWNlIHBvaW50ZXIgdG8gYSB0cmVlIG5vZGUgb24gdGhlIHN0YWNrXG4gICAgICAvLyBiZWZvcmUgdHJhdmVyc2luZyB0aGUgbm9kZSdzIGxlZnQgc3VidHJlZVxuICAgICAgcy5wdXNoKGN1cnJlbnQpO1xuICAgICAgY3VycmVudCA9IGN1cnJlbnQubGVmdDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQmFja1RyYWNrIGZyb20gdGhlIGVtcHR5IHN1YnRyZWUgYW5kIHZpc2l0IHRoZSBOb2RlXG4gICAgICAvLyBhdCB0aGUgdG9wIG9mIHRoZSBzdGFjazsgaG93ZXZlciwgaWYgdGhlIHN0YWNrIGlzXG4gICAgICAvLyBlbXB0eSB5b3UgYXJlIGRvbmVcbiAgICAgIGlmIChzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY3VycmVudCA9IHMucG9wKCk7XG4gICAgICAgIGZuKGN1cnJlbnQsIGkrKyk7XG5cbiAgICAgICAgLy8gV2UgaGF2ZSB2aXNpdGVkIHRoZSBub2RlIGFuZCBpdHMgbGVmdFxuICAgICAgICAvLyBzdWJ0cmVlLiBOb3csIGl0J3MgcmlnaHQgc3VidHJlZSdzIHR1cm5cbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucmlnaHQ7XG4gICAgICB9IGVsc2UgeyBkb25lID0gdHJ1ZTsgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cblxuVHJlZS5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uIGtleXMgKCkge1xuICB2YXIgY3VycmVudCA9IHRoaXMuX3Jvb3Q7XG4gIHZhciBzID0gW10sIHIgPSBbXSwgZG9uZSA9IGZhbHNlO1xuXG4gIHdoaWxlICghZG9uZSkge1xuICAgIGlmIChjdXJyZW50KSB7XG4gICAgICBzLnB1c2goY3VycmVudCk7XG4gICAgICBjdXJyZW50ID0gY3VycmVudC5sZWZ0O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGN1cnJlbnQgPSBzLnBvcCgpO1xuICAgICAgICByLnB1c2goY3VycmVudC5rZXkpO1xuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5yaWdodDtcbiAgICAgIH0gZWxzZSB7IGRvbmUgPSB0cnVlOyB9XG4gICAgfVxuICB9XG4gIHJldHVybiByO1xufTtcblxuXG5UcmVlLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbiB2YWx1ZXMgKCkge1xuICB2YXIgY3VycmVudCA9IHRoaXMuX3Jvb3Q7XG4gIHZhciBzID0gW10sIHIgPSBbXSwgZG9uZSA9IGZhbHNlO1xuXG4gIHdoaWxlICghZG9uZSkge1xuICAgIGlmIChjdXJyZW50KSB7XG4gICAgICBzLnB1c2goY3VycmVudCk7XG4gICAgICBjdXJyZW50ID0gY3VycmVudC5sZWZ0O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGN1cnJlbnQgPSBzLnBvcCgpO1xuICAgICAgICByLnB1c2goY3VycmVudC5kYXRhKTtcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucmlnaHQ7XG4gICAgICB9IGVsc2UgeyBkb25lID0gdHJ1ZTsgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcjtcbn07XG5cblxuVHJlZS5wcm90b3R5cGUubWluTm9kZSA9IGZ1bmN0aW9uIG1pbk5vZGUgKCkge1xuICB2YXIgbm9kZSA9IHRoaXMuX3Jvb3Q7XG4gIHdoaWxlIChub2RlICYmIG5vZGUubGVmdCkgeyBub2RlID0gbm9kZS5sZWZ0OyB9XG4gIHJldHVybiBub2RlO1xufTtcblxuXG5UcmVlLnByb3RvdHlwZS5tYXhOb2RlID0gZnVuY3Rpb24gbWF4Tm9kZSAoKSB7XG4gIHZhciBub2RlID0gdGhpcy5fcm9vdDtcbiAgd2hpbGUgKG5vZGUgJiYgbm9kZS5yaWdodCkgeyBub2RlID0gbm9kZS5yaWdodDsgfVxuICByZXR1cm4gbm9kZTtcbn07XG5cblxuVHJlZS5wcm90b3R5cGUubWluID0gZnVuY3Rpb24gbWluICgpIHtcbiAgcmV0dXJuIHRoaXMubWluTm9kZSgpLmtleTtcbn07XG5cblxuVHJlZS5wcm90b3R5cGUubWF4ID0gZnVuY3Rpb24gbWF4ICgpIHtcbiAgcmV0dXJuIHRoaXMubWF4Tm9kZSgpLmtleTtcbn07XG5cblxuVHJlZS5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uIGlzRW1wdHkgKCkge1xuICByZXR1cm4gIXRoaXMuX3Jvb3Q7XG59O1xuXG5cblRyZWUucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uIHBvcCAoKSB7XG4gIHZhciBub2RlID0gdGhpcy5fcm9vdDtcbiAgd2hpbGUgKG5vZGUubGVmdCkgeyBub2RlID0gbm9kZS5sZWZ0OyB9XG4gIHZhciByZXR1cm5WYWx1ZSA9IHsga2V5OiBub2RlLmtleSwgZGF0YTogbm9kZS5kYXRhIH07XG4gIHRoaXMucmVtb3ZlKG5vZGUua2V5KTtcbiAgcmV0dXJuIHJldHVyblZhbHVlO1xufTtcblxuXG5UcmVlLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gZmluZCAoa2V5KSB7XG4gIHZhciByb290ID0gdGhpcy5fcm9vdDtcbiAgaWYgKHJvb3QgPT09IG51bGwpICB7IHJldHVybiBudWxsOyB9XG4gIGlmIChrZXkgPT09IHJvb3Qua2V5KSB7IHJldHVybiByb290OyB9XG5cbiAgdmFyIHN1YnRyZWUgPSByb290LCBjbXA7XG4gIHZhciBjb21wYXJlID0gdGhpcy5fY29tcGFyYXRvcjtcbiAgd2hpbGUgKHN1YnRyZWUpIHtcbiAgICBjbXAgPSBjb21wYXJlKGtleSwgc3VidHJlZS5rZXkpO1xuICAgIGlmICAgIChjbXAgPT09IDApIHsgcmV0dXJuIHN1YnRyZWU7IH1cbiAgICBlbHNlIGlmIChjbXAgPCAwKSB7IHN1YnRyZWUgPSBzdWJ0cmVlLmxlZnQ7IH1cbiAgICBlbHNlICAgICAgICAgICAgICB7IHN1YnRyZWUgPSBzdWJ0cmVlLnJpZ2h0OyB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn07XG5cblxuVHJlZS5wcm90b3R5cGUuaW5zZXJ0ID0gZnVuY3Rpb24gaW5zZXJ0IChrZXksIGRhdGEpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAvLyBpZiAodGhpcy5jb250YWlucyhrZXkpKSByZXR1cm4gbnVsbDtcblxuICBpZiAoIXRoaXMuX3Jvb3QpIHtcbiAgICB0aGlzLl9yb290ID0ge1xuICAgICAgcGFyZW50OiBudWxsLCBsZWZ0OiBudWxsLCByaWdodDogbnVsbCwgYmFsYW5jZUZhY3RvcjogMCxcbiAgICAgIGtleToga2V5LCBkYXRhOiBkYXRhXG4gICAgfTtcbiAgICB0aGlzLl9zaXplKys7XG4gICAgcmV0dXJuIHRoaXMuX3Jvb3Q7XG4gIH1cblxuICB2YXIgY29tcGFyZSA9IHRoaXMuX2NvbXBhcmF0b3I7XG4gIHZhciBub2RlICA9IHRoaXMuX3Jvb3Q7XG4gIHZhciBwYXJlbnQ9IG51bGw7XG4gIHZhciBjbXAgICA9IDA7XG5cbiAgd2hpbGUgKG5vZGUpIHtcbiAgICBjbXAgPSBjb21wYXJlKGtleSwgbm9kZS5rZXkpO1xuICAgIHBhcmVudCA9IG5vZGU7XG4gICAgaWYgICAgKGNtcCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuICAgIGVsc2UgaWYgKGNtcCA8IDApIHsgbm9kZSA9IG5vZGUubGVmdDsgfVxuICAgIGVsc2UgICAgICAgICAgICAgIHsgbm9kZSA9IG5vZGUucmlnaHQ7IH1cbiAgfVxuXG4gIHZhciBuZXdOb2RlID0ge1xuICAgIGxlZnQ6IG51bGwsIHJpZ2h0OiBudWxsLCBiYWxhbmNlRmFjdG9yOiAwLFxuICAgIHBhcmVudDogcGFyZW50LCBrZXk6IGtleSwgZGF0YTogZGF0YSxcbiAgfTtcbiAgaWYgKGNtcCA8IDApIHsgcGFyZW50LmxlZnQ9IG5ld05vZGU7IH1cbiAgZWxzZSAgICAgICB7IHBhcmVudC5yaWdodCA9IG5ld05vZGU7IH1cblxuICB3aGlsZSAocGFyZW50KSB7XG4gICAgaWYgKGNvbXBhcmUocGFyZW50LmtleSwga2V5KSA8IDApIHsgcGFyZW50LmJhbGFuY2VGYWN0b3IgLT0gMTsgfVxuICAgIGVsc2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBwYXJlbnQuYmFsYW5jZUZhY3RvciArPSAxOyB9XG5cbiAgICBpZiAgICAgIChwYXJlbnQuYmFsYW5jZUZhY3RvciA9PT0gMCkgeyBicmVhazsgfVxuICAgIGVsc2UgaWYgKHBhcmVudC5iYWxhbmNlRmFjdG9yIDwgLTEpIHtcbiAgICAgIC8vbGV0IG5ld1Jvb3QgPSByaWdodEJhbGFuY2UocGFyZW50KTtcbiAgICAgIGlmIChwYXJlbnQucmlnaHQuYmFsYW5jZUZhY3RvciA9PT0gMSkgeyByb3RhdGVSaWdodChwYXJlbnQucmlnaHQpOyB9XG4gICAgICB2YXIgbmV3Um9vdCA9IHJvdGF0ZUxlZnQocGFyZW50KTtcblxuICAgICAgaWYgKHBhcmVudCA9PT0gdGhpcyQxLl9yb290KSB7IHRoaXMkMS5fcm9vdCA9IG5ld1Jvb3Q7IH1cbiAgICAgIGJyZWFrO1xuICAgIH0gZWxzZSBpZiAocGFyZW50LmJhbGFuY2VGYWN0b3IgPiAxKSB7XG4gICAgICAvLyBsZXQgbmV3Um9vdCA9IGxlZnRCYWxhbmNlKHBhcmVudCk7XG4gICAgICBpZiAocGFyZW50LmxlZnQuYmFsYW5jZUZhY3RvciA9PT0gLTEpIHsgcm90YXRlTGVmdChwYXJlbnQubGVmdCk7IH1cbiAgICAgIHZhciBuZXdSb290JDEgPSByb3RhdGVSaWdodChwYXJlbnQpO1xuXG4gICAgICBpZiAocGFyZW50ID09PSB0aGlzJDEuX3Jvb3QpIHsgdGhpcyQxLl9yb290ID0gbmV3Um9vdCQxOyB9XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcbiAgfVxuXG4gIHRoaXMuX3NpemUrKztcbiAgcmV0dXJuIG5ld05vZGU7XG59O1xuXG5cblRyZWUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIHJlbW92ZSAoa2V5KSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgaWYgKCF0aGlzLl9yb290KSB7IHJldHVybiBudWxsOyB9XG5cbiAgLy8gaWYgKCF0aGlzLmNvbnRhaW5zKGtleSkpIHJldHVybiBudWxsO1xuXG4gIHZhciBub2RlID0gdGhpcy5fcm9vdDtcbiAgdmFyIGNvbXBhcmUgPSB0aGlzLl9jb21wYXJhdG9yO1xuXG4gIHdoaWxlIChub2RlKSB7XG4gICAgdmFyIGNtcCA9IGNvbXBhcmUoa2V5LCBub2RlLmtleSk7XG4gICAgaWYgICAgKGNtcCA9PT0gMCkgeyBicmVhazsgfVxuICAgIGVsc2UgaWYgKGNtcCA8IDApIHsgbm9kZSA9IG5vZGUubGVmdDsgfVxuICAgIGVsc2UgICAgICAgICAgICAgIHsgbm9kZSA9IG5vZGUucmlnaHQ7IH1cbiAgfVxuICBpZiAoIW5vZGUpIHsgcmV0dXJuIG51bGw7IH1cbiAgdmFyIHJldHVyblZhbHVlID0gbm9kZS5rZXk7XG5cbiAgaWYgKG5vZGUubGVmdCkge1xuICAgIHZhciBtYXggPSBub2RlLmxlZnQ7XG5cbiAgICB3aGlsZSAobWF4LmxlZnQgfHwgbWF4LnJpZ2h0KSB7XG4gICAgICB3aGlsZSAobWF4LnJpZ2h0KSB7IG1heCA9IG1heC5yaWdodDsgfVxuXG4gICAgICBub2RlLmtleSA9IG1heC5rZXk7XG4gICAgICBub2RlLmRhdGEgPSBtYXguZGF0YTtcbiAgICAgIGlmIChtYXgubGVmdCkge1xuICAgICAgICBub2RlID0gbWF4O1xuICAgICAgICBtYXggPSBtYXgubGVmdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBub2RlLmtleT0gbWF4LmtleTtcbiAgICBub2RlLmRhdGEgPSBtYXguZGF0YTtcbiAgICBub2RlID0gbWF4O1xuICB9XG5cbiAgaWYgKG5vZGUucmlnaHQpIHtcbiAgICB2YXIgbWluID0gbm9kZS5yaWdodDtcblxuICAgIHdoaWxlIChtaW4ubGVmdCB8fCBtaW4ucmlnaHQpIHtcbiAgICAgIHdoaWxlIChtaW4ubGVmdCkgeyBtaW4gPSBtaW4ubGVmdDsgfVxuXG4gICAgICBub2RlLmtleT0gbWluLmtleTtcbiAgICAgIG5vZGUuZGF0YSA9IG1pbi5kYXRhO1xuICAgICAgaWYgKG1pbi5yaWdodCkge1xuICAgICAgICBub2RlID0gbWluO1xuICAgICAgICBtaW4gPSBtaW4ucmlnaHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbm9kZS5rZXk9IG1pbi5rZXk7XG4gICAgbm9kZS5kYXRhID0gbWluLmRhdGE7XG4gICAgbm9kZSA9IG1pbjtcbiAgfVxuXG4gIHZhciBwYXJlbnQgPSBub2RlLnBhcmVudDtcbiAgdmFyIHBwICAgPSBub2RlO1xuXG4gIHdoaWxlIChwYXJlbnQpIHtcbiAgICBpZiAocGFyZW50LmxlZnQgPT09IHBwKSB7IHBhcmVudC5iYWxhbmNlRmFjdG9yIC09IDE7IH1cbiAgICBlbHNlICAgICAgICAgICAgICAgICAgeyBwYXJlbnQuYmFsYW5jZUZhY3RvciArPSAxOyB9XG5cbiAgICBpZiAgICAgIChwYXJlbnQuYmFsYW5jZUZhY3RvciA8IC0xKSB7XG4gICAgICAvL2xldCBuZXdSb290ID0gcmlnaHRCYWxhbmNlKHBhcmVudCk7XG4gICAgICBpZiAocGFyZW50LnJpZ2h0LmJhbGFuY2VGYWN0b3IgPT09IDEpIHsgcm90YXRlUmlnaHQocGFyZW50LnJpZ2h0KTsgfVxuICAgICAgdmFyIG5ld1Jvb3QgPSByb3RhdGVMZWZ0KHBhcmVudCk7XG5cbiAgICAgIGlmIChwYXJlbnQgPT09IHRoaXMkMS5fcm9vdCkgeyB0aGlzJDEuX3Jvb3QgPSBuZXdSb290OyB9XG4gICAgICBwYXJlbnQgPSBuZXdSb290O1xuICAgIH0gZWxzZSBpZiAocGFyZW50LmJhbGFuY2VGYWN0b3IgPiAxKSB7XG4gICAgICAvLyBsZXQgbmV3Um9vdCA9IGxlZnRCYWxhbmNlKHBhcmVudCk7XG4gICAgICBpZiAocGFyZW50LmxlZnQuYmFsYW5jZUZhY3RvciA9PT0gLTEpIHsgcm90YXRlTGVmdChwYXJlbnQubGVmdCk7IH1cbiAgICAgIHZhciBuZXdSb290JDEgPSByb3RhdGVSaWdodChwYXJlbnQpO1xuXG4gICAgICBpZiAocGFyZW50ID09PSB0aGlzJDEuX3Jvb3QpIHsgdGhpcyQxLl9yb290ID0gbmV3Um9vdCQxOyB9XG4gICAgICBwYXJlbnQgPSBuZXdSb290JDE7XG4gICAgfVxuXG4gICAgaWYgKHBhcmVudC5iYWxhbmNlRmFjdG9yID09PSAtMSB8fCBwYXJlbnQuYmFsYW5jZUZhY3RvciA9PT0gMSkgeyBicmVhazsgfVxuXG4gICAgcHAgICA9IHBhcmVudDtcbiAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xuICB9XG5cbiAgaWYgKG5vZGUucGFyZW50KSB7XG4gICAgaWYgKG5vZGUucGFyZW50LmxlZnQgPT09IG5vZGUpIHsgbm9kZS5wYXJlbnQubGVmdD0gbnVsbDsgfVxuICAgIGVsc2UgICAgICAgICAgICAgICAgICAgICAgICAgeyBub2RlLnBhcmVudC5yaWdodCA9IG51bGw7IH1cbiAgfVxuXG4gIGlmIChub2RlID09PSB0aGlzLl9yb290KSB7IHRoaXMuX3Jvb3QgPSBudWxsOyB9XG5cbiAgdGhpcy5fc2l6ZS0tO1xuICByZXR1cm4gcmV0dXJuVmFsdWU7XG59O1xuXG5cblRyZWUucHJvdG90eXBlLmlzQmFsYW5jZWQgPSBmdW5jdGlvbiBpc0JhbGFuY2VkJDEgKCkge1xuICByZXR1cm4gaXNCYWxhbmNlZCh0aGlzLl9yb290KTtcbn07XG5cblxuVHJlZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAocHJpbnROb2RlKSB7XG4gIHJldHVybiBwcmludCh0aGlzLl9yb290LCBwcmludE5vZGUpO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIFRyZWUucHJvdG90eXBlLCBwcm90b3R5cGVBY2Nlc3NvcnMgKTtcblxucmV0dXJuIFRyZWU7XG5cbn0pKSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdmwuanMubWFwXG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVFdmVudFBvaW50KHBvaW50LCBxdWV1ZSwgc3RhdHVzKSB7XHJcbiAgICB2YXIgcCA9IHBvaW50LmRhdGEucG9pbnQ7XHJcbiAgICAvLyAxXHJcbiAgICB2YXIgdXAgPSBwb2ludC5kYXRhLnNlZ21lbnQ7XHJcbiAgICB2YXIgdXBzID0gdXAgPyBbdXBdIDogW107XHJcbiAgICB2YXIgbHBzID0gW107XHJcbiAgICB2YXIgY3BzID0gW107XHJcblxyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG5cclxuICAgIC8vIDEuIEluaXRpYWxpemUgZXZlbnQgcXVldWUgRVEgPSBhbGwgc2VnbWVudCBlbmRwb2ludHNcclxuICAgIHN0YXR1cy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XHJcbiAgICAgICAgdmFyIHNlZ21lbnQgPSBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgIGJlZ2luID0gc2VnbWVudFswXSxcclxuICAgICAgICAgICAgZW5kID0gc2VnbWVudFsxXTtcclxuXHJcbiAgICAgICAgLy8gZmluZCBsb3dlciBpbnRlcnNlY3Rpb25cclxuICAgICAgICBpZiAocFswXSA9PT0gZW5kWzBdICYmIHBbMV0gPT09IGVuZFsxXSkge1xyXG4gICAgICAgICAgICBscHMucHVzaChzZWdtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZpbmQgaW5uZXIgaW50ZXJzZWN0aW9uc1xyXG4gICAgICAgIGlmICh1dGlscy5wb2ludE9uTGluZShzZWdtZW50LCBwKSkge1xyXG4gICAgICAgICAgICBjcHMucHVzaChzZWdtZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyAzXHJcbiAgICBpZiAodXBzLmNvbmNhdChscHMpLmNvbmNhdChjcHMpLmxlbmd0aCA+IDEpIHtcclxuICAgIC8vIDRcclxuICAgICAgICByZXN1bHQucHVzaChwKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gNVxyXG4gICAgcmVtb3ZlRnJvbVRyZWUobHBzLCBzdGF0dXMpO1xyXG4gICAgcmVtb3ZlRnJvbVRyZWUoY3BzLCBzdGF0dXMpO1xyXG5cclxuICAgIC8vIDZcclxuICAgIGluc2VydEludG9UcmVlKHVwcywgc3RhdHVzKTtcclxuICAgIGluc2VydEludG9UcmVlKGNwcywgc3RhdHVzKTtcclxuXHJcblxyXG5cclxuXHJcbiAgICAvLyBjb25zb2xlLmxvZyhzdGF0dXMpO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZUZyb21UcmVlKGFyciwgdHJlZSkge1xyXG4gICAgYXJyLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICB0cmVlLnJlbW92ZShpdGVtKTtcclxuICAgIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluc2VydEludG9UcmVlKGFyciwgdHJlZSkge1xyXG4gICAgYXJyLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICB0cmVlLmluc2VydChpdGVtKTtcclxuICAgIH0pXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gaGFuZGxlRXZlbnRQb2ludDtcclxuIiwiLy8gZmlyc3Qgd2UgZGVmaW5lIGEgc3dlZXBsaW5lXG4vLyBzd2VlcGxpbmUgaGFzIHRvIHVwZGF0ZSBpdHMgc3RhdHVzXG5cbi8qKlxuICogIGJhbGFuY2VkIEFWTCBCU1QgZm9yIHN0b3JpbmcgYW4gZXZlbnQgcXVldWUgYW5kIHN3ZWVwbGluZSBzdGF0dXNcbiAqL1xuXG5cbiAvLyAoMSkgSW5pdGlhbGl6ZSBldmVudCBxdWV1ZSBFUSA9IGFsbCBzZWdtZW50IGVuZHBvaW50cztcbiAvLyAoMikgU29ydCBFUSBieSBpbmNyZWFzaW5nIHggYW5kIHk7XG4gLy8gKDMpIEluaXRpYWxpemUgc3dlZXAgbGluZSBTTCB0byBiZSBlbXB0eTtcbiAvLyAoNCkgSW5pdGlhbGl6ZSBvdXRwdXQgaW50ZXJzZWN0aW9uIGxpc3QgSUwgdG8gYmUgZW1wdHk7XG4gLy9cbiAvLyAoNSkgV2hpbGUgKEVRIGlzIG5vbmVtcHR5KSB7XG4gLy8gICAgICg2KSBMZXQgRSA9IHRoZSBuZXh0IGV2ZW50IGZyb20gRVE7XG4gLy8gICAgICg3KSBJZiAoRSBpcyBhIGxlZnQgZW5kcG9pbnQpIHtcbiAvLyAgICAgICAgICAgICBMZXQgc2VnRSA9IEUncyBzZWdtZW50O1xuIC8vICAgICAgICAgICAgIEFkZCBzZWdFIHRvIFNMO1xuIC8vICAgICAgICAgICAgIExldCBzZWdBID0gdGhlIHNlZ21lbnQgQWJvdmUgc2VnRSBpbiBTTDtcbiAvLyAgICAgICAgICAgICBMZXQgc2VnQiA9IHRoZSBzZWdtZW50IEJlbG93IHNlZ0UgaW4gU0w7XG4gLy8gICAgICAgICAgICAgSWYgKEkgPSBJbnRlcnNlY3QoIHNlZ0Ugd2l0aCBzZWdBKSBleGlzdHMpXG4gLy8gICAgICAgICAgICAgICAgIEluc2VydCBJIGludG8gRVE7XG4gLy8gICAgICAgICAgICAgSWYgKEkgPSBJbnRlcnNlY3QoIHNlZ0Ugd2l0aCBzZWdCKSBleGlzdHMpXG4gLy8gICAgICAgICAgICAgICAgIEluc2VydCBJIGludG8gRVE7XG4gLy8gICAgICAgICB9XG4gLy8gICAgICAgICBFbHNlIElmIChFIGlzIGEgcmlnaHQgZW5kcG9pbnQpIHtcbiAvLyAgICAgICAgICAgICBMZXQgc2VnRSA9IEUncyBzZWdtZW50O1xuIC8vICAgICAgICAgICAgIExldCBzZWdBID0gdGhlIHNlZ21lbnQgQWJvdmUgc2VnRSBpbiBTTDtcbiAvLyAgICAgICAgICAgICBMZXQgc2VnQiA9IHRoZSBzZWdtZW50IEJlbG93IHNlZ0UgaW4gU0w7XG4gLy8gICAgICAgICAgICAgRGVsZXRlIHNlZ0UgZnJvbSBTTDtcbiAvLyAgICAgICAgICAgICBJZiAoSSA9IEludGVyc2VjdCggc2VnQSB3aXRoIHNlZ0IpIGV4aXN0cylcbiAvLyAgICAgICAgICAgICAgICAgSWYgKEkgaXMgbm90IGluIEVRIGFscmVhZHkpXG4gLy8gICAgICAgICAgICAgICAgICAgICBJbnNlcnQgSSBpbnRvIEVRO1xuIC8vICAgICAgICAgfVxuIC8vICAgICAgICAgRWxzZSB7ICAvLyBFIGlzIGFuIGludGVyc2VjdGlvbiBldmVudFxuIC8vICAgICAgICAgICAgIEFkZCBF4oCZcyBpbnRlcnNlY3QgcG9pbnQgdG8gdGhlIG91dHB1dCBsaXN0IElMO1xuIC8vICAgICAgICAgICAgIExldCBzZWdFMSBhYm92ZSBzZWdFMiBiZSBFJ3MgaW50ZXJzZWN0aW5nIHNlZ21lbnRzIGluIFNMO1xuIC8vICAgICAgICAgICAgIFN3YXAgdGhlaXIgcG9zaXRpb25zIHNvIHRoYXQgc2VnRTIgaXMgbm93IGFib3ZlIHNlZ0UxO1xuIC8vICAgICAgICAgICAgIExldCBzZWdBID0gdGhlIHNlZ21lbnQgYWJvdmUgc2VnRTIgaW4gU0w7XG4gLy8gICAgICAgICAgICAgTGV0IHNlZ0IgPSB0aGUgc2VnbWVudCBiZWxvdyBzZWdFMSBpbiBTTDtcbiAvLyAgICAgICAgICAgICBJZiAoSSA9IEludGVyc2VjdChzZWdFMiB3aXRoIHNlZ0EpIGV4aXN0cylcbiAvLyAgICAgICAgICAgICAgICAgSWYgKEkgaXMgbm90IGluIEVRIGFscmVhZHkpXG4gLy8gICAgICAgICAgICAgICAgICAgICBJbnNlcnQgSSBpbnRvIEVRO1xuIC8vICAgICAgICAgICAgIElmIChJID0gSW50ZXJzZWN0KHNlZ0UxIHdpdGggc2VnQikgZXhpc3RzKVxuIC8vICAgICAgICAgICAgICAgICBJZiAoSSBpcyBub3QgaW4gRVEgYWxyZWFkeSlcbiAvLyAgICAgICAgICAgICAgICAgICAgIEluc2VydCBJIGludG8gRVE7XG4gLy8gICAgICAgICB9XG4gLy8gICAgICAgICByZW1vdmUgRSBmcm9tIEVRO1xuIC8vICAgICB9XG4gLy8gICAgIHJldHVybiBJTDtcbiAvLyB9XG5cblxuXG52YXIgVHJlZSA9IHJlcXVpcmUoJ2F2bCcpO1xudmFyIGhhbmRsZUV2ZW50UG9pbnQgPSByZXF1aXJlKCcuL2hhbmRsZWV2ZW50cG9pbnQnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxuLyoqXG4gKiBAcGFyYW0ge0FycmF5fSBzZWdtZW50cyBzZXQgb2Ygc2VnbWVudHMgaW50ZXJzZWN0aW5nIHN3ZWVwbGluZSBbW1t4MSwgeTFdLCBbeDIsIHkyXV0gLi4uIFtbeG0sIHltXSwgW3huLCB5bl1dXVxuICovXG5cbmZ1bmN0aW9uIGZpbmRJbnRlcnNlY3Rpb25zKHNlZ21lbnRzLCBtYXApIHtcblxuICAgIC8vICgxKSBJbml0aWFsaXplIGV2ZW50IHF1ZXVlIEVRID0gYWxsIHNlZ21lbnQgZW5kcG9pbnRzO1xuICAgIC8vICgyKSBTb3J0IEVRIGJ5IGluY3JlYXNpbmcgeCBhbmQgeTtcbiAgICB2YXIgcXVldWUgPSBuZXcgVHJlZSh1dGlscy5jb21wYXJlUG9pbnRzKTtcblxuICAgIC8vICgzKSBJbml0aWFsaXplIHN3ZWVwIGxpbmUgU0wgdG8gYmUgZW1wdHk7XG4gICAgdmFyIHN0YXR1cyA9IG5ldyBUcmVlKHV0aWxzLmNvbXBhcmVTZWdtZW50cyk7XG5cbiAgICAvLyAoNCkgSW5pdGlhbGl6ZSBvdXRwdXQgaW50ZXJzZWN0aW9uIGxpc3QgSUwgdG8gYmUgZW1wdHk7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgLy8gc3RvcmUgZXZlbnQgcG9pbnRzIGNvcnJlc3BvbmRpbmcgdG8gdGhlaXIgY29vcmRpbmF0ZXNcbiAgICBzZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChzZWdtZW50KSB7XG4gICAgICAgIC8vIDIuIFNvcnQgRVEgYnkgaW5jcmVhc2luZyB4IGFuZCB5O1xuICAgICAgICBzZWdtZW50LnNvcnQodXRpbHMuY29tcGFyZVBvaW50cyk7XG4gICAgICAgIHZhciBiZWdpbiA9IHNlZ21lbnRbMF0sXG4gICAgICAgICAgICBlbmQgPSBzZWdtZW50WzFdLFxuICAgICAgICAgICAgYmVnaW5EYXRhID0ge1xuICAgICAgICAgICAgICAgIHBvaW50OiBiZWdpbixcbiAgICAgICAgICAgICAgICB0eXBlOiAnYmVnaW4nLFxuICAgICAgICAgICAgICAgIHNlZ21lbnQ6IHNlZ21lbnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbmREYXRhID0ge1xuICAgICAgICAgICAgICAgIHBvaW50OiBlbmQsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2VuZCcsXG4gICAgICAgICAgICAgICAgc2VnbWVudDogc2VnbWVudFxuICAgICAgICAgICAgfTtcbiAgICAgICAgcXVldWUuaW5zZXJ0KGJlZ2luLCBiZWdpbkRhdGEpO1xuICAgICAgICBxdWV1ZS5pbnNlcnQoZW5kLCBlbmREYXRhKTtcblxuICAgICAgICAvLyBzdGF0dXMuaW5zZXJ0KHNlZ21lbnQsIHNlZ21lbnQpO1xuICAgIH0pO1xuXG4gICAgLy8gY29uc29sZS5sb2cocXVldWUudmFsdWVzKCkpO1xuICAgIC8vIGNvbnNvbGUubG9nKHF1ZXVlKTtcbiAgICB2YXIgdmFsdWVzID0gcXVldWUudmFsdWVzKCk7XG4gICAgdmFyIHYgPSB2YWx1ZXNbMF07XG4gICAgLy8gdnYgPSBbdi5wb2ludFswXSwgdi5wb2ludFsxXV07XG4gICAgLy8gY29uc29sZS5sb2codi5wb2ludCk7XG4gICAgLy8gLy8gY29uc29sZS5sb2codnYpO1xuICAgIC8vIC8vIGNvbnNvbGUubG9nKHYpO1xuICAgIC8vIGNvbnNvbGUubG9nKHF1ZXVlLm5leHQodi5wb2ludCkpO1xuICAgIC8vIGNvbnNvbGUubG9nKHF1ZXVlLmZpbmQodi5wb2ludCkpO1xuICAgIC8vIHF1ZXVlLmZvckVhY2goZnVuY3Rpb24gKG4pIHtcbiAgICAvLyAgICAgY29uc29sZS5sb2cobi5sZWZ0LCBuLnJpZ2h0KTtcbiAgICAvLyB9KTtcbiAgICAgICAgLy8gY29uc29sZS5sb2cocXVldWUudG9TdHJpbmcoKSk7XG5cbiAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBhcnJheSkge1xuICAgICAgICB2YXIgcCA9IHZhbHVlLnBvaW50O1xuICAgICAgICB2YXIgbGwgPSBMLmxhdExuZyhbcFsxXSwgcFswXV0pO1xuICAgICAgICB2YXIgbXJrID0gTC5jaXJjbGVNYXJrZXIobGwsIHtyYWRpdXM6IDQsIGNvbG9yOiAncmVkJywgZmlsbENvbG9yOiAnRkYwMCcgKyAyICoqIGluZGV4fSkuYWRkVG8obWFwKTtcbiAgICAgICAgbXJrLmJpbmRQb3B1cCgnJyArIGluZGV4ICsgJ1xcbicgKyBwWzBdICsgJ1xcbicgKyBwWzFdKTtcbiAgICB9KTtcblxuICAgIC8vICg1KSBXaGlsZSAoRVEgaXMgbm9uZW1wdHkpIHtcbiAgICB3aGlsZSAoIXF1ZXVlLmlzRW1wdHkoKSkge1xuICAgICAgICAgLy8gICAgICg2KSBMZXQgRSA9IHRoZSBuZXh0IGV2ZW50IGZyb20gRVE7XG4gICAgICAgIHZhciBldmVudCA9IHF1ZXVlLnBvcCgpO1xuXG4gICAgICAgIC8vICAgICAoNykgSWYgKEUgaXMgYSBsZWZ0IGVuZHBvaW50KSB7XG4gICAgICAgIGlmIChldmVudC5kYXRhLnR5cGUgPT09ICdiZWdpbicpIHtcblxuICAgICAgICAgICAgLy8g0LrQvtCz0LTQsCDQvNGLINC/0L7QvNC10YnQsNC10Lwg0L7RgtGA0LXQt9C+0Log0LIg0LzQvdC+0LbQtdGB0YLQstC+INGB0YLQsNGC0YPRgdCwLCDQvNGLINGB0YDQsNCy0L3QuNCy0LDQtdC8INC10LPQviDQsiDQtNCw0L3QvdC+0Lkg0YLQvtGH0LrQtVxuICAgICAgICAgICAgLy8g0YEg0YPQttC1INGB0YPRidC10YHRgtCy0YPRjtGJ0LjQvNC4LlxuICAgICAgICAgICAgLy8g0Y3RgtC+INC80L3QvtC20LXRgdGC0LLQviDQtNC40L3QsNC80LjRh9C10YHQutC+0LUsXG4gICAgICAgICAgICAvLyDRgtC+INC10YHRgtGMINC+0YLRgNC10LfQutC4INC80LXQvdGP0Y7RgiDRgdCy0L7QtSDQv9C+0LvQvtC20LXQvdC40LUuXG5cbiAgICAgICAgICAgIC8vINC10YHQu9C4INCyINC90LXQutC+0YLQvtGA0L7QuSDRgtC+0YfQutC1IHgg0YMg0Y3RgtC+0LPQviDQvtGC0YDQtdC30LrQsCDQsdC+0LvRjNGI0LUgeSwg0YLQviDQvtC9INC/0L7QvNC10YnQsNC10YLRgdGPINC/0L7RgdC70LUg0L/QtdGA0LLQvtCz0L5cblxuXG4gICAgICAgICAgICAvLyBzdGF0dXMueCA9IGV2ZW50LmRhdGEucG9pbnRbMF07XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICBMZXQgc2VnRSA9IEUncyBzZWdtZW50O1xuICAgICAgICAgICAgdmFyIHNlZ0UgPSBldmVudC5kYXRhLnNlZ21lbnQ7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICBBZGQgc2VnRSB0byBTTDtcbiAgICAgICAgICAgIHN0YXR1cy5pbnNlcnQoc2VnRSwgc2VnRSk7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICBMZXQgc2VnQSA9IHRoZSBzZWdtZW50IEFib3ZlIHNlZ0UgaW4gU0w7XG4gICAgICAgICAgICAvLyB2YXIgc2VnQSA9IHN0YXR1cy5wcmV2KHNlZ0UpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgTGV0IHNlZ0IgPSB0aGUgc2VnbWVudCBCZWxvdyBzZWdFIGluIFNMO1xuICAgICAgICAgICAgLy8gdmFyIHNlZ0IgPSBzdGF0dXMubmV4dChzZWdFKTtcblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coc3RhdHVzLnRvU3RyaW5nKCkpO1xuXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhzdGF0dXMudmFsdWVzKCkpO1xuICAgICAgICAgICAgdmFyIHNzID0gc3RhdHVzLmZpbmQoc2VnRSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhzcyk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhzcyk7XG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHNlZ0UpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codHJlZSk7XG4gICAgICAgICAgICBzdGF0dXMuZm9yRWFjaChmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHV0aWxzLmZpbmRFcXVhdGlvbihuLmRhdGEpKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhuKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhzZWdBKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHNlZ0IpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJy0tLS0nKTtcblxuICAgICAgICB9XG4gICAgICAgIC8vICAgICAgICAgICAgIElmIChJID0gSW50ZXJzZWN0KCBzZWdFIHdpdGggc2VnQSkgZXhpc3RzKVxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgSW5zZXJ0IEkgaW50byBFUTtcbiAgICAgICAgLy8gICAgICAgICAgICAgSWYgKEkgPSBJbnRlcnNlY3QoIHNlZ0Ugd2l0aCBzZWdCKSBleGlzdHMpXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBJbnNlcnQgSSBpbnRvIEVRO1xuICAgICAgICAvLyAgICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgc1ZhbHVlcyA9IHN0YXR1cy52YWx1ZXMoKTtcbiAgICB2YXIgZiA9IHNWYWx1ZXNbMF07XG4gICAgLy8gY29uc29sZS5sb2coc3RhdHVzLm5leHQoZikpO1xuXG4gICAgLy8gc3RhdHVzLmZvckVhY2goZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2cobik7XG4gICAgLy8gfSk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyhzdGF0dXMpO1xuXG4gICAgLy8gY29uc29sZS5sb2coc3RhdHVzLnRvU3RyaW5nKCkpO1xuXG4gICAgc1ZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGFycmF5KSB7XG4gICAgICAgIGxscyA9IHZhbHVlLm1hcChmdW5jdGlvbihwKXtyZXR1cm4gTC5sYXRMbmcocC5zbGljZSgpLnJldmVyc2UoKSl9KTtcblxuICAgICAgICB2YXIgbGluZSA9IEwucG9seWxpbmUobGxzKS5hZGRUbyhtYXApO1xuICAgICAgICBsaW5lLmJpbmRQb3B1cCgnJyArIGluZGV4KTtcbiAgICB9KTtcbiAgICAvLyBjb25zb2xlLmxvZyhzdGF0dXMudmFsdWVzKCkpO1xuXG5cblxuXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmaW5kSW50ZXJzZWN0aW9ucztcbiIsInZhciB1dGlscyA9IHtcclxuICAgIC8vIHBvaW50cyBjb21wYXJhdG9yXHJcbiAgICBjb21wYXJlUG9pbnRzOiBmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgdmFyIHgxID0gYVswXSxcclxuICAgICAgICAgICAgeTEgPSBhWzFdLFxyXG4gICAgICAgICAgICB4MiA9IGJbMF0sXHJcbiAgICAgICAgICAgIHkyID0gYlsxXTtcclxuXHJcbiAgICAgICAgaWYgKHgxID4geDIgfHwgKHgxID09PSB4MiAmJiB5MSA+IHkyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKHgxIDwgeDIgfHwgKHgxID09PSB4MiAmJiB5MSA8IHkyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfSBlbHNlIGlmICh4MSA9PT0geDIgJiYgeTEgPT09IHkyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG5cclxuXHJcbiAgICBjb21wYXJlU2VnbWVudHM6IGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgLy8g0L3Rg9C20L3QviDQstC10YDQvdGD0YLRjCDRgdC10LPQvNC10L3Rgiwg0LrQvtGC0L7RgNGL0Lkg0LIg0LTQsNC90L3QvtC5INGC0L7Rh9C60LVcclxuICAgICAgICAvLyDRj9Cy0LvRj9C10YLRgdGPINC/0LXRgNCy0YvQvCDQsdC70LjQttCw0LnRiNC40Lwg0L/QviB4INC40LvQuCB5XHJcblxyXG4gICAgICAgIC8vINGB0L7RgNGC0LjRgNC+0LLQutCwINC/0L4geSDQsiDRgtC+0YfQutC1INGBINC00LDQvdC90L7QuSDQutC+0L7RgNC00LjQvdCw0YLQvtC5IHhcclxuXHJcbiAgICAgICAgdmFyIHgxID0gYVswXVswXSxcclxuICAgICAgICAgICAgeTEgPSBhWzBdWzFdLFxyXG4gICAgICAgICAgICB4MiA9IGFbMV1bMF0sXHJcbiAgICAgICAgICAgIHkyID0gYVsxXVsxXSxcclxuICAgICAgICAgICAgeDMgPSBiWzBdWzBdLFxyXG4gICAgICAgICAgICB5MyA9IGJbMF1bMV0sXHJcbiAgICAgICAgICAgIHg0ID0gYlsxXVswXSxcclxuICAgICAgICAgICAgeTQgPSBiWzFdWzFdO1xyXG5cclxuICAgICAgICB2YXIgdjEgPSBbeDIgLSB4MSwgeTIgLSB5MV0sXHJcbiAgICAgICAgICAgIHYyID0gW3g0IC0geDMsIHk0IC0geTNdO1xyXG5cclxuICAgICAgICB2YXIgbXVsdCA9IHYxWzBdICogdjJbMV0gLSB2MVsxXSAqIHYyWzBdO1xyXG5cclxuICAgICAgICBpZiAoeTEgPiB5Mykge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKHkxIDwgeTMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoeTEgPT09IHkzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpZiAobXVsdCA+IDApIHtcclxuICAgICAgICAvLyAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgLy8gfSBlbHNlIGlmIChtdWx0IDwgMCkge1xyXG4gICAgICAgIC8vICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgLy8gfSBlbHNlIGlmIChtdWx0ID09PSAwKSB7XHJcbiAgICAgICAgLy8gICAgIHJldHVybiAwO1xyXG4gICAgICAgIC8vIH1cclxuICAgIH0sXHJcblxyXG4gICAgZmluZEVxdWF0aW9uOiBmdW5jdGlvbiAoc2VnbWVudCkge1xyXG4gICAgICAgIHZhciB4MSA9IHNlZ21lbnRbMF1bMF0sXHJcbiAgICAgICAgICAgIHkxID0gc2VnbWVudFswXVsxXSxcclxuICAgICAgICAgICAgeDIgPSBzZWdtZW50WzFdWzBdLFxyXG4gICAgICAgICAgICB5MiA9IHNlZ21lbnRbMV1bMV0sXHJcbiAgICAgICAgICAgIGEgPSB5MSAtIHkyLFxyXG4gICAgICAgICAgICBiID0geDIgLSB4MSxcclxuICAgICAgICAgICAgYyA9IHgxICogeTIgLSB4MiAqIHkxO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhhICsgJ3ggKyAnICsgYiArICd5ICsgJyArIGMgKyAnID0gMCcpO1xyXG4gICAgfSxcclxuXHJcbiAgICBwb2ludE9uTGluZTogZnVuY3Rpb24gKGxpbmUsIHBvaW50KSB7XHJcbiAgICAgICAgdmFyIGJlZ2luID0gbGluZVswXSxcclxuICAgICAgICAgICAgZW5kID0gbGluZVsxXSxcclxuICAgICAgICAgICAgeDEgPSBiZWdpblswXSxcclxuICAgICAgICAgICAgeTEgPSBiZWdpblsxXSxcclxuICAgICAgICAgICAgeDIgPSBlbmRbMF0sXHJcbiAgICAgICAgICAgIHkyID0gZW5kWzFdLFxyXG4gICAgICAgICAgICB4ID0gcG9pbnRbMF0sXHJcbiAgICAgICAgICAgIHkgPSBwb2ludFsxXTtcclxuXHJcbiAgICAgICAgcmV0dXJuICgoeCAtIHgxKSAqICh5MiAtIHkxKSAtICh5IC0geTEpICogKHgyIC0geDEpID09PSAwKSAmJiAoKHggPiB4MSAmJiB4IDwgeDIpIHx8ICh4ID4geDIgJiYgeCA8IHgxKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdXRpbHM7XHJcbiJdfQ==
