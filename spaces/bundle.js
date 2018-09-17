
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
(function (React,ReactDOM) {
  'use strict';

  var React__default = 'default' in React ? React['default'] : React;
  ReactDOM = ReactDOM && ReactDOM.hasOwnProperty('default') ? ReactDOM['default'] : ReactDOM;

  /* toSource by Marcello Bastea-Forte - zlib license */

  /**
   * Java style map.
   */
  class JavaMap {
      constructor() {
          this[Symbol.toStringTag] = 'Map';
          this._map = new Map();
          this._size = 0;
      }
      toString() {
          return '{' + Array.from(this.entries2()).map(({ key, value }) => key + ':' + value).join(', ') + '}';
      }
      forEach(callbackfn, thisArg) {
          for (const bucket of this._map.values()) {
              for (const { key, value } of bucket) {
                  callbackfn.call(thisArg, value, key, this);
              }
          }
      }
      *keys() {
          for (const bucket of this._map.values()) {
              for (const { key } of bucket) {
                  yield key;
              }
          }
      }
      *values() {
          for (const bucket of this._map.values()) {
              for (const { value } of bucket) {
                  yield value;
              }
          }
      }
      [Symbol.iterator]() {
          return this.entries();
      }
      set(key, value) {
          this.set2(key, value);
          return this;
      }
      /**
       * Like {@link #set} except it returns true if key was new and false if the value was only updated.
       *
       */
      set2(key, val) {
          const hashCode = key.hashCode(), bucket = this._map.get(hashCode);
          //assert(hashCode === (hashCode | 0))
          if (bucket) {
              const pairIndex = bucket.findIndex(pair => pair.key.equals(key));
              if (-1 == pairIndex) {
                  bucket.push({ key: key, value: val });
              }
              else {
                  bucket[pairIndex].value = val;
                  return false;
              }
          }
          else {
              this._map.set(hashCode, [{ key: key, value: val }]);
          }
          this._size++;
          return true;
      }
      has(key) {
          const hashCode = key.hashCode(), bucket = this._map.get(hashCode);
          //assert(hashCode === (hashCode | 0))
          return undefined !== bucket && bucket.some(pair => pair.key.equals(key));
      }
      get(key) {
          const hashCode = key.hashCode(), bucket = this._map.get(hashCode), pair = bucket && bucket.find(pair => pair.key.equals(key));
          return pair && pair.value;
      }
      getLike(key) {
          for (const hashCode of key.hashCodes()) {
              const bucket = this._map.get(hashCode);
              const canonVal = bucket && bucket.find(x => x.key.like(key));
              if (canonVal)
                  return canonVal;
          }
      }
      setLike(key, val) {
          return !this.getLike(key) && this.set(key, val);
      }
      'delete'(key) {
          const hashCode = key.hashCode(), bucket = this._map.get(hashCode);
          if (bucket) {
              const index = bucket.findIndex(x => x.key.equals(key));
              if (-1 != index) {
                  if (1 == bucket.length) {
                      this._map.delete(hashCode);
                  }
                  else {
                      bucket.splice(index, 1);
                  }
                  this._size--;
                  return true;
              }
          }
          return false;
      }
      deleteLike(key) {
          for (const hashCode of key.hashCodes()) {
              const bucket = this._map.get(hashCode);
              if (bucket) {
                  const index = bucket.findIndex(x => x.key.like(key));
                  if (-1 != index) {
                      const deleted = bucket[index];
                      if (1 == bucket.length) {
                          this._map.delete(hashCode);
                      }
                      else {
                          bucket.splice(index, 1);
                      }
                      this._size--;
                      return deleted;
                  }
              }
          }
      }
      *entries2() {
          for (const bucket of this._map.values()) {
              yield* bucket;
          }
      }
      *entries() {
          for (const bucket of this._map.values()) {
              for (const { key, value } of bucket) {
                  yield [key, value];
              }
          }
      }
      clear() {
          this._map.clear();
          this._size = 0;
      }
      get size() {
          return this._size;
      }
  }
  //# sourceMappingURL=bundle.module.js.map

  class Vector {
      constructor(v) {
          this.v = v;
          assertInst(Float64Array, v);
      }
      static fromFunction(dims, f) {
          assertNumbers(dims);
          const e = new Float64Array(dims);
          let i = dims;
          while (i--) {
              e[i] = f(i);
          }
          return new Vector(e);
      }
      static random(dims) {
          return Vector.fromFunction(dims, i => Math.random());
      }
      static from(...args) {
          assert(args[0] instanceof Float64Array || args.every(a => 'number' == typeof a), 'args[0] instanceof Float64Array || args.every(a => "number" == typeof a)');
          return new Vector(args[0] instanceof Float64Array ? args[0] : Float64Array.from(args));
      }
      static Zero(dims) {
          assertNumbers(dims);
          let i = 0;
          const n = new Float64Array(dims);
          while (i--) {
              n[i] = 0;
          }
          return new Vector(n);
      }
      static Unit(dims, dir) {
          assertNumbers(dims, dir);
          let i = 0;
          const n = new Float64Array(dims);
          while (i--) {
              n[i] = +(i == dir); // +true === 1, +false === 0
          }
          return new Vector(n);
      }
      /**
       * Pack an array of Vectors into an array of numbers (Float32Array by default).
       *
       * @param vectors source array
       * @param dest destination array. If provided, must be large enough to fit v3count items.
       * @param srcStart starting index in source array
       * @param destStart starting index in destination array
       * @param vectorCount Number of V3s to copy.
       * @returns Packed array.
       */
      static pack(vectors, dest, srcStart = 0, destStart = 0, vectorCount = vectors.length - srcStart) {
          //assert (v3arr.every(v3 => v3 instanceof V3), 'v3arr.every(v3 => v3 instanceof V3)')
          const dim = vectors[0].dim();
          const result = dest || new Float32Array(dim * vectorCount); // TODO
          assert(result.length - destStart >= vectorCount * dim, 'dest.length - destStart >= v3count * 3', result.length, destStart, vectorCount * 3);
          let i = vectorCount, srcIndex = srcStart, destIndex = destStart;
          while (i--) {
              const v = vectors[srcIndex++];
              for (let d = 0; d < dim; d++) {
                  result[destIndex++] = v.v[d];
              }
          }
          return result;
      }
      static lerp(a, b, t) {
          assert(a.dim() == b.dim());
          const n = new Float64Array(a.v.length);
          let i = a.v.length;
          while (i--) {
              n[i] = a.v[i] * (1 - t) + b.v[i] * t;
          }
          return new Vector(n);
      }
      static add(...vs) {
          const dim = vs[0].v.length;
          const result = new Float64Array(dim);
          let i = vs.length;
          while (i--) {
              let d = dim;
              while (d--) {
                  result[d] += vs[i].v[d];
              }
          }
          return new Vector(result);
      }
      /**
       * Create a new 4D Vector from a V3 and a weight.
       * @param v3
       * @param weight
       */
      static fromV3AndWeight(v3, weight) {
          return new Vector(new Float64Array([v3.x * weight, v3.y * weight, v3.z * weight, weight]));
      }
      get x() {
          return this.v[0];
      }
      get y() {
          return this.v[1];
      }
      get z() {
          return this.v[2];
      }
      get w() {
          return this.v[3];
      }
      [Symbol.iterator]() {
          return this.v[Symbol.iterator]();
      }
      dim() {
          return this.v.length;
      }
      e(index) {
          if (0 > index || index >= this.v.length) {
              throw new Error('array index out of bounds');
          }
          return this.v[index];
      }
      plus(vector) {
          const u = this.v, v = vector.v;
          const n = new Float64Array(u.length);
          let i = u.length;
          while (i--) {
              n[i] = u[i] + v[i];
          }
          return new Vector(n);
      }
      minus(vector) {
          const u = this.v, v = vector.v;
          const n = new Float64Array(u.length);
          let i = u.length;
          while (i--) {
              n[i] = u[i] - v[i];
          }
          return new Vector(n);
      }
      times(factor) {
          const u = this.v;
          const n = new Float64Array(u.length);
          let i = u.length;
          while (i--) {
              n[i] = u[i] * factor;
          }
          return new Vector(n);
      }
      div(val) {
          const u = this.v;
          const n = new Float64Array(u.length);
          let i = u.length;
          while (i--) {
              n[i] = u[i] / val;
          }
          return new Vector(n);
      }
      dot(vector) {
          assert(this.dim == vector.dim, 'passed vector must have the same dim');
          let result = 0;
          const u = this.v, v = vector.v;
          let i = u.length;
          while (i--) {
              result += u[i] * v[i];
          }
          return result;
      }
      cross(vector) {
          assertInst(Vector, vector);
          const n = new Float64Array(3);
          n[0] = this.v[1] * vector.v[2] - this.v[2] * vector.v[1];
          n[1] = this.v[2] * vector.v[0] - this.v[0] * vector.v[2];
          n[2] = this.v[0] * vector.v[1] - this.v[1] * vector.v[0];
          return new Vector(n);
      }
      schur(vector) {
          assertInst(Vector, vector);
          const u = this.v, v = vector.v;
          const n = new Float64Array(u.length);
          let i = u.length;
          while (i--) {
              n[i] = u[i] * v[i];
          }
          return new Vector(n);
      }
      equals(obj) {
          if (obj === this)
              return true;
          if (obj.constructor !== Vector)
              return false;
          if (this.v.length != obj.v.length)
              return false;
          let i = this.v.length;
          while (i--) {
              if (this.v[i] !== obj.v[i])
                  return false;
          }
          return true;
      }
      like(obj) {
          if (obj === this)
              return true;
          if (obj.constructor !== Vector)
              return false;
          if (this.v.length != obj.v.length)
              return false;
          let i = this.v.length;
          while (i--) {
              if (!eq(this.v[i], obj.v[i]))
                  return false;
          }
          return true;
      }
      map(f) {
          return new Vector(this.v.map(f));
      }
      toString(roundFunction) {
          roundFunction = roundFunction || (v => +v.toFixed(6));
          return 'Vector(' + this.v.map(roundFunction).join(', ') + ')';
      }
      toSource() {
          return callsce('VV', ...this.v);
      }
      angleTo(vector) {
          assertInst(Vector, vector);
          assert(!this.isZero(), '!this.likeO()');
          assert(!vector.isZero(), '!vector.likeO()');
          return Math.acos(clamp(this.dot(vector) / this.length() / vector.length(), -1, 1));
      }
      /**
       * Returns true iff this is parallel to vector, using eq
       * Throw a DebugError
       * - if vector is not a Vector or
       * - if this has a length of 0 or
       * - if vector has a length of 0
       */
      isParallelTo(vector) {
          assertInst(Vector, vector);
          assert(!this.isZero(), '!this.likeO()');
          assert(!vector.isZero(), '!vector.likeO()');
          // a . b takes on values of +|a|*|b| (vectors same direction) to -|a|*|b| (opposite direction)
          // in both cases the vectors are paralle, so check if abs(a . b) == |a|*|b|
          return eq(Math.sqrt(this.lengthSquared() * vector.lengthSquared()), Math.abs(this.dot(vector)));
      }
      isPerpendicularTo(vector) {
          assertInst(Vector, vector);
          assert(!this.isZero(), '!this.likeO()');
          assert(!vector.isZero(), '!vector.likeO()');
          return eq0(this.dot(vector));
      }
      /**
       * Returns true iff the length of this vector is 0, as returned by NLA.isZero.
       * Definition: Vector.prototype.isZero = () => NLA.isZero(this.length())
       */
      isZero() {
          return eq0(this.length());
      }
      /*/ Returns the length of this Vector, i.e. the euclidian norm.*/
      length() {
          return Math.hypot.apply(undefined, this.v);
          //return Math.sqrt(this.lengthSquared())
      }
      lengthSquared() {
          let result = 0;
          const u = this.v;
          let i = u.length;
          while (i--) {
              result += u[i] * u[i];
          }
          return result;
      }
      /**
       * Returns a new unit Vector (.length() === 1) with the same direction as this vector. Throws a
       */
      unit() {
          const length = this.length();
          if (eq0(length)) {
              throw new Error('cannot normalize zero vector');
          }
          return this.div(this.length());
      }
      /**
       * Documentation stub. You want {@link unit}
       */
      normalized() {
          throw new Error('documentation stub. use .unit()');
      }
      asRowMatrix() {
          return new Matrix(this.v.length, 1, this.v);
      }
      asColMatrix() {
          return new Matrix(1, this.v.length, this.v);
      }
      /**
       * Returns a new Vector which is the projection of this vector onto the passed vector.
       * @example
       * VV(3, 4).projectedOn(VV(1, 0)) // returns VV(3, 0)
       * @example
       * VV(3, 4).projectedOn(VV(2, 0)) // returns VV(3, 0)
       * @example
       * VV(3, 4).projectedOn(VV(-1, 0)) // returns VV(-3, 0)
       * @example
       * VV(3, 4).projectedOn(VV(0, 1)) // returns VV(0, 4)
       * @example
       * VV(3, 4).projectedOn(VV(1, 1)) // returns
       */
      projectedOn(b) {
          assertInst(Vector, b);
          // https://en.wikipedia.org/wiki/Vector_projection#Vector_projection_2
          return b.times(this.dot(b) / b.dot(b));
      }
      rejectedOn(b) {
          assertInst(Vector, b);
          // https://en.wikipedia.org/wiki/Vector_projection#Vector_projection_2
          return this.minus(b.times(this.dot(b) / b.dot(b)));
      }
      to(a) {
          return a.minus(this);
      }
      /**
       * Returns true iff the length() of this vector is equal to 'length', using equals
       * E.g. NLA.V(3, 4).hasLength(5) === true
       * NLA.V(1, 1).hasLength(1) === false
       */
      hasLength(length) {
          assertNumbers(length);
          return eq(length, this.length());
      }
      V3() {
          //assert(this.dim() == 3)
          return new V3(this.v[0], this.v[1], this.v[2]);
      }
      /**
       * Project into 3 dimensions.
       */
      p3() {
          assert(this.v.length == 4);
          const w = this.v[3];
          return new V3(this.v[0] / w, this.v[1] / w, this.v[2] / w);
      }
      transposed() {
          return new Matrix(this.v.length, 1, this.v);
      }
  }
  function VV(...values) {
      return new Vector(new Float64Array(values));
  }

  class Matrix {
      constructor(width, height, m) {
          this.width = width;
          this.height = height;
          this.m = m;
          assertInts(width, height);
          assertf(() => 0 < width);
          assertf(() => 0 < height);
          assert(width * height == m.length, 'width * height == m.length', width, height, m.length);
      }
      static random(width, height) {
          return Matrix.fromFunction(width, height, () => Math.random());
      }
      static fromFunction(width, height, f) {
          const m = new Float64Array(height * width);
          let elIndex = height * width;
          while (elIndex--) {
              m[elIndex] = f(Math.floor(elIndex / width), elIndex % width, elIndex);
          }
          return new Matrix(width, height, m);
      }
      static identityN(dim) {
          assertInts(dim);
          const m = new Float64Array(dim * dim);
          // Float64Arrays are init to 0
          let elIndex = dim * (dim + 1);
          while (elIndex) {
              elIndex -= dim + 1;
              m[elIndex] = 1;
          }
          return new Matrix(dim, dim, m);
      }
      /**
       * Create new dim x dim matrix equal to an identity matrix with rows/colums i and k swapped. Note that i and k
       * are 0-indexed.
       */
      static permutation(dim, i, k) {
          assertInts(dim, i, k);
          assertf(() => 0 <= i && i < dim);
          assertf(() => 0 <= k && k < dim);
          const m = new Float64Array(dim * dim);
          // Float64Array are init to 0
          let elIndex = dim * (dim + 1);
          while (elIndex) {
              elIndex -= dim + 1;
              m[elIndex] = 1;
          }
          m[i * dim + i] = 0;
          m[k * dim + k] = 0;
          m[i * dim + k] = 1;
          m[k * dim + i] = 1;
          return new Matrix(dim, dim, m);
      }
      static fromRowArrays(...rowArrays) {
          if (0 == rowArrays.length) {
              throw new Error('cannot have 0 vector');
          }
          const height = rowArrays.length;
          const width = rowArrays[0].length;
          const m = new Float64Array(height * width);
          arrayCopy(rowArrays[0], 0, m, 0, width);
          for (let rowIndex = 1; rowIndex < height; rowIndex++) {
              if (rowArrays[rowIndex].length != width) {
                  throw new Error('all row arrays must be the same length');
              }
              arrayCopy(rowArrays[rowIndex], 0, m, rowIndex * width, width);
          }
          return this.new(width, height, m);
      }
      static fromColVectors(colVectors) {
          return Matrix.fromColArrays(...colVectors.map(v => v.v));
      }
      static forWidthHeight(width, height) {
          return new Matrix(width, height, new Float64Array(width * height));
      }
      static fromColArrays(...colArrays) {
          if (0 == colArrays.length) {
              throw new Error('cannot have 0 vector');
          }
          const width = colArrays.length;
          const height = colArrays[0].length;
          const m = new Float64Array(height * width);
          arrayCopyStep(colArrays[0], 0, 1, m, 0, width, height);
          for (let colIndex = 1; colIndex < width; colIndex++) {
              if (colArrays[colIndex].length != height) {
                  throw new Error('all col arrays must be the same length');
              }
              arrayCopyStep(colArrays[colIndex], 0, 1, m, colIndex, width, height);
          }
          return this.new(width, height, m);
      }
      static product(...args) {
          const [ms, result] = Array.isArray(args[0])
              ? [args[0], args[1]]
              : [args, undefined];
          if (0 == ms.length)
              throw new Error("Can't guess matrix size.");
          if (1 == ms.length)
              return Matrix.copy(ms[0], result);
          return Matrix.copy(ms.reduce((a, b) => a.times(b)), result);
      }
      /**
       * Numerically calculate all the partial derivatives of f at x0.
       *
       * @param f
       * @param x0
       * @param fx0 f(x0), pass it if you have it already
       * @param EPSILON
       */
      static jacobi(f, x0, fx0 = f(x0), EPSILON = 1e-6) {
          const jacobi = Matrix.forWidthHeight(x0.length, fx0.length);
          for (let colIndex = 0; colIndex < x0.length; colIndex++) {
              x0[colIndex] += EPSILON;
              const fx = f(x0);
              for (let rowIndex = 0; rowIndex < fx0.length; rowIndex++) {
                  const value = (fx[rowIndex] - fx0[rowIndex]) / EPSILON;
                  jacobi.setEl(rowIndex, colIndex, value);
              }
              x0[colIndex] -= EPSILON;
          }
          return jacobi;
      }
      static copy(src, result = src.new()) {
          assertInst(Matrix, src, result);
          assert(src.width == result.width);
          assert(src.height == result.height);
          assert(result != src, 'result != src');
          const s = src.m, d = result.m;
          let i = s.length;
          while (i--) {
              d[i] = s[i];
          }
          return result;
      }
      static new(width, height, m) {
          return new Matrix(width, height, m);
      }
      copy() {
          return Matrix.copy(this);
      }
      e(rowIndex, colIndex) {
          assertInts(rowIndex, colIndex);
          assert(0 <= rowIndex && rowIndex < this.height, 'rowIndex out of bounds ' + rowIndex);
          assert(0 <= colIndex && colIndex < this.width, 'colIndex out of bounds ' + colIndex);
          return this.m[rowIndex * this.width + colIndex];
      }
      setEl(rowIndex, colIndex, val) {
          assertInts(rowIndex, colIndex);
          assert(0 <= rowIndex && rowIndex < this.height, 'rowIndex out of bounds ' + rowIndex);
          assert(0 <= colIndex && colIndex < this.width, 'colIndex out of bounds ' + colIndex);
          assertNumbers(val);
          this.m[rowIndex * this.width + colIndex] = val;
      }
      plus(m) {
          assert(this.width == m.width);
          assert(this.height == m.height);
          const r = this.new();
          let i = this.m.length;
          while (i--)
              r.m[i] = this.m[i] + m.m[i];
          return r;
      }
      minus(m) {
          assert(this.width == m.width);
          assert(this.height == m.height);
          const r = this.new();
          let i = this.m.length;
          while (i--)
              r.m[i] = this.m[i] - m.m[i];
          return r;
      }
      mulScalar(scalar) {
          assertNumbers(scalar);
          const r = this.new();
          let i = this.m.length;
          while (i--)
              r.m[i] = this.m[i] * scalar;
          return r;
      }
      divScalar(scalar) {
          assertNumbers(scalar);
          const r = this.new();
          let i = this.m.length;
          while (i--)
              r.m[i] = this.m[i] / scalar;
          return r;
      }
      new() {
          return new Matrix(this.width, this.height, new Float64Array(this.width * this.height));
      }
      toString(f, colNames, rowNames) {
          f = f || (v => v.toFixed(6));
          assert(typeof f(0) == 'string', '' + typeof f(0));
          assert(!colNames || colNames.length == this.width);
          assert(!rowNames || rowNames.length == this.height);
          const rounded = Array.from(this.m).map(f);
          const rows = arrayFromFunction(this.height, rowIndex => rounded.slice(rowIndex * this.width, (rowIndex + 1) * this.width)); // select matrix row
          if (colNames) {
              rows.unshift(Array.from(colNames));
          }
          if (rowNames) {
              rows.forEach((row, rowIndex) => row.unshift(rowNames[rowIndex - (colNames ? 1 : 0)] || ''));
          }
          const colWidths = arrayFromFunction(this.width, colIndex => rows.map(row => row[colIndex].length).max());
          return rows
              .map((row, rowIndex) => row
              .map((x, colIndex) => {
              // pad numbers with spaces to col width
              const padder = (rowIndex == 0 && colNames) || (colIndex == 0 && rowNames)
                  ? String.prototype.padEnd
                  : String.prototype.padStart;
              return padder.call(x, colWidths[colIndex]);
          })
              .join('  '))
              .map(x => x + '\n')
              .join(''); // join rows
      }
      row(rowIndex) {
          assertInts(rowIndex);
          assert(0 <= rowIndex && rowIndex < this.height, 'rowIndex out of bounds ' + rowIndex);
          const v = new Float64Array(this.width);
          arrayCopy(this.m, rowIndex * this.width, v, 0, this.width);
          return new Vector(v);
      }
      col(colIndex) {
          assertInts(colIndex);
          assert(0 <= colIndex && colIndex < this.width, 'colIndex out of bounds ' + colIndex);
          const v = new Float64Array(this.height);
          arrayCopyStep(this.m, colIndex, this.width, v, 0, 1, this.height);
          return new Vector(v);
      }
      dim() {
          return { width: this.width, height: this.height };
      }
      dimString() {
          return this.width + 'x' + this.height;
      }
      equals(obj) {
          if (obj.constructor != this.constructor)
              return false;
          if (this.width != obj.width || this.height != obj.height)
              return false;
          let elIndex = this.m.length;
          while (elIndex--) {
              if (this.m[elIndex] != obj.m[elIndex])
                  return false;
          }
          return true;
      }
      equalsMatrix(matrix, precision = NLA_PRECISION) {
          assertInst(Matrix, matrix);
          if (this.width != matrix.width || this.height != matrix.height)
              return false;
          let elIndex = this.m.length;
          while (elIndex--) {
              if (Math.abs(this.m[elIndex] - matrix.m[elIndex]) >= precision)
                  return false;
          }
          return true;
      }
      hashCode() {
          let result = 0;
          let elIndex = this.m.length;
          while (elIndex--) {
              result = result * 31 + floatHashCode(this.m[elIndex]);
          }
          return result;
      }
      // todo rename
      isZero() {
          let elIndex = this.m.length;
          while (elIndex--) {
              if (!eq0(this.m[elIndex])) {
                  return false;
              }
          }
          return true;
      }
      isOrthogonal() {
          return (this.isSquare() &&
              this.transposed()
                  .times(this)
                  .equalsMatrix(Matrix.identityN(this.width)));
      }
      /**
       * Returns L, U, P such that L * U == P * this
       */
      luDecomposition() {
          assertf(() => this.isSquare(), this.dim().toSource());
          const dim = this.width;
          const uRowArrays = this.asRowArrays(Float64Array);
          const lRowArrays = arrayFromFunction(dim, row => new Float64Array(dim));
          const pRowArrays = Matrix.identityN(dim).asRowArrays(Float64Array);
          let currentRowIndex = 0;
          for (let colIndex = 0; colIndex < dim; colIndex++) {
              // find largest value in colIndex
              let maxAbsValue = 0, pivotRowIndex = -1, numberOfNonZeroRows = 0;
              for (let rowIndex = currentRowIndex; rowIndex < dim; rowIndex++) {
                  const el = uRowArrays[rowIndex][colIndex];
                  numberOfNonZeroRows += +(0 != el);
                  if (Math.abs(el) > maxAbsValue) {
                      maxAbsValue = Math.abs(el);
                      pivotRowIndex = rowIndex;
                  }
              }
              // TODO: check with isZero
              if (0 == maxAbsValue) {
                  // column contains only zeros
                  continue;
              }
              assert(-1 !== pivotRowIndex);
              // swap rows
              arraySwap(uRowArrays, currentRowIndex, pivotRowIndex);
              arraySwap(lRowArrays, currentRowIndex, pivotRowIndex);
              arraySwap(pRowArrays, currentRowIndex, pivotRowIndex);
              lRowArrays[colIndex][colIndex] = 1;
              if (1 < numberOfNonZeroRows) {
                  // subtract pivot (now current) row from all below it
                  for (let rowIndex = currentRowIndex + 1; rowIndex < dim; rowIndex++) {
                      const l = uRowArrays[rowIndex][colIndex] / uRowArrays[currentRowIndex][colIndex];
                      lRowArrays[rowIndex][colIndex] = l;
                      // subtract pivot row * l from row 'rowIndex'
                      for (let colIndex2 = colIndex; colIndex2 < dim; colIndex2++) {
                          uRowArrays[rowIndex][colIndex2] -= l * uRowArrays[currentRowIndex][colIndex2];
                      }
                  }
              }
              currentRowIndex++; // this doesn't increase if pivot was zero
          }
          return {
              L: Matrix.fromRowArrays(...lRowArrays),
              U: Matrix.fromRowArrays(...uRowArrays),
              P: Matrix.fromRowArrays(...pRowArrays),
          };
      }
      gauss() {
          const width = this.width, height = this.height;
          const uRowArrays = this.asRowArrays(Float64Array);
          const lRowArrays = arrayFromFunction(height, row => new Float64Array(width));
          const pRowArrays = Matrix.identityN(height).asRowArrays(Float64Array);
          let currentRowIndex = 0;
          for (let colIndex = 0; colIndex < width; colIndex++) {
              // console.log('currentRowIndex', currentRowIndex)	// find largest value in colIndex
              let maxAbsValue = 0, pivotRowIndex = -1, numberOfNonZeroRows = 0;
              for (let rowIndex = currentRowIndex; rowIndex < height; rowIndex++) {
                  const el = uRowArrays[rowIndex][colIndex];
                  numberOfNonZeroRows += +(0 != el);
                  if (Math.abs(el) > maxAbsValue) {
                      maxAbsValue = Math.abs(el);
                      pivotRowIndex = rowIndex;
                  }
              }
              // TODO: check with isZero
              if (0 == maxAbsValue) {
                  // column contains only zeros
                  continue;
              }
              assert(-1 !== pivotRowIndex);
              // swap rows
              arraySwap(uRowArrays, currentRowIndex, pivotRowIndex);
              arraySwap(lRowArrays, currentRowIndex, pivotRowIndex);
              arraySwap(pRowArrays, currentRowIndex, pivotRowIndex);
              lRowArrays[currentRowIndex][colIndex] = 1;
              if (1 < numberOfNonZeroRows) {
                  // subtract pivot (now current) row from all below it
                  for (let rowIndex = currentRowIndex + 1; rowIndex < height; rowIndex++) {
                      const l = uRowArrays[rowIndex][colIndex] / uRowArrays[currentRowIndex][colIndex];
                      lRowArrays[rowIndex][colIndex] = l;
                      // subtract pivot row * l from row 'rowIndex'
                      for (let colIndex2 = colIndex; colIndex2 < width; colIndex2++) {
                          uRowArrays[rowIndex][colIndex2] -= l * uRowArrays[currentRowIndex][colIndex2];
                      }
                  }
              }
              currentRowIndex++; // this doesn't increase if pivot was zero
          }
          return {
              L: Matrix.fromRowArrays(...lRowArrays),
              U: Matrix.fromRowArrays(...uRowArrays),
              P: Matrix.fromRowArrays(...pRowArrays),
          };
      }
      qrDecompositionGivensRotation() {
          // function sigma(c: number, s: number) {
          // 	if (0 == c) {
          // 		return 1
          // 	}
          // 	if (Math.abs(s) < Math.abs(c)) {
          // 		return 0.5 * Math.sign(c) * s
          // 	}
          // 	return (2 * Math.sign(s)) / c
          // }
          const R = this.copy();
          function matrixForCS(dim, i, k, c, s) {
              const m = Matrix.identityN(dim);
              m.setEl(i, i, c);
              m.setEl(k, k, c);
              m.setEl(i, k, s);
              m.setEl(k, i, -s);
              return m;
          }
          let qTransposed = Matrix.identityN(this.height);
          for (let colIndex = 0; colIndex < this.width; colIndex++) {
              // find largest value in colIndex
              for (let rowIndex = colIndex + 1; rowIndex < this.height; rowIndex++) {
                  //console.log('row ', rowIndex, 'col ', colIndex)
                  const xi = R.e(colIndex, colIndex);
                  const xk = R.e(rowIndex, colIndex);
                  if (xk == 0) {
                      continue;
                  }
                  const r = Math.hypot(xi, xk);
                  const c = xi / r;
                  const s = xk / r;
                  // apply transformation on every column:
                  for (let col2 = colIndex; col2 < this.width; col2++) {
                      const x1 = R.e(colIndex, col2) * c + R.e(rowIndex, col2) * s;
                      const x2 = R.e(rowIndex, col2) * c - R.e(colIndex, col2) * s;
                      R.setEl(colIndex, col2, x1);
                      R.setEl(rowIndex, col2, x2);
                  }
                  //console.log('r ', r, 'c ', c, 's ', s, 'sigma', sigma(c, s))
                  //console.log(this.toString(),'cs\n', matrixForCS(this.height, colIndex, rowIndex, c, s).toString())
                  qTransposed = matrixForCS(this.height, colIndex, rowIndex, c, s).times(qTransposed);
              }
          }
          //console.log(qTransposed.transposed().toString(), this.toString(),
          // qTransposed.transposed().times(this).toString())
          return { Q: qTransposed.transposed(), R };
      }
      isPermutation() {
          if (!this.isSquare())
              return false;
          if (this.m.some(value => !eq0(value) && !eq(1, value)))
              return false;
          const rows = this.asRowArrays(Array);
          if (rows.some(row => row.filter(value => eq(1, value)).length != 1))
              return false;
          const cols = this.asColArrays(Array);
          if (cols.some(col => col.filter(value => eq(1, value)).length != 1))
              return false;
          return true;
      }
      isDiagonal(precision) {
          let i = this.m.length;
          while (i--) {
              if (0 !== i % (this.width + 1) && !eq0(this.m[i]))
                  return false;
          }
          return true;
      }
      isIdentity(precision) {
          return this.isLowerUnitriangular(precision) && this.isUpperTriangular(precision);
      }
      isUpperTriangular(precision = NLA_PRECISION) {
          if (!this.isSquare())
              return false;
          for (let rowIndex = 1; rowIndex < this.height; rowIndex++) {
              for (let colIndex = 0; colIndex < rowIndex; colIndex++) {
                  if (!eq0(this.m[rowIndex * this.width + colIndex], precision)) {
                      return false;
                  }
              }
          }
          return true;
      }
      isSymmetric(precision = NLA_PRECISION) {
          if (!this.isSquare())
              return false;
          for (let rowIndex = 0; rowIndex < this.height - 1; rowIndex++) {
              for (let colIndex = rowIndex + 1; colIndex < this.width; colIndex++) {
                  const a = this.m[rowIndex * this.width + colIndex];
                  const b = this.m[colIndex * this.width + rowIndex];
                  if (!eq(a, b, precision)) {
                      return false;
                  }
              }
          }
          return true;
      }
      /**
       * Returns x, so that this * x = b
       * More efficient than calculating the inverse for few (~ <= this.height) values
       */
      solveLinearSystem(b) {
          assertInst(Vector, b);
          const { L, U, P } = this.luDecomposition();
          const y = L.solveForwards(P.timesVector(b));
          const x = U.solveBackwards(y);
          return x;
      }
      isLowerUnitriangular(precision = NLA_PRECISION) {
          if (!this.isSquare())
              return false;
          for (let rowIndex = 0; rowIndex < this.height - 1; rowIndex++) {
              for (let colIndex = rowIndex; colIndex < this.width; colIndex++) {
                  const el = this.m[rowIndex * this.width + colIndex];
                  if (rowIndex == colIndex ? !eq(1, el, precision) : !eq0(el, precision)) {
                      return false;
                  }
              }
          }
          return true;
      }
      isLowerTriangular(precision = NLA_PRECISION) {
          if (!this.isSquare())
              return false;
          for (let rowIndex = 0; rowIndex < this.height - 1; rowIndex++) {
              for (let colIndex = rowIndex + 1; colIndex < this.width; colIndex++) {
                  if (!eq0(this.m[rowIndex * this.width + colIndex], precision)) {
                      return false;
                  }
              }
          }
          return true;
      }
      solveBackwards(x) {
          assertVectors(x);
          assert(this.height == x.dim(), 'this.height == x.dim()');
          assert(this.isUpperTriangular(), 'this.isUpperTriangular()\n' + this.str);
          const v = new Float64Array(this.width);
          let rowIndex = this.height;
          while (rowIndex--) {
              let temp = x.v[rowIndex];
              for (let colIndex = rowIndex + 1; colIndex < this.width; colIndex++) {
                  temp -= v[colIndex] * this.e(rowIndex, colIndex);
              }
              v[rowIndex] = temp / this.e(rowIndex, rowIndex);
          }
          return new Vector(v);
      }
      solveBackwardsMatrix(matrix) {
          const colVectors = new Array(matrix.width);
          let i = matrix.width;
          while (i--) {
              colVectors[i] = this.solveBackwards(matrix.col(i));
          }
          return Matrix.fromColVectors(colVectors);
      }
      solveForwardsMatrix(matrix) {
          const colVectors = new Array(matrix.width);
          let i = matrix.width;
          while (i--) {
              colVectors[i] = this.solveForwards(matrix.col(i));
          }
          return Matrix.fromColVectors(colVectors);
      }
      solveForwards(x) {
          assertVectors(x);
          assert(this.height == x.dim(), 'this.height == x.dim()');
          assertf(() => this.isLowerTriangular(), this.toString());
          const v = new Float64Array(this.width);
          for (let rowIndex = 0; rowIndex < this.height; rowIndex++) {
              let temp = x.v[rowIndex];
              for (let colIndex = 0; colIndex < rowIndex; colIndex++) {
                  temp -= v[colIndex] * this.e(rowIndex, colIndex);
              }
              v[rowIndex] = temp / this.e(rowIndex, rowIndex);
          }
          return new Vector(v);
      }
      /**
       * Calculates rank of matrix.
       * Number of linearly independant row/column vectors.
       * Is equal to the unmber of dimensions the image of the affine transformation represented this matrix has.
       */
      rank() {
          const U = this.gauss().U;
          let rowIndex = this.height;
          while (rowIndex-- && U.row(rowIndex).isZero()) { }
          return rowIndex + 1;
      }
      rowsIndependent() {
          return this.height == this.rank();
      }
      colsIndependent() {
          return this.width == this.rank();
      }
      asRowArrays(arrayConstructor = Float64Array) {
          return arrayFromFunction(this.height, rowIndex => this.rowArray(rowIndex, arrayConstructor));
      }
      asColArrays(arrayConstructor = Float64Array) {
          return arrayFromFunction(this.width, colIndex => this.colArray(colIndex, arrayConstructor));
      }
      rowArray(rowIndex, arrayConstructor = Float64Array) {
          const result = new arrayConstructor(this.width);
          return arrayCopy(this.m, rowIndex * this.width, result, 0, this.width);
          return result;
      }
      colArray(colIndex, arrayConstructor = Float64Array) {
          const result = new arrayConstructor(this.width);
          arrayCopyStep(this.m, colIndex, this.height, result, 0, 1, this.height);
          return result;
      }
      subMatrix(firstColIndex, subWidth, firstRowIndex, subHeight) {
          assert(0 < firstColIndex && 0 < subWidth && 0 < firstRowIndex && 0 < subHeight);
          assert(firstColIndex + subWidth <= this.width && firstRowIndex + subHeight <= this.height);
          const m = new Float64Array(subWidth * subHeight);
          arrayCopyBlocks(this.m, firstColIndex, this.width, m, 0, subWidth, subHeight, subWidth);
          return new Matrix(subWidth, subHeight, m);
      }
      map(fn) {
          return new Matrix(this.width, this.height, this.m.map(fn));
      }
      dimEquals(matrix) {
          assertInst(Matrix, matrix);
          return this.width == matrix.width && this.height == matrix.height;
      }
      inversed() {
          if (this.isSquare()) {
              if (2 == this.width)
                  return this.inversed2();
              if (3 == this.width)
                  return this.inversed3();
              if (4 == this.width)
                  return this.inversed4();
          }
          const { L, U, P } = this.luDecomposition();
          const y = L.solveForwardsMatrix(P);
          const inverse = U.solveBackwardsMatrix(y);
          return inverse;
      }
      inversed2() {
          assertf(() => 2 == this.width && 2 == this.height);
          const result = Matrix.forWidthHeight(2, 2), m = this.m, r = result.m;
          const det = m[0] * m[3] - m[1] * r[2];
          r[0] = m[3] / det;
          r[1] = -m[2] / det;
          r[2] = -m[1] / det;
          r[3] = m[0] / det;
          return result;
      }
      inversed3(result = Matrix.forWidthHeight(3, 3)) {
          assertInst(Matrix, result);
          assertf(() => 3 == this.width && 3 == this.height);
          assertf(() => 3 == result.width && 3 == result.height);
          assert(() => this != result);
          const m = this.m, r = result.m;
          r[0] = m[4] * m[8] - m[5] * m[7];
          r[1] = -m[1] * m[8] + m[2] * m[7];
          r[2] = m[1] * m[5] - m[2] * m[4];
          r[3] = -m[3] * m[8] + m[5] * m[6];
          r[4] = m[0] * m[8] - m[2] * m[6];
          r[5] = -m[0] * m[5] + m[2] * m[3];
          r[6] = m[3] * m[7] - m[4] * m[6];
          r[7] = -m[0] * m[7] + m[1] * m[6];
          r[8] = m[0] * m[4] - m[1] * m[3];
          const det = m[0] * r[0] + m[1] * r[3] + m[2] * r[6];
          let i = 9;
          while (i--) {
              r[i] /= det;
          }
          return result;
      }
      // prettier-ignore
      inversed4(result = Matrix.forWidthHeight(4, 4)) {
          assertInst(Matrix, result);
          assertf(() => 4 == this.width && 4 == this.height);
          assertf(() => 4 == result.width && 4 == result.height);
          assert(() => this != result);
          const m = this.m, r = result.m;
          // first compute transposed cofactor matrix:
          // cofactor of an element is the determinant of the 3x3 matrix gained by removing the column and row belonging
          // to the element
          r[0] = m[5] * m[10] * m[15] - m[5] * m[14] * m[11] - m[6] * m[9] * m[15]
              + m[6] * m[13] * m[11] + m[7] * m[9] * m[14] - m[7] * m[13] * m[10];
          r[1] = -m[1] * m[10] * m[15] + m[1] * m[14] * m[11] + m[2] * m[9] * m[15]
              - m[2] * m[13] * m[11] - m[3] * m[9] * m[14] + m[3] * m[13] * m[10];
          r[2] = m[1] * m[6] * m[15] - m[1] * m[14] * m[7] - m[2] * m[5] * m[15]
              + m[2] * m[13] * m[7] + m[3] * m[5] * m[14] - m[3] * m[13] * m[6];
          r[3] = -m[1] * m[6] * m[11] + m[1] * m[10] * m[7] + m[2] * m[5] * m[11]
              - m[2] * m[9] * m[7] - m[3] * m[5] * m[10] + m[3] * m[9] * m[6];
          r[4] = -m[4] * m[10] * m[15] + m[4] * m[14] * m[11] + m[6] * m[8] * m[15]
              - m[6] * m[12] * m[11] - m[7] * m[8] * m[14] + m[7] * m[12] * m[10];
          r[5] = m[0] * m[10] * m[15] - m[0] * m[14] * m[11] - m[2] * m[8] * m[15]
              + m[2] * m[12] * m[11] + m[3] * m[8] * m[14] - m[3] * m[12] * m[10];
          r[6] = -m[0] * m[6] * m[15] + m[0] * m[14] * m[7] + m[2] * m[4] * m[15]
              - m[2] * m[12] * m[7] - m[3] * m[4] * m[14] + m[3] * m[12] * m[6];
          r[7] = m[0] * m[6] * m[11] - m[0] * m[10] * m[7] - m[2] * m[4] * m[11]
              + m[2] * m[8] * m[7] + m[3] * m[4] * m[10] - m[3] * m[8] * m[6];
          r[8] = m[4] * m[9] * m[15] - m[4] * m[13] * m[11] - m[5] * m[8] * m[15]
              + m[5] * m[12] * m[11] + m[7] * m[8] * m[13] - m[7] * m[12] * m[9];
          r[9] = -m[0] * m[9] * m[15] + m[0] * m[13] * m[11] + m[1] * m[8] * m[15]
              - m[1] * m[12] * m[11] - m[3] * m[8] * m[13] + m[3] * m[12] * m[9];
          r[10] = m[0] * m[5] * m[15] - m[0] * m[13] * m[7] - m[1] * m[4] * m[15]
              + m[1] * m[12] * m[7] + m[3] * m[4] * m[13] - m[3] * m[12] * m[5];
          r[11] = -m[0] * m[5] * m[11] + m[0] * m[9] * m[7] + m[1] * m[4] * m[11]
              - m[1] * m[8] * m[7] - m[3] * m[4] * m[9] + m[3] * m[8] * m[5];
          r[12] = -m[4] * m[9] * m[14] + m[4] * m[13] * m[10] + m[5] * m[8] * m[14]
              - m[5] * m[12] * m[10] - m[6] * m[8] * m[13] + m[6] * m[12] * m[9];
          r[13] = m[0] * m[9] * m[14] - m[0] * m[13] * m[10] - m[1] * m[8] * m[14]
              + m[1] * m[12] * m[10] + m[2] * m[8] * m[13] - m[2] * m[12] * m[9];
          r[14] = -m[0] * m[5] * m[14] + m[0] * m[13] * m[6] + m[1] * m[4] * m[14]
              - m[1] * m[12] * m[6] - m[2] * m[4] * m[13] + m[2] * m[12] * m[5];
          r[15] = m[0] * m[5] * m[10] - m[0] * m[9] * m[6] - m[1] * m[4] * m[10]
              + m[1] * m[8] * m[6] + m[2] * m[4] * m[9] - m[2] * m[8] * m[5];
          // calculate determinant using laplace expansion (cf https://en.wikipedia.org/wiki/Laplace_expansion),
          // as we already have the cofactors. We multiply a column by a row as the cofactor matrix is transposed.
          const det = m[0] * r[0] + m[1] * r[4] + m[2] * r[8] + m[3] * r[12];
          // assert(!isZero(det), 'det may not be zero, i.e. the matrix is not invertible')
          let i = 16;
          while (i--) {
              r[i] /= det;
          }
          return result;
      }
      canMultiply(matrix) {
          assertInst(Matrix, matrix);
          return this.width == matrix.height;
      }
      times(matrix) {
          assertInst(Matrix, matrix);
          assert(this.canMultiply(matrix), `Cannot multiply this {this.dimString()} by matrix {matrix.dimString()}`);
          const nWidth = matrix.width, nHeight = this.height, n = this.width;
          const nM = new Float64Array(nWidth * nHeight);
          let nRowIndex = nHeight;
          while (nRowIndex--) {
              let nColIndex = nWidth;
              while (nColIndex--) {
                  let result = 0;
                  let i = n;
                  while (i--) {
                      result += this.m[nRowIndex * n + i] * matrix.m[i * nWidth + nColIndex];
                  }
                  nM[nRowIndex * nWidth + nColIndex] = result;
              }
          }
          return new Matrix(nWidth, nHeight, nM);
      }
      timesVector(v) {
          assertVectors(v);
          assert(this.width == v.dim());
          const nHeight = this.height, n = this.width;
          const nM = new Float64Array(nHeight);
          let nRowIndex = nHeight;
          while (nRowIndex--) {
              let result = 0;
              let i = n;
              while (i--) {
                  result += this.m[nRowIndex * n + i] * v.v[i];
              }
              nM[nRowIndex] = result;
          }
          return new Vector(nM);
      }
      transposed() {
          const tWidth = this.height, tHeight = this.width;
          const tM = new Float64Array(tWidth * tHeight);
          let tRowIndex = tHeight;
          while (tRowIndex--) {
              let tColIndex = tWidth;
              while (tColIndex--) {
                  tM[tRowIndex * tWidth + tColIndex] = this.m[tColIndex * tHeight + tRowIndex];
              }
          }
          return new Matrix(tWidth, tHeight, tM);
      }
      /**
       * In-place transpose.
       */
      transpose() {
          const h = this.height, w = this.width, tM = this.m;
          let tRowIndex = h;
          while (tRowIndex--) {
              let tColIndex = Math.min(tRowIndex, w);
              while (tColIndex--) {
                  const temp = tM[tRowIndex * w + tColIndex];
                  tM[tRowIndex * w + tColIndex] = tM[tColIndex * h + tRowIndex];
                  tM[tColIndex * h + tRowIndex] = temp;
              }
          }
          this.width = h;
          this.height = w;
      }
      isSquare() {
          return this.height == this.width;
      }
      diagonal() {
          if (!this.isSquare()) {
              throw new Error('!!');
          }
          const v = new Float64Array(this.width);
          let elIndex = this.width * (this.width + 1);
          let vIndex = this.width;
          while (vIndex--) {
              elIndex -= this.width + 1;
              v[vIndex] = this.m[elIndex];
          }
          return new Vector(v);
      }
      maxEl() {
          return Math.max.apply(undefined, this.m);
      }
      minEl() {
          return Math.min.apply(undefined, this.m);
      }
      maxAbsColSum() {
          let result = 0;
          let colIndex = this.width;
          while (colIndex--) {
              let absSum = 0;
              let rowIndex = this.height;
              while (rowIndex--) {
                  absSum += Math.abs(this.m[rowIndex * this.width + colIndex]);
              }
              result = Math.max(result, absSum);
          }
          return result;
      }
      maxAbsRowSum() {
          let result = 0;
          let rowIndex = this.height;
          while (rowIndex--) {
              let absSum = 0;
              let colIndex = this.width;
              while (colIndex--) {
                  absSum += Math.abs(this.m[rowIndex * this.width + colIndex]);
              }
              result = Math.max(result, absSum);
          }
          return result;
      }
      getTriangularDeterminant() {
          assert(this.isUpperTriangular() || this.isLowerTriangular(), 'not a triangular matrix');
          let product = 1;
          let elIndex = this.width * (this.width + 1);
          while (elIndex) {
              elIndex -= this.width + 1;
              product *= this.m[elIndex];
          }
          return product;
      }
      /**
       * Calculates the determinant by first calculating the LU decomposition. If you already have that, use
       * U.getTriangularDeterminant()
       */
      getDeterminant() {
          // PA = LU
          // det(A) * det(B) = det(A * B)
          // det(P) == 1 (permutation matrix)
          // det(L) == 1 (main diagonal is 1s
          // =>  det(A) == det(U)
          return this.luDecomposition().U.getTriangularDeterminant();
      }
      hasFullRank() {
          return Math.min(this.width, this.height) == this.rank();
      }
      permutationAsIndexMap() {
          assertf(() => this.isPermutation());
          const result = new Array(this.height);
          let i = this.height;
          while (i--) {
              const searchIndexStart = i * this.width;
              let searchIndex = searchIndexStart;
              while (this.m[searchIndex] < 0.5)
                  searchIndex++;
              result[i] = searchIndex - searchIndexStart;
          }
          return result;
      }
      getDependentRowIndexes(gauss = this.gauss()) {
          const { L, U, P } = gauss;
          // rows which end up as zero vectors in U are not linearly independent
          const dependents = new Array(this.height);
          let uRowIndex = this.height;
          while (uRowIndex--) {
              const uRow = U.row(uRowIndex);
              if (uRow.length() < NLA_PRECISION) {
                  dependents[uRowIndex] = true;
              }
              else {
                  break;
              }
          }
          // figure out from which other rows the rows which end up as zero vectors are created by
          let lRowIndex = this.height;
          while (lRowIndex--) {
              if (dependents[lRowIndex]) {
                  let lColIndex = Math.min(lRowIndex, this.width);
                  while (lColIndex--) {
                      if (0 !== L.e(lRowIndex, lColIndex)) {
                          dependents[lColIndex] = true;
                      }
                  }
              }
          }
          console.log('m\n', this.toString(x => '' + x));
          console.log('L\n', L.toString(x => '' + x));
          console.log('U\n', U.toString(x => '' + x));
          console.log('P\n', P.toString(x => '' + x));
          // gauss algorithm permutes the order of the rows, so map our results back to the original indices
          const indexMap = P.permutationAsIndexMap();
          const dependentRowIndexes = dependents.map((b, index) => b && indexMap[index]).filter(x => x != undefined);
          return dependentRowIndexes;
      }
      lerp(b, t, result = this.new()) {
          assertInst(Matrix, b, result);
          assertNumbers(t);
          assert(this.width == b.width && this.height == b.height);
          const s = 1 - t;
          let i = this.m.length;
          while (i--) {
              result.m[i] = s * this.m[i] + t * b.m[i];
          }
          return result;
      }
  }
  const PI = Math.PI;
  /** @define {boolean} */
  const NLA_DEBUG = "development" != 'production';
  const NLA_PRECISION = 1 / (1 << 26);
  console.log('NLA_PRECISION', NLA_PRECISION);
  console.log('NLA_DEBUG', NLA_DEBUG);
  function assertVectors(...vectors) {
      {
          for (let i = 0; i < arguments.length; i++) {
              if (!(arguments[i] instanceof V3 || arguments[i] instanceof Vector)) {
                  throw new Error('assertVectors arguments[' +
                      i +
                      '] is not a vector. ' +
                      typeof arguments[i] +
                      ' == typeof ' +
                      arguments[i]);
              }
          }
      }
      return true;
  }
  function assertInst(what, ...objs) {
      {
          for (let i = 0; i < objs.length; i++) {
              if (!(objs[i] instanceof what)) {
                  throw new Error('assertInst objs[' +
                      i +
                      '] is not a ' +
                      what.prototype.name +
                      '. ' +
                      objs[i].constructor.name +
                      objs[i]);
              }
          }
      }
      return true;
  }
  function assertNumbers(...numbers) {
      {
          for (let i = 0; i < numbers.length; i++) {
              if ('number' !== typeof numbers[i]) {
                  throw new Error(`assertNumbers arguments[${i}] is not a number. ${typeof numbers[i]} == typeof ${numbers[i]}`);
              }
          }
      }
      return true;
  }
  function assertInts(...numbers) {
      {
          for (let i = 0; i < numbers.length; i++) {
              if ('number' !== typeof numbers[i] || numbers[i] % 1 !== 0) {
                  throw new Error(`assertNumbers arguments[${i}] is not an int. ${typeof numbers[i]} == typeof ${numbers[i]}`);
              }
          }
      }
      return true;
  }
  function assert(value, ...messages) {
      if (!value) {
          throw new Error('assert failed: ' +
              messages.map(message => ('function' === typeof message ? message() : message || '')).join('\n'));
      }
      return true;
  }
  function assertf(f, ...messages) {
      if (!f()) {
          throw new Error('assertf failed: ' +
              f.toString() +
              messages.map(message => ('function' === typeof message ? message() : message || '')).join('\n'));
      }
  }
  function lerp(a, b, t) {
      return a * (1 - t) + b * t;
  }
  const originalNumberToString = Number.prototype.toString;
  Number.prototype.toString = function (radix) {
      if (PI == this) {
          return 'PI';
      }
      return originalNumberToString.call(this, radix);
  };
  const eq0 = (x, EPS = NLA_PRECISION) => Math.abs(x) <= EPS;
  const eq = (x, y, EPS = NLA_PRECISION) => Math.abs(x - y) <= EPS;
  const lt = (x, y, EPS = NLA_PRECISION) => x - y < -EPS;
  /** @deprecated */ const eq2 = eq;
  /**
   * Decimal adjustment of a number.
   *
   * @param f  The type of adjustment.
   * @param value The number.
   * @param exp The exponent (the 10 logarithm of the adjustment base).
   * @returns The adjusted value.
   */
  function decimalAdjust(f, value, exp) {
      // If the exp is undefined or zero...
      if (typeof exp === 'undefined' || +exp === 0) {
          return f(value);
      }
      value = +value;
      exp = +exp;
      // If the value is not a number or the exp is not an integer...
      if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
          return NaN;
      }
      // Shift
      let vs = value.toString().split('e');
      value = f(+(vs[0] + 'e' + (vs[1] ? +vs[1] - exp : -exp)));
      // Shift back
      vs = value.toString().split('e');
      return +(vs[0] + 'e' + (vs[1] ? +vs[1] + exp : exp));
  }
  const round10 = decimalAdjust.bind(undefined, Math.round);
  const floor10 = decimalAdjust.bind(undefined, Math.floor);
  const ceil10 = decimalAdjust.bind(undefined, Math.ceil);
  function arraySwap(arr, i, j) {
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
  }
  function arrayCopy(src, sstart, dst, dstart, length) {
      assertInts(sstart, dstart, length);
      dstart += length;
      length += sstart;
      while (length-- > sstart) {
          dst[--dstart] = src[length];
      }
      return dst;
  }
  function clamp(val, min, max) {
      assertNumbers(val, min, max);
      return Math.max(min, Math.min(max, val));
  }
  /**
   * Copies a number of items from one array to another, with a definable step size between items in the source and
   * destination array.
   *
   * @param src The source array.
   * @param sstart The location of the first item in the source array.
   * @param sstep The offset between items in the source array.
   * @param dst The destination array.
   * @param dstart The location of the first item in the destination array.
   * @param dstep The offset between items in the destination array.
   * @param count The number of items to copy.
   */
  function arrayCopyStep(src, sstart, sstep, dst, dstart, dstep, count) {
      let srcIndex = sstart + count * sstep;
      let dIndex = dstart + count * dstep;
      while (srcIndex > sstart) {
          dst[(dIndex -= dstep)] = src[(srcIndex -= sstep)];
      }
  }
  /**
   * Copies a number of contiguous, evenly-spaced blocks from one array to another.
   *
   * @param src The source array.
   * @param sstart The start of the first block in the source array.
   * @param sstep The offset from the start of one block to the start of the next block in the source array.
   * @param dst The destination array.
   * @param dstart The start of the first block in the destination array.
   * @param dstep The offset from the start of one block to the start of the next block in the destination array.
   * @param blockSize The length of one block.
   * @param blockCount The number of blocks to copy.
   */
  function arrayCopyBlocks(src, sstart, sstep, dst, dstart, dstep, blockSize, blockCount) {
      for (let i = 0; i < blockCount; i++) {
          arrayCopy(src, sstart + sstep * i, dst, dstart + dstep * i, blockSize);
      }
  }
  function arrayFromFunction(length, f) {
      assertNumbers(length);
      assert('function' == typeof f);
      const a = new Array(length);
      let elIndex = length;
      while (elIndex--) {
          a[elIndex] = f(elIndex, length);
      }
      return a;
  }
  function addOwnProperties(target, props, ...exclude) {
      Object.getOwnPropertyNames(props).forEach(key => {
          //console.log(props, key)
          if (!exclude.includes(key)) {
              if (target.hasOwnProperty(key)) {
                  console.warn('target ', target, ' already has property ', key, target[key]);
              }
              Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(props, key));
          }
      });
  }
  let defaultRoundFunction = (x) => x; // Math.round10(x, -4)
  const MINUS = (a, b) => a - b;
  function floatHashCode(f) {
      return ~~(f * (1 << 28));
  }
  /**
   * One degree in radians. Use like Math.sin(30 * DEG).
   */
  const DEG = 0.017453292519943295;
  Object.map = function (o, f, context = undefined) {
      const result = {};
      for (const key in o) {
          result[key] = f.call(context, o[key], key, o);
      }
      return result;
  };
  Array.prototype.emod = function (i) {
      return this[i % this.length];
  };
  Array.prototype.sliceStep = function (start, end, step, chunkSize = 1) {
      assertNumbers(start, step);
      start < 0 && (start = this.length + start);
      end <= 0 && (end = this.length + end);
      const resultLength = Math.ceil((end - start) / step);
      const result = new Array(resultLength); // '- start' so that chunk in the last row
      // will also be selected, even if the row is
      // not complete
      let index = 0;
      for (let i = start; i < end; i += step) {
          for (let j = i; j < Math.min(i + chunkSize, end); j++) {
              result[index++] = this[j];
          }
      }
      assert(resultLength == index);
      return result;
  };
  Array.prototype.splicePure = function (start = 0, deleteCount = 0, ...items) {
      const arrayLength = this.length;
      const _deleteCount = deleteCount < 0 ? 0 : deleteCount;
      let _start;
      if (start < 0) {
          if (Math.abs(start) > arrayLength) {
              _start = 0;
          }
          else {
              _start = arrayLength + start;
          }
      }
      else if (start > arrayLength) {
          _start = arrayLength;
      }
      else {
          _start = start;
      }
      const newLength = this.length - _deleteCount + items.length;
      const result = new Array(newLength);
      let dst = newLength;
      let src = this.length;
      while (src-- > _start + _deleteCount) {
          result[--dst] = this[src];
      }
      src = items.length;
      while (src--) {
          result[--dst] = items[src];
      }
      src = _start;
      while (src--) {
          result[--dst] = items[src];
      }
      return result;
  };
  Array.prototype.equals = function (obj) {
      if (this === obj)
          return true;
      if (Object.getPrototypeOf(obj) !== Array.prototype)
          return false;
      if (this.length !== obj.length)
          return false;
      for (let i = 0; i < this.length; i++) {
          if (!equals(this[i], obj[i]))
              return false;
      }
      return true;
  };
  function equals(a, b) {
      return 'object' === typeof a ? a.equals(b) : a === b;
  }
  Array.prototype.hashCode = function () {
      let result = 0;
      for (let i = 0; i < this.length; i++) {
          result = (result * 31 + hashCode(this[i])) | 0;
      }
      return result | 0;
  };
  function hashCode(o) {
      if ('number' === typeof o || undefined === o) {
          return o | 0;
      }
      else {
          return null === o ? 0 : o.hashCode();
      }
  }
  Array.prototype.mapFilter = function (f) {
      const length = this.length, result = [];
      for (let i = 0; i < length; i++) {
          if (i in this) {
              const val = f(this[i], i, this);
              if (val) {
                  result.push(val);
              }
          }
      }
      return result;
  };
  Array.prototype.flatMap = function (f) {
      return Array.prototype.concat.apply([], this.map(f));
  };
  Array.prototype.clear = function (...newItems) {
      return this.splice(0, this.length, ...newItems);
  };
  /**
   *
   * @returns Array.prototype.concat.apply([], this)
   */
  Array.prototype.concatenated = function () {
      return Array.prototype.concat.apply([], this);
  };
  Array.prototype.min = function () {
      let i = this.length, max = Infinity;
      while (i--) {
          const val = this[i];
          if (max > val)
              max = val;
      }
      return max;
  };
  Array.prototype.max = function () {
      // faster and no limit on array size, see https://jsperf.com/math-max-apply-vs-loop/2
      let i = this.length, max = -Infinity;
      while (i--) {
          const val = this[i];
          if (max < val)
              max = val;
      }
      return max;
  };
  Array.prototype.indexWithMax = function (f) {
      if (this.length == 0) {
          return -1;
      }
      let i = this.length, result = -1, maxVal = -Infinity;
      while (i--) {
          const val = f(this[i], i, this);
          if (val > maxVal) {
              maxVal = val;
              result = i;
          }
      }
      return result;
  };
  Array.prototype.withMax = function (f) {
      let i = this.length, result = undefined, maxVal = -Infinity;
      while (i--) {
          const el = this[i], val = f(el, i, this);
          if (val > maxVal) {
              maxVal = val;
              result = el;
          }
      }
      return result;
  };
  /**
   * Returns the sum of the absolute values of the components of this vector.
   * E.g. V(1, -2, 3) === abs(1) + abs(-2) + abs(3) === 1 + 2 + 3 === 6
   */
  Array.prototype.absSum = function () {
      let i = this.length;
      let result = 0;
      while (i--) {
          result += Math.abs(this[i]);
      }
      return result;
  };
  Array.prototype.sum = function () {
      let i = this.length;
      let result = 0;
      while (i--) {
          result += this[i];
      }
      return result;
  };
  Array.prototype.sumInPlaceTree = function () {
      if (0 == this.length)
          return 0;
      let l = this.length;
      while (l != 1) {
          const lHalfFloor = Math.floor(l / 2);
          const lHalfCeil = Math.ceil(l / 2);
          for (let i = 0; i < lHalfFloor; i++) {
              this[i] += this[i + lHalfCeil];
          }
          l = lHalfCeil;
      }
      return this[0];
  };
  Array.prototype.isEmpty = function () {
      return 0 == this.length;
  };
  Array.prototype.unique = function () {
      const uniqueSet = new Set(this);
      return Array.from(uniqueSet);
  };
  Array.prototype.remove = function (o) {
      const index = this.indexOf(o);
      if (index != -1) {
          this.splice(index, 1);
          return true;
      }
      return false;
  };
  Array.prototype.removeIndex = function (i) {
      const result = this[i];
      this.splice(i, 1);
      return result;
  };
  Array.prototype.bagRemoveIndex = function (i) {
      const result = this[i];
      if (i == this.length - 1) {
          this.pop();
      }
      else {
          this[i] = this.pop();
      }
      return result;
  };
  Array.prototype.removeMatch = function (matcher) {
      const index = this.findIndex(matcher);
      if (-1 != index) {
          return this.removeIndex(index);
      }
  };
  Array.prototype.removeAll = function (o) {
      let i = o.length;
      while (i--) {
          this.remove(o[i]);
      }
  };
  Array.prototype.toggle = function (o) {
      const index = this.indexOf(o);
      if (index != -1) {
          this.splice(index, 1);
          return false;
      }
      else {
          this.push(o);
          return true;
      }
  };
  Array.prototype.bagToggle = function (o) {
      const index = this.indexOf(o);
      if (index != -1) {
          this.bagRemoveIndex(index);
          return false;
      }
      else {
          this.push(o);
          return true;
      }
  };
  Array.prototype.binaryIndexOf = function (searchElement, cmp = (a, b) => a - b) {
      let minIndex = 0;
      let maxIndex = this.length - 1;
      let currentIndex;
      let currentElement;
      while (minIndex <= maxIndex) {
          currentIndex = ((minIndex + maxIndex) / 2) | 0;
          currentElement = this[currentIndex];
          if (cmp(currentElement, searchElement) < 0) {
              minIndex = currentIndex + 1;
          }
          else if (cmp(currentElement, searchElement) > 0) {
              maxIndex = currentIndex - 1;
          }
          else {
              return currentIndex;
          }
      }
      return -minIndex - 1;
  };
  Array.prototype.binaryInsert = function (el, cmp = MINUS) {
      let minIndex = 0;
      let maxIndex = this.length;
      let currentIndex;
      let currentElement;
      while (minIndex < maxIndex) {
          currentIndex = ~~((minIndex + maxIndex) / 2);
          currentElement = this[currentIndex];
          if (cmp(currentElement, el) < 0) {
              minIndex = currentIndex + 1;
          }
          else {
              maxIndex = currentIndex;
          }
      }
      this.splice(minIndex, 0, el);
  };
  Array.prototype.firstUnsorted = function (c) {
      for (let i = 1; i < this.length; i++) {
          if (c(this[i - 1], this[i]) > 0)
              return i;
      }
      return -1;
  };
  Object.defineProperty(Array.prototype, 'last', {
      get() {
          return this[this.length - 1];
      },
      set(val) {
          this[this.length - 1] = val;
      },
  });
  String.prototype.capitalizeFirstLetter = function () {
      return this.charAt(0).toUpperCase() + this.slice(1);
  };
  String.prototype.equals = function (x) {
      return this == x;
  };
  function SCE(o) {
      switch (typeof o) {
          case 'undefined':
              return 'undefined';
          case 'function':
              return o.toString();
          case 'number':
              return '' + o;
          case 'string':
              return JSON.stringify(o);
          case 'object':
              if (null == o) {
                  return 'null';
              }
              else {
                  return o.sce;
              }
          default:
              throw new Error();
      }
  }
  Object.defineProperty(Object.prototype, 'sce', {
      get: function () {
          return this.toSource();
      },
  });
  Object.defineProperty(Object.prototype, 'str', {
      get: function () {
          return this.toString();
      },
  });
  /**
   * solves x² + px + q = 0
   */
  function pqFormula(p, q) {
      // 4 times the discriminant:in
      const discriminantX4 = (p * p) / 4 - q;
      if (discriminantX4 < -NLA_PRECISION) {
          return [];
      }
      else if (discriminantX4 <= NLA_PRECISION) {
          return [-p / 2];
      }
      else {
          const root = Math.sqrt(discriminantX4);
          return [-p / 2 - root, -p / 2 + root];
      }
  }
  /**
   * from pomax' library
   * solves ax³ + bx² + cx + d = 0
   * This function from pomax' utils
   * @returns 0-3 roots
   */
  function solveCubicReal2(a, b, c, d) {
      if (eq0(a)) {
          if (eq0(b)) {
              return [-d / c];
          }
          else {
              return pqFormula(c / b, d / b);
          }
      }
      const divisor = a;
      a = b / divisor;
      b = c / divisor;
      c = d / divisor;
      const p = (3 * b - a * a) / 3, pDiv3 = p / 3, pDiv3Pow3 = pDiv3 * pDiv3 * pDiv3, q = (2 * a * a * a - 9 * a * b + 27 * c) / 27, qDiv2 = q / 2, discriminant = qDiv2 * qDiv2 + pDiv3Pow3;
      // 18abcd - 4b³d + b²c² - 4ac³ - 27a²d²
      if (discriminant < -NLA_PRECISION / 8) {
          const r = Math.sqrt(-pDiv3Pow3), t = -q / (2 * r), cosphi = t < -1 ? -1 : t > 1 ? 1 : t, // clamp t to [-1;1]
          phi = Math.acos(cosphi), t1 = 2 * Math.cbrt(r);
          const x1 = t1 * Math.cos(phi / 3) - a / 3;
          const x2 = t1 * Math.cos((phi + 2 * Math.PI) / 3) - a / 3;
          const x3 = t1 * Math.cos((phi + 4 * Math.PI) / 3) - a / 3;
          return [x1, x2, x3];
      }
      else if (discriminant <= NLA_PRECISION / 8) {
          if (0 == qDiv2) {
              // TODO: compare with likeO?
              return [-a / 3];
          }
          const u1 = qDiv2 < 0 ? Math.cbrt(-qDiv2) : -Math.cbrt(qDiv2);
          const x1 = 2 * u1 - a / 3;
          const x2 = -u1 - a / 3;
          return [x1, x2];
      }
      else {
          const sd = Math.sqrt(discriminant);
          const u1 = Math.cbrt(-qDiv2 + sd);
          const v1 = Math.cbrt(qDiv2 + sd);
          return [u1 - v1 - a / 3];
      }
  }
  function callsce(name, ...params) {
      return name + '(' + params.map(SCE).join(',') + ')';
  }

  /**
   * Immutable 3d-vector/point.
   */
  class V3 {
      constructor(x, y, z) {
          this.x = x;
          this.y = y;
          this.z = z;
          assertNumbers(x, y, z);
      }
      static random() {
          return new V3(Math.random(), Math.random(), Math.random());
      }
      static parallel(a, b) {
          return a.dot(b) - a.length() * b.length();
      }
      /**
       * See http://math.stackexchange.com/questions/44689/how-to-find-a-random-axis-or-unit-vector-in-3d
       * @returns A random point on the unit sphere with uniform distribution across the surface.
       */
      static randomUnit() {
          const zRotation = Math.random() * 2 * Math.PI;
          const z = Math.random() * 2 - 1;
          const zRadius = Math.sqrt(1 - Math.pow(z, 2));
          return new V3(zRadius * Math.cos(zRotation), zRadius * Math.sin(zRotation), z);
      }
      //noinspection JSUnusedLocalSymbols
      /**
       * Documentation stub. You want {@see V3#sphere}
       */
      static fromAngles(theta, phi) {
          throw new Error();
      }
      static fromFunction(f) {
          return new V3(f(0), f(1), f(2));
      }
      static min(a, b) {
          return new V3(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
      }
      static max(a, b) {
          return new V3(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
      }
      static lerp(a, b, t) {
          return new V3(a.x * (1 - t) + b.x * t, a.y * (1 - t) + b.y * t, a.z * (1 - t) + b.z * t);
      }
      static fromArray(a) {
          return new V3(a[0], a[1], a[2]);
      }
      static angleBetween(a, b) {
          return a.angleTo(b);
      }
      static zip(f, ...args) {
          assert(f instanceof Function);
          return new V3(f.apply(undefined, args.map(x => x.x)), f.apply(undefined, args.map(x => x.y)), f.apply(undefined, args.map(x => x.z)));
      }
      static normalOnPoints(a, b, c) {
          assertVectors(a, b, c);
          return a.to(b).cross(a.to(c));
      }
      static add(...vs) {
          assertVectors(...vs);
          let x = 0, y = 0, z = 0;
          let i = vs.length;
          while (i--) {
              x += vs[i].x;
              y += vs[i].y;
              z += vs[i].z;
          }
          return new V3(x, y, z);
      }
      static sub(...vs) {
          assertVectors(...vs);
          let x = vs[0].x, y = vs[0].y, z = vs[0].z;
          let i = vs.length;
          while (i--) {
              x -= vs[i].x;
              y -= vs[i].y;
              z -= vs[i].z;
          }
          return new V3(x, y, z);
      }
      /**
       * Pack an array of V3s into an array of numbers (Float32Array by default).
       *
       * @param v3arr source array
       * @param dest destination array. If provided, must be large enough to fit v3count items.
       * @param srcStart starting index in source array
       * @param destStart starting index in destination array
       * @param v3count Number of V3s to copy.
       * @returns Packed array.
       */
      static pack(v3arr, dest, srcStart = 0, destStart = 0, v3count = v3arr.length - srcStart) {
          //assert (v3arr.every(v3 => v3 instanceof V3), 'v3arr.every(v3 => v3 instanceof V3)')
          const result = dest || new Float32Array(3 * v3count); // TODO
          assert(result.length - destStart >= v3count * 3, 'dest.length - destStart >= v3count * 3', result.length, destStart, v3count * 3);
          let i = v3count, srcIndex = srcStart, destIndex = destStart;
          while (i--) {
              const v = v3arr[srcIndex++];
              result[destIndex++] = v.x;
              result[destIndex++] = v.y;
              result[destIndex++] = v.z;
          }
          return result;
      }
      static unpack(packedArray, dest, srcStart = 0, destStart = 0, v3count = (packedArray.length - srcStart) / 3) {
          //assert (v3arr.every(v3 => v3 instanceof V3), 'v3arr.every(v3 => v3 instanceof V3)')
          dest = dest || new Array(v3count);
          assert(dest.length - destStart >= v3count, 'dest.length - destStart >= v3count');
          let i = v3count, srcIndex = srcStart, destIndex = destStart;
          while (i--) {
              dest[destIndex++] = new V3(packedArray[srcIndex++], packedArray[srcIndex++], packedArray[srcIndex++]);
          }
          return dest;
      }
      static packXY(v3arr, dest, srcStart = 0, destStart = 0, v3count = v3arr.length - srcStart) {
          //assert (v3arr.every(v3 => v3 instanceof V3), 'v3arr.every(v3 => v3 instanceof V3)')
          const result = dest || new Float32Array(2 * v3count);
          assert(result.length - destStart >= v3count, 'dest.length - destStart >= v3count');
          let i = v3count, srcIndex = srcStart, destIndex = destStart;
          while (i--) {
              const v = v3arr[srcIndex++];
              result[destIndex++] = v.x;
              result[destIndex++] = v.y;
          }
          return result;
      }
      static unpackXY(src, dest, srcStart = 0, destStart = 0, v3count = Math.min(src.length / 2, (dest && dest.length) || Infinity) - destStart) {
          //assert (v3arr.every(v3 => v3 instanceof V3), 'v3arr.every(v3 => v3 instanceof V3)')
          dest = dest || new Array(v3count);
          assert(dest.length - destStart >= v3count, 'dest.length - destStart >= v3count');
          assert(src.length - srcStart >= v3count * 2, 'dest.length - destStart >= v3count');
          let i = v3count, srcIndex = srcStart, destIndex = destStart;
          while (i--) {
              dest[destIndex++] = new V3(src[srcIndex++], src[srcIndex++], 0);
          }
          return dest;
      }
      static perturbed(v, delta) {
          return v.perturbed(delta);
      }
      static polar(radius, phi, z = 0) {
          return new V3(radius * Math.cos(phi), radius * Math.sin(phi), z);
      }
      /**
       *
       * @param longitude angle in XY plane
       * @param latitude "height"/z dir angle
       */
      static sphere(longitude, latitude, length = 1) {
          return new V3(length * Math.cos(latitude) * Math.cos(longitude), length * Math.cos(latitude) * Math.sin(longitude), length * Math.sin(latitude));
      }
      static inverseLerp(a, b, x) {
          const ab = a.to(b);
          return a.to(x).dot(ab) / ab.squared();
      }
      get [0]() {
          return this.x;
      }
      get [1]() {
          return this.y;
      }
      get [2]() {
          return this.z;
      }
      get u() {
          return this.x;
      }
      get v() {
          return this.y;
      }
      perturbed(delta = NLA_PRECISION * 0.8) {
          return this.map(x => x + (Math.random() - 0.5) * delta);
      }
      *[Symbol.iterator]() {
          yield this.x;
          yield this.y;
          yield this.z;
      }
      e(index) {
          assert(index >= 0 && index < 3);
          return 0 == index ? this.x : 1 == index ? this.y : this.z;
      }
      negated() {
          return new V3(-this.x, -this.y, -this.z);
      }
      abs() {
          return new V3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
      }
      plus(a) {
          assertVectors(a);
          return new V3(this.x + a.x, this.y + a.y, this.z + a.z);
      }
      /**
       * Hadarmard product (or Schur product)
       * Element-wise multiplication of two vectors.
       * @see https://en.wikipedia.org/wiki/Hadamard_product_(matrices)
       *
       */
      schur(a) {
          return new V3(this.x * a.x, this.y * a.y, this.z * a.z);
      }
      /**
       * Element-wise division.
       */
      divv(a) {
          return new V3(this.x / a.x, this.y / a.y, this.z / a.z);
      }
      /**
       * See also {@link to} which is a.minus(this)
       */
      minus(a) {
          assertVectors(a);
          return new V3(this.x - a.x, this.y - a.y, this.z - a.z);
      }
      to(a) {
          assertVectors(a);
          return a.minus(this);
      }
      times(factor) {
          assertNumbers(factor);
          return new V3(this.x * factor, this.y * factor, this.z * factor);
      }
      div(a) {
          assertNumbers(a);
          return new V3(this.x / a, this.y / a, this.z / a);
      }
      /**
       * Dot product.
       * @see https://en.wikipedia.org/wiki/Dot_product
       */
      dot(a) {
          assertInst(V3, a);
          return this.x * a.x + this.y * a.y + this.z * a.z;
      }
      /**
       * Linearly interpolate
       */
      lerp(b, t) {
          assertVectors(b);
          assertNumbers(t);
          return V3.lerp(this, b, t);
      }
      squared() {
          return this.dot(this);
      }
      distanceTo(a) {
          assertVectors(a);
          //return this.minus(a).length()
          return Math.hypot(this.x - a.x, this.y - a.y, this.z - a.z);
      }
      distanceToSquared(a) {
          assertVectors(a);
          return this.minus(a).squared();
      }
      ///**
      // * See also {@see #setTo} for the individual
      // *
      // * @param v
      // */
      //assign(v) {
      //	assertVectors(v)
      //	this.x = v.x
      //	this.y = v.y
      //	this.z = v.z
      //}
      //
      ///**
      // * See also {@see #assign} for the V3 version
      // *
      // * @param x
      // * @param y
      // * @param z
      // */
      //setTo(x, y, z = 0) {
      //	this.x = x
      //	this.y = y
      //	this.z = z
      //}
      toSource() {
          return V3.NAMEMAP.get(this) || this.toString();
      }
      nonParallelVector() {
          const abs = this.abs();
          if (abs.x <= abs.y && abs.x <= abs.z) {
              return V3.X;
          }
          else if (abs.y <= abs.x && abs.y <= abs.z) {
              return V3.Y;
          }
          else {
              return V3.Z;
          }
      }
      slerp(b, t) {
          assertVectors(b);
          assertNumbers(t);
          const sin = Math.sin;
          const omega = this.angleTo(b);
          return this.times(sin((1 - t) * omega) / sin(omega)).plus(b.times(sin(t * omega) / sin(omega)));
      }
      min(b) {
          return new V3(Math.min(this.x, b.x), Math.min(this.y, b.y), Math.min(this.z, b.z));
      }
      max(b) {
          return new V3(Math.max(this.x, b.x), Math.max(this.y, b.y), Math.max(this.z, b.z));
      }
      equals(v) {
          return this == v || (this.x == v.x && this.y == v.y && this.z == v.z);
      }
      /**
       *
       * The cross product is defined as:
       * a x b = |a| * |b| * sin(phi) * n
       * where |.| is the euclidean norm, phi is the angle between the vectors
       * and n is a unit vector perpendicular to both a and b.
       *
       * The cross product is zero for parallel vectors.
       * @see https://en.wikipedia.org/wiki/Cross_product
       */
      cross(v) {
          return new V3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
      }
      minElement() {
          return Math.min(this.x, this.y, this.z);
      }
      maxElement() {
          return Math.max(this.x, this.y, this.z);
      }
      toArray(n = 3) {
          return [this.x, this.y, this.z].slice(0, n);
      }
      /**
       * Get a perpendicular vector.
       * For vectors in the XY-Plane, returns vector rotated 90° CCW.
       */
      getPerpendicular() {
          if (eq0(this.x) && eq0(this.y)) {
              if (eq0(this.z)) {
                  throw new Error('zero vector');
              }
              // v is Vector(0, 0, v.z)
              return V3.Y;
          }
          return new V3(-this.y, this.x, 0);
      }
      //noinspection JSMethodCanBeStatic
      dim() {
          return 3;
      }
      els() {
          return [this.x, this.y, this.z];
      }
      angleXY() {
          return Math.atan2(this.y, this.x);
      }
      lengthXY() {
          return Math.hypot(this.x, this.y);
          //return Math.sqrt(this.x * this.x + this.y * this.y)
      }
      squaredXY() {
          return this.x * this.x + this.y * this.y;
      }
      xy() {
          return new V3(this.x, this.y, 0);
      }
      /**
       * Transform this vector element-wise by way of function f. Returns V3(f(x), f(y), f(z))
       * @param f function to apply to elements (number -> number)
       */
      map(f) {
          return new V3(f(this.x, 'x'), f(this.y, 'y'), f(this.z, 'z'));
      }
      toString(roundFunction) {
          roundFunction = roundFunction || defaultRoundFunction;
          return V3.NAMEMAP.get(this) || 'V(' + [this.x, this.y, this.z].map(roundFunction).join(', ') + ')'; //+ this.id
      }
      angleTo(b) {
          assert(1 == arguments.length);
          assertVectors(b);
          assert(!this.likeO());
          assert(!b.likeO());
          return Math.acos(Math.min(1, this.dot(b) / this.length() / b.length()));
      }
      /**
       *
       * phi = angle between A and B
       * alpha = angle between n and normal1
       *
       * A . B = ||A|| * ||B|| * cos(phi)
       * A x B = ||A|| * ||B|| * sin(phi) * n (n = unit vector perpendicular)
       * (A x B) . normal1 = ||A|| * ||B|| * sin(phi) * cos(alpha)
       */
      angleRelativeNormal(vector, normal1) {
          assert(2 == arguments.length);
          assertVectors(vector, normal1);
          assertf(() => normal1.hasLength(1));
          //assert(vector.isPerpendicularTo(normal1), 'vector.isPerpendicularTo(normal1)' + vector.sce + normal1.sce)
          //assert(this.isPerpendicularTo(normal1), 'this.isPerpendicularTo(normal1)' + this.dot(vector)) //
          // -0.000053600770598683675
          return Math.atan2(this.cross(vector).dot(normal1), this.dot(vector));
      }
      /**
       * Returns true iff this is parallel to vector, i.e. this * s == vector, where s is a positive or negative number,
       * using eq. Throw a DebugError
       * - if vector is not a Vector or
       * - if this has a length of 0 or
       * - if vector has a length of 0
       */
      isParallelTo(vector) {
          assertVectors(vector);
          assert(!this.likeO());
          assert(!vector.likeO());
          // a . b takes on values of +|a|*|b| (vectors same direction) to -|a|*|b| (opposite direction)
          // in both cases the vectors are parallel, so check if abs(a . b) == |a|*|b|
          const dot = this.dot(vector);
          return eq(this.squared() * vector.squared(), dot * dot);
      }
      isPerpendicularTo(vector) {
          assertVectors(vector);
          assert(!this.likeO(), '!this.likeO()');
          assert(!vector.likeO(), '!vector.likeO()');
          return eq0(this.dot(vector));
      }
      isReverseDirTo(other) {
          assertVectors(other);
          assert(!this.likeO());
          assert(!other.likeO());
          // a . b takes on values of +|a|*|b| (vectors same direction) to -|a|*|b| (opposite direction)
          // in both cases the vectors are parallel, so check if abs(a . b) == |a|*|b|
          const dot = this.dot(other);
          return eq(Math.sqrt(this.squared() * other.squared()), dot);
      }
      /**
       * Returns the length of this Vector, i.e. the euclidean norm.
       *
       * Note that the partial derivatives of the euclidean norm at point x are equal to the
       * components of the unit vector x.
       */
      length() {
          return Math.hypot(this.x, this.y, this.z);
          //return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
      }
      /**
       * Definition: V3.likeO == V3.like(V3.O)
       */
      likeO() {
          return this.like(V3.O);
      }
      /**
       * eq(this.x, obj.x) && eq(this.y, obj.y) && eq(this.z, obj.z)
       * @param obj
       */
      like(obj) {
          if (obj === this)
              return true;
          if (!(obj instanceof V3))
              return false;
          return eq(this.x, obj.x) && eq(this.y, obj.y) && eq(this.z, obj.z);
      }
      /**
       * equivalent to this.like(v) || this.negated().like(v)
       */
      likeOrReversed(v) {
          return eq(Math.abs(this.dot(v)), Math.sqrt(this.squared() * v.squared()));
      }
      /**
       * Returns a new unit Vector (.length() === 1) with the same direction as this vector. Throws a
       * DebugError if this has a length of 0.
       */
      unit() {
          assert(!this.likeO(), 'cannot normalize zero vector');
          return this.div(this.length());
      }
      /**
       * Documentation stub. You want {@link unit}
       */
      normalized() {
          throw new Error('documentation stub. use .unit()');
      }
      /**
       * Returns a new V3 equal to this scaled so that its length is equal to newLength.
       *
       * Passing a negative newLength will flip the vector.
       */
      toLength(newLength) {
          assertNumbers(newLength);
          return this.times(newLength / this.length());
      }
      /**
       * Returns a new Vector which is the projection of this vector onto the passed vector.
       * Examples
       *
       * 	V(3, 4).projectedOn(V(1, 0)) // returns V(3, 0)
       * 	V(3, 4).projectedOn(V(2, 0)) // returns V(3, 0)
       * 	V(3, 4).projectedOn(V(-1, 0)) // returns V(-3, 0)
       * 	V(3, 4).projectedOn(V(0, 1)) // returns V(0, 4)
       * 	V(3, 4).projectedOn(V(1, 1)) // returns
       */
      projectedOn(b) {
          assertVectors(b);
          // https://en.wikipedia.org/wiki/Vector_projection#Vector_projection_2
          return b.times(this.dot(b) / b.dot(b));
      }
      rejectedFrom(b) {
          assertVectors(b);
          // https://en.wikipedia.org/wiki/Vector_projection#Vector_projection_2
          return this.minus(b.times(this.dot(b) / b.dot(b)));
      }
      rejectedFrom1(b1) {
          assertVectors(b1);
          assert(b1.hasLength(1));
          // https://en.wikipedia.org/wiki/Vector_projection#Vector_projection_2
          return this.minus(b1.times(this.dot(b1)));
      }
      /**
       * Returns the length of this vector rejected from the unit vector b.
       *
       *       /|
       * this / |    ^
       *     /__|    | b
       *      r
       *  Returns length of r (r === this.rejectedFrom(b))
       */
      rejectedLength(b) {
          assertVectors(b);
          return Math.sqrt(this.dot(this) - Math.pow(this.dot(b), 2) / b.dot(b));
      }
      /**
       * Returns the length of this vector rejected from the unit vector b1.
       *
       *       /|
       * this / |    ^
       *     /__|    | b1
       *      r
       *  Returns length of r (r === this.rejectedFrom(b1))
       */
      rejected1Length(b1) {
          assertVectors(b1);
          assert(b1.hasLength(1));
          return Math.sqrt(this.dot(this) - Math.pow(this.dot(b1), 2));
      }
      /**
       * Returns true iff the length() of this vector is equal to 'length', using eq
       * @example
       * V(3, 4).hasLength(5) === true
       * @example
       * V(1, 1).hasLength(1) === false
       */
      hasLength(length) {
          assertNumbers(length);
          return eq(length, this.length());
      }
      /**
       * Returns the sum of the absolute values of the components of this vector.
       * E.g. V(1, -2, 3) === abs(1) + abs(-2) + abs(3) === 1 + 2 + 3 === 6
       */
      absSum() {
          return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
      }
      /**
       * returns min(|x|, |y|, |z|)
       */
      minAbsElement() {
          return Math.min(Math.abs(this.x), Math.abs(this.y), Math.min(this.z));
      }
      /**
       * returns max(|x|, |y|, |z|)
       */
      maxAbsElement() {
          return Math.max(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
      }
      maxAbsDim() {
          const xAbs = Math.abs(this.x), yAbs = Math.abs(this.y), zAbs = Math.abs(this.z);
          return xAbs >= yAbs ? (xAbs >= zAbs ? 0 : 2) : yAbs >= zAbs ? 1 : 2;
      }
      minAbsDim() {
          const xAbs = Math.abs(this.x), yAbs = Math.abs(this.y), zAbs = Math.abs(this.z);
          return xAbs < yAbs ? (xAbs < zAbs ? 0 : 2) : yAbs < zAbs ? 1 : 2;
      }
      withElement(dim, el) {
          assert(['x', 'y', 'z'].includes(dim), '' + dim);
          assertNumbers(el);
          if ('x' == dim) {
              return new V3(el, this.y, this.z);
          }
          if ('y' == dim) {
              return new V3(this.x, el, this.z);
          }
          return new V3(this.x, this.y, el);
      }
      hashCode() {
          function floatHashCode$$1(f) {
              return ~~(f * (1 << 28));
          }
          return ~~((floatHashCode$$1(this.x) * 31 + floatHashCode$$1(this.y)) * 31 + floatHashCode$$1(this.z));
      }
      /**
       * as sadjkh akjhs djkahsd kjahs k skjhdakjh dkjash dkjahs kjdhas kj dhkjahsd kjahs dkjahs dkjhas kjdkajs
       * hdkljhfkjahdslfghal dasd
       *
       * * asdjklas dasds
       */
      hashCodes() {
          //function floatHashCode(f) {
          //	return ~~(f * (1 << 28))
          //}
          // compare hashCode.floatHashCode
          // the following ops are equivalent to
          // floatHashCode((el - NLA_PRECISION) % (2 * NLA_PRECISION))
          // this results in the hashCode for the (out of 8 possible) cube with the lowest hashCode
          // the other 7 can be calculated by adding constants
          const xHC = ~~(this.x * (1 << 28) - 0.5), yHC = ~~(this.y * (1 << 28) - 0.5), zHC = ~~(this.z * (1 << 28) - 0.5), hc = ~~((xHC * 31 + yHC) * 31 + zHC);
          return [
              ~~hc,
              ~~(hc + 961),
              ~~(hc + 31),
              ~~(hc + 31 + 961),
              ~~(hc + 1),
              ~~(hc + 1 + 961),
              ~~(hc + 1 + 31),
              ~~(hc + 1 + 31 + 961),
          ];
      }
      //static areDisjoint(it: Iterable<V3>): boolean {
      //	const vSet = new CustomSet
      //	for (const v of it) {
      //		if (!v.equals(vSet.canonicalizeLike(v))) {
      //			// like value already in set
      //			return false
      //		}
      //	}
      //	return true
      //}
      compareTo(other) {
          if (this.x != other.x) {
              return this.x - other.x;
          }
          else if (this.y != other.y) {
              return this.y - other.y;
          }
          else {
              return this.z - other.z;
          }
      }
      compareTo2(other, eps = NLA_PRECISION) {
          if (!eq2(this.x, other.x, eps)) {
              return this.x - other.x;
          }
          else if (!eq2(this.y, other.y, eps)) {
              return this.y - other.y;
          }
          else if (!eq2(this.z, other.z, eps)) {
              return this.z - other.z;
          }
          else {
              return 0;
          }
      }
      toAngles() {
          return {
              theta: Math.atan2(this.y, this.x),
              phi: Math.asin(this.z / this.length()),
          };
      }
  }
  V3.O = new V3(0, 0, 0);
  V3.X = new V3(1, 0, 0);
  V3.Y = new V3(0, 1, 0);
  V3.Z = new V3(0, 0, 1);
  V3.XY = new V3(1, 1, 0);
  V3.XYZ = new V3(1, 1, 1);
  V3.INF = new V3(Infinity, Infinity, Infinity);
  V3.UNITS = [V3.X, V3.Y, V3.Z];
  V3.NAMEMAP = new JavaMap()
      .set(V3.O, 'V3.O')
      .set(V3.X, 'V3.X')
      .set(V3.Y, 'V3.Y')
      .set(V3.Z, 'V3.Z')
      .set(V3.XYZ, 'V3.XYZ')
      .set(V3.INF, 'V3.INF');
  function V(a, b, c) {
      if (arguments.length == 3) {
          return new V3(parseFloat(a), parseFloat(b), parseFloat(c));
      }
      else if (arguments.length == 2) {
          return new V3(parseFloat(a), parseFloat(b), 0);
      }
      else if (arguments.length == 1) {
          if (typeof a == 'object') {
              if (a instanceof V3) {
                  // immutable, so
                  return a;
              }
              else if (a instanceof Array || a instanceof Float32Array || a instanceof Float64Array) {
                  if (2 == a.length) {
                      return new V3(parseFloat(a[0]), parseFloat(a[1]), 0);
                  }
                  else if (3 == a.length) {
                      return new V3(parseFloat(a[0]), parseFloat(a[1]), parseFloat(a[2]));
                  }
              }
              else if ('x' in a && 'y' in a) {
                  return new V3(parseFloat(a.x), parseFloat(a.y), 'z' in a ? parseFloat(a.z) : 0);
              }
          }
      }
      throw new Error('invalid arguments' + arguments);
  }

  const P3YZ = { normal1: V3.X, w: 0 };
  const P3ZX = { normal1: V3.Y, w: 0 };
  const P3XY = { normal1: V3.Z, w: 0 };
  class Transformable {
      mirror(plane) {
          return this.transform(M4.mirror(plane));
      }
      mirroredX() {
          return this.mirror(P3YZ);
      }
      mirrorY() {
          return this.mirror(P3ZX);
      }
      mirrorZ() {
          return this.mirror(P3XY);
      }
      project(plane) {
          return this.transform(M4.project(plane));
      }
      projectXY() {
          return this.transform(M4.project(P3XY));
      }
      projectYZ() {
          return this.transform(M4.project(P3YZ));
      }
      projectZX() {
          return this.transform(M4.project(P3ZX));
      }
      translate(...args) {
          return this.transform(M4.translate.apply(undefined, args), callsce.call(undefined, '.translate', ...args));
      }
      scale(...args) {
          return this.transform(M4.scale.apply(undefined, args), callsce.call(undefined, '.scale', ...args));
      }
      rotateX(radians) {
          return this.transform(M4.rotateX(radians), `.rotateX(${radians})`);
      }
      rotateY(radians) {
          return this.transform(M4.rotateY(radians), `.rotateY(${radians})`);
      }
      rotateZ(radians) {
          return this.transform(M4.rotateZ(radians), `.rotateZ(${radians})`);
      }
      rotate(rotationCenter, rotationAxis, radians) {
          return this.transform(M4.rotateLine(rotationCenter, rotationAxis, radians), callsce('.rotate', rotationCenter, rotationAxis, radians));
      }
      rotateAB(from, to) {
          return this.transform(M4.rotateAB(from, to), callsce('.rotateAB', from, to));
      }
      eulerZXZ(alpha, beta, gamma) {
          throw new Error();
          //return this.transform(M4.eulerZXZ(alpha, beta, gamma))
      }
      shearX(y, z) {
          // prettier-ignore
          return this.transform(new M4([
              1, y, z, 0,
              0, 1, 0, 0,
              0, 0, 1, 0,
              0, 0, 0, 1
          ]));
      }
      foo() {
          return this.transform(M4.FOO);
      }
      bar() {
          return this.transform(M4.BAR);
      }
      visit(visitor, ...args) {
          let proto = Object.getPrototypeOf(this);
          // walk up the prototype chain until we find a defined function in o
          while (!visitor.hasOwnProperty(proto.constructor.name) && proto !== Transformable.prototype) {
              proto = Object.getPrototypeOf(proto);
          }
          if (visitor.hasOwnProperty(proto.constructor.name)) {
              return visitor[proto.constructor.name].apply(this, args);
          }
          else {
              throw new Error('No implementation for ' + this.constructor.name);
          }
      }
  }

  const { PI: PI$1, abs: abs$1 } = Math;
  // tslint:enable:member-ordering
  class M4 extends Matrix {
      /**
       * Takes 16 arguments in row-major order, which can be passed individually, as a list, or even as
       * four lists, one for each row. If the arguments are omitted then the identity matrix is constructed instead.
       */
      constructor(...var_args) {
          let m;
          if (0 == arguments.length) {
              m = new Float64Array(16);
          }
          else {
              const flattened = Array.prototype.concat.apply([], arguments);
              assert(flattened.length == 16, 'flattened.length == 16 ' + flattened.length);
              m = new Float64Array(flattened);
          }
          super(4, 4, m);
      }
      /**
       * Returns the matrix that when multiplied with `matrix` results in the
       * identity matrix. You can optionally pass an existing matrix in `result`
       * to avoid allocating a new matrix. This implementation is from the Mesa
       * OpenGL function `__gluInvertMatrixd()` found in `project.c`.
       */
      static inverse(matrix, result = new M4()) {
          return matrix.inversed4(result);
      }
      /**
       * Create new dim x dim matrix equal to an identity matrix with rows/colums i and k swapped. Note that i and k
       * are 0-indexed.
       */
      static permutation4(i, k, result = new M4()) {
          assertInts(i, k);
          assertf(() => 0 <= i && i < 4);
          assertf(() => 0 <= k && k < 4);
          const m = result.m;
          M4.identity(result);
          m[i * 4 + i] = 0;
          m[k * 4 + k] = 0;
          m[i * 4 + k] = 1;
          m[k * 4 + i] = 1;
          return result;
      }
      /**
       * Returns `matrix`, exchanging columns for rows. You can optionally pass an
       * existing matrix in `result` to avoid allocating a new matrix.
       */
      static transpose(matrix, result = new M4()) {
          assertInst(M4, matrix);
          assertInst(M4, result);
          assert(matrix != result, 'matrix != result');
          const m = matrix.m, r = result.m;
          r[0] = m[0];
          r[1] = m[4];
          r[2] = m[8];
          r[3] = m[12];
          r[4] = m[1];
          r[5] = m[5];
          r[6] = m[9];
          r[7] = m[13];
          r[8] = m[2];
          r[9] = m[6];
          r[10] = m[10];
          r[11] = m[14];
          r[12] = m[3];
          r[13] = m[7];
          r[14] = m[11];
          r[15] = m[15];
          return result;
      }
      /**
       * Returns the concatenation of the transforms for `left` and `right`.
       */
      static multiply(left, right, result = new M4()) {
          assertInst(M4, left, right);
          assertInst(M4, result);
          assert(left != result, 'left != result');
          assert(right != result, 'right != result');
          const a = left.m, b = right.m, r = result.m;
          r[0] = a[0] * b[0] + a[1] * b[4] + (a[2] * b[8] + a[3] * b[12]);
          r[1] = a[0] * b[1] + a[1] * b[5] + (a[2] * b[9] + a[3] * b[13]);
          r[2] = a[0] * b[2] + a[1] * b[6] + (a[2] * b[10] + a[3] * b[14]);
          r[3] = a[0] * b[3] + a[1] * b[7] + (a[2] * b[11] + a[3] * b[15]);
          r[4] = a[4] * b[0] + a[5] * b[4] + (a[6] * b[8] + a[7] * b[12]);
          r[5] = a[4] * b[1] + a[5] * b[5] + (a[6] * b[9] + a[7] * b[13]);
          r[6] = a[4] * b[2] + a[5] * b[6] + (a[6] * b[10] + a[7] * b[14]);
          r[7] = a[4] * b[3] + a[5] * b[7] + (a[6] * b[11] + a[7] * b[15]);
          r[8] = a[8] * b[0] + a[9] * b[4] + (a[10] * b[8] + a[11] * b[12]);
          r[9] = a[8] * b[1] + a[9] * b[5] + (a[10] * b[9] + a[11] * b[13]);
          r[10] = a[8] * b[2] + a[9] * b[6] + (a[10] * b[10] + a[11] * b[14]);
          r[11] = a[8] * b[3] + a[9] * b[7] + (a[10] * b[11] + a[11] * b[15]);
          r[12] = a[12] * b[0] + a[13] * b[4] + (a[14] * b[8] + a[15] * b[12]);
          r[13] = a[12] * b[1] + a[13] * b[5] + (a[14] * b[9] + a[15] * b[13]);
          r[14] = a[12] * b[2] + a[13] * b[6] + (a[14] * b[10] + a[15] * b[14]);
          r[15] = a[12] * b[3] + a[13] * b[7] + (a[14] * b[11] + a[15] * b[15]);
          return result;
      }
      static product(...args) {
          const [m4s, result] = Array.isArray(args[0]) ? [args[0], args[1]] : [args, new M4()];
          if (0 == m4s.length)
              return M4.identity(result);
          if (1 == m4s.length)
              return M4.copy(m4s[0], result);
          if (2 == m4s.length)
              return M4.multiply(m4s[0], m4s[1], result);
          let a = M4.temp0, b = M4.temp1;
          M4.multiply(m4s[0], m4s[1], a);
          for (let i = 2; i < m4s.length - 1; i++) {
              M4.multiply(a, m4s[i], b);
              [a, b] = [b, a];
          }
          return M4.multiply(a, m4s.last, result);
      }
      static forSys(e0, e1, e2 = e0.cross(e1), origin = V3.O) {
          assertVectors(e0, e1, e2, origin);
          // prettier-ignore
          return new M4(e0.x, e1.x, e2.x, origin.x, e0.y, e1.y, e2.y, origin.y, e0.z, e1.z, e2.z, origin.z, 0, 0, 0, 1);
      }
      static forRows(n0, n1, n2, n3 = V3.O) {
          assertVectors(n0, n1, n2, n3);
          // prettier-ignore
          return new M4(n0.x, n0.y, n0.z, 0, n1.x, n1.y, n1.z, 0, n2.x, n2.y, n2.z, 0, n3.x, n3.y, n3.z, 1);
      }
      /**
       * Returns an identity matrix. You can optionally pass an existing matrix in `result` to avoid allocating a new
       * matrix. This emulates the OpenGL function `glLoadIdentity()`
       *
       * Unless initializing a matrix to be modified, use M4.IDENTITY
       */
      static identity(result = new M4()) {
          assertInst(M4, result);
          const m = result.m;
          m[0] = m[5] = m[10] = m[15] = 1;
          m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] = m[12] = m[13] = m[14] = 0;
          return result;
      }
      /**
       * Creates a new M4 initialized by a user defined callback function
       *
       * @param f signature: (elRow, elCol, elIndex) =>
       *     el, where elIndex is the row-major index, i.e. eLindex == elRow * 4 + elCol
       * @param result
       */
      static fromFunction4(f, result = new M4()) {
          assert(typeof f == 'function');
          assertInst(M4, result);
          const m = result.m;
          let i = 16;
          while (i--) {
              m[i] = f(Math.floor(i / 4), i % 4, i);
          }
          return result;
      }
      /**
       * Returns a perspective transform matrix, which makes far away objects appear smaller than nearby objects. The
       * `aspect` argument should be the width divided by the height of your viewport and `fov` is the top-to-bottom angle
       * of the field of view in degrees. You can optionally pass an existing matrix in `result` to avoid allocating a new
       * matrix. This emulates the OpenGL function `gluPerspective()`.
       * {@see perspectiveRad}
       * perspectiveRad
       * @param fovDegrees in degrees
       * @param aspect aspect ratio = width/height of viewport
       */
      static perspective(fovDegrees, aspect, near, far, result = new M4()) {
          return M4.perspectiveRad(fovDegrees * DEG, aspect, near, far, result);
      }
      static perspectiveRad(fov, aspect, near, far, result = new M4()) {
          assertInst(M4, result);
          assertNumbers(fov, aspect, near, far);
          const y = Math.tan(fov / 2) * near;
          const x = y * aspect;
          return M4.frustum(-x, x, -y, y, near, far, result);
      }
      static perspectivePlane(vanishingPlane, result = new M4()) {
          assertInst(M4, result);
          const m = result.m;
          m[0] = 1;
          m[1] = 0;
          m[2] = 0;
          m[3] = 0;
          m[4] = 0;
          m[5] = 1;
          m[6] = 0;
          m[7] = 0;
          m[8] = 0;
          m[9] = 0;
          m[10] = 1;
          m[11] = 0;
          m[12] = vanishingPlane.normal1.x;
          m[13] = vanishingPlane.normal1.y;
          m[14] = vanishingPlane.normal1.z;
          m[15] = -vanishingPlane.w;
          return result;
      }
      // the OpenGL function `glFrustum()`.
      static frustum(left, right, bottom, top, near, far, result = new M4()) {
          assertNumbers(left, right, bottom, top, near, far);
          assert(0 < near, '0 < near');
          assert(near < far, 'near < far');
          assertInst(M4, result);
          const m = result.m;
          m[0] = (2 * near) / (right - left);
          m[1] = 0;
          m[2] = (right + left) / (right - left);
          m[3] = 0;
          m[4] = 0;
          m[5] = (2 * near) / (top - bottom);
          m[6] = (top + bottom) / (top - bottom);
          m[7] = 0;
          m[8] = 0;
          m[9] = 0;
          m[10] = -(far + near) / (far - near);
          m[11] = (-2 * far * near) / (far - near);
          m[12] = 0;
          m[13] = 0;
          m[14] = -1;
          m[15] = 0;
          return result;
      }
      /**
       * Returns a new M4 representing the a projection through/towards a point onto a plane.
       */
      static projectPlanePoint(p, plane, result = new M4()) {
          assertVectors(p, plane.normal1);
          assertInst(M4, result);
          const m = result.m;
          const n = plane.normal1, w = plane.w;
          const np = n.dot(p);
          m[0] = p.x * n.x + w - np;
          m[1] = p.x * n.y;
          m[2] = p.x * n.z;
          m[3] = -w * p.x;
          m[4] = p.y * n.x;
          m[5] = p.y * n.y + w - np;
          m[6] = p.y * n.z;
          m[7] = -w * p.y;
          m[8] = p.z * n.x;
          m[9] = p.z * n.y;
          m[10] = p.z * n.z + w - np;
          m[11] = -w * p.z;
          m[12] = n.x;
          m[13] = n.y;
          m[14] = n.z;
          m[15] = -np;
          return result;
      }
      /**
       * Orthographic/orthogonal projection. Transforms the cuboid with the dimensions X: [left right] Y: [bottom, top]
       * Z: [near far] to the cuboid X: [-1, 1] Y [-1, 1] Z [-1, 1]
       */
      static ortho(left, right, bottom, top, near, far, result = new M4()) {
          assertNumbers(left, right, bottom, top, near, far);
          assertInst(M4, result);
          const m = result.m;
          m[0] = 2 / (right - left);
          m[1] = 0;
          m[2] = 0;
          m[3] = -(right + left) / (right - left);
          m[4] = 0;
          m[5] = 2 / (top - bottom);
          m[6] = 0;
          m[7] = -(top + bottom) / (top - bottom);
          m[8] = 0;
          m[9] = 0;
          m[10] = -2 / (far - near);
          m[11] = -(far + near) / (far - near);
          m[12] = 0;
          m[13] = 0;
          m[14] = 0;
          m[15] = 1;
          return result;
      }
      static scale(...args) {
          let x, y, z, result;
          if (args[0] instanceof V3) {
              assert(args.length <= 2);
              ({ x, y, z } = args[0]);
              result = args[1];
          }
          else if ('number' != typeof args[1]) {
              x = y = z = args[0];
              result = args[1];
          }
          else {
              assert(args.length <= 4);
              x = args[0];
              y = args[1];
              z = undefined != args[2] ? args[2] : 1;
              result = args[3];
          }
          undefined == result && (result = new M4());
          assertInst(M4, result);
          assertNumbers(x, y, z);
          const m = result.m;
          m[0] = x;
          m[1] = 0;
          m[2] = 0;
          m[3] = 0;
          m[4] = 0;
          m[5] = y;
          m[6] = 0;
          m[7] = 0;
          m[8] = 0;
          m[9] = 0;
          m[10] = z;
          m[11] = 0;
          m[12] = 0;
          m[13] = 0;
          m[14] = 0;
          m[15] = 1;
          return result;
      }
      static translate(...args) {
          let x, y, z, result;
          if (args[0] instanceof V3) {
              assert(args.length <= 2);
              ({ x, y, z } = args[0]);
              result = args[1];
          }
          else {
              assert(args.length <= 4);
              x = args[0];
              y = undefined != args[1] ? args[1] : 0;
              z = undefined != args[2] ? args[2] : 0;
              result = args[3];
          }
          undefined == result && (result = new M4());
          assertInst(M4, result);
          assertNumbers(x, y, z);
          const m = result.m;
          m[0] = 1;
          m[1] = 0;
          m[2] = 0;
          m[3] = x;
          m[4] = 0;
          m[5] = 1;
          m[6] = 0;
          m[7] = y;
          m[8] = 0;
          m[9] = 0;
          m[10] = 1;
          m[11] = z;
          m[12] = 0;
          m[13] = 0;
          m[14] = 0;
          m[15] = 1;
          return result;
      }
      /**
       * Returns a matrix that rotates by `a` degrees around the vector (x, y, z). You can optionally pass an existing
       * matrix in `result` to avoid allocating a new matrix. This emulates the OpenGL function `glRotate()`.
       */
      //static rotation(radians: raddd, x: number, y: number, z: number, result?: M4): M4
      static rotate(radians, v, result) {
          undefined == result && (result = new M4());
          assertInst(M4, result);
          let { x, y, z } = v;
          assert(!new V3(x, y, z).likeO(), '!V(x, y, z).likeO()');
          const m = result.m;
          const d = Math.sqrt(x * x + y * y + z * z);
          x /= d;
          y /= d;
          z /= d;
          const cos = Math.cos(radians), sin = Math.sin(radians), t = 1 - cos;
          m[0] = x * x * t + cos;
          m[1] = x * y * t - z * sin;
          m[2] = x * z * t + y * sin;
          m[3] = 0;
          m[4] = y * x * t + z * sin;
          m[5] = y * y * t + cos;
          m[6] = y * z * t - x * sin;
          m[7] = 0;
          m[8] = z * x * t - y * sin;
          m[9] = z * y * t + x * sin;
          m[10] = z * z * t + cos;
          m[11] = 0;
          m[12] = 0;
          m[13] = 0;
          m[14] = 0;
          m[15] = 1;
          return result;
      }
      /**
       * Returns a matrix that puts the camera at the eye point `ex, ey, ez` looking
       * toward the center point `cx, cy, cz` with an up direction of `ux, uy, uz`.
       * You can optionally pass an existing matrix in `result` to avoid allocating
       * a new matrix. This emulates the OpenGL function `gluLookAt()`.
       */
      static lookAt(eye, focus, up, result = new M4()) {
          assertVectors(eye, focus, up);
          assertInst(M4, result);
          const m = result.m;
          const f = eye.minus(focus).unit();
          const s = up.cross(f).unit();
          const t = f.cross(s).unit();
          m[0] = s.x;
          m[1] = s.y;
          m[2] = s.z;
          m[3] = -s.dot(eye);
          m[4] = t.x;
          m[5] = t.y;
          m[6] = t.z;
          m[7] = -t.dot(eye);
          m[8] = f.x;
          m[9] = f.y;
          m[10] = f.z;
          m[11] = -f.dot(eye);
          m[12] = 0;
          m[13] = 0;
          m[14] = 0;
          m[15] = 1;
          return result;
      }
      /**
       * Create a rotation matrix for rotating around the X axis
       */
      static rotateX(radians) {
          assertNumbers(radians);
          const sin = Math.sin(radians), cos = Math.cos(radians);
          const els = [1, 0, 0, 0, 0, cos, -sin, 0, 0, sin, cos, 0, 0, 0, 0, 1];
          return new M4(els);
      }
      /**
       * Create a rotation matrix for rotating around the Y axis
       */
      static rotateY(radians) {
          const sin = Math.sin(radians), cos = Math.cos(radians);
          const els = [cos, 0, sin, 0, 0, 1, 0, 0, -sin, 0, cos, 0, 0, 0, 0, 1];
          return new M4(els);
      }
      /**
       * Create a rotation matrix for rotating around the Z axis
       */
      static rotateZ(radians) {
          const sin = Math.sin(radians), cos = Math.cos(radians);
          const els = [cos, -sin, 0, 0, sin, cos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
          return new M4(els);
      }
      /**
       * New rotation matrix such that result.transformVector(a).isParallelTo(b) through smallest rotation.
       * Performs no scaling.
       */
      static rotateAB(a, b, result = new M4()) {
          // see http://inside.mines.edu/fs_home/gmurray/ArbitraryAxisRotation/
          assertVectors(a, b);
          assertInst(M4, result);
          const rotationAxis = a.cross(b), rotationAxisLength = rotationAxis.length();
          if (eq0(rotationAxisLength)) {
              return M4.identity(result);
          }
          const radians = Math.atan2(rotationAxisLength, a.dot(b));
          return M4.rotateLine(V3.O, rotationAxis, radians, result);
      }
      /**
       * Matrix for rotation about arbitrary line defined by an anchor point and direction.
       * rotationAxis does not need to be unit
       */
      static rotateLine(rotationAnchor, rotationAxis, radians, result = new M4()) {
          // see http://inside.mines.edu/fs_home/gmurray/ArbitraryAxisRotation/
          assertVectors(rotationAnchor, rotationAxis);
          assertNumbers(radians);
          assertInst(M4, result);
          rotationAxis = rotationAxis.unit();
          const ax = rotationAnchor.x, ay = rotationAnchor.y, az = rotationAnchor.z, dx = rotationAxis.x, dy = rotationAxis.y, dz = rotationAxis.z;
          const m = result.m, cos = Math.cos(radians), sin = Math.sin(radians);
          m[0] = dx * dx + (dy * dy + dz * dz) * cos;
          m[1] = dx * dy * (1 - cos) - dz * sin;
          m[2] = dx * dz * (1 - cos) + dy * sin;
          m[3] = (ax * (dy * dy + dz * dz) - dx * (ay * dy + az * dz)) * (1 - cos) + (ay * dz - az * dy) * sin;
          m[4] = dx * dy * (1 - cos) + dz * sin;
          m[5] = dy * dy + (dx * dx + dz * dz) * cos;
          m[6] = dy * dz * (1 - cos) - dx * sin;
          m[7] = (ay * (dx * dx + dz * dz) - dy * (ax * dx + az * dz)) * (1 - cos) + (az * dx - ax * dz) * sin;
          m[8] = dx * dz * (1 - cos) - dy * sin;
          m[9] = dy * dz * (1 - cos) + dx * sin;
          m[10] = dz * dz + (dx * dx + dy * dy) * cos;
          m[11] = (az * (dx * dx + dy * dy) - dz * (ax * dx + ay * dy)) * (1 - cos) + (ax * dy - ay * dx) * sin;
          m[12] = 0;
          m[13] = 0;
          m[14] = 0;
          m[15] = 1;
          return result;
      }
      /**
       * Create an affine matrix for mirroring into an arbitrary plane:
       */
      static mirror(plane, result = new M4()) {
          assertVectors(plane.normal1);
          assertInst(M4, result);
          const [nx, ny, nz] = plane.normal1;
          const w = plane.w;
          const m = result.m;
          m[0] = 1.0 - 2.0 * nx * nx;
          m[1] = -2.0 * ny * nx;
          m[2] = -2.0 * nz * nx;
          m[3] = 2.0 * nx * w;
          m[4] = -2.0 * nx * ny;
          m[5] = 1.0 - 2.0 * ny * ny;
          m[6] = -2.0 * nz * ny;
          m[7] = 2.0 * ny * w;
          m[8] = -2.0 * nx * nz;
          m[9] = -2.0 * ny * nz;
          m[10] = 1.0 - 2.0 * nz * nz;
          m[11] = 2.0 * nz * w;
          m[12] = 0;
          m[13] = 0;
          m[14] = 0;
          m[15] = 1;
          return result;
      }
      /**
       *
       * @param plane
       * @param dir Projection direction. Optional, if not specified plane normal1 will be used.
       * @param result {@see M4}
       */
      static project(plane, dir = plane.normal1, result = new M4()) {
          // TODO: doc
          // plane.normal1 DOT (p + lambda * dir) = w (1)
          // extract lambda:
          // plane.normal1 DOT p + lambda * plane.normal1 DOT dir = w
          // lambda = (w - plane.normal1 DOT p) / plane.normal1 DOT dir
          // result = p + lambda * dir
          // result = p + dir * (w - plane.normal1 DOT p) / plane.normal1 DOT dir
          // result =  w * dir / (plane.normal1 DOT dir) + p - plane.normal1 DOT p * dir / (plane.normal1 DOT dir) *
          //  a + d * (w - n . a) / (nd)
          //  a + dw - d * na
          assertVectors(dir, plane.normal1);
          assertInst(M4, result);
          const w = plane.w;
          const m = result.m;
          const nd = plane.normal1.dot(dir);
          const { x: nx, y: ny, z: nz } = plane.normal1;
          const { x: dx, y: dy, z: dz } = dir.div(nd);
          /*
           rejectedFrom: return this.minus(b.times(this.dot(b) / b.dot(b)))
           return M4.forSys(
           V3.X.rejectedFrom(plane.normal1),
           V3.Y.rejectedFrom(plane.normal1),
           V3.Z.rejectedFrom(plane.normal1),
           plane.anchor,
           result
           )
           */
          m[0] = 1.0 - nx * dx;
          m[1] = -ny * dx;
          m[2] = -nz * dx;
          m[3] = dx * w;
          m[4] = -nx * dy;
          m[5] = 1.0 - ny * dy;
          m[6] = -nz * dy;
          m[7] = dy * w;
          m[8] = -nx * dz;
          m[9] = -ny * dz;
          m[10] = 1.0 - nz * dz;
          m[11] = dz * w;
          m[12] = 0;
          m[13] = 0;
          m[14] = 0;
          m[15] = 1;
          return result;
      }
      static lineProjection(line, result = new M4()) {
          assertVectors(line.anchor, line.dir1);
          assertInst(M4, result);
          const ax = line.anchor.x, ay = line.anchor.y, az = line.anchor.z;
          const dx = line.dir1.x, dy = line.dir1.y, dz = line.dir1.z;
          const m = result.m;
          /*
           projectedOn: return b.times(this.dot(b) / b.dot(b))
           */
          m[0] = dx * dx;
          m[1] = dx * dy;
          m[2] = dx * dz;
          m[3] = ax;
          m[4] = dy * dx;
          m[5] = dy * dy;
          m[6] = dy * dz;
          m[7] = ay;
          m[8] = dz * dx;
          m[9] = dz * dy;
          m[10] = dz * dz;
          m[11] = az;
          m[12] = 0;
          m[13] = 0;
          m[14] = 0;
          m[15] = 1;
          return result;
      }
      static pointInversion(p, result = new M4()) {
          assertVectors(p);
          assertInst(M4, result);
          const m = result.m;
          m[0] = -1;
          m[1] = 0;
          m[2] = 0;
          m[3] = 2 * p.x;
          m[4] = 0;
          m[5] = -1;
          m[6] = 0;
          m[7] = 2 * p.y;
          m[8] = 0;
          m[9] = 0;
          m[10] = -1;
          m[11] = 2 * p.z;
          m[12] = 0;
          m[13] = 0;
          m[14] = 0;
          m[15] = 1;
          return result;
      }
      static new(width, height, m) {
          assert(4 == width && 4 == height);
          return new M4(...m);
      }
      get X() {
          return this.transformVector(V3.X);
      }
      get Y() {
          return this.transformVector(V3.Y);
      }
      get Z() {
          return this.transformVector(V3.Z);
      }
      get O() {
          return this.getTranslation();
      }
      isMirror(precision = NLA_PRECISION) {
          const m = this.m;
          const nx = Math.sqrt((1 - m[0]) / 2);
          const ny = Math.sqrt((1 - m[5]) / 2);
          const nz = Math.sqrt((1 - m[10]) / 2);
          return (eq(m[1], -2.0 * ny * nx, precision) &&
              eq(m[2], -2.0 * nz * nx, precision) &&
              eq(m[4], -2.0 * nx * ny, precision) &&
              eq(m[6], -2.0 * nz * ny, precision) &&
              eq(m[8], -2.0 * nx * nz, precision) &&
              eq(m[9], -2.0 * ny * nz, precision) &&
              eq(m[12], 0, precision) &&
              eq(m[13], 0, precision) &&
              eq(m[14], 0, precision) &&
              eq(m[15], 1, precision) &&
              eq(m[3] * ny, m[7] * nx, precision) &&
              eq(m[7] * nz, m[11] * ny, precision) &&
              eq(m[11] * nx, m[3] * nz, precision));
      }
      // ### GL.Matrix.frustum(left, right, bottom, top, near, far[, result])
      //
      // Sets up a viewing frustum, which is shaped like a truncated pyramid with the
      // camera where the point of the pyramid would be. You can optionally pass an
      // existing matrix in `result` to avoid allocating a new matrix. This emulates
      /**
       * Returns a new M4 which is equal to the inverse of this.
       */
      inversed(result) {
          return M4.inverse(this, result);
      }
      /**
       * Matrix trace is defined as the sum of the elements of the main diagonal.
       */
      trace() {
          return this.m[0] + this.m[5] + this.m[10] + this.m[15];
      }
      as3x3(result) {
          result = M4.copy(this, result);
          const m = result.m;
          m[3] = m[7] = m[11] = m[12] = m[13] = m[14] = 0;
          m[15] = 1;
          return result;
      }
      transform(m4) {
          return m4.times(this);
      }
      realEigenValues3() {
          const m = this.m;
          assert(0 == m[12] && 0 == m[13] && 0 == m[14]);
          // determinant of (this - λI):
          // | a-λ  b   c  |
          // |  d  e-λ  f  | = -λ^3 + λ^2 (a+e+i) + λ (-a e-a i+b d+c g-e i+f h) + a(ei - fh) - b(di - fg) + c(dh - eg)
          // |  g   h  i-λ |
          const [a, b, c, , d, e, f, , g, h, i] = m;
          // det(this - λI) = -λ^3 +λ^2 (a+e+i) + λ (-a e-a i-b d+c g-e i+f h)+ (a e i-a f h-b d i+b f g+c d h-c e g)
          const s = -1;
          const t = a + e + i; // equivalent to trace of matrix
          const u = -a * e - a * i + b * d + c * g - e * i + f * h; // equivalent to 1/2 (trace(this²) - trace²(A))
          const w = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g); // equivalent to matrix determinant
          console.log(s, t, u, w);
          return solveCubicReal2(s, t, u, w);
      }
      realEigenVectors3() {
          const eigenValues = this.realEigenValues3();
          const this3x3 = this.times(M4.IDENTITY3);
          console.log(this.toString());
          console.log(this3x3.toString());
          let mats = eigenValues.map(ev => M4.IDENTITY3.scale(-ev).plus(this3x3));
          console.log(mats.map(m => m.determinant3()));
          console.log(mats.map(m => '' + m.toString(v => '' + v)).join('\n\n'));
          console.log(mats.map(m => '' + m.gauss().U.toString(v => '' + v)).join('\n\n'));
          console.log('mats.map(m=>m.rank())', mats.map(m => m.rank()));
          if (1 == eigenValues.length) {
              console.log(mats[0].toString());
              assertf(() => 0 == mats[0].rank());
              // col vectors
              return arrayFromFunction(3, col => new V3(this.m[col], this.m[4 + col], this.m[8 + col]));
          }
          if (2 == eigenValues.length) {
              // one matrix should have rank 1, the other rank 2
              if (1 == mats[0].rank()) {
                  mats = [mats[1], mats[0]];
              }
              assertf(() => 2 == mats[0].rank());
              assertf(() => 1 == mats[1].rank());
              // mat[0] has rank 2, mat[1] has rank 1
              const gauss0 = mats[0].gauss().U;
              const eigenVector0 = gauss0
                  .row(0)
                  .cross(gauss0.row(1))
                  .V3()
                  .unit();
              const planeNormal = mats[1]
                  .gauss()
                  .U.row(0)
                  .V3();
              const eigenVector1 = planeNormal.getPerpendicular().unit();
              const eigenVector2 = eigenVector0.cross(eigenVector1).rejectedFrom(planeNormal);
              return [eigenVector0, eigenVector1, eigenVector2];
          }
          if (3 == eigenValues.length) {
              mats.forEach((mat, i) => assert(2 == mat.rank(), i + ': ' + mat.rank()));
              // the (A - lambda I) matrices map to a plane. This means, that there is an entire line in R³ which maps to
              // the point V3.O
              return mats.map(mat => {
                  const gauss = mat.gauss().U;
                  return gauss
                      .row(0)
                      .cross(gauss.row(1))
                      .V3()
                      .unit();
              });
          }
          throw new Error('there cannot be more than 3 eigen values');
      }
      /**
       * U * SIGMA * VSTAR = this
       * U and VSTAR are orthogonal matrices
       * SIGMA is a diagonal matrix
       */
      svd3() {
          function matrixForCS(i, k, c, s) {
              const m = M4.identity();
              m.setEl(i, i, c);
              m.setEl(k, k, c);
              m.setEl(i, k, s);
              m.setEl(k, i, -s);
              return m;
          }
          const A = this.as3x3();
          let S = A.transposed().times(A), V$$1 = M4.identity();
          console.log(S.str);
          for (let it = 0; it < 16; it++) {
              console.log('blahg\n', V$$1.times(S).times(V$$1.transposed()).str);
              assert(V$$1.times(S)
                  .times(V$$1.transposed())
                  .likeM4(A.transposed().times(A)), V$$1.times(S).times(V$$1.transposed()).str, A.transposed().times(A).str);
              let maxOffDiagonal = 0, maxOffDiagonalIndex = 1, j = 10;
              while (j--) {
                  const val = Math.abs(S.m[j]);
                  if (j % 4 != Math.floor(j / 4) && val > maxOffDiagonal) {
                      maxOffDiagonal = val;
                      maxOffDiagonalIndex = j;
                  }
              }
              const i = Math.floor(maxOffDiagonalIndex / 4), k = maxOffDiagonalIndex % 4;
              const a_ii = S.m[5 * i], a_kk = S.m[5 * k], a_ik = S.m[maxOffDiagonalIndex];
              const phi = a_ii === a_kk ? PI$1 / 4 : Math.atan((2 * a_ik) / (a_ii - a_kk)) / 2;
              console.log(maxOffDiagonalIndex, i, k, 'phi', phi);
              const cos = Math.cos(phi), sin = Math.sin(phi);
              const givensRotation = matrixForCS(i, k, cos, -sin);
              assert(givensRotation
                  .transposed()
                  .times(givensRotation)
                  .likeIdentity());
              console.log(givensRotation.str);
              V$$1 = V$$1.times(givensRotation);
              S = M4.product(givensRotation.transposed(), S, givensRotation);
              console.log(S.str);
          }
          const sigma = S.map((el, elIndex) => (elIndex % 5 == 0 ? Math.sqrt(el) : 0));
          return {
              U: M4.product(A, V$$1, sigma.map((el, elIndex) => (elIndex % 5 == 0 ? 1 / el : 0))),
              SIGMA: sigma,
              VSTAR: V$$1.transposed(),
          };
      }
      map(fn) {
          return M4.fromFunction4((x, y, i) => fn(this.m[i], i, this.m));
      }
      likeM4(m4) {
          assertInst(M4, m4);
          return this.m.every((el, index) => eq(el, m4.m[index]));
      }
      /**
       * Returns a new M4 equal to the transpose of this.
       */
      transposed(result) {
          return M4.transpose(this, result);
      }
      /**
       * Returns a new M4 which equal to (this * matrix) (in that order)
       */
      times(matrix) {
          return M4.multiply(this, matrix);
      }
      /**
       * In a perspective projection, parallel lines meet in a vanishing point.
       *
       * Returns undefined if there is no vanishing point, either because this is not a perspective transform,
       * or because the passed dir is perpendicular to the projections direction.
       *
       * @param dir
       */
      vanishingPoint(dir) {
          assertVectors(dir);
          const m = this.m;
          const vx = dir.x, vy = dir.y, vz = dir.z;
          const w = vx * m[12] + vy * m[13] + vz * m[14];
          if (eq0(w))
              return undefined;
          const x = vx * m[0] + vy * m[1] + vz * m[2];
          const y = vx * m[4] + vy * m[5] + vz * m[6];
          const z = vx * m[8] + vy * m[9] + vz * m[10];
          return new V3(x / w, y / w, z / w);
      }
      /**
       * Transforms the vector as a point with a w coordinate of 1. This means translations will have an effect, for
       * example.
       */
      transformPoint(v) {
          assertVectors(v);
          const m = this.m;
          const vx = v.x, vy = v.y, vz = v.z;
          const x = vx * m[0] + vy * m[1] + vz * m[2] + m[3];
          const y = vx * m[4] + vy * m[5] + vz * m[6] + m[7];
          const z = vx * m[8] + vy * m[9] + vz * m[10] + m[11];
          const w = vx * m[12] + vy * m[13] + vz * m[14] + m[15];
          // scale such that fourth element becomes 1:
          return new V3(x / w, y / w, z / w);
      }
      /**
       * Transforms the vector as a vector with a w coordinate of 0. This means translations will have no effect, for
       * example. Will throw an exception if the calculated w component != 0. This occurs for example when attempting
       * to transform a vector with a perspective matrix.
       */
      transformVector(v, checkW = true) {
          assertVectors(v);
          const m = this.m;
          const w = v.x * m[12] + v.y * m[13] + v.z * m[14];
          checkW && assert(eq0(w), () => 'w === 0 needs to be true for this to make sense (w =' + w + this.str);
          return new V3(m[0] * v.x + m[1] * v.y + m[2] * v.z, m[4] * v.x + m[5] * v.y + m[6] * v.z, m[8] * v.x + m[9] * v.y + m[10] * v.z);
      }
      transformVector2(v, anchor) {
          // v and anchor define a line(t) = anchor + t v
          // we can view the calculation of the transformed vector as the derivative of the transformed line at t = 0
          // d/dt (this * line(t)) (0)
          assertVectors(v, anchor);
          const transformedAnchor = this.timesVector(VV(anchor.x, anchor.y, anchor.z, 1));
          const transformedVector = this.timesVector(VV(v.x, v.y, v.z, 0));
          return transformedVector
              .times(transformedAnchor.w)
              .minus(transformedAnchor.times(transformedVector.w))
              .div(Math.pow(transformedAnchor.w, 2))
              .V3();
      }
      transformedPoints(vs) {
          return vs.map(v => this.transformPoint(v));
      }
      transformedVectors(vs) {
          return vs.map(v => this.transformVector(v));
      }
      new() {
          return new M4();
      }
      isRegular() {
          return !eq0(this.determinant());
      }
      isAxisAligned() {
          const m = this.m;
          return (1 >= +!eq0(m[0]) + +!eq0(m[1]) + +!eq0(m[2]) &&
              1 >= +!eq0(m[4]) + +!eq0(m[5]) + +!eq0(m[6]) &&
              1 >= +!eq0(m[8]) + +!eq0(m[9]) + +!eq0(m[10]));
      }
      /**
       * A matrix M is orthogonal iff M * M^T = I
       * I being the identity matrix.
       *
       * @returns If this matrix is orthogonal or very close to it. Comparison of the identity matrix and
       * this * this^T is done with {@link #likeM4}
       */
      isOrthogonal() {
          // return this.transposed().times(this).likeM4(M4.IDENTITY)
          M4.transpose(this, M4.temp0);
          M4.multiply(this, M4.temp0, M4.temp1);
          return M4.IDENTITY.likeM4(M4.temp1);
      }
      /**
       * A matrix M is symmetric iff M == M^T
       * I being the identity matrix.
       *
       * @returns If this matrix is symmetric or very close to it. Comparison of the identity matrix and
       * this * this^T is done with {@link #likeM4}
       */
      isSymmetric() {
          M4.transpose(this, M4.temp0);
          return this.likeM4(M4.temp0);
      }
      /**
       * A matrix M is normal1 iff M * M^-T == M^T * M TODO: ^-T?
       * I being the identity matrix.
       *
       * @returns If this matrix is symmetric or very close to it. Comparison of the identity matrix and
       * this * this^T is done with {@link #likeM4}
       */
      isNormal() {
          M4.transpose(this, M4.temp0); // temp0 = this^-T
          M4.multiply(this, M4.temp0, M4.temp1); // temp1 = this * this^-T
          M4.multiply(M4.temp0, this, M4.temp2); // temp2 = this^-T * this
          return M4.temp1.likeM4(M4.temp2);
      }
      /**
       * Determinant of matrix.
       *
       * Notes:
       *      For matrices A and B
       *      det(A * B) = det(A) * det(B)
       *      det(A^-1) = 1 / det(A)
       */
      determinant() {
          /*
           | a b c d |
           | e f g h |
           | i j k l |
           | m n o p |
           */
          const $ = this.m, a = $[0], b = $[1], c = $[2], d = $[3], e = $[4], f = $[5], g = $[6], h = $[7], i = $[8], j = $[9], k = $[10], l = $[11], m = $[12], n = $[13], o = $[14], p = $[15], klop = k * p - l * o, jlnp = j * p - l * n, jkno = j * o - k * n, ilmp = i * p - l * m, ikmo = i * o - k * m, ijmn = i * n - j * m;
          return (a * (f * klop - g * jlnp + h * jkno) -
              b * (e * klop - g * ilmp + h * ikmo) +
              c * (e * jlnp - f * ilmp + h * ijmn) -
              d * (e * jkno - f * ikmo + g * ijmn));
      }
      determinant3() {
          const [a, b, c, , d, e, f, , g, h, i] = this.m;
          const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
          return det;
      }
      /**
       * determine whether this matrix is a mirroring transformation
       */
      isMirroring() {
          /*
           var u = V(this.m[0], this.m[4], this.m[8])
           var v = V(this.m[1], this.m[5], this.m[9])
           var w = V(this.m[2], this.m[6], this.m[10])

           // for a true orthogonal, non-mirrored base, u.cross(v) == w
           // If they have an opposite direction then we are mirroring
           var mirrorvalue = u.cross(v).dot(w)
           var ismirror = (mirrorvalue < 0)
           return ismirror
           */
          return this.determinant() < 0; // TODO: also valid for 4x4?
      }
      /**
       * Get the translation part of this matrix, i.e. the result of this.transformPoint(V3.O)
       */
      getTranslation() {
          const m = this.m, w = m[15];
          return new V3(m[3] / w, m[7] / w, m[11] / w);
      }
      /**
       * Returns this matrix scaled so that the determinant is 1.
       * det(c * A) = (c ** n) * det(A) for n x n matrices,
       * so we need to divide by the 4th root of the determinant
       */
      normalized() {
          const detAbs = abs$1(this.determinant());
          return 1 == detAbs ? this : this.divScalar(Math.pow(detAbs, 0.25));
      }
      /**
       * Returns this matrix scaled so that the determinant is 1.
       * det(c * A) = (c ** n) * det(A) for n x n matrices,
       * so we need to divide by the 4th root of the determinant
       */
      normalized2() {
          const div = this.m[15];
          return 1 == div ? this : this.divScalar(Math.pow(div, 0.25));
      }
      /**
       * Returns if the matrix has the following form (within NLA_PRECISION):
       * a b c 0
       * c d e 0
       * f g h 0
       * 0 0 0 1
       */
      like3x3() {
          const m = this.m;
          return eq(1, m[15]) && eq0(m[12]) && eq0(m[13]) && eq0(m[14]) && eq0(m[3]) && eq0(m[7]) && eq0(m[11]);
      }
      isNoProj() {
          const m = this.m;
          return 0 == m[12] && 0 == m[13] && 0 == m[14] && 1 == m[15];
      }
      likeIdentity() {
          return this.m.every((val, i) => (((i / 4) | 0) == i % 4 ? eq(1, val) : eq0(val)));
      }
      isIdentity() {
          return this.m.every((val, i) => (((i / 4) | 0) == i % 4 ? 1 == val : 0 == val));
      }
      toString(f = v => v.toFixed(6).replace(/([0.])(?=0*$)/g, ' ')) {
          assert(typeof f(0) == 'string', '' + typeof f(0));
          // slice this.m to convert it to an Array (from TypeArray)
          const rounded = Array.prototype.slice.call(this.m).map(f);
          const colWidths = [0, 1, 2, 3].map(colIndex => rounded
              .sliceStep(colIndex, 0, 4)
              .map(x => x.length)
              .max());
          return [0, 1, 2, 3]
              .map(rowIndex => rounded
              .slice(rowIndex * 4, rowIndex * 4 + 4) // select matrix row
              .map((x, colIndex) => ' '.repeat(colWidths[colIndex] - x.length) + x) // pad numbers with
              // spaces to col width
              .join(' '))
              .join('\n'); // join rows
      }
      /**
       * Wether this matrix is a translation matrix, i.e. of the form
       * ```
       * 	1, 0, 0, x,
       * 	0, 1, 0, y,
       * 	0, 0, 1, z,
       * 	0, 0, 0, 1
       * ```
       */
      isTranslation() {
          // 2: any value, otherwise same value
          // prettier-ignore
          const mask = [
              1, 0, 0, 2,
              0, 1, 0, 2,
              0, 0, 1, 2,
              0, 0, 0, 1
          ];
          return mask.every((expected, index) => expected == 2 || expected == this.m[index]);
      }
      /**
       * Wether this matrix is a translation matrix, i.e. of the form
       * ```
       * 	s, 0, 0, 0,
       * 	0, t, 0, 0,
       * 	0, 0, v, 0,
       * 	0, 0, 0, 1
       * ```
       */
      isScaling() {
          // prettier-ignore
          const mask = [
              2, 0, 0, 0,
              0, 2, 0, 0,
              0, 0, 2, 0,
              0, 0, 0, 1
          ];
          return mask.every((expected, index) => expected == 2 || expected == this.m[index]);
      }
      isZRotation() {
          // prettier-ignore
          const mask = [
              2, 2, 0, 0,
              2, 2, 0, 0,
              0, 0, 1, 0,
              0, 0, 0, 1
          ];
          return (mask.every((expected, index) => expected == 2 || expected == this.m[index]) &&
              (eq(1, Math.pow(this.m[0], 2) + Math.pow(this.m[1], 2)) && this.m[0] == this.m[5] && this.m[1] == -this.m[4]));
      }
      toSource() {
          const name = M4.NAMEMAP.get(this);
          if (name) {
              return name;
          }
          else if (this.isTranslation()) {
              return callsce('M4.translate', this.O);
          }
          else if (this.isScaling()) {
              return callsce('M4.scale', this.m[0], this.m[5], this.m[10]);
          }
          else if (this.isNoProj()) {
              return !this.O.equals(V3.O)
                  ? callsce('M4.forSys', this.X, this.Y, this.Z, this.O)
                  : callsce('M4.forSys', this.X, this.Y, this.Z);
          }
          else if (this.isMirror(0)) {
              const m = this.m;
              const nx = Math.sqrt((1 - m[0]) / 2);
              const ny = Math.sqrt((1 - m[5]) / 2);
              const nz = Math.sqrt((1 - m[10]) / 2);
              const w = m[3] / 2.0 / nx;
              return callsce('M4.mirror', { normal1: new V3(nx, ny, nz), w });
          }
          else {
              const m = this.m;
              // prettier-ignore
              return 'new M4(' +
                  '\n\t' + m[0] + ',\t' + m[1] + ',\t' + m[2] + ',\t' + m[3] + ',' +
                  '\n\t' + m[4] + ',\t' + m[5] + ',\t' + m[6] + ',\t' + m[7] + ',' +
                  '\n\t' + m[8] + ',\t' + m[9] + ',\t' + m[10] + ',\t' + m[11] + ',' +
                  '\n\t' + m[12] + ',\t' + m[13] + ',\t' + m[14] + ',\t' + m[15] + ')';
          }
      }
      xyAreaFactor() {
          return this.transformVector(V3.X)
              .cross(this.transformVector(V3.Y))
              .length();
      }
  }
  /**
   * A simple (consists of integers), regular, non-orthogonal matrix, useful mainly for testing.
   * M4.BAR = M4.FOO.inverse()
   */
  // prettier-ignore
  M4.FOO = new M4(0, 1, 1, 2, 0.3, 0.4, 0.8, 13, 2.1, 3.4, 5.5, 8.9, 0, 0, 0, 1);
  M4.BAR = M4.FOO.inversed();
  M4.IDENTITY = M4.identity();
  M4.YZX = M4.forSys(V3.Y, V3.Z, V3.X);
  M4.ZXY = M4.forSys(V3.Z, V3.X, V3.Y);
  // prettier-ignore
  M4.IDENTITY3 = new M4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0);
  M4.temp0 = new M4();
  M4.temp1 = new M4();
  M4.temp2 = new M4();
  M4.NAMEMAP = new JavaMap()
      .set(M4.IDENTITY3, 'M4.IDENTITY3')
      .set(M4.FOO, 'M4.FOO')
      .set(M4.BAR, 'M4.BAR')
      .set(M4.IDENTITY, 'M4.IDENTITY')
      .set(M4.ZXY, 'M4.ZXY')
      .set(M4.YZX, 'M4.YZX');
  M4.prototype.height = 4;
  M4.prototype.width = 4;
  addOwnProperties(M4.prototype, Transformable.prototype, 'constructor');

  const KEYWORD_REGEXP$1 = new RegExp('^(' +
      'abstract|boolean|break|byte|case|catch|char|class|const|continue|debugger|' +
      'default|delete|do|double|else|enum|export|extends|false|final|finally|' +
      'float|for|function|goto|if|implements|import|in|instanceof|int|interface|' +
      'long|native|new|null|package|private|protected|public|return|short|static|' +
      'super|switch|synchronized|this|throw|throws|transient|true|try|typeof|' +
      'undefined|var|void|volatile|while|with' +
      ')$');
  function stringIsLegalKey(key) {
      return /^[a-z_$][0-9a-z_$]*$/gi.test(key) && !KEYWORD_REGEXP$1.test(key);
  }
  const seen = [];
  function toSource(o, indent = 0) {
      if (undefined === o)
          return 'undefined';
      if (null === o)
          return 'null';
      return o.toSource();
  }
  function addToSourceMethodToPrototype(clazz, method) {
      if (!clazz.prototype.toSource) {
          Object.defineProperty(clazz.prototype, 'toSource', {
              value: method,
              writable: true,
              configurable: true,
              enumerable: false,
          });
      }
  }
  addToSourceMethodToPrototype(Boolean, Boolean.prototype.toString);
  addToSourceMethodToPrototype(Function, Function.prototype.toString);
  addToSourceMethodToPrototype(Number, Number.prototype.toString);
  addToSourceMethodToPrototype(RegExp, RegExp.prototype.toString);
  addToSourceMethodToPrototype(Date, function () {
      return 'new Date(' + this.getTime() + ')';
  });
  addToSourceMethodToPrototype(String, function () {
      return JSON.stringify(this);
  });
  addToSourceMethodToPrototype(Array, function () {
      if (seen.includes(this)) {
          return 'CIRCULAR_REFERENCE';
      }
      seen.push(this);
      let result = '[';
      for (let i = 0; i < this.length; i++) {
          result += '\n\t' + toSource(this[i]).replace(/\r\n|\n|\r/g, '$&\t');
          if (i !== this.length - 1) {
              result += ',';
          }
      }
      result += 0 === this.length ? ']' : '\n]';
      seen.pop();
      return result;
  });
  addToSourceMethodToPrototype(Object, function () {
      if (seen.includes(this)) {
          return 'CIRCULAR_REFERENCE';
      }
      seen.push(this);
      let result = '{';
      const keys = Object.keys(this).sort();
      for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          result +=
              '\n\t' +
                  (stringIsLegalKey(k) ? k : JSON.stringify(k)) +
                  ': ' +
                  toSource(this[k]).replace(/\r\n|\n|\r/g, '$&\t');
          if (i !== keys.length - 1) {
              result += ',';
          }
      }
      result += 0 === keys.length ? '}' : '\n}';
      seen.pop();
      return result;
  });

  class AABB extends Transformable {
      constructor(min = V3.INF, max = V3.INF.negated()) {
          super();
          this.min = min;
          this.max = max;
          assertVectors(min, max);
      }
      static forXYZ(x, y, z) {
          return new AABB(V3.O, new V3(x, y, z));
      }
      static forAABBs(aabbs) {
          const result = new AABB();
          for (const aabb of aabbs) {
              result.addAABB(aabb);
          }
          return result;
      }
      addPoint(p) {
          assertVectors(p);
          this.min = this.min.min(p);
          this.max = this.max.max(p);
          return this;
      }
      addPoints(ps) {
          ps.forEach(p => this.addPoint(p));
          return this;
      }
      addAABB(aabb) {
          assertInst(AABB, aabb);
          this.addPoint(aabb.min);
          this.addPoint(aabb.max);
          return this;
      }
      /**
       * Returns the largest AABB contained in this which doesn't overlap with aabb
       * @param aabb
       */
      withoutAABB(aabb) {
          assertInst(AABB, aabb);
          let min, max;
          const volume = this.volume(), size = this.size();
          let remainingVolume = -Infinity;
          for (let i = 0; i < 3; i++) {
              const dim = ['x', 'y', 'z'][i];
              const cond = aabb.min[dim] - this.min[dim] > this.max[dim] - aabb.max[dim];
              const dimMin = cond ? this.min[dim] : Math.max(this.min[dim], aabb.max[dim]);
              const dimMax = !cond ? this.max[dim] : Math.min(this.max[dim], aabb.min[dim]);
              const newRemainingVolume = ((dimMax - dimMin) * volume) / size[dim];
              if (newRemainingVolume > remainingVolume) {
                  remainingVolume = newRemainingVolume;
                  min = this.min.withElement(dim, dimMin);
                  max = this.max.withElement(dim, dimMax);
              }
          }
          return new AABB(min, max);
      }
      getIntersectionAABB(aabb) {
          assertInst(AABB, aabb);
          return new AABB(this.min.max(aabb.min), this.max.min(aabb.max));
      }
      touchesAABB(aabb) {
          assertInst(AABB, aabb);
          return !(this.min.x > aabb.max.x ||
              this.max.x < aabb.min.x ||
              this.min.y > aabb.max.y ||
              this.max.y < aabb.min.y ||
              this.min.z > aabb.max.z ||
              this.max.z < aabb.min.z);
      }
      touchesAABBfuzzy(aabb, precisision = NLA_PRECISION) {
          assertInst(AABB, aabb);
          return !(lt(aabb.max.x, this.min.x, precisision) ||
              lt(this.max.x, aabb.min.x, precisision) ||
              lt(aabb.max.y, this.min.y, precisision) ||
              lt(this.max.y, aabb.min.y, precisision) ||
              lt(aabb.max.z, this.min.z, precisision) ||
              lt(this.max.z, aabb.min.z, precisision));
      }
      intersectsAABB(aabb) {
          assertInst(AABB, aabb);
          return !(this.min.x >= aabb.max.x ||
              this.max.x <= aabb.min.x ||
              this.min.y >= aabb.max.y ||
              this.max.y <= aabb.min.y ||
              this.min.z >= aabb.max.z ||
              this.max.z <= aabb.min.z);
      }
      intersectsAABB2d(aabb) {
          assertInst(AABB, aabb);
          return !(this.min.x >= aabb.max.x ||
              this.max.x <= aabb.min.x ||
              this.min.y >= aabb.max.y ||
              this.max.y <= aabb.min.y);
      }
      containsPoint(p) {
          assertVectors(p);
          return (this.min.x <= p.x &&
              this.min.y <= p.y &&
              this.min.z <= p.z &&
              this.max.x >= p.x &&
              this.max.y >= p.y &&
              this.max.z >= p.z);
      }
      containsSphere(center, radius) {
          assertVectors(center);
          assertNumbers(radius);
          return this.distanceToPoint(center) > radius;
      }
      intersectsSphere(center, radius) {
          assertVectors(center);
          assertNumbers(radius);
          return this.distanceToPoint(center) <= radius;
      }
      distanceToPoint(p) {
          assertVectors(p);
          const x = p.x, y = p.y, z = p.z;
          const min = this.min, max = this.max;
          if (this.containsPoint(p)) {
              return Math.max(min.x - x, x - max.x, min.y - y, y - max.y, min.z - z, z - max.z);
          }
          return p.distanceTo(new V3(clamp(x, min.x, max.x), clamp(y, min.y, max.y), clamp(z, min.z, max.z)));
      }
      containsAABB(aabb) {
          assertInst(AABB, aabb);
          return this.containsPoint(aabb.min) && this.containsPoint(aabb.max);
      }
      likeAABB(aabb) {
          assertInst(AABB, aabb);
          return this.min.like(aabb.min) && this.max.like(aabb.max);
      }
      intersectsLine(line) {
          assertVectors(line.anchor, line.dir1);
          const dir = line.dir1.map(el => el || Number.MIN_VALUE);
          const minTs = this.min.minus(line.anchor).divv(dir);
          const maxTs = this.max.minus(line.anchor).divv(dir);
          const tMin = minTs.min(maxTs).maxElement(), tMax = minTs.max(maxTs).minElement();
          return tMin <= tMax && !(tMax < line.tMin || line.tMax < tMin);
      }
      hasVolume() {
          return this.min.x <= this.max.x && this.min.y <= this.max.y && this.min.z <= this.max.z;
      }
      volume() {
          if (!this.hasVolume()) {
              return -1;
          }
          const v = this.max.minus(this.min);
          return v.x * v.y * v.z;
      }
      size() {
          return this.max.minus(this.min);
      }
      getCenter() {
          return this.min.plus(this.max).div(2);
      }
      transform(m4) {
          assertInst(M4, m4);
          assert(m4.isAxisAligned());
          const aabb = new AABB();
          aabb.addPoint(m4.transformPoint(this.min));
          aabb.addPoint(m4.transformPoint(this.max));
          return aabb;
      }
      ofTransformed(m4) {
          assertInst(M4, m4);
          const aabb = new AABB();
          aabb.addPoints(m4.transformedPoints(this.corners()));
          return aabb;
      }
      corners() {
          const min = this.min, max = this.max;
          return [
              min,
              new V3(min.x, min.y, max.z),
              new V3(min.x, max.y, min.z),
              new V3(min.x, max.y, max.z),
              new V3(max.x, min.y, min.z),
              new V3(max.x, min.y, max.z),
              new V3(max.x, max.y, min.z),
              max,
          ];
      }
      toString() {
          return callsce('new AABB', this.min, this.max);
      }
      toSource() {
          return this.toString();
      }
      /**
       * Return the matrix which transforms the AABB from V3.O to V3.XYZ to this AABB.
       */
      getM4() {
          return M4.translate(this.min).times(M4.scale(this.size()));
      }
  }
  //# sourceMappingURL=bundle.module.js.map

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  function __rest(s, e) {
      var t = {};
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
              t[p[i]] = s[p[i]];
      return t;
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  function __awaiter$1(thisArg, _arguments, P, generator) {
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var index_umd = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
  	factory(exports);
  }(commonjsGlobal, (function (exports) {
  	/**
  	 * @license
  	 *
  	 * chroma.js - JavaScript library for color conversions
  	 *
  	 * Copyright (c) 2011-2017, Gregor Aisch
  	 * All rights reserved.
  	 *
  	 * Redistribution and use in source and binary forms, with or without
  	 * modification, are permitted provided that the following conditions are met:
  	 *
  	 * 1. Redistributions of source code must retain the above copyright notice, this
  	 *    list of conditions and the following disclaimer.
  	 *
  	 * 2. Redistributions in binary form must reproduce the above copyright notice,
  	 *    this list of conditions and the following disclaimer in the documentation
  	 *    and/or other materials provided with the distribution.
  	 *
  	 * 3. The name Gregor Aisch may not be used to endorse or promote products
  	 *    derived from this software without specific prior written permission.
  	 *
  	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  	 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  	 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  	 * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
  	 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
  	 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
  	 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
  	 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
  	 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
  	 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  	 */
  	const { abs, atan2, cos, floor, log, min, max, round, sin, sqrt, cbrt, PI, hypot } = Math;
  	function lerp(a, b, f) {
  	    return a + (b - a) * f;
  	}
  	function lerpInv(a, b, f) {
  	    return (f - a) / (b - a);
  	}
  	function clamp(x, min = 0, max = 1) {
  	    return x < min ? min : x > max ? max : x;
  	}
  	function newtonIterate1d(f, xStart, max_steps, eps = 1e-8) {
  	    let x = xStart, fx;
  	    while (max_steps-- && abs((fx = f(x))) > eps) {
  	        const dfdx = (f(x + eps) - fx) / eps;
  	        console.log("fx / dfdx", fx / dfdx, "fx", fx, "x", x);
  	        x = x - fx / dfdx;
  	    }
  	    return x;
  	}
  	// function bisect(f: (x: number) => number, a: number, b: number, steps: number) {
  	// 	//assert(a < b)
  	// 	let fA = f(a),
  	// 		fB = f(b)
  	// 	//assert(fA * fB < 0)
  	// 	while (steps--) {
  	// 		const c = (a + b) / 2
  	// 		const fC = f(c)
  	// 		console.log("fC", fC, "c", c)
  	// 		if (sign(fA) == sign(fC)) {
  	// 			a = c
  	// 			fA = fC
  	// 		} else {
  	// 			b = c
  	// 			fB = fC
  	// 		}
  	// 	}
  	// 	//assert(a <= (b + a) / 2)
  	// 	//assert(b >= (b + a) / 2)
  	// 	return (a + b) / 2
  	// }
  	const TWOPI = 2 * PI;
  	const DEG2RAD = PI / 180;
  	const RAD2DEG = 180 / PI;
  	function chroma(...args) {
  	    if (args[0] instanceof chroma.Color) {
  	        return args[0];
  	    }
  	    if (args.length > 1 && "string" == typeof args[args.length - 1]) {
  	        return guess(args.slice(0, args.length - 1), args[args.length - 1]);
  	    }
  	    else if (Array.isArray(args[0])) {
  	        return guess(args[0]);
  	    }
  	    else {
  	        return guess(args);
  	    }
  	}
  	var chroma$1 = chroma;
  	(function (chroma) {
  	    class Color {
  	        /** @internal */
  	        constructor(r, g, b, a = 1) {
  	            this.r = r;
  	            this.g = g;
  	            this.b = b;
  	            this.a = a;
  	        }
  	        // public shade() {
  	        // 	const shades: [string, string, number][] = [
  	        // 		["ff0000", "red"],
  	        // 		["ffa500", "orange"],
  	        // 		["ffff00", "yellow"],
  	        // 		["008000", "green"],
  	        // 		["0000ff", "blue"],
  	        // 		["ee82ee", "violet"],
  	        // 		["a52a2a", "brown"],
  	        // 		["000000", "black"],
  	        // 		["808080", "grey"],
  	        // 		["ffffff", "white"],
  	        // 	] as any
  	        // 	function angleDiff(a: number, b: number) {
  	        // 		const d = (a - b) % 360
  	        // 		if (d > 180) return d - 360
  	        // 		if (d < -180) return d + 360
  	        // 		return d
  	        // 	}
  	        // 	shades.forEach(arr => arr.push(chroma(arr[0]).hsl()[0]))
  	        // 	const [h, s, l] = this.hsl()
  	        // 	if (l > 0.9) return "white"
  	        // 	if (l > 0.8 && s < 0.2) return "white"
  	        // 	if (s < 0.1) return "grey"
  	        // 	if (s < 0.4 && h > 0 && h < 48) return "brown"
  	        // 	const distanceInXYZ: { [hue: number]: number } = { 0: 0 }
  	        // 	for (let i = 60; i <= 360; i += 60) {
  	        // 		distanceInXYZ[i] =
  	        // 			distanceInXYZ[i - 60] + chroma.distance(chroma.hsl(i - 60, 1, 0.5), chroma.hsl(i, 1, 0.5), "xyz")
  	        // 	}
  	        // 	// console.log(distanceInXYZ)
  	        // 	const shadeEnds: { [hue: number]: number } = {
  	        // 		0: 9,
  	        // 		38: 48,
  	        // 		60: 65,
  	        // 		120: 165,
  	        // 		240: 245,
  	        // 		300: 338,
  	        // 		360: 369,
  	        // 	}
  	        // 	const getColorDistanceAlongXYZHue = (hueDegrees: number) => {
  	        // 		const base = hueDegrees - (hueDegrees % 60)
  	        // 		return (
  	        // 			distanceInXYZ[base] + chroma.distance(chroma.hsl(base, 1, 0.5), chroma.hsl(hueDegrees, 1, 0.5), "xyz")
  	        // 		)
  	        // 	}
  	        // 	const colorXYZD = getColorDistanceAlongXYZHue(this.hsl()[0])
  	        // 	const md = distanceInXYZ[360]
  	        // 	const shadeHue =
  	        // 		(Object.keys(shadeEnds) as any[]).find(shadeHue => shadeEnds[shadeHue | 0] >= this.hsl()[0])! % 360
  	        // 	return shades.find(([_hex, _name, _hue]) => (_hue | 0) === shadeHue)![1]
  	        // 	// process.exit()
  	        // 	return withMax(shades, ([_hex, _name, _hue]) => {
  	        // 		return -abs(angleDiff(this.hsl()[0], _hue))
  	        // 	})[1]
  	        // 	return withMax(shades, ([_hex, _name, _hue]) => {
  	        // 		const [thisL, thisA, thisB] = this.lab()
  	        // 		const [L, A, B] = chroma(_hex).lab()
  	        // 		return -hypot(thisL - L, thisA - A, thisB - B)
  	        // 	})[1]
  	        // }
  	        /**
  	         * @see [[chroma.mix]]
  	         */
  	        mix(col2, f, m = "rgb") {
  	            return chroma.mix(this, col2, f, m);
  	        }
  	        rgb(doRound = true, clamp_ = true) {
  	            const f = (t) => {
  	                if (doRound)
  	                    t = round(t);
  	                if (clamp_)
  	                    t = clamp(t, 0, 255);
  	                return t;
  	            };
  	            const { r, g, b } = this;
  	            return [f(r), f(g), f(b)];
  	        }
  	        rgba(doRound = true, clamp_ = true) {
  	            const f = (t) => {
  	                if (doRound)
  	                    t = round(t);
  	                if (clamp_)
  	                    t = clamp(t, 0, 255);
  	                return t;
  	            };
  	            const { r, g, b, a } = this;
  	            return [f(r), f(g), f(b), a];
  	        }
  	        /**
  	         * Return a hex-string representation of this color.
  	         *
  	         * @param mode
  	         * @see #num for a hex-number representation.
  	         * @example chroma('yellow').alpha(0.7).hex()
  	         * @example chroma('yellow').alpha(0.7).hex('rgba')
  	         * @example chroma('yellow').alpha(0.7).hex('argb')
  	         */
  	        hex(mode = "rgb") {
  	            const { r, g, b, a } = this;
  	            return rgb2hex(r, g, b, a, mode);
  	        }
  	        /**
  	         * Returns the [HSL] representation of this color. hue will always be in [0;360). Values are never NaN.
  	         *
  	         * @example chroma('purple').hsl()
  	         */
  	        hsl() {
  	            const { r, g, b } = this;
  	            return rgb2hsl(r, g, b);
  	        }
  	        /**
  	         * Returns the [HSL] representation of this color. hue will always be in [0;360). Values are never NaN.
  	         *
  	         * @example chroma('purple').hsv()
  	         */
  	        hsv() {
  	            const { r, g, b } = this;
  	            return rgb2hsv(r, g, b);
  	        }
  	        /**
  	         * Returns the [HSL] representation of this color. hue will always be in [0;360). Values are never NaN.
  	         *
  	         * @example chroma('purple').hcg()
  	         */
  	        hcg() {
  	            const { r, g, b } = this;
  	            return rgb2hcg(r, g, b);
  	        }
  	        /**
  	         * Returns a CSS `rgb(...)` or `hsl(...)` string representation that can be used as CSS-color definition. The alpha
  	         * value is not output if it 1.
  	         * @example chroma('teal').css() // == "rgb(0,128,128)"
  	         * @example chroma('teal').alpha(0.5).css() // == "rgba(0,128,128,0.5)"
  	         * @example chroma('teal').css('hsl') // == "hsl(180,100%,25.1%)"
  	         */
  	        css(mode = "rgb") {
  	            if ("rgb" == mode) {
  	                const { r, g, b, a } = this;
  	                return rgb2css(r, g, b, a);
  	            }
  	            else if ("hsl" == mode) {
  	                return hsl2css(this.hsl(), this.alpha());
  	            }
  	            else {
  	                throw new Error();
  	            }
  	        }
  	        name(closest = false) {
  	            const num = this.num();
  	            const name = Object.keys(chroma.w3cx11).find(name => chroma.w3cx11[name] == num);
  	            if (!name && closest) {
  	                const [thisLStar, thisAStar, thisBStar] = this.lab();
  	                return withMax(Object.keys(chroma.w3cx11), name => {
  	                    const [lStar, aStar, bStar] = chroma.num(chroma.w3cx11[name]).lab();
  	                    return -hypot(thisLStar - lStar, thisAStar - aStar, thisBStar - bStar);
  	                });
  	            }
  	            return name;
  	        }
  	        /**
  	         * Get the [CMYK](#chroma.CMYK) representation of this color.
  	         *
  	         * @example chroma('red').cmyk()
  	         */
  	        cmyk() {
  	            const { r, g, b } = this;
  	            return rgb2cmyk(r, g, b);
  	        }
  	        /**
  	         * Returns the [GL] representation of this color.
  	         * @example chroma('33cc00').gl()
  	         */
  	        gl() {
  	            const { r, g, b, a } = this;
  	            return [r / 255, g / 255, b / 255, a];
  	        }
  	        luminance(lum1) {
  	            const { r, g, b, a } = this;
  	            const [, Y] = rgb2xyz(r, g, b);
  	            if (undefined === lum1) {
  	                return Y;
  	            }
  	            const inverseLerp = (a, b, val) => (val - a) / (b - a);
  	            if (lum1 > Y) {
  	                // lerp to white
  	                return chroma.mix(this, chroma("white"), inverseLerp(Y, 1, lum1), "xyz").alpha(a);
  	            }
  	            else {
  	                // lerp to black
  	                return chroma.mix(chroma("black"), this, inverseLerp(0, Y, lum1), "xyz").alpha(a);
  	            }
  	        }
  	        /**
  	         * Get color temperature of this color in Kelvin. This only makes sense for colors close to those output by
  	         * chroma.kelvin
  	         *
  	         * @example [c = chroma('#ff3300'), c.temperature()]
  	         * @example [c = chroma('#ffe3cd'), c.temperature()]
  	         * @example [c = chroma('#b3ccff'), c.temperature()]
  	         */
  	        temperature() {
  	            const { r, g, b } = this;
  	            return rgb2kelvin(r, g, b);
  	        }
  	        /**
  	         * Returns a new [Color] with a channel changed.
  	         * @example chroma('skyblue').set('hsl.h', 0) // change hue to 0 deg (=red)
  	         * @example chroma('hotpink').set('lch.c', 30) // set chromaticity to 30
  	         * @example chroma('orangered').set('lab.l', x => x / 2) // half Lab lightness
  	         * @example chroma('darkseagreen').set('lch.c', x => x * 2) // double Lch saturation
  	         */
  	        set(modeAndChannel, value) {
  	            const [mode, channel] = modeAndChannel.split(".");
  	            const src = this[mode]();
  	            const i = mode.indexOf(channel);
  	            if (-1 == i)
  	                throw new Error("invalid channel");
  	            src[i] = "number" == typeof value ? value : value(src[i]);
  	            return chroma(src, mode).alpha(this.a);
  	        }
  	        /**
  	         * Returns whether this color is outside the RGB color cube and will be clipped/clamped when calling .rgb()
  	         *
  	         * @example [c = chroma.lch( 20, 40, 50), c.clipped()]
  	         * @example [c = chroma.lch( 40, 40, 50), c.clipped()]
  	         * @example [c = chroma.lch( 60, 40, 50), c.clipped()]
  	         * @example [c = chroma.lch( 80, 40, 50), c.clipped()]
  	         * @example [c = chroma.lch(100, 40, 50), c.clipped()]
  	         */
  	        clipped() {
  	            const { r, g, b } = this;
  	            return !(0 <= r && r <= 255 && (0 <= g && g <= 255) && (0 <= b && b <= 255));
  	        }
  	        /**
  	         * Returns black or white, whichever has the highest contrast to `this`.
  	         * In the readme you should see the result of this.
  	         *
  	         * @example chroma('red')
  	         * @example chroma('yellow')
  	         */
  	        textColor() {
  	            return this.luminance() > 0.5 ? chroma.black : chroma.white;
  	        }
  	        alpha(alpha1) {
  	            if (undefined === alpha1) {
  	                return this.a;
  	            }
  	            const { r, g, b } = this;
  	            return chroma.rgb(r, g, b, alpha1);
  	        }
  	        darker(amount = 1) {
  	            const [l, a, b] = this.lab();
  	            return chroma.lab(l - LAB_Kn * amount, a, b, this.alpha());
  	        }
  	        /**
  	         *
  	         * @param amount
  	         * @example chroma('hotpink')
  	         * @example chroma('hotpink').brighter()
  	         * @example chroma('hotpink').brighter(2)
  	         * @example chroma('hotpink').brighter(3)
  	         */
  	        brighter(amount = 1) {
  	            return this.darker(-amount);
  	        }
  	        /**
  	         * Returns a new [Color] with increased saturation.
  	         * @param amount How much.
  	         * @example chroma('slategray')
  	         * @example chroma('slategray').saturate()
  	         * @example chroma('slategray').saturate(2)
  	         * @example chroma('slategray').saturate(3)
  	         */
  	        saturate(amount = 1) {
  	            const [l, c, h] = this.lch();
  	            return chroma.lch(l, max(0, c + amount * LAB_Kn), h, this.alpha());
  	        }
  	        /**
  	         * Equivalent to `saturate(-amount)`.
  	         * @see #saturate
  	         */
  	        desaturate(amount = 1) {
  	            return this.saturate(-amount);
  	        }
  	        premultiplied() {
  	            const { r, g, b, a } = this;
  	            return chroma.rgb(r * a, g * a, b * a, a);
  	        }
  	        /**
  	         * Returns the [HSI] representation of this color. hue will always be in [0; 360). Values are never NaN.
  	         *
  	         * @example chroma('purple').hsi()
  	         */
  	        hsi() {
  	            const { r, g, b } = this;
  	            return rgb2hsi(r, g, b);
  	        }
  	        /**
  	         * Returns the [LAB] representation of this color.
  	         *
  	         * @example chroma('purple').lab()
  	         */
  	        lab() {
  	            const { r, g, b } = this;
  	            return rgb2lab(r, g, b);
  	        }
  	        /**
  	         * Return a hex-num of this color.
  	         *
  	         * @param mode
  	         * @see #num for a hex-number representation.
  	         * @example chroma('yellow').alpha(0.7).hex()
  	         * @example chroma('yellow').alpha(0.7).hex('rgba')
  	         * @example chroma('yellow').alpha(0.7).hex('argb')
  	         */
  	        num(mode = "rgb") {
  	            const { r, g, b, a } = this;
  	            return rgb2num(r, g, b, a, mode);
  	        }
  	        /**
  	         * Returns the [LCH] representation of this color. hue will always be in [0; 360). Values are never NaN.
  	         *
  	         * @example chroma('purple').lch()
  	         */
  	        lch() {
  	            const { r, g, b } = this;
  	            return rgb2lch(r, g, b);
  	        }
  	        /**
  	         * Returns the [XYZ] representation of this color. hue will always be in [0; 360). Values are never NaN.
  	         *
  	         * @example chroma('purple').xyz()
  	         */
  	        xyz() {
  	            const { r, g, b } = this;
  	            return rgb2xyz(r, g, b);
  	        }
  	        /**
  	         * Whether this [Color](#chroma.Color) is identical (strict equality of r, g, b, a) to `color`.
  	         */
  	        equals(color) {
  	            const { r, g, b, a } = this;
  	            const { r: r2, g: g2, b: b2, a: a2 } = color;
  	            return r == r2 && g == g2 && b == b2 && a == a2;
  	        }
  	        hashCode() {
  	            return this.num("rgba");
  	        }
  	        /**
  	         * @example chroma('red').toSource() // == "chroma.rgb(255, 0, 0)"
  	         * @example chroma.rgb(-2, 100.02, 200, 0.5).toSource() // == "chroma.rgb(-2, 100.02, 200, 0.5)"
  	         */
  	        toSource() {
  	            const { r, g, b, a } = this;
  	            return "chroma.rgb(" + r + ", " + g + ", " + b + (a === 1 ? ")" : ", " + a + ")");
  	        }
  	    }
  	    chroma.Color = Color;
  	    Color.prototype.toString = Color.prototype.css;
  	    Color.prototype.kelvin = Color.prototype.temperature;
  	    /**
  	     * @example chroma.black
  	     */
  	    chroma.black = new Color(0, 0, 0, 1);
  	    /**
  	     * @example chroma.black
  	     */
  	    chroma.white = new Color(255, 255, 255, 1);
  	    chroma.brewer = {
  	        OrRd: [0xfff7ec, 0xfee8c8, 0xfdd49e, 0xfdbb84, 0xfc8d59, 0xef6548, 0xd7301f, 0xb30000, 0x7f0000],
  	        PuBu: [0xfff7fb, 0xece7f2, 0xd0d1e6, 0xa6bddb, 0x74a9cf, 0x3690c0, 0x0570b0, 0x045a8d, 0x023858],
  	        BuPu: [0xf7fcfd, 0xe0ecf4, 0xbfd3e6, 0x9ebcda, 0x8c96c6, 0x8c6bb1, 0x88419d, 0x810f7c, 0x4d004b],
  	        Oranges: [0xfff5eb, 0xfee6ce, 0xfdd0a2, 0xfdae6b, 0xfd8d3c, 0xf16913, 0xd94801, 0xa63603, 0x7f2704],
  	        BuGn: [0xf7fcfd, 0xe5f5f9, 0xccece6, 0x99d8c9, 0x66c2a4, 0x41ae76, 0x238b45, 0x006d2c, 0x00441b],
  	        YlOrBr: [0xffffe5, 0xfff7bc, 0xfee391, 0xfec44f, 0xfe9929, 0xec7014, 0xcc4c02, 0x993404, 0x662506],
  	        YlGn: [0xffffe5, 0xf7fcb9, 0xd9f0a3, 0xaddd8e, 0x78c679, 0x41ab5d, 0x238443, 0x006837, 0x004529],
  	        Reds: [0xfff5f0, 0xfee0d2, 0xfcbba1, 0xfc9272, 0xfb6a4a, 0xef3b2c, 0xcb181d, 0xa50f15, 0x67000d],
  	        RdPu: [0xfff7f3, 0xfde0dd, 0xfcc5c0, 0xfa9fb5, 0xf768a1, 0xdd3497, 0xae017e, 0x7a0177, 0x49006a],
  	        Greens: [0xf7fcf5, 0xe5f5e0, 0xc7e9c0, 0xa1d99b, 0x74c476, 0x41ab5d, 0x238b45, 0x006d2c, 0x00441b],
  	        YlGnBu: [0xffffd9, 0xedf8b1, 0xc7e9b4, 0x7fcdbb, 0x41b6c4, 0x1d91c0, 0x225ea8, 0x253494, 0x081d58],
  	        Purples: [0xfcfbfd, 0xefedf5, 0xdadaeb, 0xbcbddc, 0x9e9ac8, 0x807dba, 0x6a51a3, 0x54278f, 0x3f007d],
  	        GnBu: [0xf7fcf0, 0xe0f3db, 0xccebc5, 0xa8ddb5, 0x7bccc4, 0x4eb3d3, 0x2b8cbe, 0x0868ac, 0x084081],
  	        Greys: [0xffffff, 0xf0f0f0, 0xd9d9d9, 0xbdbdbd, 0x969696, 0x737373, 0x525252, 0x252525, 0x000000],
  	        YlOrRd: [0xffffcc, 0xffeda0, 0xfed976, 0xfeb24c, 0xfd8d3c, 0xfc4e2a, 0xe31a1c, 0xbd0026, 0x800026],
  	        PuRd: [0xf7f4f9, 0xe7e1ef, 0xd4b9da, 0xc994c7, 0xdf65b0, 0xe7298a, 0xce1256, 0x980043, 0x67001f],
  	        Blues: [0xf7fbff, 0xdeebf7, 0xc6dbef, 0x9ecae1, 0x6baed6, 0x4292c6, 0x2171b5, 0x08519c, 0x08306b],
  	        PuBuGn: [0xfff7fb, 0xece2f0, 0xd0d1e6, 0xa6bddb, 0x67a9cf, 0x3690c0, 0x02818a, 0x016c59, 0x014636],
  	        Viridis: [0x440154, 0x482777, 0x3f4a8a, 0x31678e, 0x26838f, 0x1f9d8a, 0x6cce5a, 0xb6de2b, 0xfee825],
  	        Spectral: [
  	            0x9e0142,
  	            0xd53e4f,
  	            0xf46d43,
  	            0xfdae61,
  	            0xfee08b,
  	            0xffffbf,
  	            0xe6f598,
  	            0xabdda4,
  	            0x66c2a5,
  	            0x3288bd,
  	            0x5e4fa2,
  	        ],
  	        RdYlGn: [
  	            0xa50026,
  	            0xd73027,
  	            0xf46d43,
  	            0xfdae61,
  	            0xfee08b,
  	            0xffffbf,
  	            0xd9ef8b,
  	            0xa6d96a,
  	            0x66bd63,
  	            0x1a9850,
  	            0x006837,
  	        ],
  	        RdBu: [
  	            0x67001f,
  	            0xb2182b,
  	            0xd6604d,
  	            0xf4a582,
  	            0xfddbc7,
  	            0xf7f7f7,
  	            0xd1e5f0,
  	            0x92c5de,
  	            0x4393c3,
  	            0x2166ac,
  	            0x053061,
  	        ],
  	        PiYG: [
  	            0x8e0152,
  	            0xc51b7d,
  	            0xde77ae,
  	            0xf1b6da,
  	            0xfde0ef,
  	            0xf7f7f7,
  	            0xe6f5d0,
  	            0xb8e186,
  	            0x7fbc41,
  	            0x4d9221,
  	            0x276419,
  	        ],
  	        PRGn: [
  	            0x40004b,
  	            0x762a83,
  	            0x9970ab,
  	            0xc2a5cf,
  	            0xe7d4e8,
  	            0xf7f7f7,
  	            0xd9f0d3,
  	            0xa6dba0,
  	            0x5aae61,
  	            0x1b7837,
  	            0x00441b,
  	        ],
  	        RdYlBu: [
  	            0xa50026,
  	            0xd73027,
  	            0xf46d43,
  	            0xfdae61,
  	            0xfee090,
  	            0xffffbf,
  	            0xe0f3f8,
  	            0xabd9e9,
  	            0x74add1,
  	            0x4575b4,
  	            0x313695,
  	        ],
  	        BrBG: [
  	            0x543005,
  	            0x8c510a,
  	            0xbf812d,
  	            0xdfc27d,
  	            0xf6e8c3,
  	            0xf5f5f5,
  	            0xc7eae5,
  	            0x80cdc1,
  	            0x35978f,
  	            0x01665e,
  	            0x003c30,
  	        ],
  	        RdGy: [
  	            0x67001f,
  	            0xb2182b,
  	            0xd6604d,
  	            0xf4a582,
  	            0xfddbc7,
  	            0xffffff,
  	            0xe0e0e0,
  	            0xbababa,
  	            0x878787,
  	            0x4d4d4d,
  	            0x1a1a1a,
  	        ],
  	        PuOr: [
  	            0x7f3b08,
  	            0xb35806,
  	            0xe08214,
  	            0xfdb863,
  	            0xfee0b6,
  	            0xf7f7f7,
  	            0xd8daeb,
  	            0xb2abd2,
  	            0x8073ac,
  	            0x542788,
  	            0x2d004b,
  	        ],
  	        Set2: [0x66c2a5, 0xfc8d62, 0x8da0cb, 0xe78ac3, 0xa6d854, 0xffd92f, 0xe5c494, 0xb3b3b3],
  	        Accent: [0x7fc97f, 0xbeaed4, 0xfdc086, 0xffff99, 0x386cb0, 0xf0027f, 0xbf5b17, 0x666666],
  	        Set1: [0xe41a1c, 0x377eb8, 0x4daf4a, 0x984ea3, 0xff7f00, 0xffff33, 0xa65628, 0xf781bf, 0x999999],
  	        Set3: [
  	            0x8dd3c7,
  	            0xffffb3,
  	            0xbebada,
  	            0xfb8072,
  	            0x80b1d3,
  	            0xfdb462,
  	            0xb3de69,
  	            0xfccde5,
  	            0xd9d9d9,
  	            0xbc80bd,
  	            0xccebc5,
  	            0xffed6f,
  	        ],
  	        Dark2: [0x1b9e77, 0xd95f02, 0x7570b3, 0xe7298a, 0x66a61e, 0xe6ab02, 0xa6761d, 0x666666],
  	        Paired: [
  	            0xa6cee3,
  	            0x1f78b4,
  	            0xb2df8a,
  	            0x33a02c,
  	            0xfb9a99,
  	            0xe31a1c,
  	            0xfdbf6f,
  	            0xff7f00,
  	            0xcab2d6,
  	            0x6a3d9a,
  	            0xffff99,
  	            0xb15928,
  	        ],
  	        Pastel2: [0xb3e2cd, 0xfdcdac, 0xcbd5e8, 0xf4cae4, 0xe6f5c9, 0xfff2ae, 0xf1e2cc, 0xcccccc],
  	        Pastel1: [0xfbb4ae, 0xb3cde3, 0xccebc5, 0xdecbe4, 0xfed9a6, 0xffffcc, 0xe5d8bd, 0xfddaec, 0xf2f2f2],
  	    };
  	    /**
  	     * X11 color names
  	     * http://www.w3.org/TR/css3-color/#svg-color
  	     *
  	     * @example Object.keys(chroma.w3cx11).slice(0, 4)
  	     */
  	    chroma.w3cx11 = {
  	        aliceblue: 0xf0f8ff,
  	        antiquewhite: 0xfaebd7,
  	        aqua: 0x00ffff,
  	        aquamarine: 0x7fffd4,
  	        azure: 0xf0ffff,
  	        beige: 0xf5f5dc,
  	        bisque: 0xffe4c4,
  	        black: 0x000000,
  	        blanchedalmond: 0xffebcd,
  	        blue: 0x0000ff,
  	        blueviolet: 0x8a2be2,
  	        brown: 0xa52a2a,
  	        burlywood: 0xdeb887,
  	        cadetblue: 0x5f9ea0,
  	        chartreuse: 0x7fff00,
  	        chocolate: 0xd2691e,
  	        coral: 0xff7f50,
  	        cornflower: 0x6495ed,
  	        cornflowerblue: 0x6495ed,
  	        cornsilk: 0xfff8dc,
  	        crimson: 0xdc143c,
  	        cyan: 0x00ffff,
  	        darkblue: 0x00008b,
  	        darkcyan: 0x008b8b,
  	        darkgoldenrod: 0xb8860b,
  	        darkgray: 0xa9a9a9,
  	        darkgreen: 0x006400,
  	        darkgrey: 0xa9a9a9,
  	        darkkhaki: 0xbdb76b,
  	        darkmagenta: 0x8b008b,
  	        darkolivegreen: 0x556b2f,
  	        darkorange: 0xff8c00,
  	        darkorchid: 0x9932cc,
  	        darkred: 0x8b0000,
  	        darksalmon: 0xe9967a,
  	        darkseagreen: 0x8fbc8f,
  	        darkslateblue: 0x483d8b,
  	        darkslategray: 0x2f4f4f,
  	        darkslategrey: 0x2f4f4f,
  	        darkturquoise: 0x00ced1,
  	        darkviolet: 0x9400d3,
  	        deeppink: 0xff1493,
  	        deepskyblue: 0x00bfff,
  	        dimgray: 0x696969,
  	        dimgrey: 0x696969,
  	        dodgerblue: 0x1e90ff,
  	        firebrick: 0xb22222,
  	        floralwhite: 0xfffaf0,
  	        forestgreen: 0x228b22,
  	        fuchsia: 0xff00ff,
  	        gainsboro: 0xdcdcdc,
  	        ghostwhite: 0xf8f8ff,
  	        gold: 0xffd700,
  	        goldenrod: 0xdaa520,
  	        gray: 0x808080,
  	        green: 0x008000,
  	        greenyellow: 0xadff2f,
  	        grey: 0x808080,
  	        honeydew: 0xf0fff0,
  	        hotpink: 0xff69b4,
  	        indianred: 0xcd5c5c,
  	        indigo: 0x4b0082,
  	        ivory: 0xfffff0,
  	        khaki: 0xf0e68c,
  	        laserlemon: 0xffff54,
  	        lavender: 0xe6e6fa,
  	        lavenderblush: 0xfff0f5,
  	        lawngreen: 0x7cfc00,
  	        lemonchiffon: 0xfffacd,
  	        lightblue: 0xadd8e6,
  	        lightcoral: 0xf08080,
  	        lightcyan: 0xe0ffff,
  	        lightgoldenrod: 0xfafad2,
  	        lightgoldenrodyellow: 0xfafad2,
  	        lightgray: 0xd3d3d3,
  	        lightgreen: 0x90ee90,
  	        lightgrey: 0xd3d3d3,
  	        lightpink: 0xffb6c1,
  	        lightsalmon: 0xffa07a,
  	        lightseagreen: 0x20b2aa,
  	        lightskyblue: 0x87cefa,
  	        lightslategray: 0x778899,
  	        lightslategrey: 0x778899,
  	        lightsteelblue: 0xb0c4de,
  	        lightyellow: 0xffffe0,
  	        lime: 0x00ff00,
  	        limegreen: 0x32cd32,
  	        linen: 0xfaf0e6,
  	        magenta: 0xff00ff,
  	        maroon: 0x800000,
  	        maroon2: 0x7f0000,
  	        maroon3: 0xb03060,
  	        mediumaquamarine: 0x66cdaa,
  	        mediumblue: 0x0000cd,
  	        mediumorchid: 0xba55d3,
  	        mediumpurple: 0x9370db,
  	        mediumseagreen: 0x3cb371,
  	        mediumslateblue: 0x7b68ee,
  	        mediumspringgreen: 0x00fa9a,
  	        mediumturquoise: 0x48d1cc,
  	        mediumvioletred: 0xc71585,
  	        midnightblue: 0x191970,
  	        mintcream: 0xf5fffa,
  	        mistyrose: 0xffe4e1,
  	        moccasin: 0xffe4b5,
  	        navajowhite: 0xffdead,
  	        navy: 0x000080,
  	        oldlace: 0xfdf5e6,
  	        olive: 0x808000,
  	        olivedrab: 0x6b8e23,
  	        orange: 0xffa500,
  	        orangered: 0xff4500,
  	        orchid: 0xda70d6,
  	        palegoldenrod: 0xeee8aa,
  	        palegreen: 0x98fb98,
  	        paleturquoise: 0xafeeee,
  	        palevioletred: 0xdb7093,
  	        papayawhip: 0xffefd5,
  	        peachpuff: 0xffdab9,
  	        peru: 0xcd853f,
  	        pink: 0xffc0cb,
  	        plum: 0xdda0dd,
  	        powderblue: 0xb0e0e6,
  	        purple: 0x800080,
  	        purple2: 0x7f007f,
  	        purple3: 0xa020f0,
  	        rebeccapurple: 0x663399,
  	        red: 0xff0000,
  	        rosybrown: 0xbc8f8f,
  	        royalblue: 0x4169e1,
  	        saddlebrown: 0x8b4513,
  	        salmon: 0xfa8072,
  	        sandybrown: 0xf4a460,
  	        seagreen: 0x2e8b57,
  	        seashell: 0xfff5ee,
  	        sienna: 0xa0522d,
  	        silver: 0xc0c0c0,
  	        skyblue: 0x87ceeb,
  	        slateblue: 0x6a5acd,
  	        slategray: 0x708090,
  	        slategrey: 0x708090,
  	        snow: 0xfffafa,
  	        springgreen: 0x00ff7f,
  	        steelblue: 0x4682b4,
  	        tan: 0xd2b48c,
  	        teal: 0x008080,
  	        thistle: 0xd8bfd8,
  	        tomato: 0xff6347,
  	        turquoise: 0x40e0d0,
  	        violet: 0xee82ee,
  	        wheat: 0xf5deb3,
  	        white: 0xffffff,
  	        whitesmoke: 0xf5f5f5,
  	        yellow: 0xffff00,
  	        yellowgreen: 0x9acd32,
  	    };
  	    /**
  	     * Return a new [[CubeHelix]].
  	     *
  	     * @example chroma.cubehelix() // use the default helix
  	     * @example chroma.cubehelix().start(200).rotations(-0.5).gamma(0.8).lightness([0.3, 0.8])
  	     */
  	    function cubehelix(start = 300, rotations = -1.5, hue = 1, gamma = 1, lightness = [0, 1]) {
  	        const f = (t => f.at(t));
  	        Object.getOwnPropertyNames(CubeHelix.prototype).forEach(key => (f[key] = CubeHelix.prototype[key]));
  	        f.start(start);
  	        f.rotations(rotations);
  	        f.hue(hue);
  	        f.gamma(gamma);
  	        f.lightness(lightness);
  	        return f;
  	    }
  	    chroma.cubehelix = cubehelix;
  	    class CubeHelix {
  	        start(s) {
  	            if (undefined === s) {
  	                return this._start;
  	            }
  	            this._start = s;
  	            return this;
  	        }
  	        rotations(r) {
  	            if (undefined === r) {
  	                return this._rotations;
  	            }
  	            this._rotations = r;
  	            return this;
  	        }
  	        gamma(g) {
  	            if (undefined === g) {
  	                return this._gamma;
  	            }
  	            this._gamma = g;
  	            return this;
  	        }
  	        hue(h) {
  	            if (undefined === h) {
  	                return this._hue;
  	            }
  	            this._hue = Array.isArray(h) ? h : [h, h];
  	            return this;
  	        }
  	        lightness(h) {
  	            if (undefined === h) {
  	                return this._lightness;
  	            }
  	            this._lightness = Array.isArray(h) ? h : [h, h];
  	            return this;
  	        }
  	        /**
  	         * Convert to a [[Scale]].
  	         *
  	         * @example chroma.cubehelix().scale().correctLightness().domain(2, 22)
  	         */
  	        scale() {
  	            return scale(this);
  	        }
  	        at(fract) {
  	            const a = TWOPI * ((this._start + 120) / 360 + this._rotations * fract);
  	            const l = lerp(this._lightness[0], this._lightness[1], fract) ** this._gamma;
  	            const h = lerp(this._hue[0], this._hue[1], fract);
  	            const amp = (h * l * (1 - l)) / 2;
  	            const cos_a = cos(a);
  	            const sin_a = sin(a);
  	            const r = l + amp * (-0.14861 * cos_a + 1.78277 * sin_a);
  	            const g = l + amp * (-0.29227 * cos_a - 0.90649 * sin_a);
  	            const b = l + amp * (+1.97294 * cos_a);
  	            return rgb([r * 255, g * 255, b * 255, 1]);
  	        }
  	    }
  	    chroma.CubeHelix = CubeHelix;
  	    /**
  	     * Create a new random [Color] from a random point in the RGB color space.
  	     * @param randomSource A function which returns random `number`s in the interval [0; 1). Useful if you want to
  	     *     create a deterministic sequence of "random" colors. Defaults to `Math.random`.
  	     */
  	    function random(randomSource = Math.random) {
  	        return num((randomSource() * 16777216) | 0);
  	    }
  	    chroma.random = random;
  	    /**
  	     * Create a valid RGB color (`.clipped() == false`) from a random point in the CIELAB color space. This results in
  	     * more colors in the RGB color space where humans can perceive more differences.
  	     * @param randomSource A function which returns random `number`s in the interval [0; 1). Useful if you want to
  	     *     create a deterministic sequence of "random" colors. Defaults to `Math.random`.
  	     * @example chroma.random((() => { let i = 0; return () => (i = (i *Math.SQRT2) % 1); })())
  	     */
  	    // export function randomLab(randomSource = Math.random) {
  	    // 	const labAMin = -87,
  	    // 		labAMax = 99,
  	    // 		labBMin = -108,
  	    // 		labBMax = 95
  	    // 	let maxIterations = 100
  	    // 	while (maxIterations--) {
  	    // 		const u = randomSource(),
  	    // 			v = randomSource(),
  	    // 			w = randomSource()
  	    // 		// The following matrix multiplication transform the random point (u v w) in the unit cube into the
  	    // 		// oriented bounding box (OBB) of the projection of the RGB space into the LAB space. This is necessary to
  	    // 		// avoid a huge number of misses.
  	    // 		const color = chroma.lab(
  	    // 			u * -53.903 + v * -88.755 + w * 71.7 + 99.707,
  	    // 			u * -82.784 + v * 187.036 + w * -2.422 + -28.17,
  	    // 			u * -75.813 + v * -141.406 + w * -48.261 + 152.469,
  	    // 		)
  	    // 		console.log(color.lab())
  	    // 		console.log(color.rgba(false, false))
  	    // 		if (!color.clipped()) return color
  	    // 	}
  	    // 	throw new Error("Could find a random color in 100 iterations")
  	    // }
  	    /**
  	     * Mixes two colors. The mix ratio is a value between 0 and 1.
  	     * The color mixing produces different results based the color space used for interpolation.
  	     *
  	     * @param col2
  	     * @param f
  	     * @param m
  	     * @example chroma.mix('red', 'blue')
  	     * @example chroma.mix('red', 'blue', 0.25)
  	     * @example chroma.mix('red', 'blue', 0.75)
  	     *
  	     * @example chroma.mix('red', 'blue', 0.5, 'rgb')
  	     * @example chroma.mix('red', 'blue', 0.5, 'hsl')
  	     * @example chroma.mix('red', 'blue', 0.5, 'lab')
  	     * @example chroma.mix('red', 'blue', 0.5, 'lch')
  	     * @example chroma.mix('red', 'blue', 0.5, 'lrgb')
  	     */
  	    function mix(col1, col2, f = 0.5, m = "rgb") {
  	        const c1 = chroma(col1);
  	        const c2 = chroma(col2);
  	        const res = interpolators[m] && interpolators[m](c1, c2, f, m);
  	        if (!res) {
  	            throw new Error("color mode " + m + " is not supported");
  	        }
  	        return res.alpha(lerp(c1.alpha(), c2.alpha(), f));
  	    }
  	    chroma.mix = mix;
  	    /**
  	     * Parse a CSS color. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color) for all the possible
  	     * variants.
  	     *
  	     * @example chroma.css('hsl(2rad 90% 50% / 0.9)')
  	     * @example chroma.css('laserlemon')
  	     */
  	    function css(cssString) {
  	        const [r, g, b, a] = css2rgb(cssString);
  	        return new Color(r, g, b, a);
  	    }
  	    chroma.css = css;
  	    function cmyk(...args) {
  	        return guess(args, "cmyk");
  	    }
  	    chroma.cmyk = cmyk;
  	    function gl(...args) {
  	        return guess(args, "gl");
  	    }
  	    chroma.gl = gl;
  	    function hcg(...args) {
  	        return guess(args, "hcg");
  	    }
  	    chroma.hcg = hcg;
  	    function lch(...args) {
  	        return guess(args, "lch");
  	    }
  	    chroma.lch = lch;
  	    function hsi(...args) {
  	        return guess(args, "hsi");
  	    }
  	    chroma.hsi = hsi;
  	    function hsl(...args) {
  	        return guess(args, "hsl");
  	    }
  	    chroma.hsl = hsl;
  	    function hsv(...args) {
  	        return guess(args, "hsv");
  	    }
  	    chroma.hsv = hsv;
  	    /**
  	     *
  	     * @param temperature
  	     * @example chroma.kelvin(2000) // candle light
  	     * @example chroma.kelvin(3500) // sunset
  	     * @example chroma.kelvin(6500) // daylight
  	     * @example x0_1 => chroma.kelvin(x0_1 * 30000) // effective range: [0; 30000]
  	     */
  	    function kelvin(temperature) {
  	        const [r, g, b] = kelvin2rgb(temperature);
  	        return new Color(r, g, b);
  	    }
  	    chroma.kelvin = kelvin;
  	    function lab(...args) {
  	        return guess(args, "lab");
  	    }
  	    chroma.lab = lab;
  	    /**
  	     * @example chroma.num(0x663399) // rebeccapurple
  	     */
  	    function num(num) {
  	        const [r, g, b] = num2rgb(num);
  	        return new Color(r, g, b);
  	    }
  	    chroma.num = num;
  	    function rgb(...args) {
  	        return guess(args, "rgb");
  	    }
  	    chroma.rgb = rgb;
  	    function xyz(...args) {
  	        return guess(args, "xyz");
  	    }
  	    chroma.xyz = xyz;
  	    /**
  	     * Similar to chroma.mix, but accepts more than two colors.
  	     *
  	     * @example colors = ['#ddd', 'yellow', 'red', 'teal']
  	     * @example chroma.average(colors) // default = 'rgb'
  	     * @example chroma.average(colors, 'lab')
  	     * @example chroma.average(colors, 'lch')
  	     * @example chroma.average(colors, 'lrgb')
  	     * @example chroma.average(['red', 'rgba(0,0,0,0.5)']).css()
  	     */
  	    function average(chromables, mode = "rgb") {
  	        const colors = chromables.map(c => chroma(c));
  	        if (mode == "lrgb") {
  	            return _average_lrgb(colors);
  	        }
  	        if (mode == "num") {
  	            let numSum = 0, alphaSum = 0;
  	            for (const col of colors) {
  	                numSum += col.num();
  	                alphaSum += col.alpha();
  	            }
  	            return num(numSum / colors.length).alpha(alphaSum / colors.length);
  	        }
  	        const xyz = [0, 0, 0];
  	        let dx = 0;
  	        let dy = 0;
  	        let alphaSum = 0;
  	        for (const c of colors) {
  	            const xyz2 = c[mode]();
  	            alphaSum += c.alpha();
  	            for (let i = 0; i < xyz.length; i++) {
  	                if (mode.charAt(i) == "h") {
  	                    const A = (xyz2[i] / 180) * PI;
  	                    dx += cos(A);
  	                    dy += sin(A);
  	                }
  	                else {
  	                    xyz[i] += xyz2[i];
  	                }
  	            }
  	        }
  	        for (let i = 0; i < xyz.length; i++) {
  	            if (mode.charAt(i) == "h") {
  	                const A = atan2(dy / colors.length, dx / colors.length) * RAD2DEG;
  	                xyz[i] = (A + 360) % 360;
  	            }
  	            else {
  	                xyz[i] = xyz[i] / colors.length;
  	            }
  	        }
  	        return guess(xyz, mode).alpha(alphaSum / colors.length);
  	    }
  	    chroma.average = average;
  	    function bezier(...args) {
  	        const chromables = Array.isArray(args[0]) ? args[0] : args;
  	        const f = _bezier(chromables);
  	        f.scale = CubeHelix.prototype.scale;
  	        return f;
  	    }
  	    chroma.bezier = bezier;
  	    /**
  	     * Blends two colors using RGB channel-wise blend functions.
  	     * @param bottom
  	     * @param top
  	     * @param mode
  	     * @example chroma.blend('4CBBFC', 'EEEE22', 'multiply')
  	     * @example chroma.blend('4CBBFC', 'EEEE22', 'darken')
  	     * @example chroma.blend('4CBBFC', 'EEEE22', 'lighten')
  	     */
  	    function blend(bottom, top, mode) {
  	        if (!blend_fs[mode]) {
  	            throw new Error("unknown blend mode " + mode);
  	        }
  	        return blend_fs[mode](bottom, top);
  	    }
  	    chroma.blend = blend;
  	    let blend_fs;
  	    (function (blend_fs) {
  	        blend_fs.normal = blend_f(each((a, _) => a));
  	        blend_fs.multiply = blend_f(each((a, b) => (a * b) / 255));
  	        blend_fs.screen = blend_f(each(_screen));
  	        blend_fs.overlay = blend_f(each(_overlay));
  	        blend_fs.darken = blend_f(each(min));
  	        blend_fs.lighten = blend_f(each(max));
  	        blend_fs.dodge = blend_f(each(_dodge));
  	        blend_fs.burn = blend_f(each(_burn));
  	    })(blend_fs || (blend_fs = {}));
  	    function scale(...args) {
  	        const f = (t => f._at(t));
  	        Object.getOwnPropertyNames(Scale.prototype).forEach(key => (f[key] = Scale.prototype[key]));
  	        if (Array.isArray(args[0]))
  	            args = args[0];
  	        if (args.length == 1 && "string" == typeof args[0])
  	            args = chroma.brewer[args[0]];
  	        f._init("function" == typeof args[0] ? args[0] : args.map(a => chroma(a)));
  	        //f.setColors(args.length > 1 ? args : args[0])
  	        return f;
  	    }
  	    chroma.scale = scale;
  	    class Scale {
  	        classes(classes) {
  	            if (undefined === classes) {
  	                return this._classes;
  	            }
  	            if (Array.isArray(classes)) {
  	                this._classes = classes;
  	                this.domain(classes[0], classes[classes.length - 1]);
  	            }
  	            else {
  	                if (classes % 1 != 0 || classes < 1)
  	                    throw new Error("invalid classes param");
  	                // const d = analyze(this.domain())
  	                this._classes = limits(this.domain(), "e", classes);
  	            }
  	            return this;
  	        }
  	        domain(...domain) {
  	            if (undefined === domain[0]) {
  	                return "function" !== typeof this._colors
  	                    ? this._pos.map(p => lerp(this._min, this._max, p))
  	                    : [this._min, this._max];
  	            }
  	            this._min = domain[0];
  	            this._max = domain[domain.length - 1];
  	            if (2 == domain.length) {
  	                if ("function" !== typeof this._colors) {
  	                    // equidistant positions
  	                    this._pos = this._colors.map((_, c) => c / (this._colors.length - 1));
  	                }
  	            }
  	            else if ("function" !== typeof this._colors && domain.length == this._colors.length) {
  	                this._pos = domain.map(d => lerpInv(this._min, this._max, d));
  	            }
  	            else {
  	                throw new Error("invalid domain " + domain);
  	            }
  	            return this;
  	        }
  	        mode(mode) {
  	            if (undefined === mode) {
  	                return this._mode;
  	            }
  	            this._mode = mode;
  	            this._resetCache();
  	            return this;
  	        }
  	        /**
  	         * Set the output format return by `this(x)` and `this.colors(n)`.
  	         * @param _o The color format to use. Pass `undefined` to return [Color] objects.
  	         * @return `this`
  	         * @example chroma.scale("red", "white").out("hex")(0) // == "#ff0000"
  	         * @example chroma.scale("red", "white").out("num").colors(2) // == [0xff0000, 0xffffff]
  	         */
  	        out(_o) {
  	            this._out = _o;
  	            return this;
  	        }
  	        /**
  	         * This makes sure the lightness range is spread evenly across a color scale. Especially useful when working
  	         * with [multi-hue color scales](https://www.vis4.net/blog/2013/09/mastering-multi-hued-color-scales/), where
  	         * simple gamma correction can't help you very much.
  	         *
  	         * @example chroma.scale('black','red','yellow','white')
  	         * @example chroma.scale('black','red','yellow','white').correctLightness()
  	         */
  	        correctLightness(enableCorrectLightness = true) {
  	            if (this._correctLightness != enableCorrectLightness) {
  	                this._resetCache();
  	                const colors = this._colors;
  	                if (enableCorrectLightness && "function" !== typeof colors) {
  	                    // make sure that the colors have ascending or descending lightnesses
  	                    let sign = 0;
  	                    for (let i = 1; i < colors.length; i++) {
  	                        const sign2 = colors[i].lab()[0] - colors[i - 1].lab()[0];
  	                        if (0 == sign) {
  	                            sign = sign2;
  	                        }
  	                        else if (sign * sign2 < 0) {
  	                            throw new Error("scale color lightnesses must be monotonic");
  	                        }
  	                    }
  	                }
  	            }
  	            this._correctLightness = enableCorrectLightness;
  	            return this;
  	        }
  	        padding(paddingLeft, paddingRight = paddingLeft) {
  	            if (!paddingLeft) {
  	                return [this._paddingLeft, this._paddingRight];
  	            }
  	            this._paddingLeft = paddingLeft;
  	            this._paddingRight = paddingRight;
  	            return this;
  	        }
  	        /**
  	         * Get a number of equidistant colors.
  	         * @param numColors The number of colors to return.
  	         * @param format Output format. Defaults to `"hex"`. Pass `false` to get {@link Color} objects.
  	         * @returns If `numColors` is `undefined`, the colors which define this [Scale]. If `numColors` is 1,
  	         * `[this((min + max) / 2)]`. Otherwise, an array where the first element is `this(min)`, the last one is
  	         * `this(max)` and the rest are equidistant samples between min and max.
  	         * @example chroma.scale('OrRd').colors(5)
  	         * @example chroma.scale(['white', 'black']).colors(12)
  	         */
  	        colors(numColors, format = "hex") {
  	            let result;
  	            if (undefined === numColors) {
  	                result = this._colors.slice();
  	            }
  	            else if (numColors == 1) {
  	                result = [this._color((this._min + this._max) / 2)];
  	            }
  	            else if (numColors > 1) {
  	                result = Array.from({ length: numColors }, (_, i) => this._color(lerp(this._min, this._max, i / (numColors - 1))));
  	            }
  	            else {
  	                // returns all colors based on the defined classes
  	                let samples;
  	                if (this._classes && this._classes.length > 2) {
  	                    samples = Array.from({ length: this._classes.length - 1 }, (_, i) => (this._classes[i] + this._classes[i + 1]) * 0.5);
  	                }
  	                else {
  	                    samples = this.domain(); // TODO?!
  	                }
  	                result = samples.map(s => this._color(s));
  	            }
  	            return format ? result.map(c => c[format]()) : result;
  	        }
  	        cache(enableCache) {
  	            if (undefined === enableCache) {
  	                return !!this._cache;
  	            }
  	            this._cache = enableCache ? this._cache || new Map() : undefined;
  	            return this;
  	        }
  	        gamma(gamma) {
  	            if (undefined === gamma) {
  	                return this._gamma;
  	            }
  	            this._gamma = gamma;
  	            return this;
  	        }
  	        _at(t) {
  	            const c = this._color(t);
  	            return this._out ? c[this._out]() : c;
  	        }
  	        _init(colorsOrFunction) {
  	            this._colors = colorsOrFunction;
  	            if ("function" != typeof colorsOrFunction) {
  	                this._pos = colorsOrFunction.map((_, i) => i / (colorsOrFunction.length - 1));
  	            }
  	            this._mode = "rgb";
  	            this.domain(0, 1);
  	            this._paddingLeft = 0;
  	            this._paddingRight = 0;
  	            this._correctLightness = false;
  	            this._cache = new Map();
  	            this._gamma = 1;
  	        }
  	        _getClass(value) {
  	            return this._classes.findIndex(cls => value <= cls) - 1;
  	        }
  	        _color(val, bypassMap = false) {
  	            let t;
  	            if (!bypassMap) {
  	                const min = this._min, max = this._max;
  	                if (this._classes && this._classes.length > 2) {
  	                    const c = this._getClass(val);
  	                    t = c / (this._classes.length - 2);
  	                }
  	                else if (max !== min) {
  	                    t = (val - min) / (max - min);
  	                }
  	                else {
  	                    t = 1;
  	                }
  	                if (this._correctLightness) {
  	                    t = this._tCorrectedLightness(t);
  	                }
  	            }
  	            else {
  	                t = val;
  	            }
  	            t = t ** this._gamma;
  	            t = (this._paddingLeft + t) / (1 + this._paddingLeft + this._paddingRight);
  	            //	t = this._paddingLeft + t * (1 - this._paddingLeft - this._paddingRight)
  	            t = clamp(t, 0, 1);
  	            const tHash = t;
  	            const cacheResult = this._cache && this._cache.get(tHash);
  	            if (cacheResult) {
  	                return cacheResult;
  	            }
  	            else {
  	                let col;
  	                if (Array.isArray(this._colors)) {
  	                    for (let i = 0; i < this._pos.length; i++) {
  	                        const p = this._pos[i];
  	                        if (t <= p) {
  	                            col = this._colors[i];
  	                            break;
  	                        }
  	                        if (t >= p && i == this._pos.length - 1) {
  	                            col = this._colors[i];
  	                            break;
  	                        }
  	                        if (t > p && t < this._pos[i + 1]) {
  	                            t = (t - p) / (this._pos[i + 1] - p);
  	                            col = mix(this._colors[i], this._colors[i + 1], t, this._mode);
  	                            break;
  	                        }
  	                    }
  	                }
  	                else {
  	                    col = this._colors(t);
  	                }
  	                if (this._cache) {
  	                    // tslint:disable-next-line
  	                    this._cache.set(tHash, col);
  	                }
  	                // tslint:disable-next-line
  	                return col;
  	            }
  	        }
  	        _tCorrectedLightness(t0_1) {
  	            const L0 = this._color(0, true).lab()[0];
  	            const L1 = this._color(1, true).lab()[0];
  	            const L_ideal = lerp(L0, L1, t0_1);
  	            return newtonIterate1d(t => this._color(t, true).lab()[0] - L_ideal, t0_1, 8);
  	        }
  	        _resetCache() {
  	            if (this._cache)
  	                this._cache.clear();
  	        }
  	    }
  	    chroma.Scale = Scale;
  	    let scales;
  	    (function (scales) {
  	        /**
  	         * @example chroma.scales.cool()
  	         */
  	        function cool() {
  	            return scale([hsl(180, 1, 0.9), hsl(250, 0.7, 0.4)]);
  	        }
  	        scales.cool = cool;
  	        /**
  	         * @example chroma.scales.hot()
  	         */
  	        function hot() {
  	            return scale(["#000", "#f00", "#ff0", "#fff"]).mode("rgb");
  	        }
  	        scales.hot = hot;
  	    })(scales = chroma.scales || (chroma.scales = {}));
  	    /**
  	     * Computes the WCAG contrast ratio between two colors. A minimum contrast of 4.5:1
  	     * [is recommended](http://www.w3.org/TR/WCAG20-TECHS/G18.html) to ensure that text is still readable against a
  	     * background color.
  	     *
  	     * @param a
  	     * @param b
  	     */
  	    function contrast(a, b) {
  	        const l1 = chroma(a).luminance();
  	        const l2 = chroma(b).luminance();
  	        if (l1 > l2) {
  	            return (l1 + 0.05) / (l2 + 0.05);
  	        }
  	        else {
  	            return (l2 + 0.05) / (l1 + 0.05);
  	        }
  	    }
  	    chroma.contrast = contrast;
  	    /**
  	     * Compute the [euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance#Three_dimensions) between two colors.
  	     * @param a First color.
  	     * @param b Second color.
  	     * @param mode The color space in which to compute the distance. Defaults to "lab".
  	     * @example chroma.distance('#fff', '#ff0', 'rgb')
  	     * @example chroma.distance('#fff', '#f0f', 'rgb')
  	     * @example chroma.distance('#fff', '#ff0')
  	     * @example chroma.distance('#fff', '#f0f')
  	     */
  	    function distance(a, b, mode = "lab") {
  	        const l1 = chroma(a)[mode]();
  	        const l2 = chroma(b)[mode]();
  	        const channelDifferences = l1.map((channelValue, channelIndex) => channelValue - l2[channelIndex]);
  	        return hypot(...channelDifferences);
  	    }
  	    chroma.distance = distance;
  	    /**
  	     * Computes color difference as developed by the Colour Measurement Committee of the Society of Dyers and Colourists
  	     * (CMC) in 1984. The implementation is adapted from Bruce Lindbloom. The parameters L and C are weighting factors
  	     * for lightness and chromaticity.
  	     * @param reference
  	     * @param sample
  	     * @param L
  	     * @param C
  	     * @example [r = '#ededee', s = '#edeeed', chroma.deltaE(r, s)]
  	     * @example [r = '#ececee', s = '#eceeec', chroma.deltaE(r, s)]
  	     * @example [r = '#e9e9ee', s = '#e9eee9', chroma.deltaE(r, s)]
  	     * @example [r = '#e4e4ee', s = '#e4eee4', chroma.deltaE(r, s)]
  	     * @example [r = '#e0e0ee', s = '#e0eee0', chroma.deltaE(r, s)]
  	     */
  	    function deltaE(reference, sample, L = 1, C = 1) {
  	        const [L1, a1, b1] = chroma(reference).lab();
  	        const [L2, a2, b2] = chroma(sample).lab();
  	        const c1 = sqrt(a1 * a1 + b1 * b1);
  	        const c2 = sqrt(a2 * a2 + b2 * b2);
  	        const sl = L1 < 16.0 ? 0.511 : (0.040975 * L1) / (1.0 + 0.01765 * L1);
  	        const sc = (0.0638 * c1) / (1.0 + 0.0131 * c1) + 0.638;
  	        const h1 = norm360(c1 < 0.000001 ? 0.0 : (atan2(b1, a1) * 180.0) / PI);
  	        const t = h1 >= 164.0 && h1 <= 345.0
  	            ? 0.56 + abs(0.2 * cos((PI * (h1 + 168.0)) / 180.0))
  	            : 0.36 + abs(0.4 * cos((PI * (h1 + 35.0)) / 180.0));
  	        const c4 = c1 * c1 * c1 * c1;
  	        const f = sqrt(c4 / (c4 + 1900.0));
  	        const sh = sc * (f * t + 1.0 - f);
  	        const delL = L1 - L2;
  	        const delC = c1 - c2;
  	        const delA = a1 - a2;
  	        const delB = b1 - b2;
  	        const dH2 = delA * delA + delB * delB - delC * delC;
  	        const v1 = delL / (L * sl);
  	        const v2 = delC / (C * sc);
  	        const v3 = sh;
  	        return sqrt(v1 * v1 + v2 * v2 + dH2 / (v3 * v3));
  	    }
  	    chroma.deltaE = deltaE;
  	    function analyze(data) {
  	        const r = {
  	            min: Infinity,
  	            max: -Infinity,
  	            sum: 0,
  	            values: [],
  	            count: 0,
  	        };
  	        function add(val) {
  	            if (val != undefined && !isNaN(val)) {
  	                r.values.push(val);
  	                r.sum += val;
  	                if (val < r.min)
  	                    r.min = val;
  	                if (val > r.max)
  	                    r.max = val;
  	                r.count += 1;
  	            }
  	        }
  	        data.forEach(val => add(val));
  	        r.domain = [r.min, r.max];
  	        r.limits = function (mode, num) {
  	            return limits(this, mode, num);
  	        };
  	        return r;
  	    }
  	    chroma.analyze = analyze;
  	    function limits(data, mode = "e", num = 7) {
  	        const info = Array.isArray(data) ? analyze(data) : data;
  	        const { min, max, values } = info;
  	        values.sort((a, b) => a - b);
  	        if (num == 1) {
  	            return [min, max];
  	        }
  	        if (mode.startsWith("c")) {
  	            return [min, max];
  	        }
  	        else if (mode.startsWith("e")) {
  	            return Array.from({ length: num + 1 }, (_, i) => lerp(min, max, i / num));
  	        }
  	        else if (mode.startsWith("l")) {
  	            if (min <= 0) {
  	                throw new Error("Logarithmic scales are only possible for values > 0");
  	            }
  	            const min_log = Math.LOG10E * log(min);
  	            const max_log = Math.LOG10E * log(max);
  	            return Array.from({ length: num + 1 }, (_, i) => 10 ** lerp(min_log, max_log, i / num));
  	        }
  	        else if (mode.startsWith("q")) {
  	            return Array.from({ length: num + 1 }, (_, i) => {
  	                const p = ((values.length - 1) * i) / num;
  	                const pb = floor(p);
  	                return pb == p ? values[pb] : lerp(values[pb], values[pb + 1], p - pb);
  	            });
  	        }
  	        else if (mode.startsWith("k")) {
  	            // implementation based on
  	            // http://code.google.com/p/figue/source/browse/trunk/figue.js#336
  	            // simplified for 1-d input values
  	            const n = values.length;
  	            const assignments = new Array(n);
  	            const clusterSizes = new Array(num);
  	            let repeat = true;
  	            let nb_iters = 0;
  	            let centroids = Array.from({ length: num + 1 }, (_, i) => lerp(min, max, i / num));
  	            do {
  	                // assignment step
  	                clusterSizes.fill(0);
  	                for (let i = 0; i < values.length; i++) {
  	                    const value = values[i];
  	                    const minDistIndex = indexOfMax(centroids, c => -abs(c - value));
  	                    clusterSizes[minDistIndex]++;
  	                    assignments[i] = minDistIndex;
  	                }
  	                // update centroids step
  	                const newCentroids = new Array(num).fill(0);
  	                for (let i = 0; i < assignments.length; i++) {
  	                    const cluster = assignments[i];
  	                    newCentroids[cluster] += values[i];
  	                }
  	                for (let j = 0; j < newCentroids.length; j++) {
  	                    newCentroids[j] /= clusterSizes[j];
  	                }
  	                // check convergence
  	                repeat = newCentroids.some((nc, j) => nc != centroids[j]);
  	                centroids = newCentroids;
  	            } while (nb_iters++ < 200 && repeat);
  	            // finished k-means clustering
  	            // the next part is borrowed from gabrielflor.it
  	            const kClusters = Array.from({ length: num }, () => []);
  	            for (let i = 0; i < assignments.length; i++) {
  	                const cluster = assignments[i];
  	                kClusters[cluster].push(values[i]);
  	            }
  	            const tmpKMeansBreaks = [];
  	            for (const kCluster of kClusters) {
  	                tmpKMeansBreaks.push(kCluster[0], kCluster[kCluster.length - 1]);
  	            }
  	            tmpKMeansBreaks.sort((a, b) => a - b);
  	            const limits = [];
  	            limits.push(tmpKMeansBreaks[0]);
  	            for (let i = 1; i < tmpKMeansBreaks.length; i += 2) {
  	                const v = tmpKMeansBreaks[i];
  	                if (!isNaN(v) && limits.indexOf(v) == -1) {
  	                    limits.push(v);
  	                }
  	            }
  	            return limits;
  	        }
  	        else {
  	            throw new Error("unknown mode");
  	        }
  	    }
  	    chroma.limits = limits;
  	})(chroma || (chroma = {}));
  	const interpolators = {};
  	// const _guess_formats: { p: number; test: (args: any[]) => ColorFormat | undefined }[] = []
  	const _input = {};
  	function linear_interpolator(col1, col2, f, m) {
  	    const xyz1 = col1[m]();
  	    const xyz2 = col2[m]();
  	    return guess([
  	        lerp(xyz1[0], xyz2[0], f),
  	        lerp(xyz1[1], xyz2[1], f),
  	        lerp(xyz1[2], xyz2[2], f),
  	        lerp(col1.alpha(), col2.alpha(), f),
  	    ], m);
  	}
  	interpolators.xyz = interpolators.rgb = interpolators.lab = linear_interpolator;
  	interpolators.num = function (col1, col2, f) {
  	    const n1 = col1.num();
  	    const n2 = col2.num();
  	    return chroma.num(lerp(n1, n2, f));
  	};
  	interpolators.lrgb = function (col1, col2, f) {
  	    const [r1, g1, b1, a1] = col1.rgba(false, false);
  	    const [r2, g2, b2, a2] = col2.rgba(false, false);
  	    return new chroma.Color(sqrt(r1 ** 2 * (1 - f) + r2 ** 2 * f), sqrt(g1 ** 2 * (1 - f) + g2 ** 2 * f), sqrt(b1 ** 2 * (1 - f) + b2 ** 2 * f), lerp(a1, a2, f));
  	};
  	function _bezier(chromables) {
  	    const colors = chromables.map(c => chroma(c));
  	    const [lab0, lab1, lab2, lab3] = colors.map(c => c.lab());
  	    if (2 == chromables.length) {
  	        // linear interpolation
  	        return t => {
  	            return chroma.lab([0, 1, 2].map(i => lerp(lab0[i], lab1[i], t)));
  	        };
  	    }
  	    else if (3 == chromables.length) {
  	        // quadratic bezier interpolation
  	        const bezier2 = (p0, p1, p2, t) => (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2;
  	        return t => chroma.lab([0, 1, 2].map(i => bezier2(lab0[i], lab1[i], lab2[i], t)));
  	    }
  	    else if (4 == chromables.length) {
  	        // cubic bezier interpolation
  	        const bezier3 = (p0, p1, p2, p3, t) => (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;
  	        return t => chroma.lab([0, 1, 2].map(i => bezier3(lab0[i], lab1[i], lab2[i], lab3[i], t)));
  	    }
  	    else if (5 == chromables.length) {
  	        const I0 = _bezier(colors.slice(0, 3));
  	        const I1 = _bezier(colors.slice(2, 5));
  	        return t => (t < 0.5 ? I0(t * 2) : I1((t - 0.5) * 2));
  	    }
  	    else
  	        throw new Error();
  	}
  	function guess(args, mode) {
  	    if (Array.isArray(args[0]))
  	        args = args[0];
  	    if (!mode) {
  	        if (args.length == 1 && args[0] in chroma.w3cx11) {
  	            mode = "name";
  	        }
  	        else if (args.length == 1 && "string" == typeof args[0]) {
  	            mode = "css";
  	        }
  	        else if (args.length == 3) {
  	            mode = "rgb";
  	        }
  	        else if (args.length == 4 && "number" == typeof args[3] && args[3] >= 0 && args[3] <= 1) {
  	            mode = "rgb";
  	        }
  	        else if (args.length == 1 && "number" == typeof args[0] && args[0] >= 0 && args[0] <= 0xffffff) {
  	            mode = "num";
  	        }
  	        else
  	            throw new Error("could not guess mode. args " + JSON.stringify(args));
  	    }
  	    const [r, g, b, a] = _input[mode](...args);
  	    return new chroma.Color(r, g, b, a);
  	}
  	function _average_lrgb(colors) {
  	    let rSquareSum = 0, gSquareSum = 0, bSquareSum = 0, alphaSum = 0;
  	    for (const col of colors) {
  	        const [r, g, b, alpha] = col.rgba(false, false);
  	        rSquareSum += r ** 2;
  	        gSquareSum += g ** 2;
  	        bSquareSum += b ** 2;
  	        alphaSum += alpha;
  	    }
  	    return new chroma.Color(sqrt(rSquareSum) / colors.length, sqrt(gSquareSum) / colors.length, sqrt(bSquareSum) / colors.length, alphaSum / colors.length);
  	}
  	function hex2rgb(hex) {
  	    let m;
  	    if ((m = hex.match(/^#?([A-F\d]{2})([A-F\d]{2})([A-F\d]{2})([A-F\d]{2})?$/i))) {
  	        return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16), m[4] ? parseInt(m[4], 16) / 255 : 1];
  	    }
  	    else if ((m = hex.match(/^#?([A-F\d])([A-F\d])([A-F\d])([A-F\d])?$/i))) {
  	        return [
  	            parseInt(m[1], 16) * 0x11,
  	            parseInt(m[2], 16) * 0x11,
  	            parseInt(m[3], 16) * 0x11,
  	            m[4] ? (parseInt(m[4], 16) * 0x11) / 255 : 1,
  	        ];
  	    }
  	    throw new Error("invalid hex color: " + hex);
  	}
  	function rgb2hex(r255, g255, b255, a1, mode = "rgb") {
  	    r255 = clamp(round(r255), 0, 255);
  	    g255 = clamp(round(g255), 0, 255);
  	    b255 = clamp(round(b255), 0, 255);
  	    const rgb = (r255 << 16) | (g255 << 8) | b255;
  	    const rgbString = rgb.toString(16).padStart(6, "0");
  	    const alphaString = round(clamp(a1) * 255)
  	        .toString(16)
  	        .padStart(2, "0");
  	    return "#" + ("argb" == mode ? alphaString + rgbString : "rgba" == mode ? rgbString + alphaString : rgbString);
  	}
  	_input.lrgb = _input.rgb;
  	_input.hex = hex2rgb;
  	_input.hsl = hsl2rgb;
  	function norm360(degrees) {
  	    return ((degrees % 360) + 360) % 360;
  	}
  	_input.hsv = hsv2rgb;
  	function num2rgb(num) {
  	    if (!("number" == typeof num && num >= 0 && num <= 0xffffff)) {
  	        throw new Error("unknown num color: " + num);
  	    }
  	    const r = num >> 16;
  	    const g = (num >> 8) & 0xff;
  	    const b = num & 0xff;
  	    return [r, g, b, 1];
  	}
  	function rgb2num(r255, g255, b255, a1 = 1, mode = "rgb") {
  	    const rgbNum = (round(r255) << 16) | (round(g255) << 8) | round(b255);
  	    if ("rgb" === mode) {
  	        return rgbNum;
  	    }
  	    else if ("rgba" === mode) {
  	        return (rgbNum << 8) | (round(a1 * 255) << 24);
  	    }
  	    else {
  	        return (round(a1 * 255) << 24) | rgbNum;
  	    }
  	}
  	_input.num = num2rgb;
  	const WS = "\\s*";
  	const FLOAT = "([+-]?(?:\\d*\\.?)?\\d+(?:[eE][+-]?\\d+)?)";
  	const CSS_RGB_REGEX = new RegExp(["^rgba?\\(", FLOAT, ",", FLOAT, ",", FLOAT, "(?:,", FLOAT + "(%)?", ")?\\)$"].join(WS), "i");
  	const CSS_RGB_WS_REGEX = new RegExp(["^rgba?\\(", FLOAT, FLOAT, FLOAT, "(?:/", FLOAT + "(%)?", ")?\\)$"].join(WS), "i");
  	const CSS_RGB_PERCENT_REGEX = new RegExp(["^rgba?\\(", FLOAT + "%", ",", FLOAT + "%", ",", FLOAT + "%", "(?:,", FLOAT + "(%)?", ")?\\)$"].join(WS), "i");
  	const CSS_RGB_WS_PERCENT_REGEX = new RegExp(["^rgba?\\(", FLOAT + "%", FLOAT + "%", FLOAT + "%", "(?:/", FLOAT + "(%)?", ")?\\)$"].join(WS), "i");
  	const CSS_HSL_REGEX = new RegExp(["^hsla?\\(", FLOAT + "(deg|rad|turn)?", ",", FLOAT + "%", ",", FLOAT + "%", "(?:,", FLOAT + "(%)?", ")?\\)$"].join(WS), "i");
  	const CSS_HSL_WS_REGEX = new RegExp(["^hsla?\\(", FLOAT + "(deg|rad|turn)?\\s+" + FLOAT + "%", FLOAT + "%", "(?:/", FLOAT + "(%)?", ")?\\)$"].join(WS), "i");
  	function css2rgb(css) {
  	    if (chroma.w3cx11 && chroma.w3cx11[css.toLowerCase()]) {
  	        return num2rgb(chroma.w3cx11[css.toLowerCase()]);
  	    }
  	    let m;
  	    if ((m = css.match(CSS_RGB_REGEX) || css.match(CSS_RGB_WS_REGEX))) {
  	        return [
  	            clamp(+m[1], 0, 255),
  	            clamp(+m[2], 0, 255),
  	            clamp(+m[3], 0, 255),
  	            m[4] ? clamp(m[5] ? +m[4] / 100 : +m[4]) : 1,
  	        ];
  	    }
  	    else if ((m = css.match(CSS_RGB_PERCENT_REGEX) || css.match(CSS_RGB_WS_PERCENT_REGEX))) {
  	        return [
  	            clamp(+m[1] / 100) * 255,
  	            clamp(+m[2] / 100) * 255,
  	            clamp(+m[3] / 100) * 255,
  	            m[4] ? clamp(m[5] ? +m[4] / 100 : +m[4]) : 1,
  	        ];
  	    }
  	    else if ((m = css.match(CSS_HSL_REGEX) || css.match(CSS_HSL_WS_REGEX))) {
  	        const CONVERSION = { deg: 1, rad: RAD2DEG, turn: 360 };
  	        const angleUnit = (m[2] ? m[2].toLowerCase() : "deg");
  	        return hsl2rgb((((+m[1] * CONVERSION[angleUnit]) % 360) + 360) % 360, clamp(+m[3] / 100), clamp(+m[4] / 100), m[5] ? clamp(m[6] ? +m[5] / 100 : +m[5]) : 1);
  	    }
  	    else {
  	        return hex2rgb(css);
  	    }
  	}
  	function rgb2css(r, g, b, a = 1) {
  	    if (a >= 1) {
  	        return "rgb(" + [r, g, b].map(round).join(",") + ")";
  	    }
  	    else {
  	        return "rgba(" + [r, g, b].map(round).join(",") + "," + a + ")";
  	    }
  	}
  	function rnd(a) {
  	    return round(a * 100) / 100;
  	}
  	function hsl2css([h, s, l], alpha) {
  	    const mode = alpha < 1 ? "hsla" : "hsl";
  	    return (mode +
  	        "(" +
  	        rnd(h) +
  	        "," +
  	        rnd(s * 100) +
  	        "%" +
  	        "," +
  	        rnd(l * 100) +
  	        "%" +
  	        ("hsla" == mode ? "," + rnd(alpha) : "") +
  	        ")");
  	}
  	_input.css = css2rgb;
  	_input.name = function (name) {
  	    return num2rgb(chroma.w3cx11[name]);
  	};
  	function lch2lab(l, c, hueDegrees) {
  	    /*
  	    Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
  	    These formulas were invented by David Dalrymple to obtain maximum contrast without going
  	    out of gamut if the parameters are in the range 0-1.

  	    A saturation multiplier was added by Gregor Aisch
  	     */
  	    return [l, cos(hueDegrees * DEG2RAD) * c, sin(hueDegrees * DEG2RAD) * c];
  	}
  	function lch2rgb(l, c, hDegrees, alpha1 = 1) {
  	    const [, a, b] = lch2lab(l, c, hDegrees);
  	    return cielab2rgb(l, a, b, alpha1);
  	}
  	function lab2lch(l, a, b) {
  	    const c = hypot(a, b);
  	    const h = (atan2(b, a) * RAD2DEG + 360) % 360;
  	    return [l, c, h];
  	}
  	function rgb2lch(r255, g255, b255) {
  	    const [l, a, b2] = rgb2lab(r255, g255, b255);
  	    return lab2lch(l, a, b2);
  	}
  	_input.lch = lch2rgb;
  	function rgb2cmyk(r255, g255, b255) {
  	    r255 /= 255;
  	    g255 /= 255;
  	    b255 /= 255;
  	    const k = 1 - max(r255, g255, b255);
  	    if (1 == k)
  	        return [0, 0, 0, 1];
  	    const c = (1 - r255 - k) / (1 - k);
  	    const m = (1 - g255 - k) / (1 - k);
  	    const y = (1 - b255 - k) / (1 - k);
  	    return [c, m, y, k];
  	}
  	function cmyk2rgb(c1, m1, y1, k1, alpha1 = 1) {
  	    if (k1 == 1) {
  	        return [0, 0, 0, alpha1];
  	    }
  	    const r255 = 255 * (1 - c1) * (1 - k1);
  	    const g255 = 255 * (1 - m1) * (1 - k1);
  	    const b255 = 255 * (1 - y1) * (1 - k1);
  	    return [r255, g255, b255, alpha1];
  	}
  	_input.cmyk = cmyk2rgb;
  	_input.gl = function (r, g, b, a = 1) {
  	    return [r * 255, g * 255, b * 255, a];
  	};
  	//function rgb2luminance(r: number, g: number, b: number) {
  	//	// https://en.wikipedia.org/wiki/Relative_luminance
  	//	const [, Y] = rgb2xyz(r, g, b)
  	//	return Y
  	//}
  	function rgbChannel2RgbLinear(x255) {
  	    const x1 = x255 / 255;
  	    // http://entropymine.com/imageworsener/srgbformula/
  	    if (x1 <= 0.04045) {
  	        return x1 / 12.92;
  	    }
  	    else {
  	        return ((x1 + 0.055) / 1.055) ** 2.4;
  	    }
  	}
  	function rgbLinearChannel2Rgb(xLinear1) {
  	    if (xLinear1 <= 0.0031308) {
  	        return 255 * (12.92 * xLinear1);
  	    }
  	    else {
  	        return 255 * ((1 + 0.055) * xLinear1 ** (1 / 2.4) - 0.055);
  	    }
  	}
  	function kelvin2rgb(kelvin) {
  	    const t = kelvin / 100;
  	    let r, g, b;
  	    if (t < 66) {
  	        r = 255;
  	        g = -155.25485562709179 - 0.44596950469579133 * (t - 2) + 104.49216199393888 * log(t - 2);
  	        b = t < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (t - 10) + 115.67994401066147 * log(t - 10);
  	    }
  	    else {
  	        r = 351.97690566805693 + 0.114206453784165 * (t - 55) - 40.25366309332127 * log(t - 55);
  	        g = 325.4494125711974 + 0.07943456536662342 * (t - 50) - 28.0852963507957 * log(t - 50);
  	        b = 255;
  	    }
  	    return [r, g, b];
  	}
  	_input.rgb = (...args) => args;
  	function rgb2kelvin(r255, g255, b255) {
  	    console.log(b255 - r255);
  	    if (g255 + b255 < 158.61) {
  	        console.log("0 < t < 20");
  	        // calc from green
  	        return round(newtonIterate1d(t => g255 - (-155.25485562709179 - 0.44596950469579133 * (t - 2) + 104.49216199393888 * log(t - 2)), 15, 4) * 100);
  	        return (Math.E ** ((g255 + 155.25485562709179 + 0.44596950469579133 * (15 - 2)) / 104.49216199393888) + 2) * 100;
  	    }
  	    else if (b255 - r255 < 0) {
  	        console.log("20 < t < 66");
  	        return round(newtonIterate1d(t => b255 - (-254.76935184120902 + 0.8274096064007395 * (t - 10) + 115.67994401066147 * log(t - 10)), 43, 4) * 100);
  	        return ((Math.E ** ((b255 + 254.76935184120902 - 0.8274096064007395 * (43 - 10)) / 115.67994401066147) + 10) * 100);
  	    }
  	    else {
  	        console.log("0 < t < 400, start= " + (-1.4 * (r255 + g255) + 755));
  	        return round(newtonIterate1d(t => r255 - (351.97690566805693 + 0.114206453784165 * (t - 55) - 40.25366309332127 * log(t - 55)), -1.4 * (r255 + g255) + 755, 8) * 100);
  	        return ((r255 / 329.698727446) ** (1 / -0.1332047592) + 60) * 100;
  	    }
  	    return newtonIterate1d(k => {
  	        const eps = 1e-9;
  	        const [kr, kg, kb] = kelvin2rgb(k);
  	        const [kr2, kg2, kb2] = kelvin2rgb(k + eps);
  	        const dkr = (kr2 - kr) / eps, dkg = (kg2 - kg) / eps, dkb = (kb2 - kb) / eps;
  	        return dkr * (kr - r255) + dkg * (kg - g255) + dkb * (kb - b255);
  	        return kb / kr - b255 / r255;
  	    }, 
  	    //1000,
  	    //40000,
  	    Math.E ** ((b255 / r255 + 2.5) / 0.4), 20);
  	    let maxTemp = 40000;
  	    let minTemp = 1000;
  	    const eps = 0.4;
  	    let temp = 0;
  	    let rgb;
  	    while (maxTemp - minTemp > eps) {
  	        temp = (maxTemp + minTemp) * 0.5;
  	        rgb = kelvin2rgb(temp);
  	        if (rgb[2] / rgb[0] >= b255 / r255) {
  	            maxTemp = temp;
  	        }
  	        else {
  	            minTemp = temp;
  	        }
  	    }
  	    return round(temp);
  	}
  	_input.temperature = _input.kelvin = _input.K = kelvin2rgb;
  	function blend_f(f) {
  	    return function (bottom, top) {
  	        const [r, g, b] = f(chroma(top).rgb(), chroma(bottom).rgb());
  	        return chroma.rgb(r, g, b);
  	    };
  	}
  	function each(f) {
  	    return function (c1, c2) {
  	        return c1.map((e, i) => f(e, c2[i]));
  	    };
  	}
  	function _screen(a, b) {
  	    return 255 * (1 - (1 - a / 255) * (1 - b / 255));
  	}
  	function _overlay(a, b) {
  	    if (b < 128) {
  	        return (2 * a * b) / 255;
  	    }
  	    else {
  	        return 255 * (1 - 2 * (1 - a / 255) * (1 - b / 255));
  	    }
  	}
  	function _burn(a, b) {
  	    return 255 * (1 - (1 - b / 255) / (a / 255));
  	}
  	function _dodge(a, b) {
  	    if (a == 255) {
  	        return 255;
  	    }
  	    return 255 * min(1, b / 255 / (1 - a / 255));
  	}
  	/**
  	 * r, g, b can be in any interval (0-1 or 0-255)
  	 * @param r
  	 * @param g
  	 * @param b
  	 */
  	function rgb2hexhue(r, g, b) {
  	    const m = min(r, g, b);
  	    const M = max(r, g, b);
  	    const delta = M - m;
  	    let hueTurnX6; // angle as value between 0 and 6
  	    if (0 == delta) {
  	        hueTurnX6 = 0;
  	    }
  	    else if (r == M) {
  	        // second term to make sure the value is > 0
  	        hueTurnX6 = (g - b) / delta + (g < b ? 6 : 0);
  	    }
  	    else if (g == M) {
  	        hueTurnX6 = 2 + (b - r) / delta;
  	    }
  	    else {
  	        hueTurnX6 = 4 + (r - g) / delta;
  	    }
  	    return [hueTurnX6 * 60, m, M];
  	}
  	function hcxm2rgb(hueDegrees, c1, x1, m1, alpha1) {
  	    const m255 = m1 * 255;
  	    const cm255 = c1 * 255 + m255;
  	    const xm255 = x1 * 255 + m255;
  	    if (hueDegrees < 60) {
  	        return [cm255, xm255, m255, alpha1];
  	    }
  	    else if (hueDegrees < 120) {
  	        return [xm255, cm255, m255, alpha1];
  	    }
  	    else if (hueDegrees < 180) {
  	        return [m255, cm255, xm255, alpha1];
  	    }
  	    else if (hueDegrees < 240) {
  	        return [m255, xm255, cm255, alpha1];
  	    }
  	    else if (hueDegrees < 300) {
  	        return [xm255, m255, cm255, alpha1];
  	    }
  	    else {
  	        return [cm255, m255, xm255, alpha1];
  	    }
  	}
  	/**
  	 * https://en.wikipedia.org/w/index.php?title=HSL_and_HSV&oldid=856714654#From_HSL
  	 */
  	function hsl2rgb(hueDegrees, s1, l1, alpha1 = 1) {
  	    hueDegrees = norm360(hueDegrees);
  	    const c1 = (1 - abs(2 * l1 - 1)) * s1;
  	    return hcxm2rgb(hueDegrees, c1, c1 * (1 - abs(((hueDegrees / 60) % 2) - 1)), l1 - c1 / 2, alpha1);
  	}
  	function rgb2hsl(r255, g255, b255) {
  	    const [hue, min1, max1] = rgb2hexhue(r255 / 255, g255 / 255, b255 / 255);
  	    const l1 = (max1 + min1) / 2;
  	    let s1;
  	    if (max1 == min1) {
  	        s1 = 0;
  	    }
  	    else {
  	        s1 = l1 < 0.5 ? (max1 - min1) / (max1 + min1) : (max1 - min1) / (2 - max1 - min1);
  	    }
  	    return [hue, s1, l1];
  	}
  	function hsv2rgb(hueDegrees, s1, v1, alpha1 = 1) {
  	    hueDegrees = norm360(hueDegrees);
  	    const c1 = v1 * s1;
  	    return hcxm2rgb(hueDegrees, c1, c1 * (1 - abs(((hueDegrees / 60) % 2) - 1)), v1 - c1, alpha1);
  	}
  	function rgb2hsv(r255, g255, b255) {
  	    const [hue, min255, max255] = rgb2hexhue(r255, g255, b255);
  	    const delta255 = max255 - min255;
  	    const v1 = max255 / 255.0;
  	    const s1 = max255 == 0 ? 0 : delta255 / max255;
  	    return [hue, s1, v1];
  	}
  	function hcg2rgb(hueDegrees, c1, g1, alpha1 = 1) {
  	    hueDegrees = norm360(hueDegrees);
  	    const p = g1 * (1 - c1);
  	    return hcxm2rgb(hueDegrees, c1, c1 * (1 - abs(((hueDegrees / 60) % 2) - 1)), p, alpha1);
  	}
  	function rgb2hcg(r255, g255, b255) {
  	    const [hue, min255, max255] = rgb2hexhue(r255, g255, b255);
  	    const c1 = (max255 - min255) / 255;
  	    const _g1 = c1 < 1 ? min255 / 255 / (1 - c1) : 0;
  	    return [hue, c1, _g1];
  	}
  	_input.hcg = hcg2rgb;
  	function cielab2rgb(LStar100, aStar, bStar, alpha = 1) {
  	    const [x, y, z] = cielab2xyz(LStar100, aStar, bStar);
  	    return xyz2rgb(x, y, z, alpha);
  	}
  	function cielab2xyz(LStar100, aStar, bStar) {
  	    function fInv(t) {
  	        if (t > LAB_delta) {
  	            return t ** 3;
  	        }
  	        else {
  	            return LAB_3DeltaPow2 * (t - 4 / 29);
  	        }
  	    }
  	    return [
  	        LAB_Xn * fInv((LStar100 + 16) / 116 + aStar / 500),
  	        LAB_Yn * fInv((LStar100 + 16) / 116),
  	        LAB_Zn * fInv((LStar100 + 16) / 116 - bStar / 200),
  	    ];
  	}
  	function xyz2cielab(x, y, z) {
  	    // https://en.wikipedia.org/w/index.php?title=CIELAB_color_space&oldid=849576085#Forward_transformation
  	    function f(t) {
  	        if (t > LAB_deltaPow3) {
  	            return cbrt(t);
  	        }
  	        else {
  	            return t / LAB_3DeltaPow2 + 4 / 29;
  	        }
  	    }
  	    return [116 * f(y / LAB_Yn) - 16, 500 * (f(x / LAB_Xn) - f(y / LAB_Yn)), 200 * (f(y / LAB_Yn) - f(z / LAB_Zn))];
  	}
  	// const LAB_CONSTANTS = {
  	const LAB_Kn = 18;
  	const LAB_Xn = 0.95047;
  	const LAB_Yn = 1;
  	const LAB_Zn = 1.08883;
  	const LAB_delta = 0.206896552; // delta = 6 / 29
  	const LAB_3DeltaPow2 = 0.12841855; // 3 * delta ** 2
  	const LAB_deltaPow3 = 0.008856452; // delta ** 3
  	// }
  	function rgb2lab(r255, g255, b255) {
  	    const [x, y, z] = rgb2xyz(r255, g255, b255);
  	    return xyz2cielab(x, y, z);
  	}
  	function rgb2xyz(r255, g255, b255) {
  	    // https://en.wikipedia.org/wiki/SRGB#The_reverse_transformation
  	    const r1Linear = rgbChannel2RgbLinear(r255);
  	    const g1Linear = rgbChannel2RgbLinear(g255);
  	    const b1Linear = rgbChannel2RgbLinear(b255);
  	    const X = 0.4124564 * r1Linear + 0.3575761 * g1Linear + 0.1804375 * b1Linear;
  	    const Y = 0.2126729 * r1Linear + 0.7151522 * g1Linear + 0.072175 * b1Linear;
  	    const Z = 0.0193339 * r1Linear + 0.119192 * g1Linear + 0.9503041 * b1Linear;
  	    return [X, Y, Z];
  	}
  	function xyz2rgb(X1, Y1, Z1, alpha1 = 1) {
  	    // https://en.wikipedia.org/wiki/SRGB#The_forward_transformation_(CIE_XYZ_to_sRGB)
  	    const r1Linear = 3.2404542 * X1 - 1.5371385 * Y1 - 0.4985314 * Z1;
  	    const g1Linear = -0.969266 * X1 + 1.8760108 * Y1 + 0.041556 * Z1;
  	    const b1Linear = 0.0556434 * X1 - 0.2040259 * Y1 + 1.0572252 * Z1;
  	    return [rgbLinearChannel2Rgb(r1Linear), rgbLinearChannel2Rgb(g1Linear), rgbLinearChannel2Rgb(b1Linear), alpha1];
  	}
  	_input.xyz = xyz2rgb;
  	_input.lab = cielab2rgb;
  	function hsi2rgb(hueDegrees, s1, i1, alpha1 = 1) {
  	    /*
  	    borrowed from here:
  	    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
  	     */
  	    let r, g, b;
  	    let hRad = hueDegrees * DEG2RAD;
  	    if (hRad < (2 * PI) / 3) {
  	        b = (1 - s1) / 3;
  	        r = (1 + (s1 * cos(hRad)) / cos(PI / 3 - hRad)) / 3;
  	        g = 1 - (b + r);
  	    }
  	    else if (hRad < (4 * PI) / 3) {
  	        hRad -= (2 * PI) / 3;
  	        r = (1 - s1) / 3;
  	        g = (1 + (s1 * cos(hRad)) / cos(PI / 3 - hRad)) / 3;
  	        b = 1 - (r + g);
  	    }
  	    else {
  	        hRad -= (4 * PI) / 3;
  	        g = (1 - s1) / 3;
  	        b = (1 + (s1 * cos(hRad)) / cos(PI / 3 - hRad)) / 3;
  	        r = 1 - (g + b);
  	    }
  	    return [3 * i1 * r * 255, 3 * i1 * g * 255, 3 * i1 * b * 255, alpha1];
  	}
  	/**
  	 * For HSI, we use the direct angle calculation. I.e. atan2(beta, alpha). See wikipedia link.
  	 */
  	function rgb2hsi(r255, g255, b255) {
  	    // See https://en.wikipedia.org/wiki/HSL_and_HSV#Hue_and_chroma
  	    // See https://en.wikipedia.org/wiki/HSL_and_HSV#Lightness
  	    const r1 = r255 / 255;
  	    const g1 = g255 / 255;
  	    const b1 = b255 / 255;
  	    const i1 = (r1 + g1 + b1) / 3;
  	    if (r1 == g1 && g1 == b1) {
  	        return [0, 0, i1];
  	    }
  	    else {
  	        const alpha = (1 / 2) * (2 * r1 - g1 - b1);
  	        const beta = (sqrt(3) / 2) * (g1 - b1);
  	        const hRad = atan2(beta, alpha);
  	        const min1 = min(r1, g1, b1);
  	        const s1 = 1 - min1 / i1;
  	        return [(hRad < 0 ? 2 * PI + hRad : hRad) * RAD2DEG, s1, i1];
  	    }
  	}
  	_input.hsi = hsi2rgb;
  	interpolators.hsv = interpolators.hsl = interpolators.hsi = interpolators.lch = interpolators.hcg = function interpolate_hsx(color1, color2, f, m) {
  	    const [a1, b1, c1] = color1[m]();
  	    const [a2, b2, c2] = color2[m]();
  	    function lerpHue(hue1, hue2, f) {
  	        const dh = norm360(hue2 - hue1 + 180) - 180;
  	        return hue1 + f * dh;
  	    }
  	    return chroma[m](("h" == m.charAt(0) ? lerpHue : lerp)(a1, a2, f), lerp(b1, b2, f), ("h" == m.charAt(2) ? lerpHue : lerp)(c1, c2, f));
  	};
  	function indexOfMax(arr, f) {
  	    let maxValue = -Infinity, maxValueIndex = -1;
  	    for (let i = 0; i < arr.length; i++) {
  	        const value = f(arr[i]);
  	        if (value > maxValue) {
  	            maxValue = value;
  	            maxValueIndex = i;
  	        }
  	    }
  	    return maxValueIndex;
  	}
  	function withMax(arr, f) {
  	    return arr[indexOfMax(arr, f)];
  	}

  	exports.default = chroma$1;
  	exports.chroma = chroma;

  	Object.defineProperty(exports, '__esModule', { value: true });

  })));
  //# sourceMappingURL=index.umd.js.map
  });

  var chroma = unwrapExports(index_umd);

  const WGL = WebGLRenderingContext;
  class Buffer$$1 {
      /**
       * Provides a simple method of uploading data to a GPU buffer.
       *
       * @example
       *     const vertices = new Buffer(WGL.ARRAY_BUFFER, Float32Array)
       *     vertices.data = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]]
       *     vertices.compile()
       *
       * @example
       *     const indices = new Buffer(WGL.ELEMENT_ARRAY_BUFFER, Uint16Array)
       *     indices.data = [[0, 1, 2], [2, 1, 3]]
       *     indices.compile()
       *
       * @param target Specifies the target to which the buffer object is bound.
       * @param type
       */
      constructor(target, type) {
          this.target = target;
          this.type = type;
          this.buffer = undefined;
          this.data = [];
          /** Number of elements in buffer. 2 V3s is still 2, not 6. */
          this.count = 0;
          /** Space between elements in buffer. 3 for V3s. */
          this.spacing = 1;
          this.hasBeenCompiled = false;
          assert(target == WGL.ARRAY_BUFFER || target == WGL.ELEMENT_ARRAY_BUFFER, 'target == WGL.ARRAY_BUFFER || target == WGL.ELEMENT_ARRAY_BUFFER');
          assert(type == Float32Array || type == Uint16Array || type == Uint32Array, 'type == Float32Array || type == Uint16Array || type == Uint32Array');
          if (Uint16Array == type) {
              this.bindSize = WGL.UNSIGNED_SHORT;
          }
          else if (Uint32Array == type) {
              this.bindSize = WGL.UNSIGNED_INT;
          }
      }
      /**
       * Upload the contents of `data` to the GPU in preparation for rendering. The data must be a list of lists
       * where each inner list has the same length. For example, each element of data for vertex normals would be a
       * list of length three. This will remember the data length and element length for later use by shaders.
       *
       * This could have used `[].concat.apply([], this.data)` to flatten the array but Google
       * Chrome has a maximum number of arguments so the concatenations are chunked to avoid that limit.
       *
       * @param usage Either `WGL.STATIC_DRAW` or `WGL.DYNAMIC_DRAW`. Defaults to `WGL.STATIC_DRAW`
       */
      compile(usage = WGL.STATIC_DRAW, gl = currentGL$$1()) {
          assert(WGL.STATIC_DRAW == usage || WGL.DYNAMIC_DRAW == usage, 'WGL.STATIC_DRAW == type || WGL.DYNAMIC_DRAW == type');
          this.buffer = this.buffer || gl.createBuffer();
          let buffer;
          if (this.data.length == 0) {
              console.warn('empty buffer ' + this.name);
              //console.trace()
          }
          if (this.data.length == 0 || this.data[0] instanceof V3) {
              assert(!(this.data[0] instanceof V3) || this.type == Float32Array);
              V3.pack(this.data, (buffer = new this.type(this.data.length * 3))); // asserts that all
              // elements are V3s
              this.spacing = 3;
              this.count = this.data.length;
              this.maxValue = 0;
          }
          else {
              //assert(Array != this.data[0].constructor, this.name + this.data[0])
              if (Array.isArray(this.data[0])) {
                  const bufferLength = this.data.length * this.data[0].length;
                  buffer = new this.type(bufferLength);
                  let i = this.data.length, destPtr = bufferLength;
                  while (i--) {
                      const subArray = this.data[i];
                      let j = subArray.length;
                      while (j--) {
                          buffer[--destPtr] = subArray[j];
                      }
                  }
                  assert(0 == destPtr);
              }
              else {
                  buffer = new this.type(this.data);
              }
              const spacing = this.data.length ? buffer.length / this.data.length : 0;
              assert(spacing % 1 == 0, `buffer ${this.name} elements not of consistent size, average size is ` + spacing);
              {
                  if (10000 <= buffer.length) {
                      this.maxValue = 0;
                  }
                  else {
                      this.maxValue = Math.max.apply(undefined, buffer);
                  }
              }
              assert([1, 2, 3, 4].includes(spacing));
              this.spacing = spacing;
              this.count = this.data.length;
          }
          gl.bindBuffer(this.target, this.buffer);
          gl.bufferData(this.target, buffer, usage);
          this.hasBeenCompiled = true;
      }
  }

  const { cos, sin, PI: PI$2, min, max } = Math;
  const WGL$1 = WebGLRenderingContext;
  const tempM4_1 = new M4();
  const tempM4_2 = new M4();
  /**
   * @example new Mesh()
   *        .addIndexBuffer('TRIANGLES')
   *        .addIndexBuffer('LINES')
   *        .addVertexBuffer('normals', 'ts_Normal')
   */
  class Mesh$$1 extends Transformable {
      constructor() {
          super();
          this.hasBeenCompiled = false;
          this.vertexBuffers = {};
          this.indexBuffers = {};
          this.addVertexBuffer('vertices', 'ts_Vertex');
      }
      /**
       * Calculate area, volume and centroid of the mesh.
       *
       * The area is the sum of the areas of the triangles.
       *
       * For closed meshes, the volume is the contained volume. If the volume is inside-out, i.e. the face normals point
       * inwards, the returned value is negative. In general, this calculates the sum of the z-direction shadow volumes
       * of the triangles. The z-dir shadow volume is the cut-off prism with the triangle projected onto the XY plane as
       * the base face and the triangle itself as the top face.
       *
       * The centroid is the "mean point of all points inside the volume". If a uniform density is assumed, this is
       * equivalent to the center of gravity. In general, this calculates the weighted average of the centroids of all the
       * triangle shadow volumes.
       */
      calcVolume() {
          let totalVolumeX2 = 0, totalCentroidWithZX2 = V3.O, totalAreaX2 = 0;
          const triangles = this.TRIANGLES;
          const vertices = this.vertices;
          for (let i = 0; i < triangles.length; i += 3) {
              const ai = triangles[i + 0], bi = triangles[i + 1], ci = triangles[i + 2];
              const a = vertices[ai], b = vertices[bi], c = vertices[ci];
              const ab = b.minus(a), ac = c.minus(a);
              const normal = ab.cross(ac);
              //const centroidZ = (v0.z + v1.z + v2.z) / 3
              const faceCentroid = V3.add(a, b, c).div(3);
              //totalVolume += centroidZ * (area === v01.cross(v02).length() / 2) * v01.cross(v02).unit().z
              totalVolumeX2 += faceCentroid.z * normal.z;
              const faceAreaX2 = normal.length();
              totalAreaX2 += faceAreaX2;
              // NB: the shadow volume centroid does NOT have the same XY coordinates
              // as the face centroid.
              // calculate the weighted centroid of the shadow volume:
              // faceShadowCentroid = INTEGRATE [0; 1] (
              //   INTEGRATE [0; 1 - s] (
              //     normal.z *
              //     ((1 - s - t) a + s b + t c) *
              //     ((1 - s - t) a + s b + t c).z
              //   ) dt
              // ) ds
              // = (a (2 a.z + b.z + c.z) + b (a.z + 2 b.z + c.z) + c (a.z + b.z + 2 c.z)) / 24
              const faceShadowCentroid = V3.add(a.times(2 * a.z + b.z + c.z), b.times(a.z + 2 * b.z + c.z), c.times(a.z + b.z + 2 * c.z)).times(normal.z); // 1/24 factor is done at very end
              totalCentroidWithZX2 = totalCentroidWithZX2.plus(faceShadowCentroid);
          }
          // sumInPlaceTree adds negligible additional accuracy for XY sphere
          const volume = totalVolumeX2 / 2;
          return {
              volume,
              centroid: eq0(volume) ? V3.O : totalCentroidWithZX2.div(24 * volume).schur(new V3(1, 1, 0.5)),
              area: totalAreaX2 / 2,
          };
      }
      /**
       * Add a new vertex buffer with a list as a property called `name` on this object and map it to
       * the attribute called `attribute` in all shaders that draw this mesh.
       * @example new Mesh().addVertexBuffer('coords', 'ts_TexCoord')
       */
      addVertexBuffer(name, attribute) {
          assert(!this.vertexBuffers[attribute], 'Buffer ' + attribute + ' already exists.');
          //assert(!this[name])
          this.hasBeenCompiled = false;
          assert('string' == typeof name);
          assert('string' == typeof attribute);
          const buffer = (this.vertexBuffers[attribute] = new Buffer$$1(WGL$1.ARRAY_BUFFER, Float32Array));
          buffer.name = name;
          this[name] = [];
          return this;
      }
      /**
       * Add a new index buffer.
       * @example new Mesh().addIndexBuffer('TRIANGLES')
       * @example new Mesh().addIndexBuffer('LINES')
       */
      addIndexBuffer(name, type = WGL$1.UNSIGNED_SHORT) {
          this.hasBeenCompiled = false;
          const arrayType = WGL$1.UNSIGNED_SHORT == type ? Uint16Array : Uint32Array;
          const buffer = (this.indexBuffers[name] = new Buffer$$1(WGL$1.ELEMENT_ARRAY_BUFFER, arrayType));
          buffer.name = name;
          this[name] = [];
          return this;
      }
      concat(...others) {
          const result = new Mesh$$1();
          const allMeshes = [this].concat(others);
          Object.getOwnPropertyNames(this.vertexBuffers).forEach(attribute => {
              assert(others.every(other => !!other.vertexBuffers[attribute]));
              const bufferName = this.vertexBuffers[attribute].name;
              if ('ts_Vertex' !== attribute) {
                  result.addVertexBuffer(bufferName, attribute);
              }
              result[bufferName] = allMeshes.map(mesh => mesh[bufferName]).concatenated();
          });
          Object.getOwnPropertyNames(this.indexBuffers).forEach(name => {
              assert(others.every(other => !!other.indexBuffers[name]));
              result.addIndexBuffer(name, this.indexBuffers[name].bindSize);
              const newIndexBufferData = new Array(allMeshes.reduce((sum, mesh) => sum + mesh[name].length, 0));
              let ptr = 0;
              let startIndex = 0;
              for (const mesh of allMeshes) {
                  for (const index of mesh[name]) {
                      newIndexBufferData[ptr++] = startIndex + index;
                  }
                  startIndex += mesh.vertices.length;
              }
              result[name] = newIndexBufferData;
          });
          result.compile();
          return result;
      }
      /**
       * Upload all attached buffers to the GPU in preparation for rendering. This doesn't need to be called every
       * frame, only needs to be done when the data changes.
       *
       * Sets `this.hasBeenCompiled` to true.
       */
      compile(gl = currentGL$$1()) {
          // figure out shortest vertex buffer to make sure indexBuffers are in bounds
          let minVertexBufferLength = Infinity; // TODO, _minBufferName
          Object.getOwnPropertyNames(this.vertexBuffers).forEach(attribute => {
              const buffer = this.vertexBuffers[attribute];
              buffer.data = this[buffer.name];
              buffer.compile(undefined, gl);
              if (this[buffer.name].length < minVertexBufferLength) {
                  // _minBufferName = attribute
                  minVertexBufferLength = this[buffer.name].length;
              }
          });
          for (const name in this.indexBuffers) {
              const buffer = this.indexBuffers[name];
              buffer.data = this[buffer.name];
              buffer.compile(undefined, gl);
              // if (NLA_DEBUG && buffer.maxValue >= minVertexBufferLength) {
              // 	throw new Error(`max index value for buffer ${name}
              // 	is too large ${buffer.maxValue} min Vbuffer size: ${minVertexBufferLength} ${minBufferName}`)
              // }
          }
          this.hasBeenCompiled = true;
          return this;
      }
      static fromBinarySTL(stl) {
          return __awaiter$1(this, void 0, void 0, function* () {
              return new Promise((resolve, reject) => {
                  const mesh = new Mesh$$1().addVertexBuffer('normals', 'ts_Normal');
                  const fileReader = new FileReader();
                  fileReader.onerror = reject;
                  fileReader.onload = function (_progressEvent) {
                      const dataView = new DataView(this.result);
                      const HEADER_BYTE_SIZE = 80;
                      const triangleCount = dataView.getUint32(HEADER_BYTE_SIZE, true);
                      mesh.normals.length = triangleCount * 3;
                      mesh.vertices.length = triangleCount * 3;
                      let i = triangleCount * 3, bufferPtr = HEADER_BYTE_SIZE + 4;
                      function readV3() {
                          const x = dataView.getFloat32(bufferPtr, true);
                          bufferPtr += 4;
                          const y = dataView.getFloat32(bufferPtr, true);
                          bufferPtr += 4;
                          const z = dataView.getFloat32(bufferPtr, true);
                          bufferPtr += 4;
                          return new V3(x, y, z);
                      }
                      while (i) {
                          i -= 3;
                          const normal = readV3();
                          mesh.normals[i + 0] = normal;
                          mesh.normals[i + 1] = normal;
                          mesh.normals[i + 2] = normal;
                          mesh.vertices[i + 0] = readV3();
                          mesh.vertices[i + 1] = readV3();
                          mesh.vertices[i + 2] = readV3();
                          bufferPtr += 2;
                      }
                      resolve(mesh);
                  };
                  fileReader.readAsArrayBuffer(stl);
              });
          });
      }
      toBinarySTL() {
          if (!this.TRIANGLES)
              throw new Error('TRIANGLES must be defined.');
          const HEADER_BYTE_SIZE = 80, FLOAT_BYTE_SIZE = 4;
          const triangles = this.TRIANGLES;
          const triangleCount = triangles.length / 3;
          const buffer = new ArrayBuffer(HEADER_BYTE_SIZE + 4 + triangleCount * (4 * 3 * FLOAT_BYTE_SIZE + 2));
          const dataView = new DataView(buffer);
          dataView.setUint32(HEADER_BYTE_SIZE, triangleCount, true);
          let bufferPtr = HEADER_BYTE_SIZE + 4;
          let i = triangles.length;
          while (i) {
              i -= 3;
              const a = this.vertices[triangles[i]], b = this.vertices[triangles[i + 1]], c = this.vertices[triangles[i + 2]];
              const normal = V3.normalOnPoints(a, b, c);
              [normal, a, b, c].forEach(v => {
                  dataView.setFloat32(bufferPtr, v.x, true);
                  bufferPtr += 4;
                  dataView.setFloat32(bufferPtr, v.y, true);
                  bufferPtr += 4;
                  dataView.setFloat32(bufferPtr, v.z, true);
                  bufferPtr += 4;
              });
              // skip 2 bytes, already initalized to zero
              bufferPtr += 2;
          }
          assert(bufferPtr == buffer.byteLength, bufferPtr + ' ' + buffer.byteLength);
          return new Blob([buffer], { type: 'application/octet-stream' });
      }
      /**
       * Returns a new Mesh with transformed vertices.
       *
       * Transform all vertices by `matrix` and all normals by the inverse transpose of `matrix`.
       *
       * Index buffer data is referenced.
       */
      transform(m4) {
          const mesh = new Mesh$$1();
          mesh.vertices = m4.transformedPoints(this.vertices);
          if (this.normals) {
              mesh.addVertexBuffer('normals', 'ts_Normal');
              const invTrans = m4
                  .as3x3(tempM4_1)
                  .inversed(tempM4_2)
                  .transposed(tempM4_1);
              mesh.normals = this.normals.map(n => invTrans.transformVector(n).unit());
              // mesh.normals.forEach(n => assert(n.hasLength(1)))
          }
          for (const name in this.indexBuffers) {
              mesh.addIndexBuffer(name);
              mesh[name] = this[name];
          }
          for (const attribute in this.vertexBuffers) {
              if ('ts_Vertex' !== attribute && 'ts_Normal' !== attribute) {
                  const name = this.vertexBuffers[attribute].name;
                  mesh.addVertexBuffer(name, attribute);
                  mesh[name] = this[name];
              }
          }
          // this.hasBeenCompiled && mesh.compile()
          return mesh;
      }
      /**
       * Computes a new normal for each vertex from the average normal of the neighboring triangles. This means
       * adjacent triangles must share vertices for the resulting normals to be smooth.
       */
      computeNormalsFromFlatTriangles() {
          if (!this.normals)
              this.addVertexBuffer('normals', 'ts_Normal');
          // tslint:disable:no-string-literal
          //this.vertexBuffers['ts_Normal'].data = arrayFromFunction(this.vertices.length, i => V3.O)
          const TRIANGLES = this.TRIANGLES, vertices = this.vertices, normals = this.normals;
          normals.length = vertices.length;
          for (let i = 0; i < TRIANGLES.length; i += 3) {
              const ai = TRIANGLES[i], bi = TRIANGLES[i + 1], ci = TRIANGLES[i + 2];
              const a = vertices[ai];
              const b = vertices[bi];
              const c = vertices[ci];
              const normal = b
                  .minus(a)
                  .cross(c.minus(a))
                  .unit();
              normals[ai] = normals[ai].plus(normal);
              normals[bi] = normals[bi].plus(normal);
              normals[ci] = normals[ci].plus(normal);
          }
          for (let i = 0; i < vertices.length; i++) {
              normals[i] = normals[i].unit();
          }
          this.hasBeenCompiled = false;
          return this;
      }
      computeWireframeFromFlatTriangles(indexBufferName = 'LINES') {
          if (!this.TRIANGLES)
              throw new Error('TRIANGLES must be defined.');
          const canonEdges = new Set();
          function canonEdge(i0, i1) {
              const iMin = min(i0, i1), iMax = max(i0, i1);
              return (iMin << 16) | iMax;
          }
          // function uncanonEdge(key) {
          // 	return [key >> 16, key & 0xffff]
          // }
          const t = this.TRIANGLES;
          for (let i = 0; i < t.length; i += 3) {
              canonEdges.add(canonEdge(t[i + 0], t[i + 1]));
              canonEdges.add(canonEdge(t[i + 1], t[i + 2]));
              canonEdges.add(canonEdge(t[i + 2], t[i + 0]));
          }
          const data = indexBufferName;
          if (!this[data])
              this.addIndexBuffer(indexBufferName);
          //this.LINES = new Array(canonEdges.size)
          canonEdges.forEach(val => this[data].push(val >> 16, val & 0xffff));
          this.hasBeenCompiled = false;
          return this;
      }
      computeWireframeFromFlatTrianglesClosedMesh(indexBufferName = 'LINES') {
          if (!this.TRIANGLES)
              throw new Error('TRIANGLES must be defined.');
          if (!this.LINES)
              this.addIndexBuffer('LINES');
          const tris = this.TRIANGLES;
          if (!this[indexBufferName])
              this.addIndexBuffer(indexBufferName);
          const lines = this[indexBufferName];
          for (let i = 0; i < tris.length; i += 3) {
              if (tris[i + 0] < tris[i + 1])
                  lines.push(tris[i + 0], tris[i + 1]);
              if (tris[i + 1] < tris[i + 2])
                  lines.push(tris[i + 1], tris[i + 2]);
              if (tris[i + 2] < tris[i + 0])
                  lines.push(tris[i + 2], tris[i + 0]);
          }
          this.hasBeenCompiled = false;
          return this;
      }
      computeNormalLines(length = 1, indexBufferName = 'LINES') {
          if (!this.normals) {
              throw new Error('normals must be defined.');
          }
          const vs = this.vertices, si = this.vertices.length;
          if (!this[indexBufferName])
              this.addIndexBuffer(indexBufferName);
          for (let i = 0; i < this.normals.length; i++) {
              vs[si + i] = vs[i].plus(this.normals[i].toLength(length));
              this[indexBufferName].push(si + i, i);
          }
          this.hasBeenCompiled = false;
          return this;
      }
      getAABB() {
          return new AABB().addPoints(this.vertices);
      }
      getBoundingSphere() {
          const sphere = { center: this.getAABB().getCenter(), radius: 0 };
          for (let i = 0; i < this.vertices.length; i++) {
              sphere.radius = Math.max(sphere.radius, this.vertices[i].minus(sphere.center).length());
          }
          return sphere;
      }
      /**
       * Generates a square mesh in the XY plane.
       * Texture coordinates (buffer "coords") are set to go from 0 to 1 in either direction.
       *
       * @param options foo
       * @param options.detail Defaults to 1
       * @param options.detailX Defaults to options.detail. Number of subdivisions in X direction.
       * @param options.detailY Defaults to options.detail. Number of subdivisions in Y direction.j
       * @param options.width defaults to 1
       * @param options.height defaults to 1
       * @param options.startX defaults to 0
       * @param options.startY defaults to 0
       */
      static plane(options = {}) {
          const detailX = options.detailX || options.detail || 1;
          const detailY = options.detailY || options.detail || 1;
          const startX = options.startX || 0;
          const startY = options.startY || 0;
          const width = options.width || 1;
          const height = options.height || 1;
          const mesh = new Mesh$$1()
              .addIndexBuffer('LINES')
              .addIndexBuffer('TRIANGLES')
              .addVertexBuffer('normals', 'ts_Normal')
              .addVertexBuffer('coords', 'ts_TexCoord');
          for (let j = 0; j <= detailY; j++) {
              const t = j / detailY;
              for (let i = 0; i <= detailX; i++) {
                  const s = i / detailX;
                  mesh.vertices.push(new V3(startX + s * width, startY + t * height, 0));
                  mesh.coords.push([s, t]);
                  mesh.normals.push(V3.Z);
                  if (i < detailX && j < detailY) {
                      const offset = i + j * (detailX + 1);
                      mesh.TRIANGLES.push(offset, offset + detailX + 1, offset + 1, offset + detailX + 1, offset + detailX + 2, offset + 1);
                  }
              }
          }
          for (let i = 0; i < detailX; i++) {
              mesh.LINES.push(i, i + 1);
              mesh.LINES.push((detailX + 1) * detailY + i, (detailX + 1) * detailY + i + 1);
          }
          for (let j = 0; j < detailY; j++) {
              mesh.LINES.push(detailX * j, detailX * (j + 1) + 1);
              mesh.LINES.push(detailX * (j + 1), detailX * (j + 2) + 1);
          }
          mesh.compile();
          return mesh;
      }
      static box(xDetail = 1, yDetail = 1, zDetail = 1) {
          const mesh = new Mesh$$1()
              .addIndexBuffer('LINES')
              .addIndexBuffer('TRIANGLES')
              .addVertexBuffer('normals', 'ts_Normal');
          mesh.vertices.length = mesh.normals.length =
              2 * ((xDetail + 1) * (yDetail + 1) + (yDetail + 1) * (zDetail + 1) + (zDetail + 1) * (xDetail + 1));
          mesh.TRIANGLES.length = 4 * (xDetail * yDetail + yDetail * zDetail + zDetail * xDetail);
          let vi = 0, ti = 0;
          function x(detailX, detailY, m, startX = 0, width = 1, startY = 0, height = 1) {
              const normal = m.transformVector(V3.Z);
              for (let j = 0; j <= detailY; j++) {
                  const t = j / detailY;
                  for (let i = 0; i <= detailX; i++) {
                      const s = i / detailX;
                      mesh.vertices[vi] = m.transformPoint(new V3(startX + s * width, startY + t * height, 0));
                      mesh.normals[vi] = normal;
                      vi++;
                      if (i < detailX && j < detailY) {
                          const offset = i + j * (detailX + 1);
                          mesh.TRIANGLES[ti++] = offset;
                          mesh.TRIANGLES[ti++] = offset + detailX + 1;
                          mesh.TRIANGLES[ti++] = offset + 1;
                          mesh.TRIANGLES[ti++] = offset + detailX + 1;
                          mesh.TRIANGLES[ti++] = offset + detailX + 2;
                          mesh.TRIANGLES[ti++] = offset + 1;
                      }
                  }
              }
          }
          x(yDetail, xDetail, M4.forSys(V3.Y, V3.X, V3.Z.negated()));
          x(xDetail, yDetail, M4.translate(V3.Z));
          x(zDetail, yDetail, M4.forSys(V3.Z, V3.Y, V3.X.negated()));
          x(yDetail, zDetail, M4.forSys(V3.Y, V3.Z, V3.X, V3.X));
          x(xDetail, zDetail, M4.forSys(V3.X, V3.Z, V3.Y.negated()));
          x(zDetail, xDetail, M4.forSys(V3.Z, V3.X, V3.Y, V3.Y));
          return mesh;
      }
      /**
       * Generates a unit cube (1x1x1) starting at the origin and extending into the (+ + +) octant.
       * I.e. box from V3.O to V3(1,1,1)
       * Creates line (only cube edges), triangle, vertex and normal1 buffers.
       */
      static cube() {
          const mesh = new Mesh$$1()
              .addVertexBuffer('normals', 'ts_Normal')
              .addIndexBuffer('TRIANGLES')
              .addIndexBuffer('LINES');
          // basically indexes for faces of the cube. vertices each need to be added 3 times,
          // as they have different normals depending on the face being rendered
          // prettier-ignore
          const VERTEX_CORNERS = [
              0, 1, 2, 3,
              4, 5, 6, 7,
              0, 4, 1, 5,
              2, 6, 3, 7,
              2, 6, 0, 4,
              3, 7, 1, 5,
          ];
          mesh.vertices = VERTEX_CORNERS.map(i => Mesh$$1.UNIT_CUBE_CORNERS[i]);
          mesh.normals = [V3.X.negated(), V3.X, V3.Y.negated(), V3.Y, V3.Z.negated(), V3.Z].flatMap(v => [v, v, v, v]);
          for (let i = 0; i < 6 * 4; i += 4) {
              pushQuad$$1(mesh.TRIANGLES, 0 != i % 8, VERTEX_CORNERS[i], VERTEX_CORNERS[i + 1], VERTEX_CORNERS[i + 2], VERTEX_CORNERS[i + 3]);
          }
          // indexes of LINES relative to UNIT_CUBE_CORNERS. Mapped to VERTEX_CORNERS.indexOf
          // so they make sense in the context of the mesh
          // prettier-ignore
          mesh.LINES = [
              0, 1,
              0, 2,
              1, 3,
              2, 3,
              0, 4,
              1, 5,
              2, 6,
              3, 7,
              4, 5,
              4, 6,
              5, 7,
              6, 7,
          ].map(i => VERTEX_CORNERS.indexOf(i));
          mesh.compile();
          return mesh;
      }
      static isocahedron() {
          return Mesh$$1.sphere(0);
      }
      static sphere2(latitudes, longitudes) {
          const baseVertices = arrayFromFunction(latitudes, i => {
              const angle = (i / (latitudes - 1)) * PI$2 - PI$2 / 2;
              return new V3(0, cos(angle), sin(angle));
          });
          return Mesh$$1.rotation(baseVertices, { anchor: V3.O, dir1: V3.Z }, 2 * PI$2, longitudes, true, baseVertices);
      }
      /**
       * Returns a sphere mesh with radius 1 created by subdividing the faces of a isocahedron (20-sided) recursively
       * The sphere is positioned at the origin
       * @param subdivisions
       *      How many recursive divisions to do. A subdivision divides a triangle into 4,
       *      so the total number of triangles is 20 * 4^subdivisions
       * @returns
       *      Contains vertex and normal1 buffers and index buffers for triangles and LINES
       */
      static sphere(subdivisions = 3) {
          const golden = (1 + Math.sqrt(5)) / 2, u = new V3(1, golden, 0).unit(), s = u.x, t = u.y;
          // base vertices of isocahedron
          const vertices = [
              new V3(-s, t, 0),
              new V3(s, t, 0),
              new V3(-s, -t, 0),
              new V3(s, -t, 0),
              new V3(0, -s, t),
              new V3(0, s, t),
              new V3(0, -s, -t),
              new V3(0, s, -t),
              new V3(t, 0, -s),
              new V3(t, 0, s),
              new V3(-t, 0, -s),
              new V3(-t, 0, s),
          ];
          // base triangles of isocahedron
          // prettier-ignore
          const triangles = [
              // 5 faces around point 0
              0, 11, 5,
              0, 5, 1,
              0, 1, 7,
              0, 7, 10,
              0, 10, 11,
              // 5 adjacent faces
              1, 5, 9,
              5, 11, 4,
              11, 10, 2,
              10, 7, 6,
              7, 1, 8,
              // 5 faces around point 3
              3, 9, 4,
              3, 4, 2,
              3, 2, 6,
              3, 6, 8,
              3, 8, 9,
              // 5 adjacent faces
              4, 9, 5,
              2, 4, 11,
              6, 2, 10,
              8, 6, 7,
              9, 8, 1,
          ];
          /**
           * Tesselates triangle a b c
           * a b c must already be in vertices with the indexes ia ib ic
           * res is the number of subdivisions to do. 0 just results in triangle and line indexes being added to the
           * respective buffers.
           */
          function tesselateRecursively(a, b, c, res, vertices, triangles, ia, ib, ic, lines) {
              if (0 == res) {
                  triangles.push(ia, ib, ic);
                  if (ia < ib)
                      lines.push(ia, ib);
                  if (ib < ic)
                      lines.push(ib, ic);
                  if (ic < ia)
                      lines.push(ic, ia);
              }
              else {
                  // subdivide the triangle abc into 4 by adding a vertex (with the correct distance from the origin)
                  // between each segment ab, bc and cd, then calling the function recursively
                  const abMid1 = a.plus(b).toLength(1), bcMid1 = b.plus(c).toLength(1), caMid1 = c.plus(a).toLength(1);
                  // indexes of new vertices:
                  const iabm = vertices.length, ibcm = iabm + 1, icam = iabm + 2;
                  vertices.push(abMid1, bcMid1, caMid1);
                  tesselateRecursively(abMid1, bcMid1, caMid1, res - 1, vertices, triangles, iabm, ibcm, icam, lines);
                  tesselateRecursively(a, abMid1, caMid1, res - 1, vertices, triangles, ia, iabm, icam, lines);
                  tesselateRecursively(b, bcMid1, abMid1, res - 1, vertices, triangles, ib, ibcm, iabm, lines);
                  tesselateRecursively(c, caMid1, bcMid1, res - 1, vertices, triangles, ic, icam, ibcm, lines);
              }
          }
          const mesh = new Mesh$$1()
              .addVertexBuffer('normals', 'ts_Normal')
              .addIndexBuffer('TRIANGLES')
              .addIndexBuffer('LINES');
          mesh.vertices.push(...vertices);
          subdivisions = undefined == subdivisions ? 4 : subdivisions;
          for (let i = 0; i < 20; i++) {
              const [ia, ic, ib] = triangles.slice(i * 3, i * 3 + 3);
              tesselateRecursively(vertices[ia], vertices[ic], vertices[ib], subdivisions, mesh.vertices, mesh.TRIANGLES, ia, ic, ib, mesh.LINES);
          }
          mesh.normals = mesh.vertices;
          mesh.compile();
          return mesh;
      }
      static aabb(aabb) {
          const matrix = M4.product(M4.translate(aabb.min), M4.scale(aabb.size().max(new V3(NLA_PRECISION, NLA_PRECISION, NLA_PRECISION))));
          const mesh = Mesh$$1.cube().transform(matrix);
          // mesh.vertices = aabb.corners()
          mesh.computeNormalLines(20);
          mesh.compile();
          return mesh;
      }
      static offsetVertices(vertices, offset, close, normals) {
          assertVectors.apply(undefined, vertices);
          assertVectors(offset);
          const mesh = new Mesh$$1().addIndexBuffer('TRIANGLES').addVertexBuffer('coords', 'ts_TexCoord');
          normals && mesh.addVertexBuffer('normals', 'ts_Normal');
          mesh.vertices = vertices.concat(vertices.map(v => v.plus(offset)));
          const vl = vertices.length;
          mesh.coords = arrayFromFunction(vl * 2, (i) => [(i % vl) / vl, (i / vl) | 0]);
          const triangles = mesh.TRIANGLES;
          for (let i = 0; i < vertices.length - 1; i++) {
              pushQuad$$1(triangles, false, i, i + 1, vertices.length + i, vertices.length + i + 1);
          }
          if (close) {
              pushQuad$$1(triangles, false, vertices.length - 1, 0, vertices.length * 2 - 1, vertices.length);
          }
          if (normals) {
              mesh.normals = normals.concat(normals);
          }
          mesh.compile();
          return mesh;
      }
      // Creates a new $Mesh by rotating $vertices by $totalRads around $lineAxis (according to the right-hand
      // rule). $steps is the number of steps to take. $close is whether the vertices of the first and last step
      // should be connected by triangles. If $normals is set (pass an array of V3s of the same length as $vertices),
      // these will also be rotated and correctly added to the mesh.
      // @example const precious = Mesh.rotation([V(10, 0, -2), V(10, 0, 2), V(11, 0, 2), V(11, 0, -2)], , L3.Z, 512)
      static rotation(vertices, lineAxis, totalRads, steps, close = true, normals) {
          const mesh = new Mesh$$1().addIndexBuffer('TRIANGLES');
          normals && mesh.addVertexBuffer('normals', 'ts_Normal');
          const vc = vertices.length, vTotal = vc * steps;
          const rotMat = new M4();
          const triangles = mesh.TRIANGLES;
          for (let i = 0; i < steps; i++) {
              // add triangles
              const rads = (totalRads / steps) * i;
              M4.rotateLine(lineAxis.anchor, lineAxis.dir1, rads, rotMat);
              mesh.vertices.push(...rotMat.transformedPoints(vertices));
              normals && mesh.normals.push(...rotMat.transformedVectors(normals));
              if (close || i !== steps - 1) {
                  for (let j = 0; j < vc - 1; j++) {
                      pushQuad$$1(triangles, false, i * vc + j + 1, i * vc + j, ((i + 1) * vc + j + 1) % vTotal, ((i + 1) * vc + j) % vTotal);
                  }
              }
          }
          mesh.compile();
          return mesh;
      }
      static parametric(pF, pN, sMin, sMax, tMin, tMax, sRes, tRes) {
          const mesh = new Mesh$$1().addIndexBuffer('TRIANGLES').addVertexBuffer('normals', 'ts_Normal');
          for (let si = 0; si <= sRes; si++) {
              const s = lerp(sMin, sMax, si / sRes);
              for (let ti = 0; ti <= tRes; ti++) {
                  const t = lerp(tMin, tMax, ti / tRes);
                  mesh.vertices.push(pF(s, t));
                  pN && mesh.normals.push(pN(s, t));
                  if (ti < tRes && si < sRes) {
                      const offset = ti + si * (tRes + 1);
                      pushQuad$$1(mesh.TRIANGLES, false, offset, offset + tRes + 1, offset + 1, offset + tRes + 2);
                  }
              }
          }
          return mesh;
      }
      static load(json) {
          const mesh = new Mesh$$1();
          if (Array.isArray(json.vertices[0])) {
              mesh.vertices = json.vertices.map(x => V(x));
          }
          else {
              throw new Error();
          }
          if (json.triangles) {
              mesh.addIndexBuffer('TRIANGLES');
              mesh.TRIANGLES = json.triangles;
          }
          if (json.normals) {
              mesh.addVertexBuffer('normals', 'ts_Normal');
              mesh.normals = json.normals;
          }
          mesh.compile();
          return mesh;
      }
      toJSON() {
          return {
              vertices: this.vertices.map(x => x.toArray()),
              TRIANGLES: this.TRIANGLES,
          };
      }
  }
  // unique corners of a unit cube. Used by Mesh.cube to generate a cube mesh.
  Mesh$$1.UNIT_CUBE_CORNERS = [
      V3.O,
      new V3(0, 0, 1),
      new V3(0, 1, 0),
      new V3(0, 1, 1),
      new V3(1, 0, 0),
      new V3(1, 0, 1),
      new V3(1, 1, 0),
      V3.XYZ,
  ];

  /* tslint:disable:no-string-literal */
  const WGL$2 = WebGLRenderingContext;
  /**
   * These are all the draw modes usable in OpenGL ES
   */
  const DRAW_MODE_NAMES = {
      [WGL$2.POINTS]: 'POINTS',
      [WGL$2.LINES]: 'LINES',
      [WGL$2.LINE_STRIP]: 'LINE_STRIP',
      [WGL$2.LINE_LOOP]: 'LINE_LOOP',
      [WGL$2.TRIANGLES]: 'TRIANGLES',
      [WGL$2.TRIANGLE_STRIP]: 'TRIANGLE_STRIP',
      [WGL$2.TRIANGLE_FAN]: 'TRIANGLE_FAN',
  };
  const DRAW_MODE_CHECKS = {
      [WGL$2.POINTS]: _ => true,
      [WGL$2.LINES]: x => 0 == x % 2,
      [WGL$2.LINE_STRIP]: x => x > 2,
      [WGL$2.LINE_LOOP]: x => x > 2,
      [WGL$2.TRIANGLES]: x => 0 == x % 3,
      [WGL$2.TRIANGLE_STRIP]: x => x > 3,
      [WGL$2.TRIANGLE_FAN]: x => x > 3,
  };
  function isFloatArray(obj) {
      return (Float32Array == obj.constructor ||
          Float64Array == obj.constructor ||
          (Array.isArray(obj) && obj.every(x => 'number' == typeof x)));
  }
  function isIntArray(x) {
      if ([Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array].some(y => x instanceof y)) {
          return true;
      }
      return ((x instanceof Float32Array || x instanceof Float64Array || Array.isArray(x)) &&
          x.every(x => Number.isInteger(x)));
  }
  //const x:UniformTypes = undefined as 'FLOAT_VEC4' | 'FLOAT_VEC3'
  class Shader$$1 {
      /**
       * Provides a convenient wrapper for WebGL shaders. A few uniforms and attributes,
       * prefixed with `gl_`, are automatically added to all shader sources to make
       * simple shaders easier to write.
       * Headers for the following variables are automatically prepended to the passed source. The correct variables
       * are also automatically passed to the shader when drawing.
       *
       * For vertex and fragment shaders:
       uniform mat3 ts_NormalMatrix;
       uniform mat4 ts_ModelViewMatrix;
       uniform mat4 ts_ProjectionMatrix;
       uniform mat4 ts_ModelViewProjectionMatrix;
       uniform mat4 ts_ModelViewMatrixInverse;
       uniform mat4 ts_ProjectionMatrixInverse;
       uniform mat4 ts_ModelViewProjectionMatrixInverse;
       *
       *
       * Example usage:
       *
       *  const shader = new GL.Shader(
       *      `void main() { gl_Position = ts_ModelViewProjectionMatrix * ts_Vertex; }`,
       *      `uniform vec4 color; void main() { gl_FragColor = color; }`)
       *
       *  shader.uniforms({ color: [1, 0, 0, 1] }).draw(mesh)
       *
       * Compiles a shader program using the provided vertex and fragment shaders.
       */
      constructor(vertexSource, fragmentSource, gl = currentGL$$1()) {
          this.projectionMatrixVersion = -1;
          this.modelViewMatrixVersion = -1;
          // const versionRegex = /^(?:\s+|\/\/[\s\S]*?[\r\n]+|\/\*[\s\S]*?\*\/)+(#version\s+(\d+)\s+es)/
          // Headers are prepended to the sources to provide some automatic functionality.
          const header = `
		uniform mat3 ts_NormalMatrix;
		uniform mat4 ts_ModelViewMatrix;
		uniform mat4 ts_ProjectionMatrix;
		uniform mat4 ts_ModelViewProjectionMatrix;
		uniform mat4 ts_ModelViewMatrixInverse;
		uniform mat4 ts_ProjectionMatrixInverse;
		uniform mat4 ts_ModelViewProjectionMatrixInverse;
	`;
          const matrixNames = header.match(/\bts_\w+/g);
          // Compile and link errors are thrown as strings.
          function compileSource(type, source) {
              const shader = gl.createShader(type);
              gl.shaderSource(shader, source);
              gl.compileShader(shader);
              if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                  throw new Error('compile error: ' + gl.getShaderInfoLog(shader));
              }
              return shader;
          }
          this.gl = gl;
          this.program = gl.createProgram();
          gl.attachShader(this.program, compileSource(gl.VERTEX_SHADER, vertexSource));
          gl.attachShader(this.program, compileSource(gl.FRAGMENT_SHADER, fragmentSource));
          gl.linkProgram(this.program);
          if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
              throw new Error('link error: ' + gl.getProgramInfoLog(this.program));
          }
          this.attributeLocations = {};
          this.uniformLocations = {};
          this.constantAttributes = {};
          // Check for the use of built-in matrices that require expensive matrix
          // multiplications to compute, and record these in `activeMatrices`.
          this.activeMatrices = {};
          matrixNames &&
              matrixNames.forEach(name => {
                  if (gl.getUniformLocation(this.program, name)) {
                      this.activeMatrices[name] = true;
                  }
              });
          this.uniformInfos = {};
          for (let i = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS); i-- > 0;) {
              // see https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glGetActiveUniform.xml
              // this.program has already been checked
              // i is in bounds
              const info = gl.getActiveUniform(this.program, i);
              this.uniformInfos[info.name] = info;
          }
      }
      static create(vertexSource, fragmentSource, gl) {
          return new Shader$$1(vertexSource, fragmentSource, gl);
      }
      /**
       * Set a uniform for each property of `uniforms`. The correct `viewerGL.uniform*()` method is inferred from the
       * value types and from the stored uniform sampler flags.
       */
      uniforms(uniforms) {
          const gl = this.gl;
          gl.useProgram(this.program);
          for (const name in uniforms) {
              const location = this.uniformLocations[name] || gl.getUniformLocation(this.program, name);
              // !location && console.warn(name + ' uniform is not used in shader')
              if (!location)
                  continue;
              this.uniformLocations[name] = location;
              let value = uniforms[name];
              const info = this.uniformInfos[name];
              {
                  // TODO: better errors
                  if (gl.SAMPLER_2D == info.type || gl.SAMPLER_CUBE == info.type || gl.INT == info.type) {
                      if (1 == info.size) {
                          assert(Number.isInteger(value));
                      }
                      else {
                          assert(isIntArray(value) && value.length == info.size, 'value must be int array if info.size != 1');
                      }
                  }
                  assert(gl.FLOAT != info.type || ((1 == info.size && 'number' === typeof value) || isFloatArray(value)));
                  assert(gl.FLOAT_VEC3 != info.type ||
                      ((1 == info.size && value instanceof V3) ||
                          (Array.isArray(value) && info.size == value.length && assertVectors(...value))));
                  assert(gl.FLOAT_VEC4 != info.type || 1 != info.size || (isFloatArray(value) && value.length == 4));
                  assert(gl.FLOAT_MAT4 != info.type || value instanceof M4, () => value.toSource());
                  assert(gl.FLOAT_MAT3 != info.type || value.length == 9 || value instanceof M4);
              }
              if (value instanceof V3) {
                  value = value.toArray();
              }
              if (gl.FLOAT_VEC4 == info.type && info.size != 1) {
                  if (value instanceof Float32Array || value instanceof Float64Array) {
                      gl.uniform4fv(location, value instanceof Float32Array ? value : Float32Array.from(value));
                  }
                  else {
                      gl.uniform4fv(location, value.concatenated());
                  }
              }
              else if (gl.FLOAT == info.type && info.size != 1) {
                  gl.uniform1fv(location, value);
              }
              else if (gl.FLOAT_VEC3 == info.type && info.size != 1) {
                  gl.uniform3fv(location, V3.pack(value));
              }
              else if (value.length) {
                  switch (value.length) {
                      case 1:
                          gl.uniform1fv(location, value);
                          break;
                      case 2:
                          gl.uniform2fv(location, value);
                          break;
                      case 3:
                          gl.uniform3fv(location, value);
                          break;
                      case 4:
                          gl.uniform4fv(location, value);
                          break;
                      // Matrices are automatically transposed, since WebGL uses column-major
                      // indices instead of row-major indices.
                      case 9:
                          // prettier-ignore
                          gl.uniformMatrix3fv(location, false, new Float32Array([
                              value[0], value[3], value[6],
                              value[1], value[4], value[7],
                              value[2], value[5], value[8],
                          ]));
                          break;
                      case 16:
                          // prettier-ignore
                          gl.uniformMatrix4fv(location, false, new Float32Array([
                              value[0], value[4], value[8], value[12],
                              value[1], value[5], value[9], value[13],
                              value[2], value[6], value[10], value[14],
                              value[3], value[7], value[11], value[15],
                          ]));
                          break;
                      default:
                          throw new Error('don\'t know how to load uniform "' + name + '" of length ' + value.length);
                  }
              }
              else if ('number' == typeof value) {
                  if (gl.SAMPLER_2D == info.type || gl.SAMPLER_CUBE == info.type || gl.INT == info.type) {
                      gl.uniform1i(location, value);
                  }
                  else {
                      gl.uniform1f(location, value);
                  }
              }
              else if ('boolean' == typeof value) {
                  gl.uniform1i(location, +value);
              }
              else if (value instanceof M4) {
                  const m = value.m;
                  if (gl.FLOAT_MAT4 == info.type) {
                      // prettier-ignore
                      gl.uniformMatrix4fv(location, false, [
                          m[0], m[4], m[8], m[12],
                          m[1], m[5], m[9], m[13],
                          m[2], m[6], m[10], m[14],
                          m[3], m[7], m[11], m[15]
                      ]);
                  }
                  else if (gl.FLOAT_MAT3 == info.type) {
                      // prettier-ignore
                      gl.uniformMatrix3fv(location, false, [
                          m[0], m[4], m[8],
                          m[1], m[5], m[9],
                          m[2], m[6], m[10]
                      ]);
                  }
                  else if (gl.FLOAT_MAT2 == info.type) {
                      // prettier-ignore
                      gl.uniformMatrix2fv(location, false, new Float32Array([
                          m[0], m[4],
                          m[1], m[5]
                      ]));
                  }
                  else {
                      throw new Error(`Can't assign M4 to ${info.type}`);
                  }
              }
              else {
                  throw new Error('attempted to set uniform "' + name + '" to invalid value ' + value);
              }
          }
          return this;
      }
      attributes(attributes) {
          const gl = this.gl;
          gl.useProgram(this.program);
          for (const name in attributes) {
              const location = this.attributeLocations[name] || gl.getAttribLocation(this.program, name);
              if (location == -1) {
                  if (!name.startsWith('ts_')) {
                      console.warn(`Vertex buffer ${name} was not bound because the attribute is not active.`);
                  }
                  continue;
              }
              this.attributeLocations[name] = location;
              gl.disableVertexAttribArray(location);
              let value = attributes[name];
              if (value instanceof V3) {
                  // TODO: figure out the types here...
                  value = value.toArray();
              }
              if ('number' === typeof value) {
                  gl.vertexAttrib1f(location, value);
              }
              else {
                  gl.vertexAttrib4fv(location, value);
                  // switch ((value as number[]).length) {
                  // 	case 1:
                  // 		gl.vertexAttrib1fv(location, value as number[])
                  // 		break
                  // 	case 2:
                  // 		gl.vertexAttrib2fv(location, value as number[])
                  // 		break
                  // 	case 3:
                  // 		gl.vertexAttrib3fv(location, value as number[])
                  // 		break
                  // 	case 4:
                  // 		break
                  // }
              }
              this.constantAttributes[name] = true;
          }
          return this;
      }
      /**
       * Sets all uniform matrix attributes, binds all relevant buffers, and draws the mesh geometry as indexed
       * triangles or indexed LINES. Set `mode` to `gl.LINES` (and either add indices to `LINES` or call
       * `computeWireframe()`) to draw the mesh in wireframe.
       *
       * @param mesh
       * @param mode Defaults to 'TRIANGLES'. Must be passed as string so the correct index buffer can be
       *     automatically drawn.
       * @param start int
       * @param count int
       */
      draw(mesh, mode = WGL$2.TRIANGLES, start, count) {
          assert(mesh.hasBeenCompiled, 'mesh.hasBeenCompiled');
          assert(undefined != DRAW_MODE_NAMES[mode]);
          const modeName = DRAW_MODE_NAMES[mode];
          // assert(mesh.indexBuffers[modeStr], `mesh.indexBuffers[${modeStr}] undefined`)
          return this.drawBuffers(mesh.vertexBuffers, mesh.indexBuffers[modeName], mode, start, count);
      }
      /**
       * Sets all uniform matrix attributes, binds all relevant buffers, and draws the
       * indexed mesh geometry. The `vertexBuffers` argument is a map from attribute
       * names to `Buffer` objects of type `WGL.ARRAY_BUFFER`, `indexBuffer` is a `Buffer`
       * object of type `WGL.ELEMENT_ARRAY_BUFFER`, and `mode` is a WebGL primitive mode
       * like `WGL.TRIANGLES` or `WGL.LINES`. This method automatically creates and caches
       * vertex attribute pointers for attributes as needed.
       */
      drawBuffers(vertexBuffers, indexBuffer, mode = WGL$2.TRIANGLES, start = 0, count) {
          const gl = this.gl;
          assert(undefined != DRAW_MODE_NAMES[mode]);
          assertf(() => 1 <= Object.keys(vertexBuffers).length);
          Object.keys(vertexBuffers).forEach(key => assertInst(Buffer$$1, vertexBuffers[key]));
          // Only varruct up the built-in matrices that are active in the shader
          const on = this.activeMatrices;
          const modelViewMatrixInverse = (on['ts_ModelViewMatrixInverse'] || on['ts_NormalMatrix']) &&
              //&& this.modelViewMatrixVersion != gl.modelViewMatrixVersion
              gl.modelViewMatrix.inversed();
          const projectionMatrixInverse = on['ts_ProjectionMatrixInverse'] &&
              //&& this.projectionMatrixVersion != gl.projectionMatrixVersion
              gl.projectionMatrix.inversed();
          const modelViewProjectionMatrix = (on['ts_ModelViewProjectionMatrix'] || on['ts_ModelViewProjectionMatrixInverse']) &&
              //&& (this.projectionMatrixVersion != gl.projectionMatrixVersion || this.modelViewMatrixVersion !=
              // gl.modelViewMatrixVersion)
              gl.projectionMatrix.times(gl.modelViewMatrix);
          const uni = {}; // Uniform Matrices
          on['ts_ModelViewMatrix'] &&
              this.modelViewMatrixVersion != gl.modelViewMatrixVersion &&
              (uni['ts_ModelViewMatrix'] = gl.modelViewMatrix);
          on['ts_ModelViewMatrixInverse'] && (uni['ts_ModelViewMatrixInverse'] = modelViewMatrixInverse);
          on['ts_ProjectionMatrix'] &&
              this.projectionMatrixVersion != gl.projectionMatrixVersion &&
              (uni['ts_ProjectionMatrix'] = gl.projectionMatrix);
          projectionMatrixInverse && (uni['ts_ProjectionMatrixInverse'] = projectionMatrixInverse);
          modelViewProjectionMatrix && (uni['ts_ModelViewProjectionMatrix'] = modelViewProjectionMatrix);
          modelViewProjectionMatrix &&
              on['ts_ModelViewProjectionMatrixInverse'] &&
              (uni['ts_ModelViewProjectionMatrixInverse'] = modelViewProjectionMatrix.inversed());
          on['ts_NormalMatrix'] &&
              this.modelViewMatrixVersion != gl.modelViewMatrixVersion &&
              (uni['ts_NormalMatrix'] = modelViewMatrixInverse.transposed());
          this.uniforms(uni);
          this.projectionMatrixVersion = gl.projectionMatrixVersion;
          this.modelViewMatrixVersion = gl.modelViewMatrixVersion;
          // Create and enable attribute pointers as necessary.
          let minVertexBufferLength = Infinity;
          for (const attribute in vertexBuffers) {
              const buffer = vertexBuffers[attribute];
              assert(buffer.hasBeenCompiled);
              const location = this.attributeLocations[attribute] || gl.getAttribLocation(this.program, attribute);
              if (location == -1 || !buffer.buffer) {
                  if (!attribute.startsWith('ts_')) {
                      console.warn(`Vertex buffer ${attribute} was not bound because the attribute is not active.`);
                  }
                  continue;
              }
              this.attributeLocations[attribute] = location;
              gl.bindBuffer(WGL$2.ARRAY_BUFFER, buffer.buffer);
              gl.enableVertexAttribArray(location);
              gl.vertexAttribPointer(location, buffer.spacing, WGL$2.FLOAT, false, 0, 0);
              minVertexBufferLength = Math.min(minVertexBufferLength, buffer.count);
          }
          // Disable unused attribute pointers.
          for (const attribute in this.attributeLocations) {
              if (!(attribute in vertexBuffers)) {
                  gl.disableVertexAttribArray(this.attributeLocations[attribute]);
              }
          }
          {
              const numAttribs = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
              for (let i = 0; i < numAttribs; ++i) {
                  const buffer = gl.getVertexAttrib(i, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING);
                  if (!buffer) {
                      const info = gl.getActiveAttrib(this.program, i);
                      if (!this.constantAttributes[info.name]) {
                          console.warn('No buffer is bound to attribute ' + info.name + ' and it was not set with .attributes()');
                      }
                  }
                  // console.log('name:', info.name, 'type:', info.type, 'size:', info.size)
              }
          }
          // Draw the geometry.
          if (minVertexBufferLength) {
              if (undefined === count) {
                  count = indexBuffer ? indexBuffer.count : minVertexBufferLength;
              }
              assert(DRAW_MODE_CHECKS[mode](count), 'count ' +
                  count +
                  "doesn't fulfill requirement +" +
                  DRAW_MODE_CHECKS[mode].toString() +
                  ' for mode ' +
                  DRAW_MODE_NAMES[mode]);
              if (indexBuffer) {
                  assert(indexBuffer.hasBeenCompiled);
                  assert(minVertexBufferLength > indexBuffer.maxValue);
                  assert(count % indexBuffer.spacing == 0);
                  assert(start % indexBuffer.spacing == 0);
                  if (start + count > indexBuffer.count) {
                      throw new Error('Buffer not long enough for passed parameters start/length/buffer length ' +
                          start +
                          ' ' +
                          count +
                          ' ' +
                          indexBuffer.count);
                  }
                  gl.bindBuffer(WGL$2.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
                  // start parameter has to be multiple of sizeof(WGL.UNSIGNED_SHORT)
                  gl.drawElements(mode, count, indexBuffer.bindSize, indexBuffer.type.BYTES_PER_ELEMENT * start);
              }
              else {
                  if (start + count > minVertexBufferLength) {
                      throw new Error('invalid');
                  }
                  gl.drawArrays(mode, start, count);
              }
              gl.drawCallCount++;
          }
          return this;
      }
  }

  class Texture$$1 {
      /**
       * Provides a simple wrapper around WebGL textures that supports render-to-texture.
       *
       * The arguments `width` and `height` give the size of the texture in texels.
       * WebGL texture dimensions must be powers of two unless `filter` is set to
       * either `WGL.NEAREST` or `WGL.LINEAR` and `wrap` is set to `WGL.CLAMP_TO_EDGE`
       * (which they are by default).
       *
       * Texture parameters can be passed in via the `options` argument.
       * Example usage:
       *
       *      let tex = new GL.Texture(256, 256, {
       *       magFilter: WGL.NEAREST,
       *       minFilter: WGL.LINEAR,
       *
       *       wrapS: WGL.REPEAT,
       *       wrapT: WGL.REPEAT,
       *
       *       format: WGL.RGB, // Defaults to WGL.RGBA
       *       type: WGL.FLOAT // Defaults to WGL.UNSIGNED_BYTE
       *     })
       *
       */
      constructor(width, height, options = {}, gl = currentGL$$1()) {
          this.gl = gl;
          this.width = width;
          this.height = height;
          this.format = options.format || gl.RGBA;
          this.internalFormat = options.internalFormat || gl.RGBA;
          this.type = options.type || gl.UNSIGNED_BYTE;
          const magFilter = options.filter || options.magFilter || gl.LINEAR;
          const minFilter = options.filter || options.minFilter || gl.LINEAR;
          if (this.type === gl.FLOAT) {
              if (gl.version != 2 && !gl.getExtension('OES_texture_float')) {
                  throw new Error('OES_texture_float is required but not supported');
              }
              if ((minFilter !== gl.NEAREST || magFilter !== gl.NEAREST) &&
                  !gl.getExtension('OES_texture_float_linear')) {
                  throw new Error('OES_texture_float_linear is required but not supported');
              }
          }
          else if (this.type === gl.HALF_FLOAT_OES) {
              if (!gl.getExtension('OES_texture_half_float')) {
                  throw new Error('OES_texture_half_float is required but not supported');
              }
              if ((minFilter !== gl.NEAREST || magFilter !== gl.NEAREST) &&
                  !gl.getExtension('OES_texture_half_float_linear')) {
                  throw new Error('OES_texture_half_float_linear is required but not supported');
              }
          }
          this.texture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, this.texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.wrap || options.wrapS || gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.wrap || options.wrapT || gl.CLAMP_TO_EDGE);
          gl.texImage2D(gl.TEXTURE_2D, 0, this.internalFormat, width, height, 0, this.format, this.type, options.data);
      }
      setData(data) {
          this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
          this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.format, this.width, this.height, 0, this.format, this.type, data);
      }
      bind(unit) {
          this.gl.activeTexture((this.gl.TEXTURE0 + unit));
          this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      }
      unbind(unit) {
          this.gl.activeTexture((this.gl.TEXTURE0 + unit));
          this.gl.bindTexture(this.gl.TEXTURE_2D, null);
      }
      drawTo(render) {
          const gl = this.gl;
          const prevFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
          if (!this.framebuffer) {
              // create a renderbuffer for the depth component
              const prevRenderbuffer = gl.getParameter(gl.RENDERBUFFER_BINDING);
              const depthRenderbuffer = gl.createRenderbuffer();
              gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderbuffer);
              // DEPTH_COMPONENT16 is the only depth format
              gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
              gl.bindRenderbuffer(gl.RENDERBUFFER, prevRenderbuffer);
              // create a framebuffer to render to
              this.framebuffer = gl.createFramebuffer();
              gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
              gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
              gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderbuffer);
              if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
                  throw new Error('Rendering to this texture is not supported (incomplete this.framebuffer)');
              }
          }
          else if (prevFramebuffer !== this.framebuffer) {
              gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
          }
          const prevViewport = gl.getParameter(gl.VIEWPORT);
          gl.viewport(0, 0, this.width, this.height);
          render(gl);
          // restore previous state
          prevFramebuffer !== this.framebuffer && gl.bindFramebuffer(gl.FRAMEBUFFER, prevFramebuffer);
          gl.viewport(prevViewport[0], prevViewport[1], prevViewport[2], prevViewport[3]);
      }
      swapWith(other) {
          assert(this.gl == other.gl);
          let temp;
          temp = other.texture;
          other.texture = this.texture;
          this.texture = temp;
          temp = other.width;
          other.width = this.width;
          this.width = temp;
          temp = other.height;
          other.height = this.height;
          this.height = temp;
      }
      /**
       * Return a new texture created from `imgElement`, an `<img>` tag.
       */
      static fromImage(imgElement, options = {}, gl = currentGL$$1()) {
          const texture = new Texture$$1(imgElement.width, imgElement.height, options, gl);
          try {
              gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.format, texture.type, imgElement);
          }
          catch (e) {
              if (location.protocol == 'file:') {
                  throw new Error('imgElement not loaded for security reasons (serve this page over "http://" instead)');
              }
              else {
                  throw new Error('imgElement not loaded for security reasons (imgElement must originate from the same ' +
                      'domain as this page or use Cross-Origin Resource Sharing)');
              }
          }
          if (options.minFilter && options.minFilter != gl.NEAREST && options.minFilter != gl.LINEAR) {
              gl.generateMipmap(gl.TEXTURE_2D);
          }
          return texture;
      }
      /**
       * Returns a checkerboard texture that will switch to the correct texture when it loads.
       */
      static fromURLSwitch(url, options, gl = currentGL$$1()) {
          Texture$$1.checkerBoardCanvas =
              Texture$$1.checkerBoardCanvas ||
                  (function () {
                      const c = document.createElement('canvas').getContext('2d');
                      if (!c)
                          throw new Error('Could not create 2d canvas.');
                      c.canvas.width = c.canvas.height = 128;
                      for (let y = 0; y < c.canvas.height; y += 16) {
                          for (let x = 0; x < c.canvas.width; x += 16) {
                              //noinspection JSBitwiseOperatorUsage
                              c.fillStyle = (x ^ y) & 16 ? '#FFF' : '#DDD';
                              c.fillRect(x, y, 16, 16);
                          }
                      }
                      return c.canvas;
                  })();
          const texture = Texture$$1.fromImage(Texture$$1.checkerBoardCanvas, options);
          const image = new Image();
          image.onload = () => Texture$$1.fromImage(image, options, gl).swapWith(texture);
          // error event doesn't return a reason. Most likely a 404.
          image.onerror = () => {
              throw new Error('Could not load image ' + image.src + '. 404?');
          };
          image.src = url;
          return texture;
      }
      static fromURL(url, options, gl = currentGL$$1()) {
          return new Promise((resolve, reject) => {
              const image = new Image();
              image.onload = () => resolve(Texture$$1.fromImage(image, options, gl));
              image.onerror = ev => reject('Could not load image ' + image.src + '. 404?' + ev);
              image.src = url;
          });
      }
  }

  /*
  ** Copyright (c) 2012 The Khronos Group Inc.
  **
  ** Permission is hereby granted, free of charge, to any person obtaining a
  ** copy of this software and/or associated documentation files (the
  ** 'Materials'), to deal in the Materials without restriction, including
  ** without limitation the rights to use, copy, modify, merge, publish,
  ** distribute, sublicense, and/or sell copies of the Materials, and to
  ** permit persons to whom the Materials are furnished to do so, subject to
  ** the following conditions:
  **
  ** The above copyright notice and this permission notice shall be included
  ** in all copies or substantial portions of the Materials.
  **
  ** THE MATERIALS ARE PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
  ** EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  ** MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  ** IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
  ** CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  ** TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  ** MATERIALS OR THE USE OR OTHER DEALINGS IN THE MATERIALS.
  */
  // Various functions for helping debug WebGL apps.
  /**
   * Wrapped logging function.
   * @param msg Message to log.
   */
  function log(msg) {
      if (window.console && window.console.log) {
          window.console.log(msg);
      }
  }
  /**
   * Wrapped error logging function.
   * @param msg Message to log.
   */
  function error(msg) {
      if (window.console && window.console.error) {
          window.console.error(msg);
      }
      else {
          log(msg);
      }
  }
  /**
   * Which arguments are enums based on the number of arguments to the function.
   * So
   *    'texImage2D': {
   *       9: { 0:true, 2:true, 6:true, 7:true },
   *       6: { 0:true, 2:true, 3:true, 4:true },
   *    },
   *
   * means if there are 9 arguments then 6 and 7 are enums, if there are 6
   * arguments 3 and 4 are enums
   *
   * @type {!Object.<number, !Object.<number, string>}
   */
  const glValidEnumContexts = {
      // Generic setters and getters
      enable: { 1: { 0: true } },
      disable: { 1: { 0: true } },
      getParameter: { 1: { 0: true } },
      // Rendering
      drawArrays: { 3: { 0: true } },
      drawElements: { 4: { 0: true, 2: true } },
      // Shaders
      createShader: { 1: { 0: true } },
      getShaderParameter: { 2: { 1: true } },
      getProgramParameter: { 2: { 1: true } },
      getShaderPrecisionFormat: { 2: { 0: true, 1: true } },
      // Vertex attributes
      getVertexAttrib: { 2: { 1: true } },
      vertexAttribPointer: { 6: { 2: true } },
      // Textures
      bindTexture: { 2: { 0: true } },
      activeTexture: { 1: { 0: true } },
      getTexParameter: { 2: { 0: true, 1: true } },
      texParameterf: { 3: { 0: true, 1: true } },
      texParameteri: { 3: { 0: true, 1: true, 2: true } },
      // texImage2D and texSubImage2D are defined below with WebGL 2 entrypoints
      copyTexImage2D: { 8: { 0: true, 2: true } },
      copyTexSubImage2D: { 8: { 0: true } },
      generateMipmap: { 1: { 0: true } },
      // compressedTexImage2D and compressedTexSubImage2D are defined below with WebGL 2 entrypoints
      // Buffer objects
      bindBuffer: { 2: { 0: true } },
      // bufferData and bufferSubData are defined below with WebGL 2 entrypoints
      getBufferParameter: { 2: { 0: true, 1: true } },
      // Renderbuffers and framebuffers
      pixelStorei: { 2: { 0: true, 1: true } },
      // readPixels is defined below with WebGL 2 entrypoints
      bindRenderbuffer: { 2: { 0: true } },
      bindFramebuffer: { 2: { 0: true } },
      checkFramebufferStatus: { 1: { 0: true } },
      framebufferRenderbuffer: { 4: { 0: true, 1: true, 2: true } },
      framebufferTexture2D: { 5: { 0: true, 1: true, 2: true } },
      getFramebufferAttachmentParameter: { 3: { 0: true, 1: true, 2: true } },
      getRenderbufferParameter: { 2: { 0: true, 1: true } },
      renderbufferStorage: { 4: { 0: true, 1: true } },
      // Frame buffer operations (clear, blend, depth test, stencil)
      clear: { 1: { 0: { enumBitwiseOr: ['COLOR_BUFFER_BIT', 'DEPTH_BUFFER_BIT', 'STENCIL_BUFFER_BIT'] } } },
      depthFunc: { 1: { 0: true } },
      blendFunc: { 2: { 0: true, 1: true } },
      blendFuncSeparate: { 4: { 0: true, 1: true, 2: true, 3: true } },
      blendEquation: { 1: { 0: true } },
      blendEquationSeparate: { 2: { 0: true, 1: true } },
      stencilFunc: { 3: { 0: true } },
      stencilFuncSeparate: { 4: { 0: true, 1: true } },
      stencilMaskSeparate: { 2: { 0: true } },
      stencilOp: { 3: { 0: true, 1: true, 2: true } },
      stencilOpSeparate: { 4: { 0: true, 1: true, 2: true, 3: true } },
      // Culling
      cullFace: { 1: { 0: true } },
      frontFace: { 1: { 0: true } },
      // ANGLE_instanced_arrays extension
      drawArraysInstancedANGLE: { 4: { 0: true } },
      drawElementsInstancedANGLE: { 5: { 0: true, 2: true } },
      // EXT_blend_minmax extension
      blendEquationEXT: { 1: { 0: true } },
      // WebGL 2 Buffer objects
      bufferData: {
          3: { 0: true, 2: true },
          4: { 0: true, 2: true },
          5: { 0: true, 2: true },
      },
      bufferSubData: {
          3: { 0: true },
          4: { 0: true },
          5: { 0: true },
      },
      copyBufferSubData: { 5: { 0: true, 1: true } },
      getBufferSubData: { 3: { 0: true }, 4: { 0: true }, 5: { 0: true } },
      // WebGL 2 Framebuffer objects
      blitFramebuffer: {
          10: { 8: { enumBitwiseOr: ['COLOR_BUFFER_BIT', 'DEPTH_BUFFER_BIT', 'STENCIL_BUFFER_BIT'] }, 9: true },
      },
      framebufferTextureLayer: { 5: { 0: true, 1: true } },
      invalidateFramebuffer: { 2: { 0: true } },
      invalidateSubFramebuffer: { 6: { 0: true } },
      readBuffer: { 1: { 0: true } },
      // WebGL 2 Renderbuffer objects
      getInternalformatParameter: { 3: { 0: true, 1: true, 2: true } },
      renderbufferStorageMultisample: { 5: { 0: true, 2: true } },
      // WebGL 2 Texture objects
      texStorage2D: { 5: { 0: true, 2: true } },
      texStorage3D: { 6: { 0: true, 2: true } },
      texImage2D: {
          9: { 0: true, 2: true, 6: true, 7: true },
          6: { 0: true, 2: true, 3: true, 4: true },
          10: { 0: true, 2: true, 6: true, 7: true },
      },
      texImage3D: {
          10: { 0: true, 2: true, 7: true, 8: true },
          11: { 0: true, 2: true, 7: true, 8: true },
      },
      texSubImage2D: {
          9: { 0: true, 6: true, 7: true },
          7: { 0: true, 4: true, 5: true },
          10: { 0: true, 6: true, 7: true },
      },
      texSubImage3D: {
          11: { 0: true, 8: true, 9: true },
          12: { 0: true, 8: true, 9: true },
      },
      copyTexSubImage3D: { 9: { 0: true } },
      compressedTexImage2D: {
          7: { 0: true, 2: true },
          8: { 0: true, 2: true },
          9: { 0: true, 2: true },
      },
      compressedTexImage3D: {
          8: { 0: true, 2: true },
          9: { 0: true, 2: true },
          10: { 0: true, 2: true },
      },
      compressedTexSubImage2D: {
          8: { 0: true, 6: true },
          9: { 0: true, 6: true },
          10: { 0: true, 6: true },
      },
      compressedTexSubImage3D: {
          10: { 0: true, 8: true },
          11: { 0: true, 8: true },
          12: { 0: true, 8: true },
      },
      // WebGL 2 Vertex attribs
      vertexAttribIPointer: { 5: { 2: true } },
      // WebGL 2 Writing to the drawing buffer
      drawArraysInstanced: { 4: { 0: true } },
      drawElementsInstanced: { 5: { 0: true, 2: true } },
      drawRangeElements: { 6: { 0: true, 4: true } },
      // WebGL 2 Reading back pixels
      readPixels: {
          7: { 4: true, 5: true },
          8: { 4: true, 5: true },
      },
      // WebGL 2 Multiple Render Targets
      clearBufferfv: { 3: { 0: true }, 4: { 0: true } },
      clearBufferiv: { 3: { 0: true }, 4: { 0: true } },
      clearBufferuiv: { 3: { 0: true }, 4: { 0: true } },
      clearBufferfi: { 4: { 0: true } },
      // WebGL 2 Query objects
      beginQuery: { 2: { 0: true } },
      endQuery: { 1: { 0: true } },
      getQuery: { 2: { 0: true, 1: true } },
      getQueryParameter: { 2: { 1: true } },
      // WebGL 2 Sampler objects
      samplerParameteri: { 3: { 1: true, 2: true } },
      samplerParameterf: { 3: { 1: true } },
      getSamplerParameter: { 2: { 1: true } },
      // WebGL 2 Sync objects
      fenceSync: { 2: { 0: true, 1: { enumBitwiseOr: [] } } },
      clientWaitSync: { 3: { 1: { enumBitwiseOr: ['SYNC_FLUSH_COMMANDS_BIT'] } } },
      waitSync: { 3: { 1: { enumBitwiseOr: [] } } },
      getSyncParameter: { 2: { 1: true } },
      // WebGL 2 Transform Feedback
      bindTransformFeedback: { 2: { 0: true } },
      beginTransformFeedback: { 1: { 0: true } },
      transformFeedbackVaryings: { 3: { 2: true } },
      // WebGL2 Uniform Buffer Objects and Transform Feedback Buffers
      bindBufferBase: { 3: { 0: true } },
      bindBufferRange: { 5: { 0: true } },
      getIndexedParameter: { 2: { 0: true } },
      getActiveUniforms: { 3: { 2: true } },
      getActiveUniformBlockParameter: { 3: { 2: true } },
  };
  /**
   * Map of numbers to names.
   * @type {Object}
   */
  let glEnums = null;
  /**
   * Map of names to numbers.
   * @type {Object}
   */
  let enumStringToValue = null;
  /**
   * Initializes this module. Safe to call more than once.
   * @param ctx A WebGL context. If
   *    you have more than one context it doesn't matter which one
   *    you pass in, it is only used to pull out constants.
   */
  function init() {
      if (null === glEnums) {
          glEnums = {};
          enumStringToValue = {};
          const c = window.WebGL2RenderingContext || window.WebGLRenderingContext;
          if (!c)
              throw new Error('Neither WebGL2RenderingContext nor WebGLRenderingContext exists on window.');
          for (const propertyName in c) {
              const prop = c[propertyName];
              if ('number' === typeof prop) {
                  glEnums[prop] = propertyName;
                  enumStringToValue[propertyName] = prop;
              }
          }
      }
  }
  /**
   * Gets an string version of an WebGL enum.
   *
   * Example:
   *   var str = WebGLDebugUtil.glEnumToString(ctx.getError())
   *
   * @param value Value to return an enum for
   * @return The string version of the enum.
   */
  function glEnumToString(value) {
      init();
      var name = glEnums[value];
      return name !== undefined ? 'gl.' + name : '/*UNKNOWN WebGL ENUM*/ 0x' + value.toString(16) + '';
  }
  /**
   * Converts the argument of a WebGL function to a string.
   * Attempts to convert enum arguments to strings.
   *
   * Example:
   *   WebGLDebugUtil.init(ctx)
   *   var str = WebGLDebugUtil.glFunctionArgToString('bindTexture', 2, 0, gl.TEXTURE_2D)
   *
   * would return 'TEXTURE_2D'
   *
   * @param functionName the name of the WebGL function.
   * @param numArgs the number of arguments passed to the function.
   * @param argumentIndex the index of the argument.
   * @param value The value of the argument.
   * @return The value as a string.
   */
  function glFunctionArgToString(functionName, numArgs, argumentIndex, value) {
      const funcInfo = glValidEnumContexts[functionName];
      if (funcInfo !== undefined) {
          const funcOverloadInfo = funcInfo[numArgs];
          if (funcOverloadInfo !== undefined) {
              const argInfo = funcOverloadInfo[argumentIndex];
              if (argInfo) {
                  if (typeof argInfo === 'object') {
                      const enums = argInfo.enumBitwiseOr;
                      const orEnums = [];
                      let orResult = 0;
                      for (let i = 0; i < enums.length; ++i) {
                          const enumValue = enumStringToValue[enums[i]];
                          if ((value & enumValue) !== 0) {
                              orResult |= enumValue;
                              orEnums.push(glEnumToString(enumValue));
                          }
                      }
                      if (orResult === value) {
                          return orEnums.join(' | ');
                      }
                      else {
                          return glEnumToString(value);
                      }
                  }
                  else {
                      return glEnumToString(value);
                  }
              }
          }
      }
      if (value === null) {
          return 'null';
      }
      else if (value === undefined) {
          return 'undefined';
      }
      else {
          return value.toString();
      }
  }
  function makePropertyWrapper(wrapper, original, propertyName) {
      //log('wrap prop: ' + propertyName)
      wrapper.__defineGetter__(propertyName, function () {
          return original[propertyName];
      });
      // TODO(gmane): this needs to handle properties that take more than
      // one value?
      wrapper.__defineSetter__(propertyName, function (value) {
          //log('set: ' + propertyName)
          original[propertyName] = value;
      });
  }
  /**
   * Given a WebGL context returns a wrapped context that calls
   * gl.getError after every command and calls a function if the
   * result is not NO_ERROR.
   *
   * You can supply your own function if you want. For example, if you'd like
   * an exception thrown on any GL error you could do this
   *
   *    function throwOnGLError(err, funcName, args) {
   *      throw new Error(WebGLDebugUtils.glEnumToString(err) +
   *            ' was caused by call to ' + funcName)
   *    }
   *
   *    ctx = WebGLDebugUtils.makeDebugContext(
   *        canvas.getContext('webgl'), throwOnGLError)
   *
   * @param ctx The webgl context to wrap.
   * @param opt_onErrorFunc The function
   *     to call when gl.getError returns an error. If not specified the default
   *     function calls console.log with a message.
   * @param opt_onFunc The
   *     function to call when each webgl function is called. You
   *     can use this to log all calls for example.
   * @param opt_err_ctx The webgl context
   *        to call getError on if different than ctx.
   */
  function makeDebugContext(ctx, opt_onErrorFunc, opt_onFunc, opt_err_ctx = ctx) {
      init();
      opt_onErrorFunc =
          opt_onErrorFunc ||
              function (err, functionName, args) {
                  // apparently we can't do args.join(',')
                  var argStr = '';
                  var numArgs = args.length;
                  for (let i = 0; i < numArgs; ++i) {
                      argStr += (i == 0 ? '' : ', ') + glFunctionArgToString(functionName, numArgs, i, args[i]);
                  }
                  error('WebGL error ' + glEnumToString(err) + ' in ' + functionName + '(' + argStr + ')');
              };
      // Holds booleans for each GL error so after we get the error ourselves
      // we can still return it to the client app.
      const glErrorShadow = {};
      // Makes a function that calls a WebGL function and then calls getError.
      function makeErrorWrapper(ctx, functionName) {
          return function (...args) {
              if (opt_onFunc) {
                  opt_onFunc(functionName, args);
              }
              const result = ctx[functionName].apply(ctx, args);
              const err = opt_err_ctx.getError();
              if (err != 0) {
                  glErrorShadow[err] = true;
                  opt_onErrorFunc(err, functionName, args);
              }
              return result;
          };
      }
      // Make a an object that has a copy of every property of the WebGL context
      // but wraps all functions.
      const wrapper = {};
      for (let propertyName in ctx) {
          const prop = ctx[propertyName];
          if ('function' === typeof prop) {
              if (propertyName != 'getExtension') {
                  wrapper[propertyName] = makeErrorWrapper(ctx, propertyName);
              }
              else {
                  let wrapped = makeErrorWrapper(ctx, propertyName);
                  wrapper[propertyName] = function () {
                      const result = wrapped.apply(ctx, arguments);
                      if (!result) {
                          return null;
                      }
                      return makeDebugContext(result, opt_onErrorFunc, opt_onFunc, opt_err_ctx);
                  };
              }
          }
          else {
              makePropertyWrapper(wrapper, ctx, propertyName);
          }
      }
      // Override the getError function with one that returns our saved results.
      wrapper.getError = function () {
          for (const err in glErrorShadow) {
              if (glErrorShadow.hasOwnProperty(err)) {
                  if (glErrorShadow[err]) {
                      glErrorShadow[err] = false;
                      return parseInt(err);
                  }
              }
          }
          return ctx.NO_ERROR;
      };
      return wrapper;
  }

  var posCoordVS = "attribute vec2 ts_TexCoord;attribute vec4 ts_Vertex;uniform mat4 ts_ModelViewProjectionMatrix;varying vec2 coord;void main(){coord=ts_TexCoord.xy;gl_Position=ts_ModelViewProjectionMatrix*ts_Vertex;}";

  var sdfRenderFS = "precision mediump float;uniform sampler2D u_texture;uniform vec4 u_color;uniform float u_buffer;uniform float u_gamma;uniform float u_debug;varying vec2 coord;void main(){float dist=texture2D(u_texture,coord).r;if(u_debug>0.0){gl_FragColor=vec4(dist,dist,dist,1);}else{float alpha=smoothstep(u_buffer-u_gamma,u_buffer+u_gamma,dist);gl_FragColor=vec4(u_color.rgb,alpha*u_color.a);if(gl_FragColor.a==0.0){discard;}}}";
  function currentGL$$1() {
      return TSGLContextBase$$1.gl;
  }
  class TSGLContextBase$$1 {
      constructor(gl, immediate = {
          mesh: new Mesh$$1().addVertexBuffer('coords', 'ts_TexCoord').addVertexBuffer('colors', 'ts_Color'),
          mode: -1,
          coord: [0, 0],
          color: [1, 1, 1, 1],
          pointSize: 1,
          shader: Shader$$1.create(`
			attribute vec4 ts_Color;
			attribute vec4 ts_Vertex;
			uniform mat4 ts_ModelViewProjectionMatrix;
			attribute vec2 ts_TexCoord;
            uniform float pointSize;
            varying vec4 color;
            varying vec2 coord;
            void main() {
                color = ts_Color;
                coord = ts_TexCoord;
                gl_Position = ts_ModelViewProjectionMatrix * ts_Vertex;
                gl_PointSize = pointSize;
            }
		`, `
			precision highp float;
            uniform sampler2D texture;
            uniform float pointSize;
            // uniform bool useTexture;
            varying vec4 color;
            varying vec2 coord;
            void main() {
                gl_FragColor = color;
                // if (useTexture) gl_FragColor *= texture2D(texture, coord.xy);
            }
        `, gl),
      }) {
          this.immediate = immediate;
          this.modelViewMatrix = M4.identity();
          this.projectionMatrix = M4.identity();
          this.tempMatrix = new M4();
          this.resultMatrix = new M4();
          this.modelViewStack = [];
          this.projectionStack = [];
          this.drawCallCount = 0;
          this.projectionMatrixVersion = 0;
          this.modelViewMatrixVersion = 0;
          this.cachedSDFMeshes = {};
          this.matrixMode(TSGLContextBase$$1.MODELVIEW);
      }
      /// Implement the OpenGL modelview and projection matrix stacks, along with some other useful GLU matrix functions.
      matrixMode(mode) {
          switch (mode) {
              case this.MODELVIEW:
                  this.currentMatrixName = 'modelViewMatrix';
                  this.stack = this.modelViewStack;
                  break;
              case this.PROJECTION:
                  this.currentMatrixName = 'projectionMatrix';
                  this.stack = this.projectionStack;
                  break;
              default:
                  throw new Error('invalid matrix mode ' + mode);
          }
      }
      loadIdentity() {
          M4.identity(this[this.currentMatrixName]);
          this.currentMatrixName == 'projectionMatrix' ? this.projectionMatrixVersion++ : this.modelViewMatrixVersion++;
      }
      loadMatrix(m4) {
          M4.copy(m4, this[this.currentMatrixName]);
          this.currentMatrixName == 'projectionMatrix' ? this.projectionMatrixVersion++ : this.modelViewMatrixVersion++;
      }
      multMatrix(m4) {
          M4.multiply(this[this.currentMatrixName], m4, this.resultMatrix);
          const temp = this.resultMatrix;
          this.resultMatrix = this[this.currentMatrixName];
          this[this.currentMatrixName] = temp;
          this.currentMatrixName == 'projectionMatrix' ? this.projectionMatrixVersion++ : this.modelViewMatrixVersion++;
      }
      mirror(plane) {
          this.multMatrix(M4.mirror(plane));
      }
      perspective(fovDegrees, aspect, near, far) {
          this.multMatrix(M4.perspectiveRad(fovDegrees * DEG, aspect, near, far, this.tempMatrix));
      }
      frustum(left, right, bottom, top, near, far) {
          this.multMatrix(M4.frustum(left, right, bottom, top, near, far, this.tempMatrix));
      }
      ortho(left, right, bottom, top, near, far) {
          this.multMatrix(M4.ortho(left, right, bottom, top, near, far, this.tempMatrix));
      }
      scale(...args) {
          this.multMatrix(M4.scale(...args, this.tempMatrix));
      }
      mirroredX() {
          this.multMatrix(M4.mirror(P3ZX));
      }
      translate(x, y, z) {
          if (undefined !== y) {
              this.multMatrix(M4.translate(x, y, z, this.tempMatrix));
          }
          else {
              this.multMatrix(M4.translate(x, this.tempMatrix));
          }
      }
      rotate(angleDegrees, x, y, z) {
          this.multMatrix(M4.rotate(angleDegrees * DEG, { x, y, z }, this.tempMatrix));
      }
      lookAt(eye, center, up) {
          this.multMatrix(M4.lookAt(eye, center, up, this.tempMatrix));
      }
      pushMatrix() {
          this.stack.push(M4.copy(this[this.currentMatrixName]));
      }
      popMatrix() {
          const pop = this.stack.pop();
          assert(undefined !== pop);
          this[this.currentMatrixName] = pop;
          this.currentMatrixName == 'projectionMatrix' ? this.projectionMatrixVersion++ : this.modelViewMatrixVersion++;
      }
      /**
       * World coordinates (WC) to screen/window coordinates matrix
       */
      wcToWindowMatrix() {
          const viewport = this.getParameter(this.VIEWPORT);
          const [x, y, w, h] = viewport;
          // prettier-ignore
          const viewportToScreenMatrix = new M4([
              w / 2, 0, 0, x + w / 2,
              h / 2, 0, 0, y + h / 2,
              0, 0, 1, 0,
              0, 0, 0, 1,
          ]);
          return M4.product(viewportToScreenMatrix, this.projectionMatrix, this.modelViewMatrix);
      }
      /////////// IMMEDIATE MODE
      // ### Immediate mode
      //
      // Provide an implementation of OpenGL's deprecated immediate mode. This is
      // deprecated for a reason: constantly re-specifying the geometry is a bad
      // idea for performance. You should use a `GL.Mesh` instead, which specifies
      // the geometry once and caches it on the graphics card. Still, nothing
      // beats a quick `viewerGL.begin(WGL.POINTS); viewerGL.vertex(1, 2, 3); viewerGL.end();` for
      // debugging. This intentionally doesn't implement fixed-function lighting
      // because it's only meant for quick debugging tasks.
      pointSize(pointSize) {
          this.immediate.shader.uniforms({ pointSize: pointSize });
      }
      begin(mode) {
          if (this.immediate.mode != -1)
              throw new Error('mismatched viewerGL.begin() and viewerGL.end() calls');
          this.immediate.mode = mode;
          this.immediate.mesh.colors = [];
          this.immediate.mesh.coords = [];
          this.immediate.mesh.vertices = [];
      }
      color(...args) {
          this.immediate.color =
              1 == args.length && Array.isArray(args[0])
                  ? args[0]
                  : 1 == args.length && 'number' == typeof args[0]
                      ? hexIntToGLColor(args[0])
                      : 1 == args.length && 'string' == typeof args[0]
                          ? chroma(args[0]).gl()
                          : [args[0], args[1], args[2], args[3] || 1];
      }
      texCoord(...args) {
          this.immediate.coord = V.apply(undefined, args).toArray(2);
      }
      vertex(...args) {
          this.immediate.mesh.colors.push(this.immediate.color);
          this.immediate.mesh.coords.push(this.immediate.coord);
          this.immediate.mesh.vertices.push(V.apply(undefined, args));
      }
      end() {
          if (this.immediate.mode == -1)
              throw new Error('mismatched viewerGL.begin() and viewerGL.end() calls');
          this.immediate.mesh.compile();
          this.immediate.shader
              .uniforms({
              useTexture: !!TSGLContextBase$$1.gl.getParameter(this.TEXTURE_BINDING_2D),
          })
              .drawBuffers(this.immediate.mesh.vertexBuffers, undefined, this.immediate.mode);
          this.immediate.mode = -1;
      }
      makeCurrent() {
          TSGLContextBase$$1.gl = this;
      }
      /**
       * Starts an animation loop.
       */
      animate(callback) {
          const requestAnimationFrame = window.requestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              function (callback) {
                  setTimeout(() => callback(performance.now()), 1000 / 60);
              };
          let time$$1 = performance.now(), keepUpdating = true;
          const update = (now) => {
              if (keepUpdating) {
                  callback.call(this, now, now - time$$1);
                  time$$1 = now;
                  requestAnimationFrame(update);
              }
          };
          requestAnimationFrame(update);
          return () => {
              keepUpdating = false;
          };
      }
      /**
       * Provide an easy way to get a fullscreen app running, including an
       * automatic 3D perspective projection matrix by default. This should be
       * called once.
       *
       * Just fullscreen, no automatic camera:
       *
       *     viewerGL.fullscreen({ camera: false })
       *
       * Adjusting field of view, near plane distance, and far plane distance:
       *
       *     viewerGL.fullscreen({ fov: 45, near: 0.1, far: 1000 })
       *
       * Adding padding from the edge of the window:
       *
       *     viewerGL.fullscreen({ paddingLeft: 250, paddingBottom: 60 })
       */
      fullscreen(options = {}) {
          const top = options.paddingTop || 0;
          const left = options.paddingLeft || 0;
          const right = options.paddingRight || 0;
          const bottom = options.paddingBottom || 0;
          if (!document.body) {
              throw new Error("document.body doesn't exist yet (call viewerGL.fullscreen() from " +
                  'window.onload() or from inside the <body> tag)');
          }
          document.body.appendChild(this.canvas);
          document.body.style.overflow = 'hidden';
          this.canvas.style.position = 'absolute';
          this.canvas.style.left = left + 'px';
          this.canvas.style.top = top + 'px';
          this.canvas.style.width = window.innerWidth - left - right + 'px';
          this.canvas.style.bottom = window.innerHeight - top - bottom + 'px';
          const gl = this;
          function windowOnResize() {
              gl.canvas.width = (window.innerWidth - left - right) * window.devicePixelRatio;
              gl.canvas.height = (window.innerHeight - top - bottom) * window.devicePixelRatio;
              gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
              if (options.camera) {
                  gl.matrixMode(TSGLContextBase$$1.PROJECTION);
                  gl.loadIdentity();
                  gl.perspective(options.fov || 45, gl.canvas.width / gl.canvas.height, options.near || 0.1, options.far || 1000);
                  gl.matrixMode(TSGLContextBase$$1.MODELVIEW);
              }
          }
          window.addEventListener('resize', windowOnResize);
          windowOnResize();
          return this;
      }
      getMouseLine(canvasPosXOrE, canvasPosY) {
          if (canvasPosXOrE instanceof MouseEvent) {
              return this.getMouseLine(canvasPosXOrE.offsetX, canvasPosXOrE.offsetY);
          }
          const ndc1 = V((canvasPosXOrE * 2) / this.canvas.offsetWidth - 1, (-canvasPosY * 2) / this.canvas.offsetHeight + 1, 0);
          const ndc2 = V((canvasPosXOrE * 2) / this.canvas.offsetWidth - 1, (-canvasPosY * 2) / this.canvas.offsetHeight + 1, 1);
          const inverseProjectionMatrix = this.projectionMatrix.inversed();
          const anchor = inverseProjectionMatrix.transformPoint(ndc1);
          const dir = inverseProjectionMatrix.transformPoint(ndc2).minus(anchor);
          return { anchor, dir };
      }
      viewportFill() {
          this.viewport(0, 0, this.canvas.width, this.canvas.height);
      }
      setupTextRendering(pngURL, jsonURL) {
          return __awaiter$1(this, void 0, void 0, function* () {
              this.textRenderShader = Shader$$1.create(posCoordVS, sdfRenderFS);
              [this.textAtlas, this.textMetrics] = yield Promise.all([
                  Texture$$1.fromURL(pngURL, {
                      format: this.LUMINANCE,
                      internalFormat: this.LUMINANCE,
                      type: this.UNSIGNED_BYTE,
                  }),
                  fetch(jsonURL).then(r => r.json()),
              ]);
              // const cs = this.textMetrics.chars
              // const maxY = Object.keys(cs).reduce((a, b) => Math.max(a, cs[b][3]), 0)
              // const minY = Object.keys(cs).reduce((a, b) => Math.min(a, cs[b][3] - cs[b][1]), 0)
              // console.log(maxY, minY)
          });
      }
      getSDFMeshForString(str) {
          assert(this.textMetrics);
          return (this.cachedSDFMeshes[str] ||
              (this.cachedSDFMeshes[str] = createTextMesh(this.textMetrics, this.textAtlas, str)));
      }
      renderText(string, color, size = 1, xAlign = 'left', baseline = 'bottom', gamma = 0.05, lineHeight = 1.2) {
          const strMesh = this.getSDFMeshForString(string);
          this.pushMatrix();
          this.scale(size);
          const xTranslate = { left: 0, center: -0.5, right: -1 };
          const yTranslate = {
              top: -this.textMetrics.ascender / this.textMetrics.size,
              middle: (-this.textMetrics.ascender - this.textMetrics.descender) / 2 / this.textMetrics.size,
              alphabetic: 0,
              bottom: -this.textMetrics.descender / this.textMetrics.size,
          };
          // console.log('yTranslate[baseline]', yTranslate[baseline])
          this.translate(xTranslate[xAlign] * strMesh.width, yTranslate[baseline], 0);
          this.multMatrix(M4.forSys(V3.X, V3.Y, new V3(0, -lineHeight, 0)));
          this.textAtlas.bind(0);
          this.textRenderShader
              .uniforms({ texture: 0, u_color: color, u_debug: 0, u_gamma: gamma, u_buffer: 192 / 256 })
              .draw(strMesh);
          this.popMatrix();
          // gl.uniform1f(shader.u_debug, debug ? 1 : 0)
          // gl.uniform4fv(shader.u_color, [1, 1, 1, 1])
          // gl.uniform1f(shader.u_buffer, buffer)
          // gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numItems)
          // gl.uniform4fv(shader.u_color, [0, 0, 0, 1])
          // gl.uniform1f(shader.u_buffer, 192 / 256)
          // gl.uniform1f(shader.u_gamma, (gamma * 1.4142) / scale)
          // gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numItems)
      }
      static create(options = {}) {
          const canvas = options.canvas || document.createElement('canvas');
          if (!options.canvas) {
              canvas.width = 800;
              canvas.height = 600;
          }
          if (!('alpha' in options))
              options.alpha = false;
          let newGL = undefined;
          try {
              newGL = canvas.getContext('webgl2', options);
              newGL && (newGL.version = 2);
              if (!newGL) {
                  newGL = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
                  newGL && (newGL.version = 1);
              }
              console.log('getting context');
          }
          catch (e) {
              console.log(e, 'Failed to get context');
          }
          if (!newGL)
              throw new Error('WebGL not supported');
          if (options.throwOnError) {
              newGL = makeDebugContext(newGL, (err, funcName) => {
                  throw new Error(glEnumToString(err) + ' was caused by ' + funcName);
              });
          }
          TSGLContextBase$$1.gl = newGL;
          addOwnProperties(newGL, TSGLContextBase$$1.prototype);
          addOwnProperties(newGL, new TSGLContextBase$$1(newGL));
          //addEventListeners(newGL)
          return newGL;
      }
      fixCanvasRes() {
          this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
          this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
          this.viewport(0, 0, this.canvas.width, this.canvas.height);
      }
  }
  TSGLContextBase$$1.MODELVIEW = 0;
  TSGLContextBase$$1.PROJECTION = 1;
  TSGLContextBase$$1.HALF_FLOAT_OES = 0x8d61;
  var TSGLContext;
  (function (TSGLContext$$1) {
      /**
       * `create()` creates a new WebGL context and augments it with more methods. The alpha channel is disabled
       * by default because it usually causes unintended transparencies in the canvas.
       */
      TSGLContext$$1.create = TSGLContextBase$$1.create;
  })(TSGLContext || (TSGLContext = {}));
  // enum WGL_ERROR {
  // 	NO_ERROR = WGL.NO_ERROR,
  // 	INVALID_ENUM = WGL.INVALID_ENUM,
  // 	INVALID_VALUE = WGL.INVALID_VALUE,
  // 	INVALID_OPERATION = WGL.INVALID_OPERATION,
  // 	INVALID_FRAMEBUFFER_OPERATION = WGL.INVALID_FRAMEBUFFER_OPERATION,
  // 	OUT_OF_MEMORY = WGL.OUT_OF_MEMORY,
  // 	CONTEXT_LOST_WEBGL = WGL.CONTEXT_LOST_WEBGL,
  // }
  TSGLContextBase$$1.prototype.MODELVIEW = TSGLContextBase$$1.MODELVIEW;
  TSGLContextBase$$1.prototype.PROJECTION = TSGLContextBase$$1.PROJECTION;
  TSGLContextBase$$1.prototype.HALF_FLOAT_OES = TSGLContextBase$$1.HALF_FLOAT_OES;
  /**
   *
   * Push two triangles:
   * ```
   c - d
   | \ |
   a - b
   ```
   */
  function pushQuad$$1(triangles, flipped, a, b, c, d) {
      // prettier-ignore
      if (flipped) {
          triangles.push(a, c, b, b, c, d);
      }
      else {
          triangles.push(a, b, c, b, d, c);
      }
  }
  function hexIntToGLColor(color) {
      return [(color >> 16) / 255.0, ((color >> 8) & 0xff) / 255.0, (color & 0xff) / 255.0, 1.0];
  }
  // function measureText(metrics: FontJsonMetrics, text: string, size: number) {
  // 	const dimensions = {
  // 		advance: 0,
  // 	}
  // 	const scale = size / metrics.size
  // 	for (let i = 0; i < text.length; i++) {
  // 		const horiAdvance = metrics.chars[text[i]][4]
  // 		dimensions.advance += horiAdvance * scale
  // 	}
  // 	return dimensions
  // }
  // gl.getExtension('OES_standard_derivatives')
  // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE)
  // gl.enable(gl.BLEND)
  // const texture = gl.createTexture()
  // const vertexBuffer = gl.createBuffer()
  // const textureBuffer = gl.createBuffer()
  function createTextMesh(fontMetrics, fontTextureAtlas, str, lineHeight = 1) {
      const mesh = new Mesh$$1().addIndexBuffer('TRIANGLES').addVertexBuffer('coords', 'ts_TexCoord');
      let cursorX = 0;
      let cursorY = 0;
      function drawGlyph(chr) {
          const metric = fontMetrics.chars[chr];
          if (!metric)
              return;
          const [width, height, horiBearingX, horiBearingY, horiAdvance, posX, posY] = metric;
          const { size, buffer } = fontMetrics;
          const quadStartIndex = mesh.vertices.length;
          // buffer = margin on texture
          if (width > 0 && height > 0) {
              // Add a quad (= two triangles) per glyph.
              const left = (cursorX + horiBearingX - buffer) / size;
              const right = (cursorX + horiBearingX + width + buffer) / size;
              const bottom = (horiBearingY - height - buffer) / size;
              const top = (horiBearingY + buffer) / size;
              mesh.vertices.push(new V3(left, bottom, cursorY / size), new V3(right, bottom, cursorY / size), new V3(left, top, cursorY / size), new V3(right, top, cursorY / size));
              const coordsLeft = posX / fontTextureAtlas.width;
              const coordsRight = (posX + width + 2 * buffer) / fontTextureAtlas.width;
              const coordsBottom = (posY + height + 2 * buffer) / fontTextureAtlas.height;
              const coordsTop = posY / fontTextureAtlas.height;
              mesh.coords.push([coordsLeft, coordsBottom], [coordsRight, coordsBottom], [coordsLeft, coordsTop], [coordsRight, coordsTop]);
              // mesh.coords.push([0, 0], [0, 1], [1, 0], [1, 1])
              pushQuad$$1(mesh.TRIANGLES, false, quadStartIndex, quadStartIndex + 1, quadStartIndex + 2, quadStartIndex + 3);
          }
          // pen.x += Math.ceil(horiAdvance * scale);
          cursorX += horiAdvance;
      }
      for (let i = 0; i < str.length; i++) {
          const chr = str[i];
          if ('\n' == chr) {
              cursorX = 0;
              cursorY += lineHeight * fontMetrics.size;
          }
          else {
              drawGlyph(chr);
          }
      }
      return Object.assign(mesh.compile(), { width: cursorX / fontMetrics.size, lineCount: cursorY + 1 });
  }
  //# sourceMappingURL=bundle.module.js.map

  var posVS = "precision mediump float;uniform mat4 ts_ModelViewProjectionMatrix;attribute vec4 ts_Vertex;void main(){gl_Position=ts_ModelViewProjectionMatrix*ts_Vertex;}";

  /**
   * lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="npm" -o ./`
   * Copyright jQuery Foundation and other contributors <https://jquery.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */

  /** Used as the `TypeError` message for "Functions" methods. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /** `Object#toString` result references. */
  var funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]';

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  /**
   * Checks if `value` is a host object in IE < 9.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
   */
  function isHostObject(value) {
    // Many host objects are `Object` objects that can coerce to strings
    // despite having improperly defined `toString` methods.
    var result = false;
    if (value != null && typeof value.toString != 'function') {
      try {
        result = !!(value + '');
      } catch (e) {}
    }
    return result;
  }

  /** Used for built-in method references. */
  var arrayProto = Array.prototype,
      funcProto = Function.prototype,
      objectProto = Object.prototype;

  /** Used to detect overreaching core-js shims. */
  var coreJsData = root['__core-js_shared__'];

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString = objectProto.toString;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /** Built-in value references. */
  var splice = arrayProto.splice;

  /* Built-in method references that are verified to be native. */
  var Map$1 = getNative(root, 'Map'),
      nativeCreate = getNative(Object, 'create');

  /**
   * Creates a hash object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Hash(entries) {
    var index = -1,
        length = entries ? entries.length : 0;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  /**
   * Removes all key-value entries from the hash.
   *
   * @private
   * @name clear
   * @memberOf Hash
   */
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
  }

  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @name delete
   * @memberOf Hash
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function hashDelete(key) {
    return this.has(key) && delete this.__data__[key];
  }

  /**
   * Gets the hash value for `key`.
   *
   * @private
   * @name get
   * @memberOf Hash
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : undefined;
  }

  /**
   * Checks if a hash value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Hash
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
  }

  /**
   * Sets the hash `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Hash
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the hash instance.
   */
  function hashSet(key, value) {
    var data = this.__data__;
    data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
    return this;
  }

  // Add methods to `Hash`.
  Hash.prototype.clear = hashClear;
  Hash.prototype['delete'] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;

  /**
   * Creates an list cache object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function ListCache(entries) {
    var index = -1,
        length = entries ? entries.length : 0;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  /**
   * Removes all key-value entries from the list cache.
   *
   * @private
   * @name clear
   * @memberOf ListCache
   */
  function listCacheClear() {
    this.__data__ = [];
  }

  /**
   * Removes `key` and its value from the list cache.
   *
   * @private
   * @name delete
   * @memberOf ListCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function listCacheDelete(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    return true;
  }

  /**
   * Gets the list cache value for `key`.
   *
   * @private
   * @name get
   * @memberOf ListCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function listCacheGet(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    return index < 0 ? undefined : data[index][1];
  }

  /**
   * Checks if a list cache value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf ListCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }

  /**
   * Sets the list cache `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf ListCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the list cache instance.
   */
  function listCacheSet(key, value) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }

  // Add methods to `ListCache`.
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype['delete'] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function MapCache(entries) {
    var index = -1,
        length = entries ? entries.length : 0;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */
  function mapCacheClear() {
    this.__data__ = {
      'hash': new Hash,
      'map': new (Map$1 || ListCache),
      'string': new Hash
    };
  }

  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function mapCacheDelete(key) {
    return getMapData(this, key)['delete'](key);
  }

  /**
   * Gets the map value for `key`.
   *
   * @private
   * @name get
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }

  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }

  /**
   * Sets the map `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache instance.
   */
  function mapCacheSet(key, value) {
    getMapData(this, key).set(key, value);
    return this;
  }

  // Add methods to `MapCache`.
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype['delete'] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;

  /**
   * Gets the index at which the `key` is found in `array` of key-value pairs.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} key The key to search for.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq$1(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource$1(value));
  }

  /**
   * Gets the data for `map`.
   *
   * @private
   * @param {Object} map The map to query.
   * @param {string} key The reference key.
   * @returns {*} Returns the map data.
   */
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key)
      ? data[typeof key == 'string' ? 'string' : 'hash']
      : data.map;
  }

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */
  function isKeyable(value) {
    var type = typeof value;
    return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
      ? (value !== '__proto__')
      : (value === null);
  }

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to process.
   * @returns {string} Returns the source code.
   */
  function toSource$1(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  /**
   * Creates a function that memoizes the result of `func`. If `resolver` is
   * provided, it determines the cache key for storing the result based on the
   * arguments provided to the memoized function. By default, the first argument
   * provided to the memoized function is used as the map cache key. The `func`
   * is invoked with the `this` binding of the memoized function.
   *
   * **Note:** The cache is exposed as the `cache` property on the memoized
   * function. Its creation may be customized by replacing the `_.memoize.Cache`
   * constructor with one whose instances implement the
   * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
   * method interface of `delete`, `get`, `has`, and `set`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to have its output memoized.
   * @param {Function} [resolver] The function to resolve the cache key.
   * @returns {Function} Returns the new memoized function.
   * @example
   *
   * var object = { 'a': 1, 'b': 2 };
   * var other = { 'c': 3, 'd': 4 };
   *
   * var values = _.memoize(_.values);
   * values(object);
   * // => [1, 2]
   *
   * values(other);
   * // => [3, 4]
   *
   * object.a = 2;
   * values(object);
   * // => [1, 2]
   *
   * // Modify the result cache.
   * values.cache.set(object, ['a', 'b']);
   * values(object);
   * // => ['a', 'b']
   *
   * // Replace `_.memoize.Cache`.
   * _.memoize.Cache = WeakMap;
   */
  function memoize(func, resolver) {
    if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments,
          key = resolver ? resolver.apply(this, args) : args[0],
          cache = memoized.cache;

      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result);
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache);
    return memoized;
  }

  // Assign cache to `_.memoize`.
  memoize.Cache = MapCache;

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq$1(value, other) {
    return value === other || (value !== value && other !== other);
  }

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 8-9 which returns 'object' for typed array and other constructors.
    var tag = isObject(value) ? objectToString.call(value) : '';
    return tag == funcTag || tag == genTag;
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  var lodash_memoize = memoize;

  var colorFS = "precision mediump float;uniform vec4 color;void main(){gl_FragColor=color;}";

  var posNormalColorVS = "precision mediump float;uniform mat4 ts_ModelViewProjectionMatrix;uniform mat3 ts_NormalMatrix;uniform float f;attribute vec3 ts_Normal;attribute vec4 ts_Vertex;attribute vec4 ts_Vertex2;attribute vec4 ts_Color;varying vec3 normal;varying vec4 color;void main(){vec4 v=mix(ts_Vertex,ts_Vertex2,f);gl_Position=ts_ModelViewProjectionMatrix*v;normal=ts_NormalMatrix*ts_Normal;color=ts_Color;}";

  var varyingColorFS = "precision mediump float;varying vec4 color;void main(){gl_FragColor=color;}";

  function renderHueCylinder(gl, radius, radialStart, radialName, radialEnd, vStart, vName, vEnd) {
      gl.begin(gl.LINES);
      gl.color("black");
      // lightness
      gl.vertex(V3.O);
      gl.vertex(V(0, 0, 1));
      // saturation
      gl.vertex(V3.O);
      gl.vertex(V(radius, 0, 0));
      for (let i = 0; i < 256; i++) {
          gl.vertex(V3.polar(radius, (i / 256) * 2 * Math.PI, 0));
          gl.vertex(V3.polar(radius, ((i + 1) / 256) * 2 * Math.PI, 0));
      }
      gl.end();
      for (let hue = 0; hue < 360; hue += 30) {
          gl.pushMatrix();
          gl.rotate(hue, 0, 0, 1);
          gl.translate(radius, 0);
          gl.rotate(90, 0, 0, 1.0);
          gl.renderText(hue + "°", chroma.hsl(hue, 1, 0.5).gl(), 0.05, "center", "top");
          gl.renderText(hue + "°", [0, 0, 0, 1], 0.05, "center", "top", 0.2);
          gl.popMatrix();
      }
      gl.pushMatrix();
      gl.rotate(90, 1, 0, 0);
      gl.renderText(radialStart, [0, 0, 0, 1], 0.05, "left", "top");
      gl.translate(0.25, 0, 0);
      gl.renderText(radialName, [0, 0, 0, 1], 0.05, "center", "top");
      gl.translate(0.25, 0, 0);
      gl.renderText(radialEnd, [0, 0, 0, 1], 0.05, "right", "top");
      gl.popMatrix();
      // lightness
      gl.pushMatrix();
      // gl.rotate(-135, 0, 0, 1)
      gl.rotate(90, 1, 0, 0);
      gl.renderText(vStart, [0, 0, 0, 1], 0.05, "left", "bottom");
      gl.translate(0, 0.5, 0);
      gl.renderText(vName, [0, 0, 0, 1], 0.05, "left", "middle");
      gl.translate(0, 0.5, 0);
      gl.renderText(vEnd, [0, 0, 0, 1], 0.05, "left", "top");
      gl.popMatrix();
  }
  const colorSpaces = {
      rgb: {
          render(gl) {
              gl.translate(-0.5, -0.5, 0);
              gl.begin(gl.LINES);
              gl.color("black");
              gl.vertex(V3.O);
              gl.vertex(V3.X);
              gl.vertex(V3.O);
              gl.vertex(V3.Y);
              gl.vertex(V3.O);
              gl.vertex(V3.Z);
              gl.end();
              gl.pushMatrix();
              gl.rotate(90, 1, 0, 0);
              gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "top");
              gl.translate(0.5, 0, 0);
              gl.renderText("red", [1, 0, 0, 1], 0.05, "center", "top");
              gl.translate(0.5, 0, 0);
              gl.renderText("255", [0, 0, 0, 1], 0.05, "right", "top");
              gl.popMatrix();
              gl.pushMatrix();
              gl.rotate(90, 0, 0, 1);
              gl.rotate(90, 1, 0, 0);
              gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "top");
              gl.translate(0.5, 0, 0);
              gl.renderText("green", [0, 1, 0, 1], 0.05, "center", "top");
              gl.translate(0.5, 0, 0);
              gl.renderText("255", [0, 0, 0, 1], 0.05, "right", "top");
              gl.popMatrix();
              gl.pushMatrix();
              gl.rotate(-135, 0, 0, 1);
              gl.rotate(90, 1, 0, 0);
              gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "bottom");
              gl.translate(0, 0.5, 0);
              gl.renderText("blue", [0, 0, 1, 1], 0.05, "left", "middle");
              gl.translate(0, 0.5, 0);
              gl.renderText("255", [0, 0, 0, 1], 0.05, "left", "top");
              gl.popMatrix();
          },
          convert(color) {
              const [x, y, z] = color.gl();
              return new V3(x - 0.5, y - 0.5, z);
          },
          title: "RGB",
          children: (React__default.createElement(React__default.Fragment, null, "The RGB color space. What your screen uses. Red, green and blue channels, generally 8 bits each, for a total of 16 million colors.")),
      },
      hsl: {
          render(gl) {
              renderHueCylinder(gl, 0.5, "0", "saturation", "100%", "0", "lightness", "100%");
          },
          convert(color) {
              const [h, s, l] = color.hsl();
              return V3.polar(s * 0.5, h * DEG).plus(new V3(0, 0, l));
          },
          title: "HSL",
          children: React__default.createElement(React__default.Fragment, null, "Hue, saturation and lightness. Also supported by CSS."),
      },
      hsv: {
          render(gl) {
              renderHueCylinder(gl, 0.5, "0", "saturation", "100%", "0", "value", "100%");
          },
          convert(color) {
              const [h, s, v] = color.hsv();
              return V3.polar(s * 0.5, h * DEG).plus(new V3(0, 0, v));
          },
          title: "HSV",
          children: React__default.createElement(React__default.Fragment, null),
      },
      hcl: {
          render(gl) {
              renderHueCylinder(gl, 0.5, "0", "chroma", "200", "0", "luminance", "100");
          },
          convert(color) {
              const [l, c, h] = color.lch();
              return V3.polar((c / 200) * 0.5, h * DEG).plus(new V3(0, 0, l / 100));
          },
          title: "HCL",
          children: (React__default.createElement(React__default.Fragment, null,
              React__default.createElement("a", { href: "https://en.wikipedia.org/wiki/HCL_color_space" }, "wiki"))),
      },
      lab: {
          render(gl) {
              gl.begin(gl.LINES);
              gl.color("black");
              // L*
              gl.vertex(V3.O);
              gl.vertex(new V3(0, 0, 1));
              // A*
              gl.vertex(new V3((-87 / 100) * 0.5, 0, 0));
              gl.vertex(new V3((99 / 100) * 0.5, 0, 0));
              // B*
              gl.vertex(new V3(0, (-108 / 100) * 0.5, 0));
              gl.vertex(new V3(0, (95 / 100) * 0.5, 0));
              gl.end();
              gl.pushMatrix();
              gl.rotate(90, 1, 0, 0);
              gl.renderText("A*", [1, 0, 0, 1], 0.05, "center", "top");
              gl.translate((-87 / 100) * 0.5, 0, 0);
              gl.renderText("-87", [0, 0, 0, 1], 0.05, "left", "top");
              gl.translate(((99 + 87) / 100) * 0.5, 0, 0);
              gl.renderText("99", [0, 0, 0, 1], 0.05, "right", "top");
              gl.popMatrix();
              gl.pushMatrix();
              gl.rotate(90, 0, 0, 1);
              gl.rotate(90, 1, 0, 0);
              gl.renderText("B*", [1, 0, 0, 1], 0.05, "center", "top");
              gl.translate((-108 / 100) * 0.5, 0, 0);
              gl.renderText("-108", [0, 0, 0, 1], 0.05, "left", "top");
              gl.translate(((95 + 108) / 100) * 0.5, 0, 0);
              gl.renderText("95", [0, 0, 0, 1], 0.05, "right", "top");
              gl.popMatrix();
              gl.pushMatrix();
              gl.rotate(-135, 0, 0, 1);
              gl.rotate(90, 1, 0, 0);
              gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "bottom");
              gl.translate(0, 0.5, 0);
              gl.renderText("blue", [0, 0, 1, 1], 0.05, "left", "middle");
              gl.translate(0, 0.5, 0);
              gl.renderText("255", [0, 0, 0, 1], 0.05, "left", "top");
              gl.popMatrix();
          },
          convert(color) {
              const [l, a, b] = color.lab();
              return new V3((a / 100) * 0.5, (b / 100) * 0.5, l / 100);
          },
          title: "CIELAB",
          children: (React__default.createElement(React__default.Fragment, null,
              "CIELAB color space. Much closer to perceptual uniform that RGB or HSL.",
              " ",
              React__default.createElement("a", { href: "https://en.wikipedia.org/wiki/CIELAB_color_space" }, "wiki"))),
      },
      xyz: {
          render(gl) {
              gl.begin(gl.LINES);
              gl.color("black");
              // L*
              gl.vertex(V3.O);
              gl.vertex(new V3(0, 0, 1));
              // A*
              gl.vertex(new V3((-87 / 100) * 0.5, 0, 0));
              gl.vertex(new V3((99 / 100) * 0.5, 0, 0));
              // B*
              gl.vertex(new V3(0, (-108 / 100) * 0.5, 0));
              gl.vertex(new V3(0, (95 / 100) * 0.5, 0));
              gl.end();
              gl.pushMatrix();
              gl.rotate(90, 1, 0, 0);
              gl.renderText("X", [1, 0, 0, 1], 0.05, "center", "top");
              gl.translate((-87 / 100) * 0.5, 0, 0);
              gl.renderText("-87", [0, 0, 0, 1], 0.05, "left", "top");
              gl.translate(((99 + 87) / 100) * 0.5, 0, 0);
              gl.renderText("99", [0, 0, 0, 1], 0.05, "right", "top");
              gl.popMatrix();
              gl.pushMatrix();
              gl.rotate(90, 0, 0, 1);
              gl.rotate(90, 1, 0, 0);
              gl.renderText("Y", [1, 0, 0, 1], 0.05, "center", "top");
              gl.translate((-108 / 100) * 0.5, 0, 0);
              gl.renderText("-108", [0, 0, 0, 1], 0.05, "left", "top");
              gl.translate(((95 + 108) / 100) * 0.5, 0, 0);
              gl.renderText("95", [0, 0, 0, 1], 0.05, "right", "top");
              gl.popMatrix();
              gl.pushMatrix();
              gl.rotate(-135, 0, 0, 1);
              gl.rotate(90, 1, 0, 0);
              gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "bottom");
              gl.translate(0, 0.5, 0);
              gl.renderText("Z", [0, 0, 1, 1], 0.05, "left", "middle");
              gl.translate(0, 0.5, 0);
              gl.renderText("255", [0, 0, 0, 1], 0.05, "left", "top");
              gl.popMatrix();
          },
          convert(color) {
              const [x, y, z] = color.xyz();
              return new V3(x * 0.5, y * 0.5, z);
          },
          title: "XYZ",
          children: (React__default.createElement(React__default.Fragment, null,
              "CIELAB color space. Much closer to perceptual uniform that RGB or HSL.",
              " ",
              React__default.createElement("a", { href: "https://en.wikipedia.org/wiki/CIELAB_color_space" }, "wiki"))),
      },
  };
  //# sourceMappingURL=colorSpaces.js.map

  /*

  +-----------------------------------------------------------------+
  |   Created by Chirag Mehta - http://chir.ag/tech/download/ntc    |
  |-----------------------------------------------------------------|
  |               ntc js (Name that Color JavaScript)               |
  +-----------------------------------------------------------------+

  All the functions, code, lists etc. have been written specifically
  for the Name that Color JavaScript by Chirag Mehta unless otherwise
  specified.

  This script is released under the: Creative Commons License:
  Attribution 2.5 http://creativecommons.org/licenses/by/2.5/

  Sample Usage:

    <script type="text/javascript" src="ntc.js"></script>

    <script type="text/javascript">

      var n_match  = ntc.name("#6195ED");
      n_rgb = n_match[0]; // This is the RGB value of the closest matching color
      n_name = n_match[1]; // This is the text string for the name of the match
      n_shade_rgb = n_match[2]; // This is the RGB value for the name of colors shade
      n_shade_name = n_match[3]; // This is the text string for the name of colors shade
      n_exactmatch = n_match[4]; // True if exact color match, False if close-match

      alert(n_match);

    </script>

  */

  var ntc = {
  	init: function() {
  		var color, rgb, hsl;
  		for (var i = 0; i < ntc.names.length; i++) {
  			color = "#" + ntc.names[i][0];
  			rgb = ntc.rgb(color);
  			hsl = ntc.hsl(color);
  			ntc.names[i].push(rgb[0], rgb[1], rgb[2], hsl[0], hsl[1], hsl[2]);
  		}
  	},

  	name: function(color) {
  		color = color.toUpperCase();
  		if (color.length < 3 || color.length > 7) return ["#000000", "Invalid Color: " + color, "#000000", "", false]
  		if (color.length % 3 == 0) color = "#" + color;
  		if (color.length == 4)
  			color =
  				"#" +
  				color.substr(1, 1) +
  				color.substr(1, 1) +
  				color.substr(2, 1) +
  				color.substr(2, 1) +
  				color.substr(3, 1) +
  				color.substr(3, 1);

  		var rgb = ntc.rgb(color);
  		var r = rgb[0],
  			g = rgb[1],
  			b = rgb[2];
  		var hsl = ntc.hsl(color);
  		var h = hsl[0],
  			s = hsl[1],
  			l = hsl[2];
  		var ndf1 = 0;
  		ndf2 = 0;
  		ndf = 0;
  		var cl = -1,
  			df = -1;

  		for (var i = 0; i < ntc.names.length; i++) {
  			if (color == "#" + ntc.names[i][0])
  				return ["#" + ntc.names[i][0], ntc.names[i][1], ntc.shadergb(ntc.names[i][2]), ntc.names[i][2], true]

  			ndf1 =
  				Math.pow(r - ntc.names[i][3], 2) + Math.pow(g - ntc.names[i][4], 2) + Math.pow(b - ntc.names[i][5], 2);
  			ndf2 =
  				Math.abs(Math.pow(h - ntc.names[i][6], 2)) +
  				Math.pow(s - ntc.names[i][7], 2) +
  				Math.abs(Math.pow(l - ntc.names[i][8], 2));
  			ndf = ndf1 + ndf2 * 2;
  			if (df < 0 || df > ndf) {
  				df = ndf;
  				cl = i;
  			}
  		}

  		return cl < 0
  			? ["#000000", "Invalid Color: " + color, "#000000", "", false]
  			: ["#" + ntc.names[cl][0], ntc.names[cl][1], ntc.shadergb(ntc.names[cl][2]), ntc.names[cl][2], false]
  	},

  	// adopted from: Farbtastic 1.2
  	// http://acko.net/dev/farbtastic
  	hsl: function(color) {
  		var rgb = [
  			parseInt("0x" + color.substring(1, 3)) / 255,
  			parseInt("0x" + color.substring(3, 5)) / 255,
  			parseInt("0x" + color.substring(5, 7)) / 255,
  		];
  		var min, max, delta, h, s, l;
  		var r = rgb[0],
  			g = rgb[1],
  			b = rgb[2];

  		min = Math.min(r, Math.min(g, b));
  		max = Math.max(r, Math.max(g, b));
  		delta = max - min;
  		l = (min + max) / 2;

  		s = 0;
  		if (l > 0 && l < 1) s = delta / (l < 0.5 ? 2 * l : 2 - 2 * l);

  		h = 0;
  		if (delta > 0) {
  			if (max == r && max != g) h += (g - b) / delta;
  			if (max == g && max != b) h += 2 + (b - r) / delta;
  			if (max == b && max != r) h += 4 + (r - g) / delta;
  			h /= 6;
  		}
  		return [parseInt(h * 255), parseInt(s * 255), parseInt(l * 255)]
  	},

  	// adopted from: Farbtastic 1.2
  	// http://acko.net/dev/farbtastic
  	rgb: function(color) {
  		return [
  			parseInt("0x" + color.substring(1, 3)),
  			parseInt("0x" + color.substring(3, 5)),
  			parseInt("0x" + color.substring(5, 7)),
  		]
  	},

  	shadergb: function(shadename) {
  		for (var i = 0; i < ntc.shades.length; i++) {
  			if (shadename == ntc.shades[i][1]) return "#" + ntc.shades[i][0]
  		}
  		return "#000000"
  	},

  	shades: [
  		["FF0000", "Red"],
  		["FFA500", "Orange"],
  		["FFFF00", "Yellow"],
  		["008000", "Green"],
  		["0000FF", "Blue"],
  		["EE82EE", "Violet"],
  		["A52A2A", "Brown"],
  		["000000", "Black"],
  		["808080", "Grey"],
  		["FFFFFF", "White"],
  	],

  	names: [
  		["35312C", "Acadia", "Brown"],
  		["75AA94", "Acapulco", "Green"],
  		["C0E8D5", "Aero Blue", "Green"],
  		["745085", "Affair", "Violet"],
  		["905E26", "Afghan Tan", "Yellow"],
  		["5D8AA8", "Air Force Blue", "Blue"],
  		["BEB29A", "Akaroa", "Yellow"],
  		["F2F0E6", "Alabaster", "Grey"],
  		["E1DACB", "Albescent White", "Yellow"],
  		["954E2C", "Alert Tan", "Orange"],
  		["F0F8FF", "Alice Blue", "Blue"],
  		["E32636", "Alizarin", "Red"],
  		["1F6A7D", "Allports", "Blue"],
  		["EED9C4", "Almond", "Yellow"],
  		["9A8678", "Almond Frost", "Brown"],
  		["AD8A3B", "Alpine", "Yellow"],
  		["CDC6C5", "Alto", "Grey"],
  		["848789", "Aluminium", "Grey"],
  		["E52B50", "Amaranth", "Red"],
  		["387B54", "Amazon", "Green"],
  		["FFBF00", "Amber", "Yellow"],
  		["8A7D72", "Americano", "Brown"],
  		["9966CC", "Amethyst", "Violet"],
  		["95879C", "Amethyst Smoke", "Violet"],
  		["F5E6EA", "Amour", "Violet"],
  		["7D9D72", "Amulet", "Green"],
  		["8CCEEA", "Anakiwa", "Blue"],
  		["6C461F", "Antique Brass", "Orange"],
  		["FAEBD7", "Antique White", "White"],
  		["C68E3F", "Anzac", "Yellow"],
  		["D3A95C", "Apache", "Yellow"],
  		["66B348", "Apple", "Green"],
  		["A95249", "Apple Blossom", "Red"],
  		["DEEADC", "Apple Green", "Green"],
  		["FBCEB1", "Apricot", "Orange"],
  		["F7F0DB", "Apricot White", "Yellow"],
  		["00FFFF", "Aqua", "Blue"],
  		["D9DDD5", "Aqua Haze", "Grey"],
  		["E8F3E8", "Aqua Spring", "Green"],
  		["DBE4DC", "Aqua Squeeze", "Grey"],
  		["7FFFD4", "Aquamarine", "Blue"],
  		["274A5D", "Arapawa", "Blue"],
  		["484A46", "Armadillo", "Grey"],
  		["4B5320", "Army green", "Green"],
  		["827A67", "Arrowtown", "Yellow"],
  		["3B444B", "Arsenic", "Grey"],
  		["BEBAA7", "Ash", "Green"],
  		["7BA05B", "Asparagus", "Green"],
  		["EDD5A6", "Astra", "Yellow"],
  		["376F89", "Astral", "Blue"],
  		["445172", "Astronaut", "Blue"],
  		["214559", "Astronaut Blue", "Blue"],
  		["DCDDDD", "Athens Grey", "Grey"],
  		["D5CBB2", "Aths Special", "Yellow"],
  		["9CD03B", "Atlantis", "Green"],
  		["2B797A", "Atoll", "Green"],
  		["3D4B52", "Atomic", "Blue"],
  		["FF9966", "Atomic Tangerine", "Orange"],
  		["9E6759", "Au Chico", "Brown"],
  		["372528", "Aubergine", "Brown"],
  		["712F2C", "Auburn", "Brown"],
  		["EFF8AA", "Australian Mint", "Green"],
  		["95986B", "Avocado", "Green"],
  		["63775A", "Axolotl", "Green"],
  		["F9C0C4", "Azalea", "Red"],
  		["293432", "Aztec", "Green"],
  		["F0FFFF", "Azure", "Blue"],
  		["6FFFFF", "Baby Blue", "Blue"],
  		["25597F", "Bahama Blue", "Blue"],
  		["A9C01C", "Bahia", "Green"],
  		["5C3317", "Baker's Chocolate", "Brown"],
  		["849CA9", "Bali Hai", "Blue"],
  		["3C3D3E", "Baltic Sea", "Grey"],
  		["FBE7B2", "Banana Mania", "Yellow"],
  		["878466", "Bandicoot", "Green"],
  		["D2C61F", "Barberry", "Green"],
  		["B6935C", "Barley Corn", "Yellow"],
  		["F7E5B7", "Barley White", "Yellow"],
  		["452E39", "Barossa", "Violet"],
  		["2C2C32", "Bastille", "Blue"],
  		["51574F", "Battleship Grey", "Grey"],
  		["7BB18D", "Bay Leaf", "Green"],
  		["353E64", "Bay Of Many", "Blue"],
  		["8F7777", "Bazaar", "Brown"],
  		["EBB9B3", "Beauty Bush", "Red"],
  		["926F5B", "Beaver", "Brown"],
  		["E9D7AB", "Beeswax", "Yellow"],
  		["F5F5DC", "Beige", "Brown"],
  		["86D2C1", "Bermuda", "Green"],
  		["6F8C9F", "Bermuda Grey", "Blue"],
  		["BCBFA8", "Beryl Green", "Green"],
  		["F4EFE0", "Bianca", "Yellow"],
  		["334046", "Big Stone", "Blue"],
  		["3E8027", "Bilbao", "Green"],
  		["AE99D2", "Biloba Flower", "Violet"],
  		["3F3726", "Birch", "Yellow"],
  		["D0C117", "Bird Flower", "Green"],
  		["2F3C53", "Biscay", "Blue"],
  		["486C7A", "Bismark", "Blue"],
  		["B5AC94", "Bison Hide", "Yellow"],
  		["FFE4C4", "Bisque", "Brown"],
  		["3D2B1F", "Bistre", "Brown"],
  		["88896C", "Bitter", "Green"],
  		["D2DB32", "Bitter Lemon", "Green"],
  		["FE6F5E", "Bittersweet", "Orange"],
  		["E7D2C8", "Bizarre", "Orange"],
  		["000000", "Black", "Black"],
  		["232E26", "Black Bean", "Green"],
  		["2C3227", "Black Forest", "Green"],
  		["E0DED7", "Black Haze", "Grey"],
  		["332C22", "Black Magic", "Brown"],
  		["383740", "Black Marlin", "Blue"],
  		["1E272C", "Black Pearl", "Blue"],
  		["2C2D3C", "Black Rock", "Blue"],
  		["532934", "Black Rose", "Red"],
  		["24252B", "Black Russian", "Grey"],
  		["E5E6DF", "Black Squeeze", "Grey"],
  		["E5E4DB", "Black White", "Grey"],
  		["43182F", "Blackberry", "Violet"],
  		["2E183B", "Blackcurrant", "Violet"],
  		["D9D0C1", "Blanc", "Yellow"],
  		["FFEBCD", "Blanched Almond", "Brown"],
  		["EBE1CE", "Bleach White", "Yellow"],
  		["A3E3ED", "Blizzard Blue", "Blue"],
  		["DFB1B6", "Blossom", "Red"],
  		["0000FF", "Blue", "Blue"],
  		["62777E", "Blue Bayoux", "Blue"],
  		["9999CC", "Blue Bell", "Blue"],
  		["E3D6E9", "Blue Chalk", "Violet"],
  		["262B2F", "Blue Charcoal", "Blue"],
  		["408F90", "Blue Chill", "Green"],
  		["4B2D72", "Blue Diamond", "Violet"],
  		["35514F", "Blue Dianne", "Green"],
  		["4B3C8E", "Blue Gem", "Violet"],
  		["BDBACE", "Blue Haze", "Violet"],
  		["00626F", "Blue Lagoon", "Green"],
  		["6A5BB1", "Blue Marguerite", "Violet"],
  		["D8F0D2", "Blue Romance", "Green"],
  		["78857A", "Blue Smoke", "Green"],
  		["166461", "Blue Stone", "Green"],
  		["8A2BE2", "Blue Violet", "Violet"],
  		["1E3442", "Blue Whale", "Blue"],
  		["3C4354", "Blue Zodiac", "Blue"],
  		["305C71", "Blumine", "Blue"],
  		["B55067", "Blush", "Red"],
  		["2A2725", "Bokara Grey", "Grey"],
  		["79443B", "Bole", "Brown"],
  		["AEAEAD", "Bombay", "Grey"],
  		["DFD7D2", "Bon Jour", "Grey"],
  		["0095B6", "Bondi Blue", "Blue"],
  		["DBC2AB", "Bone", "Orange"],
  		["4C1C24", "Bordeaux", "Red"],
  		["4C3D4E", "Bossanova", "Violet"],
  		["438EAC", "Boston Blue", "Blue"],
  		["92ACB4", "Botticelli", "Blue"],
  		["254636", "Bottle Green", "Green"],
  		["7C817C", "Boulder", "Grey"],
  		["A78199", "Bouquet", "Violet"],
  		["AF6C3E", "Bourbon", "Orange"],
  		["5B3D27", "Bracken", "Brown"],
  		["DCB68A", "Brandy", "Orange"],
  		["C07C40", "Brandy Punch", "Orange"],
  		["B6857A", "Brandy Rose", "Red"],
  		["B5A642", "Brass", "Yellow"],
  		["517B78", "Breaker Bay", "Green"],
  		["C62D42", "Brick Red", "Red"],
  		["F8EBDD", "Bridal Heath", "Orange"],
  		["FAE6DF", "Bridesmaid", "Orange"],
  		["66FF00", "Bright Green", "Green"],
  		["57595D", "Bright Grey", "Grey"],
  		["922A31", "Bright Red", "Red"],
  		["ECBD2C", "Bright Sun", "Yellow"],
  		["08E8DE", "Bright Turquoise", "Blue"],
  		["FF55A3", "Brilliant Rose", "Red"],
  		["FB607F", "Brink Pink", "Red"],
  		["004225", "British Racing Green", "Green"],
  		["A79781", "Bronco", "Brown"],
  		["CD7F32", "Bronze", "Brown"],
  		["584C25", "Bronze Olive", "Yellow"],
  		["434C28", "Bronzetone", "Yellow"],
  		["EECC24", "Broom", "Yellow"],
  		["A52A2A", "Brown", "Brown"],
  		["53331E", "Brown Bramble", "Brown"],
  		["594537", "Brown Derby", "Brown"],
  		["3C241B", "Brown Pod", "Brown"],
  		["E6F2EA", "Bubbles", "Green"],
  		["6E5150", "Buccaneer", "Red"],
  		["A5A88F", "Bud", "Green"],
  		["BC9B1B", "Buddha Gold", "Yellow"],
  		["F0DC82", "Buff", "Yellow"],
  		["482427", "Bulgarian Rose", "Red"],
  		["75442B", "Bull Shot", "Orange"],
  		["292C2F", "Bunker", "Grey"],
  		["2B3449", "Bunting", "Blue"],
  		["800020", "Burgundy", "Red"],
  		["DEB887", "Burly Wood", "Brown"],
  		["234537", "Burnham", "Green"],
  		["D08363", "Burning Sand", "Orange"],
  		["582124", "Burnt Crimson", "Red"],
  		["FF7034", "Burnt Orange", "Orange"],
  		["E97451", "Burnt Sienna", "Brown"],
  		["8A3324", "Burnt Umber", "Brown"],
  		["DA9429", "Buttercup", "Yellow"],
  		["9D702E", "Buttered Rum", "Yellow"],
  		["68578C", "Butterfly Bush", "Violet"],
  		["F6E0A4", "Buttermilk", "Yellow"],
  		["F1EBDA", "Buttery White", "Yellow"],
  		["4A2E32", "Cab Sav", "Red"],
  		["CD526C", "Cabaret", "Red"],
  		["4C5544", "Cabbage Pont", "Green"],
  		["5B6F55", "Cactus", "Green"],
  		["5F9EA0", "Cadet Blue", "Blue"],
  		["984961", "Cadillac", "Red"],
  		["6A4928", "Cafe Royale", "Brown"],
  		["D5B185", "Calico", "Brown"],
  		["E98C3A", "California", "Orange"],
  		["3D7188", "Calypso", "Blue"],
  		["206937", "Camarone", "Green"],
  		["803A4B", "Camelot", "Red"],
  		["CCA483", "Cameo", "Brown"],
  		["4F4D32", "Camouflage", "Yellow"],
  		["78866B", "Camouflage Green", "Green"],
  		["D08A9B", "Can Can", "Red"],
  		["FFFF99", "Canary", "Yellow"],
  		["8E5164", "Cannon Pink", "Red"],
  		["4E5552", "Cape Cod", "Grey"],
  		["FEE0A5", "Cape Honey", "Yellow"],
  		["75482F", "Cape Palliser", "Orange"],
  		["AFC182", "Caper", "Green"],
  		["592720", "Caput Mortuum", "Brown"],
  		["FFD59A", "Caramel", "Yellow"],
  		["EBE5D5", "Cararra", "Green"],
  		["1B3427", "Cardin Green", "Green"],
  		["C41E3A", "Cardinal", "Red"],
  		["C99AA0", "Careys Pink", "Red"],
  		["00CC99", "Caribbean Green", "Green"],
  		["E68095", "Carissma", "Red"],
  		["F5F9CB", "Carla", "Green"],
  		["960018", "Carmine", "Red"],
  		["5B3A24", "Carnaby Tan", "Brown"],
  		["FFA6C9", "Carnation Pink", "Red"],
  		["F8DBE0", "Carousel Pink", "Red"],
  		["ED9121", "Carrot Orange", "Orange"],
  		["F0B253", "Casablanca", "Yellow"],
  		["3F545A", "Casal", "Blue"],
  		["8CA8A0", "Cascade", "Green"],
  		["D1B399", "Cashmere", "Brown"],
  		["AAB5B8", "Casper", "Blue"],
  		["44232F", "Castro", "Red"],
  		["273C5A", "Catalina Blue", "Blue"],
  		["E0E4DC", "Catskill White", "Grey"],
  		["E0B8B1", "Cavern Pink", "Red"],
  		["9271A7", "Ce Soir", "Violet"],
  		["463430", "Cedar", "Brown"],
  		["ACE1AF", "Celadon", "Green"],
  		["B4C04C", "Celery", "Green"],
  		["D2D2C0", "Celeste", "Green"],
  		["3A4E5F", "Cello", "Blue"],
  		["2B3F36", "Celtic", "Green"],
  		["857158", "Cement", "Brown"],
  		["DE3163", "Cerise", "Violet"],
  		["007BA7", "Cerulean", "Blue"],
  		["2A52BE", "Cerulean Blue", "Blue"],
  		["FDE9E0", "Chablis", "Red"],
  		["5A6E41", "Chalet Green", "Green"],
  		["DFC281", "Chalky", "Yellow"],
  		["475877", "Chambray", "Blue"],
  		["E8CD9A", "Chamois", "Yellow"],
  		["EED9B6", "Champagne", "Yellow"],
  		["EDB8C7", "Chantilly", "Red"],
  		["394043", "Charade", "Blue"],
  		["464646", "Charcoal", "Grey"],
  		["F8EADF", "Chardon", "Orange"],
  		["FFC878", "Chardonnay", "Yellow"],
  		["A4DCE6", "Charlotte", "Blue"],
  		["D0748B", "Charm", "Red"],
  		["7FFF00", "Chartreuse", "Green"],
  		["DFFF00", "Chartreuse Yellow", "Yellow"],
  		["419F59", "Chateau Green", "Green"],
  		["B3ABB6", "Chatelle", "Violet"],
  		["2C5971", "Chathams Blue", "Blue"],
  		["88A95B", "Chelsea Cucumber", "Green"],
  		["95532F", "Chelsea Gem", "Orange"],
  		["DEC371", "Chenin", "Yellow"],
  		["F5CD82", "Cherokee", "Yellow"],
  		["372D52", "Cherry Pie", "Violet"],
  		["F5D7DC", "Cherub", "Red"],
  		["B94E48", "Chestnut", "Brown"],
  		["666FB4", "Chetwode Blue", "Blue"],
  		["5B5D56", "Chicago", "Grey"],
  		["F0F5BB", "Chiffon", "Green"],
  		["D05E34", "Chilean Fire", "Orange"],
  		["F9F7DE", "Chilean Heath", "Green"],
  		["FBF3D3", "China Ivory", "Green"],
  		["B8AD8A", "Chino", "Yellow"],
  		["9DD3A8", "Chinook", "Green"],
  		["D2691E", "Chocolate", "Brown"],
  		["382161", "Christalle", "Violet"],
  		["71A91D", "Christi", "Green"],
  		["BF652E", "Christine", "Orange"],
  		["CAC7B7", "Chrome White", "Green"],
  		["7D4E38", "Cigar", "Brown"],
  		["242A2E", "Cinder", "Grey"],
  		["FBD7CC", "Cinderella", "Red"],
  		["E34234", "Cinnabar", "Red"],
  		["5D3B2E", "Cioccolato", "Brown"],
  		["8E9A21", "Citron", "Green"],
  		["9FB70A", "Citrus", "Green"],
  		["D2B3A9", "Clam Shell", "Orange"],
  		["6E2233", "Claret", "Red"],
  		["F4C8DB", "Classic Rose", "Violet"],
  		["897E59", "Clay Creek", "Yellow"],
  		["DFEFEA", "Clear Day", "Green"],
  		["463623", "Clinker", "Brown"],
  		["C2BCB1", "Cloud", "Yellow"],
  		["353E4F", "Cloud Burst", "Blue"],
  		["B0A99F", "Cloudy", "Brown"],
  		["47562F", "Clover", "Green"],
  		["0047AB", "Cobalt", "Blue"],
  		["4F3835", "Cocoa Bean", "Red"],
  		["35281E", "Cocoa Brown", "Brown"],
  		["E1DABB", "Coconut Cream", "Green"],
  		["2D3032", "Cod Grey", "Grey"],
  		["726751", "Coffee", "Yellow"],
  		["362D26", "Coffee Bean", "Brown"],
  		["9A463D", "Cognac", "Red"],
  		["3C2F23", "Cola", "Brown"],
  		["9D8ABF", "Cold Purple", "Violet"],
  		["CAB5B2", "Cold Turkey", "Red"],
  		["9BDDFF", "Columbia Blue", "Blue"],
  		["636373", "Comet", "Blue"],
  		["4C785C", "Como", "Green"],
  		["A0B1AE", "Conch", "Green"],
  		["827F79", "Concord", "Grey"],
  		["D2D1CD", "Concrete", "Grey"],
  		["DDCB46", "Confetti", "Green"],
  		["654D49", "Congo Brown", "Brown"],
  		["B1DD52", "Conifer", "Green"],
  		["C16F68", "Contessa", "Red"],
  		["DA8A67", "Copper", "Red"],
  		["77422C", "Copper Canyon", "Orange"],
  		["996666", "Copper Rose", "Violet"],
  		["95524C", "Copper Rust", "Red"],
  		["FF7F50", "Coral", "Orange"],
  		["F5D0C9", "Coral Candy", "Red"],
  		["FF4040", "Coral Red", "Red"],
  		["AB6E67", "Coral Tree", "Red"],
  		["404D49", "Corduroy", "Green"],
  		["BBB58D", "Coriander", "Green"],
  		["5A4C42", "Cork", "Brown"],
  		["FBEC5D", "Corn", "Yellow"],
  		["F8F3C4", "Corn Field", "Green"],
  		["42426F", "Corn Flower Blue", "Blue"],
  		["8D702A", "Corn Harvest", "Yellow"],
  		["FFF8DC", "Corn Silk", "Yellow"],
  		["93CCEA", "Cornflower", "Blue"],
  		["6495ED", "Cornflower Blue", "Blue"],
  		["E9BA81", "Corvette", "Orange"],
  		["794D60", "Cosmic", "Violet"],
  		["E1F8E7", "Cosmic Latte", "White"],
  		["FCD5CF", "Cosmos", "Red"],
  		["625D2A", "Costa Del Sol", "Green"],
  		["FFB7D5", "Cotton Candy", "Red"],
  		["BFBAAF", "Cotton Seed", "Yellow"],
  		["1B4B35", "County Green", "Green"],
  		["443736", "Cowboy", "Brown"],
  		["87382F", "Crab Apple", "Red"],
  		["A65648", "Crail", "Red"],
  		["DB5079", "Cranberry", "Red"],
  		["4D3E3C", "Crater Brown", "Brown"],
  		["FFFDD0", "Cream", "White"],
  		["FFE39B", "Cream Brulee", "Yellow"],
  		["EEC051", "Cream Can", "Yellow"],
  		["393227", "Creole", "Brown"],
  		["77712B", "Crete", "Green"],
  		["DC143C", "Crimson", "Red"],
  		["706950", "Crocodile", "Yellow"],
  		["763C33", "Crown Of Thorns", "Red"],
  		["B4E2D5", "Cruise", "Green"],
  		["165B31", "Crusoe", "Green"],
  		["F38653", "Crusta", "Orange"],
  		["784430", "Cumin", "Orange"],
  		["F5F4C1", "Cumulus", "Green"],
  		["F5B2C5", "Cupid", "Red"],
  		["3D85B8", "Curious Blue", "Blue"],
  		["5C8173", "Cutty Sark", "Green"],
  		["0F4645", "Cyprus", "Green"],
  		["EDD2A4", "Dairy Cream", "Yellow"],
  		["5B3E90", "Daisy Bush", "Violet"],
  		["664A2D", "Dallas", "Brown"],
  		["FED85D", "Dandelion", "Yellow"],
  		["5B89C0", "Danube", "Blue"],
  		["00008B", "Dark Blue", "Blue"],
  		["654321", "Dark Brown", "Brown"],
  		["08457E", "Dark Cerulean", "Blue"],
  		["986960", "Dark Chestnut", "Red"],
  		["CD5B45", "Dark Coral", "Orange"],
  		["008B8B", "Dark Cyan", "Green"],
  		["B8860B", "Dark Goldenrod", "Yellow"],
  		["A9A9A9", "Dark Gray", "Grey"],
  		["013220", "Dark Green", "Green"],
  		["4A766E", "Dark Green Copper", "Green"],
  		["BDB76B", "Dark Khaki", "Yellow"],
  		["8B008B", "Dark Magenta", "Violet"],
  		["556B2F", "Dark Olive Green", "Green"],
  		["FF8C00", "Dark Orange", "Orange"],
  		["9932CC", "Dark Orchid", "Violet"],
  		["03C03C", "Dark Pastel Green", "Green"],
  		["E75480", "Dark Pink", "Red"],
  		["871F78", "Dark Purple", "Violet"],
  		["8B0000", "Dark Red", "Red"],
  		["45362B", "Dark Rum", "Brown"],
  		["E9967A", "Dark Salmon", "Orange"],
  		["8FBC8F", "Dark Sea Green", "Green"],
  		["465352", "Dark Slate", "Green"],
  		["483D8B", "Dark Slate Blue", "Blue"],
  		["2F4F4F", "Dark Slate Grey", "Grey"],
  		["177245", "Dark Spring Green", "Green"],
  		["97694F", "Dark Tan", "Brown"],
  		["FFA812", "Dark Tangerine", "Orange"],
  		["00CED1", "Dark Turquoise", "Blue"],
  		["9400D3", "Dark Violet", "Violet"],
  		["855E42", "Dark Wood", "Brown"],
  		["788878", "Davy's Grey", "Grey"],
  		["9F9D91", "Dawn", "Green"],
  		["E6D6CD", "Dawn Pink", "Orange"],
  		["85CA87", "De York", "Green"],
  		["CCCF82", "Deco", "Green"],
  		["E36F8A", "Deep Blush", "Red"],
  		["51412D", "Deep Bronze", "Brown"],
  		["DA3287", "Deep Cerise", "Violet"],
  		["193925", "Deep Fir", "Green"],
  		["343467", "Deep Koamaru", "Violet"],
  		["9955BB", "Deep Lilac", "Violet"],
  		["CC00CC", "Deep Magenta", "Violet"],
  		["FF1493", "Deep Pink", "Red"],
  		["167E65", "Deep Sea", "Green"],
  		["00BFFF", "Deep Sky Blue", "Blue"],
  		["19443C", "Deep Teal", "Green"],
  		["B5998E", "Del Rio", "Brown"],
  		["486531", "Dell", "Green"],
  		["999B95", "Delta", "Grey"],
  		["8272A4", "Deluge", "Violet"],
  		["1560BD", "Denim", "Blue"],
  		["F9E4C6", "Derby", "Yellow"],
  		["A15F3B", "Desert", "Orange"],
  		["EDC9AF", "Desert Sand", "Brown"],
  		["EDE7E0", "Desert Storm", "Grey"],
  		["E7F2E9", "Dew", "Green"],
  		["322C2B", "Diesel", "Grey"],
  		["696969", "Dim Gray", "Grey"],
  		["607C47", "Dingley", "Green"],
  		["892D4F", "Disco", "Red"],
  		["CD8431", "Dixie", "Yellow"],
  		["1E90FF", "Dodger Blue", "Blue"],
  		["F5F171", "Dolly", "Green"],
  		["6A6873", "Dolphin", "Violet"],
  		["6C5B4C", "Domino", "Brown"],
  		["5A4F51", "Don Juan", "Brown"],
  		["816E5C", "Donkey Brown", "Brown"],
  		["6E5F56", "Dorado", "Brown"],
  		["E4CF99", "Double Colonial White", "Yellow"],
  		["E9DCBE", "Double Pearl Lusta", "Yellow"],
  		["D2C3A3", "Double Spanish White", "Yellow"],
  		["777672", "Dove Grey", "Grey"],
  		["6FD2BE", "Downy", "Green"],
  		["FBEB9B", "Drover", "Yellow"],
  		["514F4A", "Dune", "Grey"],
  		["E5CAC0", "Dust Storm", "Orange"],
  		["AC9B9B", "Dusty Grey", "Grey"],
  		["F0DFBB", "Dutch White", "Yellow"],
  		["B0AC94", "Eagle", "Green"],
  		["B8A722", "Earls Green", "Green"],
  		["FBF2DB", "Early Dawn", "Yellow"],
  		["47526E", "East Bay", "Blue"],
  		["AA8CBC", "East Side", "Violet"],
  		["00879F", "Eastern Blue", "Blue"],
  		["E6D8D4", "Ebb", "Red"],
  		["313337", "Ebony", "Grey"],
  		["323438", "Ebony Clay", "Grey"],
  		["A4AFCD", "Echo Blue", "Blue"],
  		["3F3939", "Eclipse", "Grey"],
  		["C2B280", "Ecru", "Brown"],
  		["D6D1C0", "Ecru White", "Green"],
  		["C96138", "Ecstasy", "Orange"],
  		["266255", "Eden", "Green"],
  		["C1D8C5", "Edgewater", "Green"],
  		["97A49A", "Edward", "Green"],
  		["F9E4C5", "Egg Sour", "Yellow"],
  		["990066", "Eggplant", "Violet"],
  		["1034A6", "Egyptian Blue", "Blue"],
  		["39392C", "El Paso", "Green"],
  		["8F4E45", "El Salva", "Red"],
  		["7DF9FF", "Electric Blue", "Blue"],
  		["6600FF", "Electric Indigo", "Violet"],
  		["CCFF00", "Electric Lime", "Green"],
  		["BF00FF", "Electric Purple", "Violet"],
  		["243640", "Elephant", "Blue"],
  		["1B8A6B", "Elf Green", "Green"],
  		["297B76", "Elm", "Green"],
  		["50C878", "Emerald", "Green"],
  		["6E3974", "Eminence", "Violet"],
  		["50494A", "Emperor", "Grey"],
  		["7C7173", "Empress", "Grey"],
  		["29598B", "Endeavour", "Blue"],
  		["F5D752", "Energy Yellow", "Yellow"],
  		["274234", "English Holly", "Green"],
  		["8BA58F", "Envy", "Green"],
  		["DAB160", "Equator", "Yellow"],
  		["4E312D", "Espresso", "Red"],
  		["2D2F28", "Eternity", "Green"],
  		["329760", "Eucalyptus", "Green"],
  		["CDA59C", "Eunry", "Red"],
  		["26604F", "Evening Sea", "Green"],
  		["264334", "Everglade", "Green"],
  		["F3E5DC", "Fair Pink", "Orange"],
  		["6E5A5B", "Falcon", "Brown"],
  		["C19A6B", "Fallow", "Brown"],
  		["801818", "Falu Red", "Red"],
  		["F2E6DD", "Fantasy", "Orange"],
  		["625665", "Fedora", "Violet"],
  		["A5D785", "Feijoa", "Green"],
  		["4D5D53", "Feldgrau", "Grey"],
  		["D19275", "Feldspar", "Red"],
  		["63B76C", "Fern", "Green"],
  		["4F7942", "Fern Green", "Green"],
  		["876A68", "Ferra", "Brown"],
  		["EACC4A", "Festival", "Yellow"],
  		["DBE0D0", "Feta", "Green"],
  		["B1592F", "Fiery Orange", "Orange"],
  		["636F22", "Fiji Green", "Green"],
  		["75785A", "Finch", "Green"],
  		["61755B", "Finlandia", "Green"],
  		["694554", "Finn", "Violet"],
  		["4B5A62", "Fiord", "Blue"],
  		["8F3F2A", "Fire", "Orange"],
  		["B22222", "Fire Brick", "Red"],
  		["E09842", "Fire Bush", "Yellow"],
  		["CE1620", "Fire Engine Red", "Red"],
  		["314643", "Firefly", "Green"],
  		["BE5C48", "Flame Pea", "Orange"],
  		["86282E", "Flame Red", "Red"],
  		["EA8645", "Flamenco", "Orange"],
  		["E1634F", "Flamingo", "Orange"],
  		["EEDC82", "Flax", "Yellow"],
  		["716E61", "Flint", "Green"],
  		["7A2E4D", "Flirt", "Red"],
  		["FFFAF0", "Floral White", "White"],
  		["D0EAE8", "Foam", "Green"],
  		["D5C7E8", "Fog", "Violet"],
  		["A7A69D", "Foggy Grey", "Grey"],
  		["228B22", "Forest Green", "Green"],
  		["FDEFDB", "Forget Me Not", "Yellow"],
  		["65ADB2", "Fountain Blue", "Blue"],
  		["FFD7A0", "Frangipani", "Yellow"],
  		["029D74", "Free Speech Aquamarine", "Green"],
  		["4156C5", "Free Speech Blue", "Blue"],
  		["09F911", "Free Speech Green", "Green"],
  		["E35BD8", "Free Speech Magenta", "Red"],
  		["C00000", "Free Speech Red", "Red"],
  		["BFBDC1", "French Grey", "Grey"],
  		["DEB7D9", "French Lilac", "Violet"],
  		["A4D2E0", "French Pass", "Blue"],
  		["F64A8A", "French Rose", "Red"],
  		["86837A", "Friar Grey", "Grey"],
  		["B4E1BB", "Fringy Flower", "Green"],
  		["E56D75", "Froly", "Red"],
  		["E1E4C5", "Frost", "Green"],
  		["E2F2E4", "Frosted Mint", "Green"],
  		["DBE5D2", "Frostee", "Green"],
  		["4BA351", "Fruit Salad", "Green"],
  		["C154C1", "Fuchsia", "Violet"],
  		["FF77FF", "Fuchsia Pink", "Red"],
  		["C2D62E", "Fuego", "Green"],
  		["D19033", "Fuel Yellow", "Yellow"],
  		["335083", "Fun Blue", "Blue"],
  		["15633D", "Fun Green", "Green"],
  		["3C3B3C", "Fuscous Grey", "Grey"],
  		["C45655", "Fuzzy Wuzzy Brown", "Brown"],
  		["2C4641", "Gable Green", "Green"],
  		["DCDCDC", "Gainsboro", "White"],
  		["DCD7D1", "Gallery", "Grey"],
  		["D8A723", "Galliano", "Yellow"],
  		["E49B0F", "Gamboge", "Yellow"],
  		["C5832E", "Geebung", "Yellow"],
  		["31796D", "Genoa", "Green"],
  		["E77B75", "Geraldine", "Red"],
  		["CBD0CF", "Geyser", "Grey"],
  		["C0BFC7", "Ghost", "Blue"],
  		["F8F8FF", "Ghost White", "White"],
  		["564786", "Gigas", "Violet"],
  		["B9AD61", "Gimblet", "Green"],
  		["D9DFCD", "Gin", "Green"],
  		["F8EACA", "Gin Fizz", "Yellow"],
  		["EBD4AE", "Givry", "Yellow"],
  		["78B1BF", "Glacier", "Blue"],
  		["5F8151", "Glade Green", "Green"],
  		["786E4C", "Go Ben", "Yellow"],
  		["34533D", "Goblin", "Green"],
  		["FFD700", "Gold", "Yellow"],
  		["D56C30", "Gold Drop", "Orange"],
  		["E2B227", "Gold Tips", "Yellow"],
  		["CA8136", "Golden Bell", "Orange"],
  		["996515", "Golden Brown", "Brown"],
  		["F1CC2B", "Golden Dream", "Yellow"],
  		["EBDE31", "Golden Fizz", "Green"],
  		["F9D77E", "Golden Glow", "Yellow"],
  		["FCC200", "Golden Poppy", "Yellow"],
  		["EACE6A", "Golden Sand", "Yellow"],
  		["FFC152", "Golden Tainoi", "Yellow"],
  		["FFDF00", "Golden Yellow", "Yellow"],
  		["DBDB70", "Goldenrod", "Yellow"],
  		["373332", "Gondola", "Grey"],
  		["29332B", "Gordons Green", "Green"],
  		["FDE336", "Gorse", "Green"],
  		["399F86", "Gossamer", "Green"],
  		["9FD385", "Gossip", "Green"],
  		["698890", "Gothic", "Blue"],
  		["51559B", "Governor Bay", "Blue"],
  		["CAB8A2", "Grain Brown", "Yellow"],
  		["FFCD73", "Grandis", "Yellow"],
  		["8B8265", "Granite Green", "Yellow"],
  		["C5E7CD", "Granny Apple", "Green"],
  		["7B948C", "Granny Smith", "Green"],
  		["9DE093", "Granny Smith Apple", "Green"],
  		["413D4B", "Grape", "Violet"],
  		["383428", "Graphite", "Yellow"],
  		["4A4B46", "Gravel", "Grey"],
  		["008000", "Green", "Green"],
  		["3E6334", "Green House", "Green"],
  		["393D2A", "Green Kelp", "Green"],
  		["526B2D", "Green Leaf", "Green"],
  		["BFC298", "Green Mist", "Green"],
  		["266242", "Green Pea", "Green"],
  		["9CA664", "Green Smoke", "Green"],
  		["A9AF99", "Green Spring", "Green"],
  		["23414E", "Green Vogue", "Blue"],
  		["2C2D24", "Green Waterloo", "Green"],
  		["DEDDCB", "Green White", "Green"],
  		["ADFF2F", "Green Yellow", "Green"],
  		["C14D36", "Grenadier", "Orange"],
  		["808080", "Grey", "Grey"],
  		["9FA3A7", "Grey Chateau", "Grey"],
  		["BDBAAE", "Grey Nickel", "Green"],
  		["D1D3CC", "Grey Nurse", "Grey"],
  		["A19A7F", "Grey Olive", "Yellow"],
  		["9391A0", "Grey Suit", "Blue"],
  		["465945", "Grey-Asparagus", "Green"],
  		["952E31", "Guardsman Red", "Red"],
  		["343F5C", "Gulf Blue", "Blue"],
  		["74B2A8", "Gulf Stream", "Green"],
  		["A4ADB0", "Gull Grey", "Grey"],
  		["ACC9B2", "Gum Leaf", "Green"],
  		["718F8A", "Gumbo", "Green"],
  		["484753", "Gun Powder", "Violet"],
  		["2C3539", "Gunmetal", "Blue"],
  		["7A7C76", "Gunsmoke", "Grey"],
  		["989171", "Gurkha", "Green"],
  		["9E8022", "Hacienda", "Yellow"],
  		["633528", "Hairy Heath", "Brown"],
  		["2C2A35", "Haiti", "Violet"],
  		["EDE7C8", "Half And Half", "Green"],
  		["558F93", "Half Baked", "Blue"],
  		["F2E5BF", "Half Colonial White", "Yellow"],
  		["FBF0D6", "Half Dutch White", "Yellow"],
  		["F1EAD7", "Half Pearl Lusta", "Yellow"],
  		["E6DBC7", "Half Spanish White", "Yellow"],
  		["E8D4A2", "Hampton", "Yellow"],
  		["5218FA", "Han Purple", "Violet"],
  		["3FFF00", "Harlequin", "Green"],
  		["C93413", "Harley Davidson Orange", "Orange"],
  		["CBCEC0", "Harp", "Green"],
  		["EAB76A", "Harvest Gold", "Yellow"],
  		["3B2B2C", "Havana", "Brown"],
  		["5784C1", "Havelock Blue", "Blue"],
  		["99522B", "Hawaiian Tan", "Orange"],
  		["D2DAED", "Hawkes Blue", "Blue"],
  		["4F2A2C", "Heath", "Red"],
  		["AEBBC1", "Heather", "Blue"],
  		["948C7E", "Heathered Grey", "Brown"],
  		["46473E", "Heavy Metal", "Grey"],
  		["DF73FF", "Heliotrope", "Violet"],
  		["69684B", "Hemlock", "Yellow"],
  		["987D73", "Hemp", "Brown"],
  		["928C3C", "Highball", "Green"],
  		["7A9461", "Highland", "Green"],
  		["A7A07E", "Hillary", "Green"],
  		["736330", "Himalaya", "Yellow"],
  		["DFF1D6", "Hint Of Green", "Green"],
  		["F5EFEB", "Hint Of Red", "Grey"],
  		["F6F5D7", "Hint Of Yellow", "Green"],
  		["49889A", "Hippie Blue", "Blue"],
  		["608A5A", "Hippie Green", "Green"],
  		["AB495C", "Hippie Pink", "Red"],
  		["A1A9A8", "Hit Grey", "Grey"],
  		["FDA470", "Hit Pink", "Orange"],
  		["BB8E34", "Hokey Pokey", "Yellow"],
  		["647D86", "Hoki", "Blue"],
  		["25342B", "Holly", "Green"],
  		["F400A1", "Hollywood Cerise", "Red"],
  		["5C3C6D", "Honey Flower", "Violet"],
  		["F0FFF0", "Honeydew", "White"],
  		["E8ED69", "Honeysuckle", "Green"],
  		["CD6D93", "Hopbush", "Violet"],
  		["648894", "Horizon", "Blue"],
  		["6D562C", "Horses Neck", "Yellow"],
  		["815B28", "Hot Curry", "Yellow"],
  		["FF00CC", "Hot Magenta", "Red"],
  		["FF69B4", "Hot Pink", "Red"],
  		["4E2E53", "Hot Purple", "Violet"],
  		["A7752C", "Hot Toddy", "Yellow"],
  		["CEEFE4", "Humming Bird", "Green"],
  		["355E3B", "Hunter Green", "Green"],
  		["8B7E77", "Hurricane", "Brown"],
  		["B2994B", "Husk", "Yellow"],
  		["AFE3D6", "Ice Cold", "Green"],
  		["CAE1D9", "Iceberg", "Green"],
  		["EF95AE", "Illusion", "Red"],
  		["B0E313", "Inch Worm", "Green"],
  		["CD5C5C", "Indian Red", "Red"],
  		["4F301F", "Indian Tan", "Brown"],
  		["4B0082", "Indigo", "Violet"],
  		["9C5B34", "Indochine", "Orange"],
  		["002FA7", "International Klein Blue", "Blue"],
  		["FF4F00", "International Orange", "Orange"],
  		["03B4C8", "Iris Blue", "Blue"],
  		["62422B", "Irish Coffee", "Brown"],
  		["CBCDCD", "Iron", "Grey"],
  		["706E66", "Ironside Grey", "Grey"],
  		["865040", "Ironstone", "Brown"],
  		["009900", "Islamic Green", "Green"],
  		["F8EDDB", "Island Spice", "Yellow"],
  		["FFFFF0", "Ivory", "White"],
  		["3D325D", "Jacarta", "Violet"],
  		["413628", "Jacko Bean", "Brown"],
  		["3D3F7D", "Jacksons Purple", "Violet"],
  		["00A86B", "Jade", "Green"],
  		["E27945", "Jaffa", "Orange"],
  		["CAE7E2", "Jagged Ice", "Green"],
  		["3F2E4C", "Jagger", "Violet"],
  		["29292F", "Jaguar", "Blue"],
  		["674834", "Jambalaya", "Brown"],
  		["2F7532", "Japanese Laurel", "Green"],
  		["CE7259", "Japonica", "Orange"],
  		["259797", "Java", "Green"],
  		["5F2C2F", "Jazz", "Red"],
  		["A50B5E", "Jazzberry Jam", "Red"],
  		["44798E", "Jelly Bean", "Blue"],
  		["BBD0C9", "Jet Stream", "Green"],
  		["136843", "Jewel", "Green"],
  		["463D3E", "Jon", "Grey"],
  		["EEF293", "Jonquil", "Green"],
  		["7AAAE0", "Jordy Blue", "Blue"],
  		["5D5346", "Judge Grey", "Brown"],
  		["878785", "Jumbo", "Grey"],
  		["29AB87", "Jungle Green", "Green"],
  		["B0C4C4", "Jungle Mist", "Green"],
  		["74918E", "Juniper", "Green"],
  		["DCBFAC", "Just Right", "Orange"],
  		["6C5E53", "Kabul", "Brown"],
  		["245336", "Kaitoke Green", "Green"],
  		["C5C3B0", "Kangaroo", "Green"],
  		["2D2D24", "Karaka", "Green"],
  		["FEDCC1", "Karry", "Orange"],
  		["576D8E", "Kashmir Blue", "Blue"],
  		["4CBB17", "Kelly Green", "Green"],
  		["4D503C", "Kelp", "Green"],
  		["6C322E", "Kenyan Copper", "Red"],
  		["5FB69C", "Keppel", "Green"],
  		["F0E68C", "Khaki", "Yellow"],
  		["BFC0AB", "Kidnapper", "Green"],
  		["3A3532", "Kilamanjaro", "Grey"],
  		["49764F", "Killarney", "Green"],
  		["695D87", "Kimberly", "Violet"],
  		["583580", "Kingfisher Daisy", "Violet"],
  		["E093AB", "Kobi", "Red"],
  		["7B785A", "Kokoda", "Green"],
  		["804E2C", "Korma", "Orange"],
  		["FEB552", "Koromiko", "Yellow"],
  		["F9D054", "Kournikova", "Yellow"],
  		["428929", "La Palma", "Green"],
  		["BAC00E", "La Rioja", "Green"],
  		["C6DA36", "Las Palmas", "Green"],
  		["C6A95E", "Laser", "Yellow"],
  		["FFFF66", "Laser Lemon", "Yellow"],
  		["6E8D71", "Laurel", "Green"],
  		["E6E6FA", "Lavender", "Violet"],
  		["CCCCFF", "Lavender Blue", "Blue"],
  		["FFF0F5", "Lavender Blush", "Violet"],
  		["BDBBD7", "Lavender Grey", "Grey"],
  		["FBAED2", "Lavender Pink", "Red"],
  		["FBA0E3", "Lavender Rose", "Red"],
  		["7CFC00", "Lawn Green", "Green"],
  		["906A54", "Leather", "Brown"],
  		["FDE910", "Lemon", "Yellow"],
  		["FFFACD", "Lemon Chiffon", "Yellow"],
  		["968428", "Lemon Ginger", "Yellow"],
  		["999A86", "Lemon Grass", "Green"],
  		["2E3749", "Licorice", "Blue"],
  		["ADD8E6", "Light Blue", "Blue"],
  		["F08080", "Light Coral", "Orange"],
  		["E0FFFF", "Light Cyan", "Blue"],
  		["EEDD82", "Light Goldenrod", "Yellow"],
  		["FAFAD2", "Light Goldenrod Yellow", "Yellow"],
  		["90EE90", "Light Green", "Green"],
  		["D3D3D3", "Light Grey", "Grey"],
  		["FFB6C1", "Light Pink", "Red"],
  		["FFA07A", "Light Salmon", "Orange"],
  		["20B2AA", "Light Sea Green", "Green"],
  		["87CEFA", "Light Sky Blue", "Blue"],
  		["8470FF", "Light Slate Blue", "Blue"],
  		["778899", "Light Slate Grey", "Grey"],
  		["B0C4DE", "Light Steel Blue", "Blue"],
  		["856363", "Light Wood", "Brown"],
  		["FFFFE0", "Light Yellow", "Yellow"],
  		["F7A233", "Lightning Yellow", "Yellow"],
  		["C8A2C8", "Lilac", "Violet"],
  		["9470C4", "Lilac Bush", "Violet"],
  		["C19FB3", "Lily", "Violet"],
  		["E9EEEB", "Lily White", "Grey"],
  		["7AAC21", "Lima", "Green"],
  		["00FF00", "Lime", "Green"],
  		["32CD32", "Lime Green", "Green"],
  		["5F9727", "Limeade", "Green"],
  		["89AC27", "Limerick", "Green"],
  		["FAF0E6", "Linen", "White"],
  		["C7CDD8", "Link Water", "Blue"],
  		["962C54", "Lipstick", "Red"],
  		["534B4F", "Liver", "Brown"],
  		["312A29", "Livid Brown", "Brown"],
  		["DBD9C2", "Loafer", "Green"],
  		["B3BBB7", "Loblolly", "Green"],
  		["489084", "Lochinvar", "Green"],
  		["316EA0", "Lochmara", "Blue"],
  		["A2A580", "Locust", "Green"],
  		["393E2E", "Log Cabin", "Green"],
  		["9D9CB4", "Logan", "Blue"],
  		["B9ACBB", "Lola", "Violet"],
  		["AE94AB", "London Hue", "Violet"],
  		["522426", "Lonestar", "Red"],
  		["8B504B", "Lotus", "Brown"],
  		["4C3347", "Loulou", "Violet"],
  		["AB9A1C", "Lucky", "Green"],
  		["292D4F", "Lucky Point", "Blue"],
  		["4E5541", "Lunar Green", "Green"],
  		["782E2C", "Lusty", "Red"],
  		["AB8D3F", "Luxor Gold", "Yellow"],
  		["697D89", "Lynch", "Blue"],
  		["CBE8E8", "Mabel", "Blue"],
  		["FFB97B", "Macaroni And Cheese", "Orange"],
  		["B7E3A8", "Madang", "Green"],
  		["2D3C54", "Madison", "Blue"],
  		["473E23", "Madras", "Brown"],
  		["FF00FF", "Magenta", "Violet"],
  		["AAF0D1", "Magic Mint", "Green"],
  		["F8F4FF", "Magnolia", "White"],
  		["CA3435", "Mahogany", "Brown"],
  		["A56531", "Mai Tai", "Orange"],
  		["2A2922", "Maire", "Yellow"],
  		["E3B982", "Maize", "Yellow"],
  		["695F50", "Makara", "Brown"],
  		["505555", "Mako", "Grey"],
  		["0BDA51", "Malachite", "Green"],
  		["97976F", "Malachite Green", "Green"],
  		["66B7E1", "Malibu", "Blue"],
  		["3A4531", "Mallard", "Green"],
  		["A59784", "Malta", "Brown"],
  		["766D7C", "Mamba", "Violet"],
  		["8D90A1", "Manatee", "Blue"],
  		["B57B2E", "Mandalay", "Yellow"],
  		["8E2323", "Mandarian Orange", "Orange"],
  		["CD525B", "Mandy", "Red"],
  		["F5B799", "Mandys Pink", "Orange"],
  		["E77200", "Mango Tango", "Orange"],
  		["E2AF80", "Manhattan", "Orange"],
  		["7FC15C", "Mantis", "Green"],
  		["96A793", "Mantle", "Green"],
  		["E4DB55", "Manz", "Green"],
  		["352235", "Mardi Gras", "Violet"],
  		["B88A3D", "Marigold", "Yellow"],
  		["42639F", "Mariner", "Blue"],
  		["800000", "Maroon", "Brown"],
  		["2B2E26", "Marshland", "Green"],
  		["B7A8A3", "Martini", "Brown"],
  		["3C3748", "Martinique", "Violet"],
  		["EBC881", "Marzipan", "Yellow"],
  		["57534B", "Masala", "Brown"],
  		["365C7D", "Matisse", "Blue"],
  		["8E4D45", "Matrix", "Red"],
  		["524B4B", "Matterhorn", "Grey"],
  		["E0B0FF", "Mauve", "Violet"],
  		["915F6D", "Mauve Taupe", "Red"],
  		["F091A9", "Mauvelous", "Red"],
  		["C8B1C0", "Maverick", "Violet"],
  		["73C2FB", "Maya Blue", "Blue"],
  		["8C6338", "McKenzie", "Orange"],
  		["66CDAA", "Medium Aquamarine", "Blue"],
  		["0000CD", "Medium Blue", "Blue"],
  		["AF4035", "Medium Carmine", "Red"],
  		["EAEAAE", "Medium Goldenrod", "Yellow"],
  		["BA55D3", "Medium Orchid", "Violet"],
  		["9370DB", "Medium Purple", "Violet"],
  		["3CB371", "Medium Sea Green", "Green"],
  		["7B68EE", "Medium Slate Blue", "Blue"],
  		["00FA9A", "Medium Spring Green", "Green"],
  		["48D1CC", "Medium Turquoise", "Blue"],
  		["C71585", "Medium Violet Red", "Red"],
  		["A68064", "Medium Wood", "Brown"],
  		["E0B7C2", "Melanie", "Red"],
  		["342931", "Melanzane", "Violet"],
  		["FEBAAD", "Melon", "Red"],
  		["C3B9DD", "Melrose", "Violet"],
  		["D5D2D1", "Mercury", "Grey"],
  		["E1DBD0", "Merino", "Yellow"],
  		["4F4E48", "Merlin", "Grey"],
  		["73343A", "Merlot", "Red"],
  		["554A3C", "Metallic Bronze", "Red"],
  		["6E3D34", "Metallic Copper", "Red"],
  		["D4AF37", "Metallic Gold", "Yellow"],
  		["BB7431", "Meteor", "Orange"],
  		["4A3B6A", "Meteorite", "Violet"],
  		["9B3D3D", "Mexican Red", "Red"],
  		["666A6D", "Mid Grey", "Grey"],
  		["21303E", "Midnight", "Blue"],
  		["191970", "Midnight Blue", "Blue"],
  		["21263A", "Midnight Express", "Blue"],
  		["242E28", "Midnight Moss", "Green"],
  		["3F3623", "Mikado", "Brown"],
  		["F6F493", "Milan", "Green"],
  		["9E3332", "Milano Red", "Red"],
  		["F3E5C0", "Milk Punch", "Yellow"],
  		["DCD9CD", "Milk White", "Grey"],
  		["595648", "Millbrook", "Brown"],
  		["F5F5CC", "Mimosa", "Green"],
  		["DAEA6F", "Mindaro", "Green"],
  		["373E41", "Mine Shaft", "Blue"],
  		["506355", "Mineral Green", "Green"],
  		["407577", "Ming", "Green"],
  		["3E3267", "Minsk", "Violet"],
  		["F5FFFA", "Mint Cream", "White"],
  		["98FF98", "Mint Green", "Green"],
  		["E0D8A7", "Mint Julep", "Green"],
  		["C6EADD", "Mint Tulip", "Green"],
  		["373F43", "Mirage", "Blue"],
  		["A5A9B2", "Mischka", "Blue"],
  		["BAB9A9", "Mist Grey", "Grey"],
  		["FFE4E1", "Misty Rose", "Violet"],
  		["605A67", "Mobster", "Violet"],
  		["582F2B", "Moccaccino", "Red"],
  		["FFE4B5", "Moccasin", "Yellow"],
  		["6F372D", "Mocha", "Red"],
  		["97463C", "Mojo", "Red"],
  		["FF9889", "Mona Lisa", "Red"],
  		["6B252C", "Monarch", "Red"],
  		["554D42", "Mondo", "Brown"],
  		["A58B6F", "Mongoose", "Brown"],
  		["7A7679", "Monsoon", "Grey"],
  		["393B3C", "Montana", "Grey"],
  		["7AC5B4", "Monte Carlo", "Green"],
  		["8378C7", "Moody Blue", "Violet"],
  		["F5F3CE", "Moon Glow", "Green"],
  		["CECDB8", "Moon Mist", "Green"],
  		["C0B2D7", "Moon Raker", "Violet"],
  		["F0C420", "Moon Yellow", "Yellow"],
  		["9ED1D3", "Morning Glory", "Blue"],
  		["442D21", "Morocco Brown", "Brown"],
  		["565051", "Mortar", "Grey"],
  		["005F5B", "Mosque", "Green"],
  		["ADDFAD", "Moss Green", "Green"],
  		["1AB385", "Mountain Meadow", "Green"],
  		["A09F9C", "Mountain Mist", "Grey"],
  		["997A8D", "Mountbatten Pink", "Violet"],
  		["A9844F", "Muddy Waters", "Yellow"],
  		["9E7E53", "Muesli", "Brown"],
  		["C54B8C", "Mulberry", "Violet"],
  		["884F40", "Mule Fawn", "Brown"],
  		["524D5B", "Mulled Wine", "Violet"],
  		["FFDB58", "Mustard", "Yellow"],
  		["D68B80", "My Pink", "Red"],
  		["FDAE45", "My Sin", "Yellow"],
  		["21421E", "Myrtle", "Green"],
  		["D8DDDA", "Mystic", "Grey"],
  		["4E5D4E", "Nandor", "Green"],
  		["A39A87", "Napa", "Yellow"],
  		["E9E6DC", "Narvik", "Green"],
  		["FFDEAD", "Navajo White", "Brown"],
  		["000080", "Navy", "Blue"],
  		["0066CC", "Navy Blue", "Blue"],
  		["B8C6BE", "Nebula", "Green"],
  		["EEC7A2", "Negroni", "Orange"],
  		["4D4DFF", "Neon Blue", "Blue"],
  		["FF9933", "Neon Carrot", "Orange"],
  		["FF6EC7", "Neon Pink", "Violet"],
  		["93AAB9", "Nepal", "Blue"],
  		["77A8AB", "Neptune", "Green"],
  		["252525", "Nero", "Grey"],
  		["AAA583", "Neutral Green", "Green"],
  		["666F6F", "Nevada", "Grey"],
  		["6D3B24", "New Amber", "Orange"],
  		["00009C", "New Midnight Blue", "Blue"],
  		["E4C385", "New Orleans", "Yellow"],
  		["EBC79E", "New Tan", "Brown"],
  		["DD8374", "New York Pink", "Red"],
  		["29A98B", "Niagara", "Green"],
  		["332E2E", "Night Rider", "Grey"],
  		["A23D54", "Night Shadz", "Red"],
  		["253F4E", "Nile Blue", "Blue"],
  		["A99D9D", "Nobel", "Grey"],
  		["A19986", "Nomad", "Yellow"],
  		["1D393C", "Nordic", "Blue"],
  		["A4B88F", "Norway", "Green"],
  		["BC9229", "Nugget", "Yellow"],
  		["7E4A3B", "Nutmeg", "Brown"],
  		["FCEDC5", "Oasis", "Yellow"],
  		["008F70", "Observatory", "Green"],
  		["4CA973", "Ocean Green", "Green"],
  		["CC7722", "Ochre", "Brown"],
  		["DFF0E2", "Off Green", "Green"],
  		["FAF3DC", "Off Yellow", "Yellow"],
  		["313330", "Oil", "Grey"],
  		["8A3335", "Old Brick", "Red"],
  		["73503B", "Old Copper", "Red"],
  		["CFB53B", "Old Gold", "Yellow"],
  		["FDF5E6", "Old Lace", "White"],
  		["796878", "Old Lavender", "Violet"],
  		["C02E4C", "Old Rose", "Red"],
  		["808000", "Olive", "Green"],
  		["6B8E23", "Olive Drab", "Green"],
  		["B5B35C", "Olive Green", "Green"],
  		["888064", "Olive Haze", "Yellow"],
  		["747028", "Olivetone", "Green"],
  		["9AB973", "Olivine", "Orange"],
  		["C2E6EC", "Onahau", "Blue"],
  		["48412B", "Onion", "Yellow"],
  		["A8C3BC", "Opal", "Green"],
  		["987E7E", "Opium", "Brown"],
  		["395555", "Oracle", "Green"],
  		["FFA500", "Orange", "Orange"],
  		["FFA000", "Orange Peel", "Orange"],
  		["FF4500", "Orange Red", "Orange"],
  		["A85335", "Orange Roughy", "Orange"],
  		["EAE3CD", "Orange White", "Yellow"],
  		["DA70D6", "Orchid", "Violet"],
  		["F1EBD9", "Orchid White", "Yellow"],
  		["255B77", "Orient", "Blue"],
  		["C28E88", "Oriental Pink", "Red"],
  		["D2D3B3", "Orinoco", "Green"],
  		["818988", "Oslo Grey", "Grey"],
  		["D3DBCB", "Ottoman", "Green"],
  		["2D383A", "Outer Space", "Grey"],
  		["FF6037", "Outrageous Orange", "Orange"],
  		["28353A", "Oxford Blue", "Blue"],
  		["6D9A78", "Oxley", "Green"],
  		["D1EAEA", "Oyster Bay", "Blue"],
  		["D4B5B0", "Oyster Pink", "Red"],
  		["864B36", "Paarl", "Orange"],
  		["7A715C", "Pablo", "Yellow"],
  		["009DC4", "Pacific Blue", "Blue"],
  		["4F4037", "Paco", "Brown"],
  		["7EB394", "Padua", "Green"],
  		["682860", "Palatinate Purple", "Violet"],
  		["987654", "Pale Brown", "Brown"],
  		["DDADAF", "Pale Chestnut", "Red"],
  		["ABCDEF", "Pale Cornflower Blue", "Blue"],
  		["EEE8AA", "Pale Goldenrod", "Yellow"],
  		["98FB98", "Pale Green", "Green"],
  		["BDCAA8", "Pale Leaf", "Green"],
  		["F984E5", "Pale Magenta", "Violet"],
  		["9C8D72", "Pale Oyster", "Brown"],
  		["FADADD", "Pale Pink", "Red"],
  		["F9F59F", "Pale Prim", "Green"],
  		["EFD6DA", "Pale Rose", "Red"],
  		["636D70", "Pale Sky", "Blue"],
  		["C3BEBB", "Pale Slate", "Grey"],
  		["BC987E", "Pale Taupe", "Grey"],
  		["AFEEEE", "Pale Turquoise", "Blue"],
  		["DB7093", "Pale Violet Red", "Red"],
  		["20392C", "Palm Green", "Green"],
  		["36482F", "Palm Leaf", "Green"],
  		["EAE4DC", "Pampas", "Grey"],
  		["EBF7E4", "Panache", "Green"],
  		["DFB992", "Pancho", "Orange"],
  		["544F3A", "Panda", "Yellow"],
  		["FFEFD5", "Papaya Whip", "Yellow"],
  		["7C2D37", "Paprika", "Red"],
  		["488084", "Paradiso", "Green"],
  		["D0C8B0", "Parchment", "Yellow"],
  		["FBEB50", "Paris Daisy", "Green"],
  		["312760", "Paris M", "Violet"],
  		["BFCDC0", "Paris White", "Green"],
  		["305D35", "Parsley", "Green"],
  		["77DD77", "Pastel Green", "Green"],
  		["639283", "Patina", "Green"],
  		["D3E5EF", "Pattens Blue", "Blue"],
  		["2A2551", "Paua", "Violet"],
  		["BAAB87", "Pavlova", "Yellow"],
  		["404048", "Payne's Grey", "Grey"],
  		["FFCBA4", "Peach", "Orange"],
  		["FFDAB9", "Peach Puff", "Yellow"],
  		["FFCC99", "Peach-Orange", "Orange"],
  		["FADFAD", "Peach-Yellow", "Yellow"],
  		["7A4434", "Peanut", "Brown"],
  		["D1E231", "Pear", "Yellow"],
  		["DED1C6", "Pearl Bush", "Orange"],
  		["EAE0C8", "Pearl Lusta", "Yellow"],
  		["766D52", "Peat", "Yellow"],
  		["2599B2", "Pelorous", "Blue"],
  		["D7E7D0", "Peppermint", "Green"],
  		["ACB9E8", "Perano", "Blue"],
  		["C2A9DB", "Perfume", "Violet"],
  		["ACB6B2", "Periglacial Blue", "Green"],
  		["C3CDE6", "Periwinkle", "Blue"],
  		["1C39BB", "Persian Blue", "Blue"],
  		["00A693", "Persian Green", "Green"],
  		["32127A", "Persian Indigo", "Violet"],
  		["F77FBE", "Persian Pink", "Red"],
  		["683332", "Persian Plum", "Red"],
  		["CC3333", "Persian Red", "Red"],
  		["FE28A2", "Persian Rose", "Red"],
  		["EC5800", "Persimmon", "Red"],
  		["CD853F", "Peru", "Brown"],
  		["733D1F", "Peru Tan", "Orange"],
  		["7A7229", "Pesto", "Yellow"],
  		["DA9790", "Petite Orchid", "Red"],
  		["91A092", "Pewter", "Green"],
  		["826663", "Pharlap", "Brown"],
  		["F8EA97", "Picasso", "Green"],
  		["5BA0D0", "Picton Blue", "Blue"],
  		["FDD7E4", "Pig Pink", "Red"],
  		["00A550", "Pigment Green", "Green"],
  		["756556", "Pine Cone", "Brown"],
  		["BDC07E", "Pine Glade", "Green"],
  		["01796F", "Pine Green", "Green"],
  		["2A2F23", "Pine Tree", "Green"],
  		["FFC0CB", "Pink", "Red"],
  		["FF66FF", "Pink Flamingo", "Red"],
  		["D8B4B6", "Pink Flare", "Red"],
  		["F6CCD7", "Pink Lace", "Red"],
  		["F3D7B6", "Pink Lady", "Orange"],
  		["BFB3B2", "Pink Swan", "Grey"],
  		["9D5432", "Piper", "Orange"],
  		["F5E6C4", "Pipi", "Yellow"],
  		["FCDBD2", "Pippin", "Red"],
  		["BA782A", "Pirate Gold", "Yellow"],
  		["BBCDA5", "Pixie Green", "Green"],
  		["E57F3D", "Pizazz", "Orange"],
  		["BF8D3C", "Pizza", "Yellow"],
  		["3E594C", "Plantation", "Green"],
  		["DDA0DD", "Plum", "Violet"],
  		["651C26", "Pohutukawa", "Red"],
  		["E5F2E7", "Polar", "Green"],
  		["8AA7CC", "Polo Blue", "Blue"],
  		["6A1F44", "Pompadour", "Violet"],
  		["DDDCDB", "Porcelain", "Grey"],
  		["DF9D5B", "Porsche", "Orange"],
  		["3B436C", "Port Gore", "Blue"],
  		["F4F09B", "Portafino", "Green"],
  		["8B98D8", "Portage", "Blue"],
  		["F0D555", "Portica", "Yellow"],
  		["EFDCD4", "Pot Pourri", "Orange"],
  		["845C40", "Potters Clay", "Brown"],
  		["B0E0E6", "Powder Blue", "Blue"],
  		["883C32", "Prairie Sand", "Red"],
  		["CAB4D4", "Prelude", "Violet"],
  		["E2CDD5", "Prim", "Violet"],
  		["E4DE8E", "Primrose", "Green"],
  		["F8F6DF", "Promenade", "Green"],
  		["F6E3DA", "Provincial Pink", "Orange"],
  		["003366", "Prussian Blue", "Blue"],
  		["DD00FF", "Psychedelic Purple", "Violet"],
  		["CC8899", "Puce", "Red"],
  		["6E3326", "Pueblo", "Orange"],
  		["59BAA3", "Puerto Rico", "Green"],
  		["BAC0B4", "Pumice", "Green"],
  		["FF7518", "Pumpkin", "Orange"],
  		["534931", "Punga", "Yellow"],
  		["800080", "Purple", "Violet"],
  		["652DC1", "Purple Heart", "Violet"],
  		["9678B6", "Purple Mountain's Majesty", "Violet"],
  		["50404D", "Purple Taupe", "Grey"],
  		["CDAE70", "Putty", "Yellow"],
  		["F2EDDD", "Quarter Pearl Lusta", "Green"],
  		["EBE2D2", "Quarter Spanish White", "Yellow"],
  		["D9D9F3", "Quartz", "White"],
  		["C3988B", "Quicksand", "Brown"],
  		["CBC9C0", "Quill Grey", "Grey"],
  		["6A5445", "Quincy", "Brown"],
  		["232F2C", "Racing Green", "Green"],
  		["FF355E", "Radical Red", "Red"],
  		["DCC6A0", "Raffia", "Yellow"],
  		["667028", "Rain Forest", "Green"],
  		["B3C1B1", "Rainee", "Green"],
  		["FCAE60", "Rajah", "Orange"],
  		["2B2E25", "Rangoon Green", "Green"],
  		["6F747B", "Raven", "Blue"],
  		["D27D46", "Raw Sienna", "Brown"],
  		["734A12", "Raw Umber", "Brown"],
  		["FF33CC", "Razzle Dazzle Rose", "Red"],
  		["E30B5C", "Razzmatazz", "Red"],
  		["453430", "Rebel", "Brown"],
  		["FF0000", "Red", "Red"],
  		["701F28", "Red Berry", "Red"],
  		["CB6F4A", "Red Damask", "Orange"],
  		["662A2C", "Red Devil", "Red"],
  		["FF3F34", "Red Orange", "Orange"],
  		["5D1F1E", "Red Oxide", "Red"],
  		["7D4138", "Red Robin", "Red"],
  		["AD522E", "Red Stage", "Orange"],
  		["BB3385", "Medium Red Violet", "Violet"],
  		["5B342E", "Redwood", "Red"],
  		["D1EF9F", "Reef", "Green"],
  		["A98D36", "Reef Gold", "Yellow"],
  		["203F58", "Regal Blue", "Blue"],
  		["798488", "Regent Grey", "Blue"],
  		["A0CDD9", "Regent St Blue", "Blue"],
  		["F6DEDA", "Remy", "Red"],
  		["B26E33", "Reno Sand", "Orange"],
  		["323F75", "Resolution Blue", "Blue"],
  		["37363F", "Revolver", "Violet"],
  		["3D4653", "Rhino", "Blue"],
  		["EFECDE", "Rice Cake", "Green"],
  		["EFF5D1", "Rice Flower", "Green"],
  		["5959AB", "Rich Blue", "Blue"],
  		["A15226", "Rich Gold", "Orange"],
  		["B7C61A", "Rio Grande", "Green"],
  		["89D9C8", "Riptide", "Green"],
  		["556061", "River Bed", "Blue"],
  		["DDAD56", "Rob Roy", "Yellow"],
  		["00CCCC", "Robin's Egg Blue", "Blue"],
  		["5A4D41", "Rock", "Brown"],
  		["93A2BA", "Rock Blue", "Blue"],
  		["9D442D", "Rock Spray", "Orange"],
  		["C7A384", "Rodeo Dust", "Brown"],
  		["6D7876", "Rolling Stone", "Green"],
  		["D8625B", "Roman", "Red"],
  		["7D6757", "Roman Coffee", "Brown"],
  		["F4F0E6", "Romance", "Grey"],
  		["FFC69E", "Romantic", "Orange"],
  		["EAB852", "Ronchi", "Yellow"],
  		["A14743", "Roof Terracotta", "Red"],
  		["8E593C", "Rope", "Orange"],
  		["D3A194", "Rose", "Red"],
  		["FEAB9A", "Rose Bud", "Red"],
  		["8A2D52", "Rose Bud Cherry", "Red"],
  		["AC512D", "Rose Of Sharon", "Orange"],
  		["905D5D", "Rose Taupe", "Violet"],
  		["FBEEE8", "Rose White", "Red"],
  		["BC8F8F", "Rosy Brown", "Brown"],
  		["B69642", "Roti", "Yellow"],
  		["A94064", "Rouge", "Red"],
  		["4169E1", "Royal Blue", "Blue"],
  		["B54B73", "Royal Heath", "Red"],
  		["6B3FA0", "Royal Purple", "Violet"],
  		["E0115F", "Ruby", "Red"],
  		["716675", "Rum", "Violet"],
  		["F1EDD4", "Rum Swizzle", "Green"],
  		["80461B", "Russet", "Brown"],
  		["7D655C", "Russett", "Brown"],
  		["B7410E", "Rust", "Red"],
  		["3A181A", "Rustic Red", "Red"],
  		["8D5F2C", "Rusty Nail", "Orange"],
  		["5D4E46", "Saddle", "Brown"],
  		["8B4513", "Saddle Brown", "Brown"],
  		["FF6600", "Safety Orange", "Orange"],
  		["F4C430", "Saffron", "Yellow"],
  		["989F7A", "Sage", "Green"],
  		["B79826", "Sahara", "Yellow"],
  		["A5CEEC", "Sail", "Blue"],
  		["177B4D", "Salem", "Green"],
  		["FA8072", "Salmon", "Red"],
  		["FFD67B", "Salomie", "Yellow"],
  		["696268", "Salt Box", "Violet"],
  		["EEF3E5", "Saltpan", "Grey"],
  		["3B2E25", "Sambuca", "Brown"],
  		["2C6E31", "San Felix", "Green"],
  		["445761", "San Juan", "Blue"],
  		["4E6C9D", "San Marino", "Blue"],
  		["867665", "Sand Dune", "Brown"],
  		["A3876A", "Sandal", "Brown"],
  		["AF937D", "Sandrift", "Brown"],
  		["786D5F", "Sandstone", "Brown"],
  		["DECB81", "Sandwisp", "Yellow"],
  		["FEDBB7", "Sandy Beach", "Orange"],
  		["F4A460", "Sandy Brown", "Brown"],
  		["92000A", "Sangria", "Red"],
  		["6C3736", "Sanguine Brown", "Red"],
  		["9998A7", "Santas Grey", "Blue"],
  		["A96A50", "Sante Fe", "Orange"],
  		["E1D5A6", "Sapling", "Yellow"],
  		["082567", "Sapphire", "Blue"],
  		["555B2C", "Saratoga", "Green"],
  		["F4EAE4", "Sauvignon", "Red"],
  		["F5DEC4", "Sazerac", "Orange"],
  		["6F63A0", "Scampi", "Violet"],
  		["ADD9D1", "Scandal", "Green"],
  		["FF2400", "Scarlet", "Red"],
  		["4A2D57", "Scarlet Gum", "Violet"],
  		["7E2530", "Scarlett", "Red"],
  		["6B6A6C", "Scarpa Flow", "Grey"],
  		["87876F", "Schist", "Green"],
  		["FFD800", "School Bus Yellow", "Yellow"],
  		["8D8478", "Schooner", "Brown"],
  		["308EA0", "Scooter", "Blue"],
  		["6A6466", "Scorpion", "Grey"],
  		["EEE7C8", "Scotch Mist", "Yellow"],
  		["66FF66", "Screamin' Green", "Green"],
  		["3D4031", "Scrub", "Green"],
  		["EF9548", "Sea Buckthorn", "Orange"],
  		["DFDDD6", "Sea Fog", "Grey"],
  		["2E8B57", "Sea Green", "Green"],
  		["C2D5C4", "Sea Mist", "Green"],
  		["8AAEA4", "Sea Nymph", "Green"],
  		["DB817E", "Sea Pink", "Red"],
  		["77B7D0", "Seagull", "Blue"],
  		["321414", "Seal Brown", "Brown"],
  		["69326E", "Seance", "Violet"],
  		["FFF5EE", "Seashell", "White"],
  		["37412A", "Seaweed", "Green"],
  		["E6DFE7", "Selago", "Violet"],
  		["FFBA00", "Selective Yellow", "Yellow"],
  		["6B4226", "Semi-Sweet Chocolate", "Brown"],
  		["9E5B40", "Sepia", "Brown"],
  		["FCE9D7", "Serenade", "Orange"],
  		["837050", "Shadow", "Green"],
  		["9AC0B6", "Shadow Green", "Green"],
  		["9F9B9D", "Shady Lady", "Grey"],
  		["609AB8", "Shakespeare", "Blue"],
  		["F8F6A8", "Shalimar", "Green"],
  		["33CC99", "Shamrock", "Green"],
  		["009E60", "Shamrock Green", "Green"],
  		["34363A", "Shark", "Grey"],
  		["00494E", "Sherpa Blue", "Green"],
  		["1B4636", "Sherwood Green", "Green"],
  		["E6B2A6", "Shilo", "Red"],
  		["745937", "Shingle Fawn", "Brown"],
  		["7988AB", "Ship Cove", "Blue"],
  		["4E4E4C", "Ship Grey", "Grey"],
  		["842833", "Shiraz", "Red"],
  		["E899BE", "Shocking", "Violet"],
  		["FC0FC0", "Shocking Pink", "Red"],
  		["61666B", "Shuttle Grey", "Grey"],
  		["686B50", "Siam", "Green"],
  		["E9D9A9", "Sidecar", "Yellow"],
  		["A0522D", "Sienna", "Brown"],
  		["BBADA1", "Silk", "Brown"],
  		["C0C0C0", "Silver", "Grey"],
  		["ACAEA9", "Silver Chalice", "Grey"],
  		["BEBDB6", "Silver Sand", "Grey"],
  		["67BE90", "Silver Tree", "Green"],
  		["A6D5D0", "Sinbad", "Green"],
  		["69293B", "Siren", "Red"],
  		["68766E", "Sirocco", "Green"],
  		["C5BAA0", "Sisal", "Yellow"],
  		["9DB4AA", "Skeptic", "Green"],
  		["87CEEB", "Sky Blue", "Blue"],
  		["6A5ACD", "Slate Blue", "Blue"],
  		["708090", "Slate Grey", "Grey"],
  		["42342B", "Slugger", "Brown"],
  		["003399", "Smalt", "Blue"],
  		["496267", "Smalt Blue", "Blue"],
  		["BB5F34", "Smoke Tree", "Orange"],
  		["605D6B", "Smoky", "Violet"],
  		["FFFAFA", "Snow", "White"],
  		["E3E3DC", "Snow Drift", "Grey"],
  		["EAF7C9", "Snow Flurry", "Green"],
  		["D6F0CD", "Snowy Mint", "Green"],
  		["E4D7E5", "Snuff", "Violet"],
  		["ECE5DA", "Soapstone", "Grey"],
  		["CFBEA5", "Soft Amber", "Yellow"],
  		["EEDFDE", "Soft Peach", "Red"],
  		["85494C", "Solid Pink", "Red"],
  		["EADAC2", "Solitaire", "Yellow"],
  		["E9ECF1", "Solitude", "Blue"],
  		["DD6B38", "Sorbus", "Orange"],
  		["9D7F61", "Sorrell Brown", "Brown"],
  		["C9B59A", "Sour Dough", "Brown"],
  		["6F634B", "Soya Bean", "Brown"],
  		["4B433B", "Space Shuttle", "Brown"],
  		["7B8976", "Spanish Green", "Green"],
  		["DED1B7", "Spanish White", "Yellow"],
  		["375D4F", "Spectra", "Green"],
  		["6C4F3F", "Spice", "Brown"],
  		["8B5F4D", "Spicy Mix", "Brown"],
  		["FF1CAE", "Spicy Pink", "Red"],
  		["B3C4D8", "Spindle", "Blue"],
  		["F1D79E", "Splash", "Yellow"],
  		["7ECDDD", "Spray", "Blue"],
  		["A7FC00", "Spring Bud", "Green"],
  		["00FF7F", "Spring Green", "Green"],
  		["A3BD9C", "Spring Rain", "Green"],
  		["F1F1C6", "Spring Sun", "Green"],
  		["E9E1D9", "Spring Wood", "Grey"],
  		["B8CA9D", "Sprout", "Green"],
  		["A2A1AC", "Spun Pearl", "Blue"],
  		["8F7D6B", "Squirrel", "Brown"],
  		["325482", "St Tropaz", "Blue"],
  		["858885", "Stack", "Grey"],
  		["A0A197", "Star Dust", "Grey"],
  		["D2C6B6", "Stark White", "Yellow"],
  		["E3DD39", "Starship", "Green"],
  		["4682B4", "Steel Blue", "Blue"],
  		["43464B", "Steel Grey", "Grey"],
  		["833D3E", "Stiletto", "Red"],
  		["807661", "Stonewall", "Yellow"],
  		["65645F", "Storm Dust", "Grey"],
  		["747880", "Storm Grey", "Blue"],
  		["DABE82", "Straw", "Yellow"],
  		["946A81", "Strikemaster", "Violet"],
  		["406356", "Stromboli", "Green"],
  		["724AA1", "Studio", "Violet"],
  		["8C9C9C", "Submarine", "Blue"],
  		["EEEFDF", "Sugar Cane", "Green"],
  		["C6EA80", "Sulu", "Green"],
  		["8FB69C", "Summer Green", "Green"],
  		["38B0DE", "Summer Sky", "Blue"],
  		["EF8E38", "Sun", "Orange"],
  		["C4AA4D", "Sundance", "Yellow"],
  		["F8AFA9", "Sundown", "Red"],
  		["DAC01A", "Sunflower", "Yellow"],
  		["C76155", "Sunglo", "Red"],
  		["FFCC33", "Sunglow", "Orange"],
  		["C0514A", "Sunset", "Red"],
  		["FE4C40", "Sunset Orange", "Orange"],
  		["FA9D49", "Sunshade", "Orange"],
  		["FFB437", "Supernova", "Yellow"],
  		["B8D4BB", "Surf", "Green"],
  		["C3D6BD", "Surf Crest", "Green"],
  		["007B77", "Surfie Green", "Green"],
  		["7C9F2F", "Sushi", "Green"],
  		["8B8685", "Suva Grey", "Grey"],
  		["252F2F", "Swamp", "Green"],
  		["DAE6DD", "Swans Down", "Grey"],
  		["F9E176", "Sweet Corn", "Yellow"],
  		["EE918D", "Sweet Pink", "Red"],
  		["D7CEC5", "Swirl", "Grey"],
  		["DBD0CA", "Swiss Coffee", "Grey"],
  		["F6AE78", "Tacao", "Orange"],
  		["D2B960", "Tacha", "Yellow"],
  		["DC722A", "Tahiti Gold", "Orange"],
  		["D8CC9B", "Tahuna Sands", "Yellow"],
  		["853534", "Tall Poppy", "Red"],
  		["A39977", "Tallow", "Yellow"],
  		["752B2F", "Tamarillo", "Red"],
  		["D2B48C", "Tan", "Brown"],
  		["B8B5A1", "Tana", "Green"],
  		["1E2F3C", "Tangaroa", "Blue"],
  		["F28500", "Tangerine", "Orange"],
  		["FFCC00", "Tangerine Yellow", "Yellow"],
  		["D46F31", "Tango", "Orange"],
  		["7C7C72", "Tapa", "Green"],
  		["B37084", "Tapestry", "Red"],
  		["DEF1DD", "Tara", "Green"],
  		["253C48", "Tarawera", "Blue"],
  		["BAC0B3", "Tasman", "Grey"],
  		["483C32", "Taupe", "Grey"],
  		["8B8589", "Taupe Grey", "Grey"],
  		["643A48", "Tawny Port", "Red"],
  		["496569", "Tax Break", "Blue"],
  		["2B4B40", "Te Papa Green", "Green"],
  		["BFB5A2", "Tea", "Yellow"],
  		["D0F0C0", "Tea Green", "Green"],
  		["F883C2", "Tea Rose", "Orange"],
  		["AB8953", "Teak", "Yellow"],
  		["008080", "Teal", "Blue"],
  		["254855", "Teal Blue", "Blue"],
  		["3C2126", "Temptress", "Brown"],
  		["CD5700", "Tenne (Tawny)", "Orange"],
  		["F4D0A4", "Tequila", "Yellow"],
  		["E2725B", "Terra Cotta", "Red"],
  		["ECE67E", "Texas", "Green"],
  		["FCB057", "Texas Rose", "Orange"],
  		["B1948F", "Thatch", "Brown"],
  		["544E31", "Thatch Green", "Yellow"],
  		["D8BFD8", "Thistle", "Violet"],
  		["4D4D4B", "Thunder", "Grey"],
  		["923830", "Thunderbird", "Red"],
  		["97422D", "Tia Maria", "Orange"],
  		["B9C3BE", "Tiara", "Grey"],
  		["184343", "Tiber", "Green"],
  		["FC80A5", "Tickle Me Pink", "Red"],
  		["F0F590", "Tidal", "Green"],
  		["BEB4AB", "Tide", "Brown"],
  		["324336", "Timber Green", "Green"],
  		["D9D6CF", "Timberwolf", "Grey"],
  		["DDD6E1", "Titan White", "Violet"],
  		["9F715F", "Toast", "Brown"],
  		["6D5843", "Tobacco Brown", "Brown"],
  		["44362D", "Tobago", "Brown"],
  		["3E2631", "Toledo", "Violet"],
  		["2D2541", "Tolopea", "Violet"],
  		["4F6348", "Tom Thumb", "Green"],
  		["FF6347", "Tomato", "Red"],
  		["E79E88", "Tonys Pink", "Orange"],
  		["817C87", "Topaz", "Violet"],
  		["FD0E35", "Torch Red", "Red"],
  		["353D75", "Torea Bay", "Blue"],
  		["374E88", "Tory Blue", "Blue"],
  		["744042", "Tosca", "Red"],
  		["9CACA5", "Tower Grey", "Green"],
  		["6DAFA7", "Tradewind", "Green"],
  		["DDEDE9", "Tranquil", "Blue"],
  		["E2DDC7", "Travertine", "Green"],
  		["E2813B", "Tree Poppy", "Orange"],
  		["7E8424", "Trendy Green", "Green"],
  		["805D80", "Trendy Pink", "Violet"],
  		["C54F33", "Trinidad", "Orange"],
  		["AEC9EB", "Tropical Blue", "Blue"],
  		["00755E", "Tropical Rain Forest", "Green"],
  		["4C5356", "Trout", "Grey"],
  		["8E72C7", "True V", "Violet"],
  		["454642", "Tuatara", "Grey"],
  		["F9D3BE", "Tuft Bush", "Orange"],
  		["E3AC3D", "Tulip Tree", "Yellow"],
  		["DEA681", "Tumbleweed", "Brown"],
  		["46494E", "Tuna", "Grey"],
  		["585452", "Tundora", "Grey"],
  		["F5CC23", "Turbo", "Yellow"],
  		["A56E75", "Turkish Rose", "Red"],
  		["AE9041", "Turmeric", "Yellow"],
  		["40E0D0", "Turquoise", "Blue"],
  		["6CDAE7", "Turquoise Blue", "Blue"],
  		["363E1D", "Turtle Green", "Green"],
  		["AD6242", "Tuscany", "Orange"],
  		["E3E5B1", "Tusk", "Green"],
  		["BF914B", "Tussock", "Yellow"],
  		["F8E4E3", "Tutu", "Red"],
  		["DAC0CD", "Twilight", "Violet"],
  		["F4F6EC", "Twilight Blue", "Grey"],
  		["C19156", "Twine", "Yellow"],
  		["66023C", "Tyrian Purple", "Violet"],
  		["FF6FFF", "Ultra Pink", "Red"],
  		["120A8F", "Ultramarine", "Blue"],
  		["D4574E", "Valencia", "Red"],
  		["382C38", "Valentino", "Violet"],
  		["2A2B41", "Valhalla", "Violet"],
  		["523936", "Van Cleef", "Brown"],
  		["CCB69B", "Vanilla", "Brown"],
  		["EBD2D1", "Vanilla Ice", "Red"],
  		["FDEFD3", "Varden", "Yellow"],
  		["C80815", "Venetian Red", "Red"],
  		["2C5778", "Venice Blue", "Blue"],
  		["8B7D82", "Venus", "Violet"],
  		["62603E", "Verdigris", "Grey"],
  		["48531A", "Verdun Green", "Green"],
  		["FF4D00", "Vermilion", "Red"],
  		["5C4033", "Very Dark Brown", "Brown"],
  		["CDCDCD", "Very Light Grey", "Grey"],
  		["A85533", "Vesuvius", "Orange"],
  		["564985", "Victoria", "Violet"],
  		["5F9228", "Vida Loca", "Green"],
  		["4DB1C8", "Viking", "Blue"],
  		["955264", "Vin Rouge", "Red"],
  		["C58F9D", "Viola", "Red"],
  		["2E2249", "Violent Violet", "Violet"],
  		["EE82EE", "Violet", "Violet"],
  		["9F5F9F", "Violet Blue", "Violet"],
  		["F7468A", "Violet Red", "Red"],
  		["40826D", "Viridian", "Blue"],
  		["4B5F56", "Viridian Green", "Green"],
  		["F9E496", "Vis Vis", "Yellow"],
  		["97D5B3", "Vista Blue", "Green"],
  		["E3DFD9", "Vista White", "Grey"],
  		["FF9980", "Vivid Tangerine", "Orange"],
  		["803790", "Vivid Violet", "Violet"],
  		["4E2728", "Volcano", "Red"],
  		["443240", "Voodoo", "Violet"],
  		["36383C", "Vulcan", "Grey"],
  		["D4BBB1", "Wafer", "Orange"],
  		["5B6E91", "Waikawa Grey", "Blue"],
  		["4C4E31", "Waiouru", "Green"],
  		["E4E2DC", "Wan White", "Grey"],
  		["849137", "Wasabi", "Green"],
  		["B6ECDE", "Water Leaf", "Green"],
  		["006E4E", "Watercourse", "Green"],
  		["D6CA3D", "Wattle", "Green"],
  		["F2CDBB", "Watusi", "Orange"],
  		["EEB39E", "Wax Flower", "Orange"],
  		["FDD7D8", "We Peep", "Red"],
  		["4C6B88", "Wedgewood", "Blue"],
  		["8E3537", "Well Read", "Red"],
  		["5C512F", "West Coast", "Yellow"],
  		["E5823A", "West Side", "Orange"],
  		["D4CFC5", "Westar", "Grey"],
  		["F1919A", "Wewak", "Red"],
  		["F5DEB3", "Wheat", "Brown"],
  		["DFD7BD", "Wheatfield", "Yellow"],
  		["D29062", "Whiskey", "Orange"],
  		["D4915D", "Whiskey Sour", "Orange"],
  		["EFE6E6", "Whisper", "Grey"],
  		["FFFFFF", "White", "White"],
  		["D7EEE4", "White Ice", "Green"],
  		["E7E5E8", "White Lilac", "Blue"],
  		["EEE7DC", "White Linen", "Grey"],
  		["F8F6D8", "White Nectar", "Green"],
  		["DAD6CC", "White Pointer", "Grey"],
  		["D4CFB4", "White Rock", "Green"],
  		["F5F5F5", "White Smoke", "White"],
  		["7A89B8", "Wild Blue Yonder", "Blue"],
  		["E3D474", "Wild Rice", "Green"],
  		["E7E4DE", "Wild Sand", "Grey"],
  		["FF3399", "Wild Strawberry", "Red"],
  		["FD5B78", "Wild Watermelon", "Red"],
  		["BECA60", "Wild Willow", "Green"],
  		["53736F", "William", "Green"],
  		["DFE6CF", "Willow Brook", "Green"],
  		["69755C", "Willow Grove", "Green"],
  		["462C77", "Windsor", "Violet"],
  		["522C35", "Wine Berry", "Red"],
  		["D0C383", "Winter Hazel", "Yellow"],
  		["F9E8E2", "Wisp Pink", "Red"],
  		["C9A0DC", "Wisteria", "Violet"],
  		["A29ECD", "Wistful", "Blue"],
  		["FBF073", "Witch Haze", "Green"],
  		["302621", "Wood Bark", "Brown"],
  		["463629", "Woodburn", "Brown"],
  		["626746", "Woodland", "Green"],
  		["45402B", "Woodrush", "Yellow"],
  		["2B3230", "Woodsmoke", "Grey"],
  		["554545", "Woody Brown", "Brown"],
  		["75876E", "Xanadu", "Green"],
  		["FFFF00", "Yellow", "Yellow"],
  		["9ACD32", "Yellow Green", "Green"],
  		["73633E", "Yellow Metal", "Yellow"],
  		["FFAE42", "Yellow Orange", "Orange"],
  		["F49F35", "Yellow Sea", "Yellow"],
  		["FFC5BB", "Your Pink", "Red"],
  		["826A21", "Yukon Gold", "Yellow"],
  		["C7B882", "Yuma", "Yellow"],
  		["6B5A5A", "Zambezi", "Brown"],
  		["B2C6B1", "Zanah", "Green"],
  		["C6723B", "Zest", "Orange"],
  		["3B3C38", "Zeus", "Grey"],
  		["81A6AA", "Ziggurat", "Blue"],
  		["EBC2AF", "Zinnwaldite", "Brown"],
  		["DEE3E3", "Zircon", "Grey"],
  		["DDC283", "Zombie", "Yellow"],
  		["A29589", "Zorba", "Brown"],
  		["17462E", "Zuccini", "Green"],
  		["CDD5D5", "Zumthor", "Grey"],
  	],
  };

  ntc.init();
  var ntc2 = ntc;

  var ntc$1 = /*#__PURE__*/Object.freeze({
    default: ntc2,
    __moduleExports: ntc2
  });

  const ANIMATION_DURATION = 2000;
  const names = [
      ["35312C", "Acadia", "Brown"],
      ["75AA94", "Acapulco", "Green"],
      ["C0E8D5", "Aero Blue", "Green"],
      ["745085", "Affair", "Violet"],
      ["905E26", "Afghan Tan", "Yellow"],
      ["5D8AA8", "Air Force Blue", "Blue"],
      ["BEB29A", "Akaroa", "Yellow"],
      ["F2F0E6", "Alabaster", "Grey"],
      ["E1DACB", "Albescent White", "Yellow"],
      ["954E2C", "Alert Tan", "Orange"],
      ["F0F8FF", "Alice Blue", "Blue"],
      ["E32636", "Alizarin", "Red"],
      ["1F6A7D", "Allports", "Blue"],
      ["EED9C4", "Almond", "Yellow"],
      ["9A8678", "Almond Frost", "Brown"],
      ["AD8A3B", "Alpine", "Yellow"],
      ["CDC6C5", "Alto", "Grey"],
      ["848789", "Aluminium", "Grey"],
      ["E52B50", "Amaranth", "Red"],
      ["387B54", "Amazon", "Green"],
      ["FFBF00", "Amber", "Yellow"],
      ["8A7D72", "Americano", "Brown"],
      ["9966CC", "Amethyst", "Violet"],
      ["95879C", "Amethyst Smoke", "Violet"],
      ["F5E6EA", "Amour", "Violet"],
      ["7D9D72", "Amulet", "Green"],
      ["8CCEEA", "Anakiwa", "Blue"],
      ["6C461F", "Antique Brass", "Orange"],
      ["FAEBD7", "Antique White", "White"],
      ["C68E3F", "Anzac", "Yellow"],
      ["D3A95C", "Apache", "Yellow"],
      ["66B348", "Apple", "Green"],
      ["A95249", "Apple Blossom", "Red"],
      ["DEEADC", "Apple Green", "Green"],
      ["FBCEB1", "Apricot", "Orange"],
      ["F7F0DB", "Apricot White", "Yellow"],
      ["00FFFF", "Aqua", "Blue"],
      ["D9DDD5", "Aqua Haze", "Grey"],
      ["E8F3E8", "Aqua Spring", "Green"],
      ["DBE4DC", "Aqua Squeeze", "Grey"],
      ["7FFFD4", "Aquamarine", "Blue"],
      ["274A5D", "Arapawa", "Blue"],
      ["484A46", "Armadillo", "Grey"],
      ["4B5320", "Army green", "Green"],
      ["827A67", "Arrowtown", "Yellow"],
      ["3B444B", "Arsenic", "Grey"],
      ["BEBAA7", "Ash", "Green"],
      ["7BA05B", "Asparagus", "Green"],
      ["EDD5A6", "Astra", "Yellow"],
      ["376F89", "Astral", "Blue"],
      ["445172", "Astronaut", "Blue"],
      ["214559", "Astronaut Blue", "Blue"],
      ["DCDDDD", "Athens Grey", "Grey"],
      ["D5CBB2", "Aths Special", "Yellow"],
      ["9CD03B", "Atlantis", "Green"],
      ["2B797A", "Atoll", "Green"],
      ["3D4B52", "Atomic", "Blue"],
      ["FF9966", "Atomic Tangerine", "Orange"],
      ["9E6759", "Au Chico", "Brown"],
      ["372528", "Aubergine", "Brown"],
      ["712F2C", "Auburn", "Brown"],
      ["EFF8AA", "Australian Mint", "Green"],
      ["95986B", "Avocado", "Green"],
      ["63775A", "Axolotl", "Green"],
      ["F9C0C4", "Azalea", "Red"],
      ["293432", "Aztec", "Green"],
      ["F0FFFF", "Azure", "Blue"],
      ["6FFFFF", "Baby Blue", "Blue"],
      ["25597F", "Bahama Blue", "Blue"],
      ["A9C01C", "Bahia", "Green"],
      ["5C3317", "Baker's Chocolate", "Brown"],
      ["849CA9", "Bali Hai", "Blue"],
      ["3C3D3E", "Baltic Sea", "Grey"],
      ["FBE7B2", "Banana Mania", "Yellow"],
      ["878466", "Bandicoot", "Green"],
      ["D2C61F", "Barberry", "Green"],
      ["B6935C", "Barley Corn", "Yellow"],
      ["F7E5B7", "Barley White", "Yellow"],
      ["452E39", "Barossa", "Violet"],
      ["2C2C32", "Bastille", "Blue"],
      ["51574F", "Battleship Grey", "Grey"],
      ["7BB18D", "Bay Leaf", "Green"],
      ["353E64", "Bay Of Many", "Blue"],
      ["8F7777", "Bazaar", "Brown"],
      ["EBB9B3", "Beauty Bush", "Red"],
      ["926F5B", "Beaver", "Brown"],
      ["E9D7AB", "Beeswax", "Yellow"],
      ["F5F5DC", "Beige", "Brown"],
      ["86D2C1", "Bermuda", "Green"],
      ["6F8C9F", "Bermuda Grey", "Blue"],
      ["BCBFA8", "Beryl Green", "Green"],
      ["F4EFE0", "Bianca", "Yellow"],
      ["334046", "Big Stone", "Blue"],
      ["3E8027", "Bilbao", "Green"],
      ["AE99D2", "Biloba Flower", "Violet"],
      ["3F3726", "Birch", "Yellow"],
      ["D0C117", "Bird Flower", "Green"],
      ["2F3C53", "Biscay", "Blue"],
      ["486C7A", "Bismark", "Blue"],
      ["B5AC94", "Bison Hide", "Yellow"],
      ["FFE4C4", "Bisque", "Brown"],
      ["3D2B1F", "Bistre", "Brown"],
      ["88896C", "Bitter", "Green"],
      ["D2DB32", "Bitter Lemon", "Green"],
      ["FE6F5E", "Bittersweet", "Orange"],
      ["E7D2C8", "Bizarre", "Orange"],
      ["000000", "Black", "Black"],
      ["232E26", "Black Bean", "Green"],
      ["2C3227", "Black Forest", "Green"],
      ["E0DED7", "Black Haze", "Grey"],
      ["332C22", "Black Magic", "Brown"],
      ["383740", "Black Marlin", "Blue"],
      ["1E272C", "Black Pearl", "Blue"],
      ["2C2D3C", "Black Rock", "Blue"],
      ["532934", "Black Rose", "Red"],
      ["24252B", "Black Russian", "Grey"],
      ["E5E6DF", "Black Squeeze", "Grey"],
      ["E5E4DB", "Black White", "Grey"],
      ["43182F", "Blackberry", "Violet"],
      ["2E183B", "Blackcurrant", "Violet"],
      ["D9D0C1", "Blanc", "Yellow"],
      ["FFEBCD", "Blanched Almond", "Brown"],
      ["EBE1CE", "Bleach White", "Yellow"],
      ["A3E3ED", "Blizzard Blue", "Blue"],
      ["DFB1B6", "Blossom", "Red"],
      ["0000FF", "Blue", "Blue"],
      ["62777E", "Blue Bayoux", "Blue"],
      ["9999CC", "Blue Bell", "Blue"],
      ["E3D6E9", "Blue Chalk", "Violet"],
      ["262B2F", "Blue Charcoal", "Blue"],
      ["408F90", "Blue Chill", "Green"],
      ["4B2D72", "Blue Diamond", "Violet"],
      ["35514F", "Blue Dianne", "Green"],
      ["4B3C8E", "Blue Gem", "Violet"],
      ["BDBACE", "Blue Haze", "Violet"],
      ["00626F", "Blue Lagoon", "Green"],
      ["6A5BB1", "Blue Marguerite", "Violet"],
      ["D8F0D2", "Blue Romance", "Green"],
      ["78857A", "Blue Smoke", "Green"],
      ["166461", "Blue Stone", "Green"],
      ["8A2BE2", "Blue Violet", "Violet"],
      ["1E3442", "Blue Whale", "Blue"],
      ["3C4354", "Blue Zodiac", "Blue"],
      ["305C71", "Blumine", "Blue"],
      ["B55067", "Blush", "Red"],
      ["2A2725", "Bokara Grey", "Grey"],
      ["79443B", "Bole", "Brown"],
      ["AEAEAD", "Bombay", "Grey"],
      ["DFD7D2", "Bon Jour", "Grey"],
      ["0095B6", "Bondi Blue", "Blue"],
      ["DBC2AB", "Bone", "Orange"],
      ["4C1C24", "Bordeaux", "Red"],
      ["4C3D4E", "Bossanova", "Violet"],
      ["438EAC", "Boston Blue", "Blue"],
      ["92ACB4", "Botticelli", "Blue"],
      ["254636", "Bottle Green", "Green"],
      ["7C817C", "Boulder", "Grey"],
      ["A78199", "Bouquet", "Violet"],
      ["AF6C3E", "Bourbon", "Orange"],
      ["5B3D27", "Bracken", "Brown"],
      ["DCB68A", "Brandy", "Orange"],
      ["C07C40", "Brandy Punch", "Orange"],
      ["B6857A", "Brandy Rose", "Red"],
      ["B5A642", "Brass", "Yellow"],
      ["517B78", "Breaker Bay", "Green"],
      ["C62D42", "Brick Red", "Red"],
      ["F8EBDD", "Bridal Heath", "Orange"],
      ["FAE6DF", "Bridesmaid", "Orange"],
      ["66FF00", "Bright Green", "Green"],
      ["57595D", "Bright Grey", "Grey"],
      ["922A31", "Bright Red", "Red"],
      ["ECBD2C", "Bright Sun", "Yellow"],
      ["08E8DE", "Bright Turquoise", "Blue"],
      ["FF55A3", "Brilliant Rose", "Red"],
      ["FB607F", "Brink Pink", "Red"],
      ["004225", "British Racing Green", "Green"],
      ["A79781", "Bronco", "Brown"],
      ["CD7F32", "Bronze", "Brown"],
      ["584C25", "Bronze Olive", "Yellow"],
      ["434C28", "Bronzetone", "Yellow"],
      ["EECC24", "Broom", "Yellow"],
      ["A52A2A", "Brown", "Brown"],
      ["53331E", "Brown Bramble", "Brown"],
      ["594537", "Brown Derby", "Brown"],
      ["3C241B", "Brown Pod", "Brown"],
      ["E6F2EA", "Bubbles", "Green"],
      ["6E5150", "Buccaneer", "Red"],
      ["A5A88F", "Bud", "Green"],
      ["BC9B1B", "Buddha Gold", "Yellow"],
      ["F0DC82", "Buff", "Yellow"],
      ["482427", "Bulgarian Rose", "Red"],
      ["75442B", "Bull Shot", "Orange"],
      ["292C2F", "Bunker", "Grey"],
      ["2B3449", "Bunting", "Blue"],
      ["800020", "Burgundy", "Red"],
      ["DEB887", "Burly Wood", "Brown"],
      ["234537", "Burnham", "Green"],
      ["D08363", "Burning Sand", "Orange"],
      ["582124", "Burnt Crimson", "Red"],
      ["FF7034", "Burnt Orange", "Orange"],
      ["E97451", "Burnt Sienna", "Brown"],
      ["8A3324", "Burnt Umber", "Brown"],
      ["DA9429", "Buttercup", "Yellow"],
      ["9D702E", "Buttered Rum", "Yellow"],
      ["68578C", "Butterfly Bush", "Violet"],
      ["F6E0A4", "Buttermilk", "Yellow"],
      ["F1EBDA", "Buttery White", "Yellow"],
      ["4A2E32", "Cab Sav", "Red"],
      ["CD526C", "Cabaret", "Red"],
      ["4C5544", "Cabbage Pont", "Green"],
      ["5B6F55", "Cactus", "Green"],
      ["5F9EA0", "Cadet Blue", "Blue"],
      ["984961", "Cadillac", "Red"],
      ["6A4928", "Cafe Royale", "Brown"],
      ["D5B185", "Calico", "Brown"],
      ["E98C3A", "California", "Orange"],
      ["3D7188", "Calypso", "Blue"],
      ["206937", "Camarone", "Green"],
      ["803A4B", "Camelot", "Red"],
      ["CCA483", "Cameo", "Brown"],
      ["4F4D32", "Camouflage", "Yellow"],
      ["78866B", "Camouflage Green", "Green"],
      ["D08A9B", "Can Can", "Red"],
      ["FFFF99", "Canary", "Yellow"],
      ["8E5164", "Cannon Pink", "Red"],
      ["4E5552", "Cape Cod", "Grey"],
      ["FEE0A5", "Cape Honey", "Yellow"],
      ["75482F", "Cape Palliser", "Orange"],
      ["AFC182", "Caper", "Green"],
      ["592720", "Caput Mortuum", "Brown"],
      ["FFD59A", "Caramel", "Yellow"],
      ["EBE5D5", "Cararra", "Green"],
      ["1B3427", "Cardin Green", "Green"],
      ["C41E3A", "Cardinal", "Red"],
      ["C99AA0", "Careys Pink", "Red"],
      ["00CC99", "Caribbean Green", "Green"],
      ["E68095", "Carissma", "Red"],
      ["F5F9CB", "Carla", "Green"],
      ["960018", "Carmine", "Red"],
      ["5B3A24", "Carnaby Tan", "Brown"],
      ["FFA6C9", "Carnation Pink", "Red"],
      ["F8DBE0", "Carousel Pink", "Red"],
      ["ED9121", "Carrot Orange", "Orange"],
      ["F0B253", "Casablanca", "Yellow"],
      ["3F545A", "Casal", "Blue"],
      ["8CA8A0", "Cascade", "Green"],
      ["D1B399", "Cashmere", "Brown"],
      ["AAB5B8", "Casper", "Blue"],
      ["44232F", "Castro", "Red"],
      ["273C5A", "Catalina Blue", "Blue"],
      ["E0E4DC", "Catskill White", "Grey"],
      ["E0B8B1", "Cavern Pink", "Red"],
      ["9271A7", "Ce Soir", "Violet"],
      ["463430", "Cedar", "Brown"],
      ["ACE1AF", "Celadon", "Green"],
      ["B4C04C", "Celery", "Green"],
      ["D2D2C0", "Celeste", "Green"],
      ["3A4E5F", "Cello", "Blue"],
      ["2B3F36", "Celtic", "Green"],
      ["857158", "Cement", "Brown"],
      ["DE3163", "Cerise", "Violet"],
      ["007BA7", "Cerulean", "Blue"],
      ["2A52BE", "Cerulean Blue", "Blue"],
      ["FDE9E0", "Chablis", "Red"],
      ["5A6E41", "Chalet Green", "Green"],
      ["DFC281", "Chalky", "Yellow"],
      ["475877", "Chambray", "Blue"],
      ["E8CD9A", "Chamois", "Yellow"],
      ["EED9B6", "Champagne", "Yellow"],
      ["EDB8C7", "Chantilly", "Red"],
      ["394043", "Charade", "Blue"],
      ["464646", "Charcoal", "Grey"],
      ["F8EADF", "Chardon", "Orange"],
      ["FFC878", "Chardonnay", "Yellow"],
      ["A4DCE6", "Charlotte", "Blue"],
      ["D0748B", "Charm", "Red"],
      ["7FFF00", "Chartreuse", "Green"],
      ["DFFF00", "Chartreuse Yellow", "Yellow"],
      ["419F59", "Chateau Green", "Green"],
      ["B3ABB6", "Chatelle", "Violet"],
      ["2C5971", "Chathams Blue", "Blue"],
      ["88A95B", "Chelsea Cucumber", "Green"],
      ["95532F", "Chelsea Gem", "Orange"],
      ["DEC371", "Chenin", "Yellow"],
      ["F5CD82", "Cherokee", "Yellow"],
      ["372D52", "Cherry Pie", "Violet"],
      ["F5D7DC", "Cherub", "Red"],
      ["B94E48", "Chestnut", "Brown"],
      ["666FB4", "Chetwode Blue", "Blue"],
      ["5B5D56", "Chicago", "Grey"],
      ["F0F5BB", "Chiffon", "Green"],
      ["D05E34", "Chilean Fire", "Orange"],
      ["F9F7DE", "Chilean Heath", "Green"],
      ["FBF3D3", "China Ivory", "Green"],
      ["B8AD8A", "Chino", "Yellow"],
      ["9DD3A8", "Chinook", "Green"],
      ["D2691E", "Chocolate", "Brown"],
      ["382161", "Christalle", "Violet"],
      ["71A91D", "Christi", "Green"],
      ["BF652E", "Christine", "Orange"],
      ["CAC7B7", "Chrome White", "Green"],
      ["7D4E38", "Cigar", "Brown"],
      ["242A2E", "Cinder", "Grey"],
      ["FBD7CC", "Cinderella", "Red"],
      ["E34234", "Cinnabar", "Red"],
      ["5D3B2E", "Cioccolato", "Brown"],
      ["8E9A21", "Citron", "Green"],
      ["9FB70A", "Citrus", "Green"],
      ["D2B3A9", "Clam Shell", "Orange"],
      ["6E2233", "Claret", "Red"],
      ["F4C8DB", "Classic Rose", "Violet"],
      ["897E59", "Clay Creek", "Yellow"],
      ["DFEFEA", "Clear Day", "Green"],
      ["463623", "Clinker", "Brown"],
      ["C2BCB1", "Cloud", "Yellow"],
      ["353E4F", "Cloud Burst", "Blue"],
      ["B0A99F", "Cloudy", "Brown"],
      ["47562F", "Clover", "Green"],
      ["0047AB", "Cobalt", "Blue"],
      ["4F3835", "Cocoa Bean", "Red"],
      ["35281E", "Cocoa Brown", "Brown"],
      ["E1DABB", "Coconut Cream", "Green"],
      ["2D3032", "Cod Grey", "Grey"],
      ["726751", "Coffee", "Yellow"],
      ["362D26", "Coffee Bean", "Brown"],
      ["9A463D", "Cognac", "Red"],
      ["3C2F23", "Cola", "Brown"],
      ["9D8ABF", "Cold Purple", "Violet"],
      ["CAB5B2", "Cold Turkey", "Red"],
      ["9BDDFF", "Columbia Blue", "Blue"],
      ["636373", "Comet", "Blue"],
      ["4C785C", "Como", "Green"],
      ["A0B1AE", "Conch", "Green"],
      ["827F79", "Concord", "Grey"],
      ["D2D1CD", "Concrete", "Grey"],
      ["DDCB46", "Confetti", "Green"],
      ["654D49", "Congo Brown", "Brown"],
      ["B1DD52", "Conifer", "Green"],
      ["C16F68", "Contessa", "Red"],
      ["DA8A67", "Copper", "Red"],
      ["77422C", "Copper Canyon", "Orange"],
      ["996666", "Copper Rose", "Violet"],
      ["95524C", "Copper Rust", "Red"],
      ["FF7F50", "Coral", "Orange"],
      ["F5D0C9", "Coral Candy", "Red"],
      ["FF4040", "Coral Red", "Red"],
      ["AB6E67", "Coral Tree", "Red"],
      ["404D49", "Corduroy", "Green"],
      ["BBB58D", "Coriander", "Green"],
      ["5A4C42", "Cork", "Brown"],
      ["FBEC5D", "Corn", "Yellow"],
      ["F8F3C4", "Corn Field", "Green"],
      ["42426F", "Corn Flower Blue", "Blue"],
      ["8D702A", "Corn Harvest", "Yellow"],
      ["FFF8DC", "Corn Silk", "Yellow"],
      ["93CCEA", "Cornflower", "Blue"],
      ["6495ED", "Cornflower Blue", "Blue"],
      ["E9BA81", "Corvette", "Orange"],
      ["794D60", "Cosmic", "Violet"],
      ["E1F8E7", "Cosmic Latte", "White"],
      ["FCD5CF", "Cosmos", "Red"],
      ["625D2A", "Costa Del Sol", "Green"],
      ["FFB7D5", "Cotton Candy", "Red"],
      ["BFBAAF", "Cotton Seed", "Yellow"],
      ["1B4B35", "County Green", "Green"],
      ["443736", "Cowboy", "Brown"],
      ["87382F", "Crab Apple", "Red"],
      ["A65648", "Crail", "Red"],
      ["DB5079", "Cranberry", "Red"],
      ["4D3E3C", "Crater Brown", "Brown"],
      ["FFFDD0", "Cream", "White"],
      ["FFE39B", "Cream Brulee", "Yellow"],
      ["EEC051", "Cream Can", "Yellow"],
      ["393227", "Creole", "Brown"],
      ["77712B", "Crete", "Green"],
      ["DC143C", "Crimson", "Red"],
      ["706950", "Crocodile", "Yellow"],
      ["763C33", "Crown Of Thorns", "Red"],
      ["B4E2D5", "Cruise", "Green"],
      ["165B31", "Crusoe", "Green"],
      ["F38653", "Crusta", "Orange"],
      ["784430", "Cumin", "Orange"],
      ["F5F4C1", "Cumulus", "Green"],
      ["F5B2C5", "Cupid", "Red"],
      ["3D85B8", "Curious Blue", "Blue"],
      ["5C8173", "Cutty Sark", "Green"],
      ["0F4645", "Cyprus", "Green"],
      ["EDD2A4", "Dairy Cream", "Yellow"],
      ["5B3E90", "Daisy Bush", "Violet"],
      ["664A2D", "Dallas", "Brown"],
      ["FED85D", "Dandelion", "Yellow"],
      ["5B89C0", "Danube", "Blue"],
      ["00008B", "Dark Blue", "Blue"],
      ["654321", "Dark Brown", "Brown"],
      ["08457E", "Dark Cerulean", "Blue"],
      ["986960", "Dark Chestnut", "Red"],
      ["CD5B45", "Dark Coral", "Orange"],
      ["008B8B", "Dark Cyan", "Green"],
      ["B8860B", "Dark Goldenrod", "Yellow"],
      ["A9A9A9", "Dark Gray", "Grey"],
      ["013220", "Dark Green", "Green"],
      ["4A766E", "Dark Green Copper", "Green"],
      ["BDB76B", "Dark Khaki", "Yellow"],
      ["8B008B", "Dark Magenta", "Violet"],
      ["556B2F", "Dark Olive Green", "Green"],
      ["FF8C00", "Dark Orange", "Orange"],
      ["9932CC", "Dark Orchid", "Violet"],
      ["03C03C", "Dark Pastel Green", "Green"],
      ["E75480", "Dark Pink", "Red"],
      ["871F78", "Dark Purple", "Violet"],
      ["8B0000", "Dark Red", "Red"],
      ["45362B", "Dark Rum", "Brown"],
      ["E9967A", "Dark Salmon", "Orange"],
      ["8FBC8F", "Dark Sea Green", "Green"],
      ["465352", "Dark Slate", "Green"],
      ["483D8B", "Dark Slate Blue", "Blue"],
      ["2F4F4F", "Dark Slate Grey", "Grey"],
      ["177245", "Dark Spring Green", "Green"],
      ["97694F", "Dark Tan", "Brown"],
      ["FFA812", "Dark Tangerine", "Orange"],
      ["00CED1", "Dark Turquoise", "Blue"],
      ["9400D3", "Dark Violet", "Violet"],
      ["855E42", "Dark Wood", "Brown"],
      ["788878", "Davy's Grey", "Grey"],
      ["9F9D91", "Dawn", "Green"],
      ["E6D6CD", "Dawn Pink", "Orange"],
      ["85CA87", "De York", "Green"],
      ["CCCF82", "Deco", "Green"],
      ["E36F8A", "Deep Blush", "Red"],
      ["51412D", "Deep Bronze", "Brown"],
      ["DA3287", "Deep Cerise", "Violet"],
      ["193925", "Deep Fir", "Green"],
      ["343467", "Deep Koamaru", "Violet"],
      ["9955BB", "Deep Lilac", "Violet"],
      ["CC00CC", "Deep Magenta", "Violet"],
      ["FF1493", "Deep Pink", "Red"],
      ["167E65", "Deep Sea", "Green"],
      ["00BFFF", "Deep Sky Blue", "Blue"],
      ["19443C", "Deep Teal", "Green"],
      ["B5998E", "Del Rio", "Brown"],
      ["486531", "Dell", "Green"],
      ["999B95", "Delta", "Grey"],
      ["8272A4", "Deluge", "Violet"],
      ["1560BD", "Denim", "Blue"],
      ["F9E4C6", "Derby", "Yellow"],
      ["A15F3B", "Desert", "Orange"],
      ["EDC9AF", "Desert Sand", "Brown"],
      ["EDE7E0", "Desert Storm", "Grey"],
      ["E7F2E9", "Dew", "Green"],
      ["322C2B", "Diesel", "Grey"],
      ["696969", "Dim Gray", "Grey"],
      ["607C47", "Dingley", "Green"],
      ["892D4F", "Disco", "Red"],
      ["CD8431", "Dixie", "Yellow"],
      ["1E90FF", "Dodger Blue", "Blue"],
      ["F5F171", "Dolly", "Green"],
      ["6A6873", "Dolphin", "Violet"],
      ["6C5B4C", "Domino", "Brown"],
      ["5A4F51", "Don Juan", "Brown"],
      ["816E5C", "Donkey Brown", "Brown"],
      ["6E5F56", "Dorado", "Brown"],
      ["E4CF99", "Double Colonial White", "Yellow"],
      ["E9DCBE", "Double Pearl Lusta", "Yellow"],
      ["D2C3A3", "Double Spanish White", "Yellow"],
      ["777672", "Dove Grey", "Grey"],
      ["6FD2BE", "Downy", "Green"],
      ["FBEB9B", "Drover", "Yellow"],
      ["514F4A", "Dune", "Grey"],
      ["E5CAC0", "Dust Storm", "Orange"],
      ["AC9B9B", "Dusty Grey", "Grey"],
      ["F0DFBB", "Dutch White", "Yellow"],
      ["B0AC94", "Eagle", "Green"],
      ["B8A722", "Earls Green", "Green"],
      ["FBF2DB", "Early Dawn", "Yellow"],
      ["47526E", "East Bay", "Blue"],
      ["AA8CBC", "East Side", "Violet"],
      ["00879F", "Eastern Blue", "Blue"],
      ["E6D8D4", "Ebb", "Red"],
      ["313337", "Ebony", "Grey"],
      ["323438", "Ebony Clay", "Grey"],
      ["A4AFCD", "Echo Blue", "Blue"],
      ["3F3939", "Eclipse", "Grey"],
      ["C2B280", "Ecru", "Brown"],
      ["D6D1C0", "Ecru White", "Green"],
      ["C96138", "Ecstasy", "Orange"],
      ["266255", "Eden", "Green"],
      ["C1D8C5", "Edgewater", "Green"],
      ["97A49A", "Edward", "Green"],
      ["F9E4C5", "Egg Sour", "Yellow"],
      ["990066", "Eggplant", "Violet"],
      ["1034A6", "Egyptian Blue", "Blue"],
      ["39392C", "El Paso", "Green"],
      ["8F4E45", "El Salva", "Red"],
      ["7DF9FF", "Electric Blue", "Blue"],
      ["6600FF", "Electric Indigo", "Violet"],
      ["CCFF00", "Electric Lime", "Green"],
      ["BF00FF", "Electric Purple", "Violet"],
      ["243640", "Elephant", "Blue"],
      ["1B8A6B", "Elf Green", "Green"],
      ["297B76", "Elm", "Green"],
      ["50C878", "Emerald", "Green"],
      ["6E3974", "Eminence", "Violet"],
      ["50494A", "Emperor", "Grey"],
      ["7C7173", "Empress", "Grey"],
      ["29598B", "Endeavour", "Blue"],
      ["F5D752", "Energy Yellow", "Yellow"],
      ["274234", "English Holly", "Green"],
      ["8BA58F", "Envy", "Green"],
      ["DAB160", "Equator", "Yellow"],
      ["4E312D", "Espresso", "Red"],
      ["2D2F28", "Eternity", "Green"],
      ["329760", "Eucalyptus", "Green"],
      ["CDA59C", "Eunry", "Red"],
      ["26604F", "Evening Sea", "Green"],
      ["264334", "Everglade", "Green"],
      ["F3E5DC", "Fair Pink", "Orange"],
      ["6E5A5B", "Falcon", "Brown"],
      ["C19A6B", "Fallow", "Brown"],
      ["801818", "Falu Red", "Red"],
      ["F2E6DD", "Fantasy", "Orange"],
      ["625665", "Fedora", "Violet"],
      ["A5D785", "Feijoa", "Green"],
      ["4D5D53", "Feldgrau", "Grey"],
      ["D19275", "Feldspar", "Red"],
      ["63B76C", "Fern", "Green"],
      ["4F7942", "Fern Green", "Green"],
      ["876A68", "Ferra", "Brown"],
      ["EACC4A", "Festival", "Yellow"],
      ["DBE0D0", "Feta", "Green"],
      ["B1592F", "Fiery Orange", "Orange"],
      ["636F22", "Fiji Green", "Green"],
      ["75785A", "Finch", "Green"],
      ["61755B", "Finlandia", "Green"],
      ["694554", "Finn", "Violet"],
      ["4B5A62", "Fiord", "Blue"],
      ["8F3F2A", "Fire", "Orange"],
      ["B22222", "Fire Brick", "Red"],
      ["E09842", "Fire Bush", "Yellow"],
      ["CE1620", "Fire Engine Red", "Red"],
      ["314643", "Firefly", "Green"],
      ["BE5C48", "Flame Pea", "Orange"],
      ["86282E", "Flame Red", "Red"],
      ["EA8645", "Flamenco", "Orange"],
      ["E1634F", "Flamingo", "Orange"],
      ["EEDC82", "Flax", "Yellow"],
      ["716E61", "Flint", "Green"],
      ["7A2E4D", "Flirt", "Red"],
      ["FFFAF0", "Floral White", "White"],
      ["D0EAE8", "Foam", "Green"],
      ["D5C7E8", "Fog", "Violet"],
      ["A7A69D", "Foggy Grey", "Grey"],
      ["228B22", "Forest Green", "Green"],
      ["FDEFDB", "Forget Me Not", "Yellow"],
      ["65ADB2", "Fountain Blue", "Blue"],
      ["FFD7A0", "Frangipani", "Yellow"],
      ["029D74", "Free Speech Aquamarine", "Green"],
      ["4156C5", "Free Speech Blue", "Blue"],
      ["09F911", "Free Speech Green", "Green"],
      ["E35BD8", "Free Speech Magenta", "Red"],
      ["C00000", "Free Speech Red", "Red"],
      ["BFBDC1", "French Grey", "Grey"],
      ["DEB7D9", "French Lilac", "Violet"],
      ["A4D2E0", "French Pass", "Blue"],
      ["F64A8A", "French Rose", "Red"],
      ["86837A", "Friar Grey", "Grey"],
      ["B4E1BB", "Fringy Flower", "Green"],
      ["E56D75", "Froly", "Red"],
      ["E1E4C5", "Frost", "Green"],
      ["E2F2E4", "Frosted Mint", "Green"],
      ["DBE5D2", "Frostee", "Green"],
      ["4BA351", "Fruit Salad", "Green"],
      ["C154C1", "Fuchsia", "Violet"],
      ["FF77FF", "Fuchsia Pink", "Red"],
      ["C2D62E", "Fuego", "Green"],
      ["D19033", "Fuel Yellow", "Yellow"],
      ["335083", "Fun Blue", "Blue"],
      ["15633D", "Fun Green", "Green"],
      ["3C3B3C", "Fuscous Grey", "Grey"],
      ["C45655", "Fuzzy Wuzzy Brown", "Brown"],
      ["2C4641", "Gable Green", "Green"],
      ["DCDCDC", "Gainsboro", "White"],
      ["DCD7D1", "Gallery", "Grey"],
      ["D8A723", "Galliano", "Yellow"],
      ["E49B0F", "Gamboge", "Yellow"],
      ["C5832E", "Geebung", "Yellow"],
      ["31796D", "Genoa", "Green"],
      ["E77B75", "Geraldine", "Red"],
      ["CBD0CF", "Geyser", "Grey"],
      ["C0BFC7", "Ghost", "Blue"],
      ["F8F8FF", "Ghost White", "White"],
      ["564786", "Gigas", "Violet"],
      ["B9AD61", "Gimblet", "Green"],
      ["D9DFCD", "Gin", "Green"],
      ["F8EACA", "Gin Fizz", "Yellow"],
      ["EBD4AE", "Givry", "Yellow"],
      ["78B1BF", "Glacier", "Blue"],
      ["5F8151", "Glade Green", "Green"],
      ["786E4C", "Go Ben", "Yellow"],
      ["34533D", "Goblin", "Green"],
      ["FFD700", "Gold", "Yellow"],
      ["D56C30", "Gold Drop", "Orange"],
      ["E2B227", "Gold Tips", "Yellow"],
      ["CA8136", "Golden Bell", "Orange"],
      ["996515", "Golden Brown", "Brown"],
      ["F1CC2B", "Golden Dream", "Yellow"],
      ["EBDE31", "Golden Fizz", "Green"],
      ["F9D77E", "Golden Glow", "Yellow"],
      ["FCC200", "Golden Poppy", "Yellow"],
      ["EACE6A", "Golden Sand", "Yellow"],
      ["FFC152", "Golden Tainoi", "Yellow"],
      ["FFDF00", "Golden Yellow", "Yellow"],
      ["DBDB70", "Goldenrod", "Yellow"],
      ["373332", "Gondola", "Grey"],
      ["29332B", "Gordons Green", "Green"],
      ["FDE336", "Gorse", "Green"],
      ["399F86", "Gossamer", "Green"],
      ["9FD385", "Gossip", "Green"],
      ["698890", "Gothic", "Blue"],
      ["51559B", "Governor Bay", "Blue"],
      ["CAB8A2", "Grain Brown", "Yellow"],
      ["FFCD73", "Grandis", "Yellow"],
      ["8B8265", "Granite Green", "Yellow"],
      ["C5E7CD", "Granny Apple", "Green"],
      ["7B948C", "Granny Smith", "Green"],
      ["9DE093", "Granny Smith Apple", "Green"],
      ["413D4B", "Grape", "Violet"],
      ["383428", "Graphite", "Yellow"],
      ["4A4B46", "Gravel", "Grey"],
      ["008000", "Green", "Green"],
      ["3E6334", "Green House", "Green"],
      ["393D2A", "Green Kelp", "Green"],
      ["526B2D", "Green Leaf", "Green"],
      ["BFC298", "Green Mist", "Green"],
      ["266242", "Green Pea", "Green"],
      ["9CA664", "Green Smoke", "Green"],
      ["A9AF99", "Green Spring", "Green"],
      ["23414E", "Green Vogue", "Blue"],
      ["2C2D24", "Green Waterloo", "Green"],
      ["DEDDCB", "Green White", "Green"],
      ["ADFF2F", "Green Yellow", "Green"],
      ["C14D36", "Grenadier", "Orange"],
      ["808080", "Grey", "Grey"],
      ["9FA3A7", "Grey Chateau", "Grey"],
      ["BDBAAE", "Grey Nickel", "Green"],
      ["D1D3CC", "Grey Nurse", "Grey"],
      ["A19A7F", "Grey Olive", "Yellow"],
      ["9391A0", "Grey Suit", "Blue"],
      ["465945", "Grey-Asparagus", "Green"],
      ["952E31", "Guardsman Red", "Red"],
      ["343F5C", "Gulf Blue", "Blue"],
      ["74B2A8", "Gulf Stream", "Green"],
      ["A4ADB0", "Gull Grey", "Grey"],
      ["ACC9B2", "Gum Leaf", "Green"],
      ["718F8A", "Gumbo", "Green"],
      ["484753", "Gun Powder", "Violet"],
      ["2C3539", "Gunmetal", "Blue"],
      ["7A7C76", "Gunsmoke", "Grey"],
      ["989171", "Gurkha", "Green"],
      ["9E8022", "Hacienda", "Yellow"],
      ["633528", "Hairy Heath", "Brown"],
      ["2C2A35", "Haiti", "Violet"],
      ["EDE7C8", "Half And Half", "Green"],
      ["558F93", "Half Baked", "Blue"],
      ["F2E5BF", "Half Colonial White", "Yellow"],
      ["FBF0D6", "Half Dutch White", "Yellow"],
      ["F1EAD7", "Half Pearl Lusta", "Yellow"],
      ["E6DBC7", "Half Spanish White", "Yellow"],
      ["E8D4A2", "Hampton", "Yellow"],
      ["5218FA", "Han Purple", "Violet"],
      ["3FFF00", "Harlequin", "Green"],
      ["C93413", "Harley Davidson Orange", "Orange"],
      ["CBCEC0", "Harp", "Green"],
      ["EAB76A", "Harvest Gold", "Yellow"],
      ["3B2B2C", "Havana", "Brown"],
      ["5784C1", "Havelock Blue", "Blue"],
      ["99522B", "Hawaiian Tan", "Orange"],
      ["D2DAED", "Hawkes Blue", "Blue"],
      ["4F2A2C", "Heath", "Red"],
      ["AEBBC1", "Heather", "Blue"],
      ["948C7E", "Heathered Grey", "Brown"],
      ["46473E", "Heavy Metal", "Grey"],
      ["DF73FF", "Heliotrope", "Violet"],
      ["69684B", "Hemlock", "Yellow"],
      ["987D73", "Hemp", "Brown"],
      ["928C3C", "Highball", "Green"],
      ["7A9461", "Highland", "Green"],
      ["A7A07E", "Hillary", "Green"],
      ["736330", "Himalaya", "Yellow"],
      ["DFF1D6", "Hint Of Green", "Green"],
      ["F5EFEB", "Hint Of Red", "Grey"],
      ["F6F5D7", "Hint Of Yellow", "Green"],
      ["49889A", "Hippie Blue", "Blue"],
      ["608A5A", "Hippie Green", "Green"],
      ["AB495C", "Hippie Pink", "Red"],
      ["A1A9A8", "Hit Grey", "Grey"],
      ["FDA470", "Hit Pink", "Orange"],
      ["BB8E34", "Hokey Pokey", "Yellow"],
      ["647D86", "Hoki", "Blue"],
      ["25342B", "Holly", "Green"],
      ["F400A1", "Hollywood Cerise", "Red"],
      ["5C3C6D", "Honey Flower", "Violet"],
      ["F0FFF0", "Honeydew", "White"],
      ["E8ED69", "Honeysuckle", "Green"],
      ["CD6D93", "Hopbush", "Violet"],
      ["648894", "Horizon", "Blue"],
      ["6D562C", "Horses Neck", "Yellow"],
      ["815B28", "Hot Curry", "Yellow"],
      ["FF00CC", "Hot Magenta", "Red"],
      ["FF69B4", "Hot Pink", "Red"],
      ["4E2E53", "Hot Purple", "Violet"],
      ["A7752C", "Hot Toddy", "Yellow"],
      ["CEEFE4", "Humming Bird", "Green"],
      ["355E3B", "Hunter Green", "Green"],
      ["8B7E77", "Hurricane", "Brown"],
      ["B2994B", "Husk", "Yellow"],
      ["AFE3D6", "Ice Cold", "Green"],
      ["CAE1D9", "Iceberg", "Green"],
      ["EF95AE", "Illusion", "Red"],
      ["B0E313", "Inch Worm", "Green"],
      ["CD5C5C", "Indian Red", "Red"],
      ["4F301F", "Indian Tan", "Brown"],
      ["4B0082", "Indigo", "Violet"],
      ["9C5B34", "Indochine", "Orange"],
      ["002FA7", "International Klein Blue", "Blue"],
      ["FF4F00", "International Orange", "Orange"],
      ["03B4C8", "Iris Blue", "Blue"],
      ["62422B", "Irish Coffee", "Brown"],
      ["CBCDCD", "Iron", "Grey"],
      ["706E66", "Ironside Grey", "Grey"],
      ["865040", "Ironstone", "Brown"],
      ["009900", "Islamic Green", "Green"],
      ["F8EDDB", "Island Spice", "Yellow"],
      ["FFFFF0", "Ivory", "White"],
      ["3D325D", "Jacarta", "Violet"],
      ["413628", "Jacko Bean", "Brown"],
      ["3D3F7D", "Jacksons Purple", "Violet"],
      ["00A86B", "Jade", "Green"],
      ["E27945", "Jaffa", "Orange"],
      ["CAE7E2", "Jagged Ice", "Green"],
      ["3F2E4C", "Jagger", "Violet"],
      ["29292F", "Jaguar", "Blue"],
      ["674834", "Jambalaya", "Brown"],
      ["2F7532", "Japanese Laurel", "Green"],
      ["CE7259", "Japonica", "Orange"],
      ["259797", "Java", "Green"],
      ["5F2C2F", "Jazz", "Red"],
      ["A50B5E", "Jazzberry Jam", "Red"],
      ["44798E", "Jelly Bean", "Blue"],
      ["BBD0C9", "Jet Stream", "Green"],
      ["136843", "Jewel", "Green"],
      ["463D3E", "Jon", "Grey"],
      ["EEF293", "Jonquil", "Green"],
      ["7AAAE0", "Jordy Blue", "Blue"],
      ["5D5346", "Judge Grey", "Brown"],
      ["878785", "Jumbo", "Grey"],
      ["29AB87", "Jungle Green", "Green"],
      ["B0C4C4", "Jungle Mist", "Green"],
      ["74918E", "Juniper", "Green"],
      ["DCBFAC", "Just Right", "Orange"],
      ["6C5E53", "Kabul", "Brown"],
      ["245336", "Kaitoke Green", "Green"],
      ["C5C3B0", "Kangaroo", "Green"],
      ["2D2D24", "Karaka", "Green"],
      ["FEDCC1", "Karry", "Orange"],
      ["576D8E", "Kashmir Blue", "Blue"],
      ["4CBB17", "Kelly Green", "Green"],
      ["4D503C", "Kelp", "Green"],
      ["6C322E", "Kenyan Copper", "Red"],
      ["5FB69C", "Keppel", "Green"],
      ["F0E68C", "Khaki", "Yellow"],
      ["BFC0AB", "Kidnapper", "Green"],
      ["3A3532", "Kilamanjaro", "Grey"],
      ["49764F", "Killarney", "Green"],
      ["695D87", "Kimberly", "Violet"],
      ["583580", "Kingfisher Daisy", "Violet"],
      ["E093AB", "Kobi", "Red"],
      ["7B785A", "Kokoda", "Green"],
      ["804E2C", "Korma", "Orange"],
      ["FEB552", "Koromiko", "Yellow"],
      ["F9D054", "Kournikova", "Yellow"],
      ["428929", "La Palma", "Green"],
      ["BAC00E", "La Rioja", "Green"],
      ["C6DA36", "Las Palmas", "Green"],
      ["C6A95E", "Laser", "Yellow"],
      ["FFFF66", "Laser Lemon", "Yellow"],
      ["6E8D71", "Laurel", "Green"],
      ["E6E6FA", "Lavender", "Violet"],
      ["CCCCFF", "Lavender Blue", "Blue"],
      ["FFF0F5", "Lavender Blush", "Violet"],
      ["BDBBD7", "Lavender Grey", "Grey"],
      ["FBAED2", "Lavender Pink", "Red"],
      ["FBA0E3", "Lavender Rose", "Red"],
      ["7CFC00", "Lawn Green", "Green"],
      ["906A54", "Leather", "Brown"],
      ["FDE910", "Lemon", "Yellow"],
      ["FFFACD", "Lemon Chiffon", "Yellow"],
      ["968428", "Lemon Ginger", "Yellow"],
      ["999A86", "Lemon Grass", "Green"],
      ["2E3749", "Licorice", "Blue"],
      ["ADD8E6", "Light Blue", "Blue"],
      ["F08080", "Light Coral", "Orange"],
      ["E0FFFF", "Light Cyan", "Blue"],
      ["EEDD82", "Light Goldenrod", "Yellow"],
      ["FAFAD2", "Light Goldenrod Yellow", "Yellow"],
      ["90EE90", "Light Green", "Green"],
      ["D3D3D3", "Light Grey", "Grey"],
      ["FFB6C1", "Light Pink", "Red"],
      ["FFA07A", "Light Salmon", "Orange"],
      ["20B2AA", "Light Sea Green", "Green"],
      ["87CEFA", "Light Sky Blue", "Blue"],
      ["8470FF", "Light Slate Blue", "Blue"],
      ["778899", "Light Slate Grey", "Grey"],
      ["B0C4DE", "Light Steel Blue", "Blue"],
      ["856363", "Light Wood", "Brown"],
      ["FFFFE0", "Light Yellow", "Yellow"],
      ["F7A233", "Lightning Yellow", "Yellow"],
      ["C8A2C8", "Lilac", "Violet"],
      ["9470C4", "Lilac Bush", "Violet"],
      ["C19FB3", "Lily", "Violet"],
      ["E9EEEB", "Lily White", "Grey"],
      ["7AAC21", "Lima", "Green"],
      ["00FF00", "Lime", "Green"],
      ["32CD32", "Lime Green", "Green"],
      ["5F9727", "Limeade", "Green"],
      ["89AC27", "Limerick", "Green"],
      ["FAF0E6", "Linen", "White"],
      ["C7CDD8", "Link Water", "Blue"],
      ["962C54", "Lipstick", "Red"],
      ["534B4F", "Liver", "Brown"],
      ["312A29", "Livid Brown", "Brown"],
      ["DBD9C2", "Loafer", "Green"],
      ["B3BBB7", "Loblolly", "Green"],
      ["489084", "Lochinvar", "Green"],
      ["316EA0", "Lochmara", "Blue"],
      ["A2A580", "Locust", "Green"],
      ["393E2E", "Log Cabin", "Green"],
      ["9D9CB4", "Logan", "Blue"],
      ["B9ACBB", "Lola", "Violet"],
      ["AE94AB", "London Hue", "Violet"],
      ["522426", "Lonestar", "Red"],
      ["8B504B", "Lotus", "Brown"],
      ["4C3347", "Loulou", "Violet"],
      ["AB9A1C", "Lucky", "Green"],
      ["292D4F", "Lucky Point", "Blue"],
      ["4E5541", "Lunar Green", "Green"],
      ["782E2C", "Lusty", "Red"],
      ["AB8D3F", "Luxor Gold", "Yellow"],
      ["697D89", "Lynch", "Blue"],
      ["CBE8E8", "Mabel", "Blue"],
      ["FFB97B", "Macaroni And Cheese", "Orange"],
      ["B7E3A8", "Madang", "Green"],
      ["2D3C54", "Madison", "Blue"],
      ["473E23", "Madras", "Brown"],
      ["FF00FF", "Magenta", "Violet"],
      ["AAF0D1", "Magic Mint", "Green"],
      ["F8F4FF", "Magnolia", "White"],
      ["CA3435", "Mahogany", "Brown"],
      ["A56531", "Mai Tai", "Orange"],
      ["2A2922", "Maire", "Yellow"],
      ["E3B982", "Maize", "Yellow"],
      ["695F50", "Makara", "Brown"],
      ["505555", "Mako", "Grey"],
      ["0BDA51", "Malachite", "Green"],
      ["97976F", "Malachite Green", "Green"],
      ["66B7E1", "Malibu", "Blue"],
      ["3A4531", "Mallard", "Green"],
      ["A59784", "Malta", "Brown"],
      ["766D7C", "Mamba", "Violet"],
      ["8D90A1", "Manatee", "Blue"],
      ["B57B2E", "Mandalay", "Yellow"],
      ["8E2323", "Mandarian Orange", "Orange"],
      ["CD525B", "Mandy", "Red"],
      ["F5B799", "Mandys Pink", "Orange"],
      ["E77200", "Mango Tango", "Orange"],
      ["E2AF80", "Manhattan", "Orange"],
      ["7FC15C", "Mantis", "Green"],
      ["96A793", "Mantle", "Green"],
      ["E4DB55", "Manz", "Green"],
      ["352235", "Mardi Gras", "Violet"],
      ["B88A3D", "Marigold", "Yellow"],
      ["42639F", "Mariner", "Blue"],
      ["800000", "Maroon", "Brown"],
      ["2B2E26", "Marshland", "Green"],
      ["B7A8A3", "Martini", "Brown"],
      ["3C3748", "Martinique", "Violet"],
      ["EBC881", "Marzipan", "Yellow"],
      ["57534B", "Masala", "Brown"],
      ["365C7D", "Matisse", "Blue"],
      ["8E4D45", "Matrix", "Red"],
      ["524B4B", "Matterhorn", "Grey"],
      ["E0B0FF", "Mauve", "Violet"],
      ["915F6D", "Mauve Taupe", "Red"],
      ["F091A9", "Mauvelous", "Red"],
      ["C8B1C0", "Maverick", "Violet"],
      ["73C2FB", "Maya Blue", "Blue"],
      ["8C6338", "McKenzie", "Orange"],
      ["66CDAA", "Medium Aquamarine", "Blue"],
      ["0000CD", "Medium Blue", "Blue"],
      ["AF4035", "Medium Carmine", "Red"],
      ["EAEAAE", "Medium Goldenrod", "Yellow"],
      ["BA55D3", "Medium Orchid", "Violet"],
      ["9370DB", "Medium Purple", "Violet"],
      ["3CB371", "Medium Sea Green", "Green"],
      ["7B68EE", "Medium Slate Blue", "Blue"],
      ["00FA9A", "Medium Spring Green", "Green"],
      ["48D1CC", "Medium Turquoise", "Blue"],
      ["C71585", "Medium Violet Red", "Red"],
      ["A68064", "Medium Wood", "Brown"],
      ["E0B7C2", "Melanie", "Red"],
      ["342931", "Melanzane", "Violet"],
      ["FEBAAD", "Melon", "Red"],
      ["C3B9DD", "Melrose", "Violet"],
      ["D5D2D1", "Mercury", "Grey"],
      ["E1DBD0", "Merino", "Yellow"],
      ["4F4E48", "Merlin", "Grey"],
      ["73343A", "Merlot", "Red"],
      ["554A3C", "Metallic Bronze", "Red"],
      ["6E3D34", "Metallic Copper", "Red"],
      ["D4AF37", "Metallic Gold", "Yellow"],
      ["BB7431", "Meteor", "Orange"],
      ["4A3B6A", "Meteorite", "Violet"],
      ["9B3D3D", "Mexican Red", "Red"],
      ["666A6D", "Mid Grey", "Grey"],
      ["21303E", "Midnight", "Blue"],
      ["191970", "Midnight Blue", "Blue"],
      ["21263A", "Midnight Express", "Blue"],
      ["242E28", "Midnight Moss", "Green"],
      ["3F3623", "Mikado", "Brown"],
      ["F6F493", "Milan", "Green"],
      ["9E3332", "Milano Red", "Red"],
      ["F3E5C0", "Milk Punch", "Yellow"],
      ["DCD9CD", "Milk White", "Grey"],
      ["595648", "Millbrook", "Brown"],
      ["F5F5CC", "Mimosa", "Green"],
      ["DAEA6F", "Mindaro", "Green"],
      ["373E41", "Mine Shaft", "Blue"],
      ["506355", "Mineral Green", "Green"],
      ["407577", "Ming", "Green"],
      ["3E3267", "Minsk", "Violet"],
      ["F5FFFA", "Mint Cream", "White"],
      ["98FF98", "Mint Green", "Green"],
      ["E0D8A7", "Mint Julep", "Green"],
      ["C6EADD", "Mint Tulip", "Green"],
      ["373F43", "Mirage", "Blue"],
      ["A5A9B2", "Mischka", "Blue"],
      ["BAB9A9", "Mist Grey", "Grey"],
      ["FFE4E1", "Misty Rose", "Violet"],
      ["605A67", "Mobster", "Violet"],
      ["582F2B", "Moccaccino", "Red"],
      ["FFE4B5", "Moccasin", "Yellow"],
      ["6F372D", "Mocha", "Red"],
      ["97463C", "Mojo", "Red"],
      ["FF9889", "Mona Lisa", "Red"],
      ["6B252C", "Monarch", "Red"],
      ["554D42", "Mondo", "Brown"],
      ["A58B6F", "Mongoose", "Brown"],
      ["7A7679", "Monsoon", "Grey"],
      ["393B3C", "Montana", "Grey"],
      ["7AC5B4", "Monte Carlo", "Green"],
      ["8378C7", "Moody Blue", "Violet"],
      ["F5F3CE", "Moon Glow", "Green"],
      ["CECDB8", "Moon Mist", "Green"],
      ["C0B2D7", "Moon Raker", "Violet"],
      ["F0C420", "Moon Yellow", "Yellow"],
      ["9ED1D3", "Morning Glory", "Blue"],
      ["442D21", "Morocco Brown", "Brown"],
      ["565051", "Mortar", "Grey"],
      ["005F5B", "Mosque", "Green"],
      ["ADDFAD", "Moss Green", "Green"],
      ["1AB385", "Mountain Meadow", "Green"],
      ["A09F9C", "Mountain Mist", "Grey"],
      ["997A8D", "Mountbatten Pink", "Violet"],
      ["A9844F", "Muddy Waters", "Yellow"],
      ["9E7E53", "Muesli", "Brown"],
      ["C54B8C", "Mulberry", "Violet"],
      ["884F40", "Mule Fawn", "Brown"],
      ["524D5B", "Mulled Wine", "Violet"],
      ["FFDB58", "Mustard", "Yellow"],
      ["D68B80", "My Pink", "Red"],
      ["FDAE45", "My Sin", "Yellow"],
      ["21421E", "Myrtle", "Green"],
      ["D8DDDA", "Mystic", "Grey"],
      ["4E5D4E", "Nandor", "Green"],
      ["A39A87", "Napa", "Yellow"],
      ["E9E6DC", "Narvik", "Green"],
      ["FFDEAD", "Navajo White", "Brown"],
      ["000080", "Navy", "Blue"],
      ["0066CC", "Navy Blue", "Blue"],
      ["B8C6BE", "Nebula", "Green"],
      ["EEC7A2", "Negroni", "Orange"],
      ["4D4DFF", "Neon Blue", "Blue"],
      ["FF9933", "Neon Carrot", "Orange"],
      ["FF6EC7", "Neon Pink", "Violet"],
      ["93AAB9", "Nepal", "Blue"],
      ["77A8AB", "Neptune", "Green"],
      ["252525", "Nero", "Grey"],
      ["AAA583", "Neutral Green", "Green"],
      ["666F6F", "Nevada", "Grey"],
      ["6D3B24", "New Amber", "Orange"],
      ["00009C", "New Midnight Blue", "Blue"],
      ["E4C385", "New Orleans", "Yellow"],
      ["EBC79E", "New Tan", "Brown"],
      ["DD8374", "New York Pink", "Red"],
      ["29A98B", "Niagara", "Green"],
      ["332E2E", "Night Rider", "Grey"],
      ["A23D54", "Night Shadz", "Red"],
      ["253F4E", "Nile Blue", "Blue"],
      ["A99D9D", "Nobel", "Grey"],
      ["A19986", "Nomad", "Yellow"],
      ["1D393C", "Nordic", "Blue"],
      ["A4B88F", "Norway", "Green"],
      ["BC9229", "Nugget", "Yellow"],
      ["7E4A3B", "Nutmeg", "Brown"],
      ["FCEDC5", "Oasis", "Yellow"],
      ["008F70", "Observatory", "Green"],
      ["4CA973", "Ocean Green", "Green"],
      ["CC7722", "Ochre", "Brown"],
      ["DFF0E2", "Off Green", "Green"],
      ["FAF3DC", "Off Yellow", "Yellow"],
      ["313330", "Oil", "Grey"],
      ["8A3335", "Old Brick", "Red"],
      ["73503B", "Old Copper", "Red"],
      ["CFB53B", "Old Gold", "Yellow"],
      ["FDF5E6", "Old Lace", "White"],
      ["796878", "Old Lavender", "Violet"],
      ["C02E4C", "Old Rose", "Red"],
      ["808000", "Olive", "Green"],
      ["6B8E23", "Olive Drab", "Green"],
      ["B5B35C", "Olive Green", "Green"],
      ["888064", "Olive Haze", "Yellow"],
      ["747028", "Olivetone", "Green"],
      ["9AB973", "Olivine", "Orange"],
      ["C2E6EC", "Onahau", "Blue"],
      ["48412B", "Onion", "Yellow"],
      ["A8C3BC", "Opal", "Green"],
      ["987E7E", "Opium", "Brown"],
      ["395555", "Oracle", "Green"],
      ["FFA500", "Orange", "Orange"],
      ["FFA000", "Orange Peel", "Orange"],
      ["FF4500", "Orange Red", "Orange"],
      ["A85335", "Orange Roughy", "Orange"],
      ["EAE3CD", "Orange White", "Yellow"],
      ["DA70D6", "Orchid", "Violet"],
      ["F1EBD9", "Orchid White", "Yellow"],
      ["255B77", "Orient", "Blue"],
      ["C28E88", "Oriental Pink", "Red"],
      ["D2D3B3", "Orinoco", "Green"],
      ["818988", "Oslo Grey", "Grey"],
      ["D3DBCB", "Ottoman", "Green"],
      ["2D383A", "Outer Space", "Grey"],
      ["FF6037", "Outrageous Orange", "Orange"],
      ["28353A", "Oxford Blue", "Blue"],
      ["6D9A78", "Oxley", "Green"],
      ["D1EAEA", "Oyster Bay", "Blue"],
      ["D4B5B0", "Oyster Pink", "Red"],
      ["864B36", "Paarl", "Orange"],
      ["7A715C", "Pablo", "Yellow"],
      ["009DC4", "Pacific Blue", "Blue"],
      ["4F4037", "Paco", "Brown"],
      ["7EB394", "Padua", "Green"],
      ["682860", "Palatinate Purple", "Violet"],
      ["987654", "Pale Brown", "Brown"],
      ["DDADAF", "Pale Chestnut", "Red"],
      ["ABCDEF", "Pale Cornflower Blue", "Blue"],
      ["EEE8AA", "Pale Goldenrod", "Yellow"],
      ["98FB98", "Pale Green", "Green"],
      ["BDCAA8", "Pale Leaf", "Green"],
      ["F984E5", "Pale Magenta", "Violet"],
      ["9C8D72", "Pale Oyster", "Brown"],
      ["FADADD", "Pale Pink", "Red"],
      ["F9F59F", "Pale Prim", "Green"],
      ["EFD6DA", "Pale Rose", "Red"],
      ["636D70", "Pale Sky", "Blue"],
      ["C3BEBB", "Pale Slate", "Grey"],
      ["BC987E", "Pale Taupe", "Grey"],
      ["AFEEEE", "Pale Turquoise", "Blue"],
      ["DB7093", "Pale Violet Red", "Red"],
      ["20392C", "Palm Green", "Green"],
      ["36482F", "Palm Leaf", "Green"],
      ["EAE4DC", "Pampas", "Grey"],
      ["EBF7E4", "Panache", "Green"],
      ["DFB992", "Pancho", "Orange"],
      ["544F3A", "Panda", "Yellow"],
      ["FFEFD5", "Papaya Whip", "Yellow"],
      ["7C2D37", "Paprika", "Red"],
      ["488084", "Paradiso", "Green"],
      ["D0C8B0", "Parchment", "Yellow"],
      ["FBEB50", "Paris Daisy", "Green"],
      ["312760", "Paris M", "Violet"],
      ["BFCDC0", "Paris White", "Green"],
      ["305D35", "Parsley", "Green"],
      ["77DD77", "Pastel Green", "Green"],
      ["639283", "Patina", "Green"],
      ["D3E5EF", "Pattens Blue", "Blue"],
      ["2A2551", "Paua", "Violet"],
      ["BAAB87", "Pavlova", "Yellow"],
      ["404048", "Payne's Grey", "Grey"],
      ["FFCBA4", "Peach", "Orange"],
      ["FFDAB9", "Peach Puff", "Yellow"],
      ["FFCC99", "Peach-Orange", "Orange"],
      ["FADFAD", "Peach-Yellow", "Yellow"],
      ["7A4434", "Peanut", "Brown"],
      ["D1E231", "Pear", "Yellow"],
      ["DED1C6", "Pearl Bush", "Orange"],
      ["EAE0C8", "Pearl Lusta", "Yellow"],
      ["766D52", "Peat", "Yellow"],
      ["2599B2", "Pelorous", "Blue"],
      ["D7E7D0", "Peppermint", "Green"],
      ["ACB9E8", "Perano", "Blue"],
      ["C2A9DB", "Perfume", "Violet"],
      ["ACB6B2", "Periglacial Blue", "Green"],
      ["C3CDE6", "Periwinkle", "Blue"],
      ["1C39BB", "Persian Blue", "Blue"],
      ["00A693", "Persian Green", "Green"],
      ["32127A", "Persian Indigo", "Violet"],
      ["F77FBE", "Persian Pink", "Red"],
      ["683332", "Persian Plum", "Red"],
      ["CC3333", "Persian Red", "Red"],
      ["FE28A2", "Persian Rose", "Red"],
      ["EC5800", "Persimmon", "Red"],
      ["CD853F", "Peru", "Brown"],
      ["733D1F", "Peru Tan", "Orange"],
      ["7A7229", "Pesto", "Yellow"],
      ["DA9790", "Petite Orchid", "Red"],
      ["91A092", "Pewter", "Green"],
      ["826663", "Pharlap", "Brown"],
      ["F8EA97", "Picasso", "Green"],
      ["5BA0D0", "Picton Blue", "Blue"],
      ["FDD7E4", "Pig Pink", "Red"],
      ["00A550", "Pigment Green", "Green"],
      ["756556", "Pine Cone", "Brown"],
      ["BDC07E", "Pine Glade", "Green"],
      ["01796F", "Pine Green", "Green"],
      ["2A2F23", "Pine Tree", "Green"],
      ["FFC0CB", "Pink", "Red"],
      ["FF66FF", "Pink Flamingo", "Red"],
      ["D8B4B6", "Pink Flare", "Red"],
      ["F6CCD7", "Pink Lace", "Red"],
      ["F3D7B6", "Pink Lady", "Orange"],
      ["BFB3B2", "Pink Swan", "Grey"],
      ["9D5432", "Piper", "Orange"],
      ["F5E6C4", "Pipi", "Yellow"],
      ["FCDBD2", "Pippin", "Red"],
      ["BA782A", "Pirate Gold", "Yellow"],
      ["BBCDA5", "Pixie Green", "Green"],
      ["E57F3D", "Pizazz", "Orange"],
      ["BF8D3C", "Pizza", "Yellow"],
      ["3E594C", "Plantation", "Green"],
      ["DDA0DD", "Plum", "Violet"],
      ["651C26", "Pohutukawa", "Red"],
      ["E5F2E7", "Polar", "Green"],
      ["8AA7CC", "Polo Blue", "Blue"],
      ["6A1F44", "Pompadour", "Violet"],
      ["DDDCDB", "Porcelain", "Grey"],
      ["DF9D5B", "Porsche", "Orange"],
      ["3B436C", "Port Gore", "Blue"],
      ["F4F09B", "Portafino", "Green"],
      ["8B98D8", "Portage", "Blue"],
      ["F0D555", "Portica", "Yellow"],
      ["EFDCD4", "Pot Pourri", "Orange"],
      ["845C40", "Potters Clay", "Brown"],
      ["B0E0E6", "Powder Blue", "Blue"],
      ["883C32", "Prairie Sand", "Red"],
      ["CAB4D4", "Prelude", "Violet"],
      ["E2CDD5", "Prim", "Violet"],
      ["E4DE8E", "Primrose", "Green"],
      ["F8F6DF", "Promenade", "Green"],
      ["F6E3DA", "Provincial Pink", "Orange"],
      ["003366", "Prussian Blue", "Blue"],
      ["DD00FF", "Psychedelic Purple", "Violet"],
      ["CC8899", "Puce", "Red"],
      ["6E3326", "Pueblo", "Orange"],
      ["59BAA3", "Puerto Rico", "Green"],
      ["BAC0B4", "Pumice", "Green"],
      ["FF7518", "Pumpkin", "Orange"],
      ["534931", "Punga", "Yellow"],
      ["800080", "Purple", "Violet"],
      ["652DC1", "Purple Heart", "Violet"],
      ["9678B6", "Purple Mountain's Majesty", "Violet"],
      ["50404D", "Purple Taupe", "Grey"],
      ["CDAE70", "Putty", "Yellow"],
      ["F2EDDD", "Quarter Pearl Lusta", "Green"],
      ["EBE2D2", "Quarter Spanish White", "Yellow"],
      ["D9D9F3", "Quartz", "White"],
      ["C3988B", "Quicksand", "Brown"],
      ["CBC9C0", "Quill Grey", "Grey"],
      ["6A5445", "Quincy", "Brown"],
      ["232F2C", "Racing Green", "Green"],
      ["FF355E", "Radical Red", "Red"],
      ["DCC6A0", "Raffia", "Yellow"],
      ["667028", "Rain Forest", "Green"],
      ["B3C1B1", "Rainee", "Green"],
      ["FCAE60", "Rajah", "Orange"],
      ["2B2E25", "Rangoon Green", "Green"],
      ["6F747B", "Raven", "Blue"],
      ["D27D46", "Raw Sienna", "Brown"],
      ["734A12", "Raw Umber", "Brown"],
      ["FF33CC", "Razzle Dazzle Rose", "Red"],
      ["E30B5C", "Razzmatazz", "Red"],
      ["453430", "Rebel", "Brown"],
      ["FF0000", "Red", "Red"],
      ["701F28", "Red Berry", "Red"],
      ["CB6F4A", "Red Damask", "Orange"],
      ["662A2C", "Red Devil", "Red"],
      ["FF3F34", "Red Orange", "Orange"],
      ["5D1F1E", "Red Oxide", "Red"],
      ["7D4138", "Red Robin", "Red"],
      ["AD522E", "Red Stage", "Orange"],
      ["BB3385", "Medium Red Violet", "Violet"],
      ["5B342E", "Redwood", "Red"],
      ["D1EF9F", "Reef", "Green"],
      ["A98D36", "Reef Gold", "Yellow"],
      ["203F58", "Regal Blue", "Blue"],
      ["798488", "Regent Grey", "Blue"],
      ["A0CDD9", "Regent St Blue", "Blue"],
      ["F6DEDA", "Remy", "Red"],
      ["B26E33", "Reno Sand", "Orange"],
      ["323F75", "Resolution Blue", "Blue"],
      ["37363F", "Revolver", "Violet"],
      ["3D4653", "Rhino", "Blue"],
      ["EFECDE", "Rice Cake", "Green"],
      ["EFF5D1", "Rice Flower", "Green"],
      ["5959AB", "Rich Blue", "Blue"],
      ["A15226", "Rich Gold", "Orange"],
      ["B7C61A", "Rio Grande", "Green"],
      ["89D9C8", "Riptide", "Green"],
      ["556061", "River Bed", "Blue"],
      ["DDAD56", "Rob Roy", "Yellow"],
      ["00CCCC", "Robin's Egg Blue", "Blue"],
      ["5A4D41", "Rock", "Brown"],
      ["93A2BA", "Rock Blue", "Blue"],
      ["9D442D", "Rock Spray", "Orange"],
      ["C7A384", "Rodeo Dust", "Brown"],
      ["6D7876", "Rolling Stone", "Green"],
      ["D8625B", "Roman", "Red"],
      ["7D6757", "Roman Coffee", "Brown"],
      ["F4F0E6", "Romance", "Grey"],
      ["FFC69E", "Romantic", "Orange"],
      ["EAB852", "Ronchi", "Yellow"],
      ["A14743", "Roof Terracotta", "Red"],
      ["8E593C", "Rope", "Orange"],
      ["D3A194", "Rose", "Red"],
      ["FEAB9A", "Rose Bud", "Red"],
      ["8A2D52", "Rose Bud Cherry", "Red"],
      ["AC512D", "Rose Of Sharon", "Orange"],
      ["905D5D", "Rose Taupe", "Violet"],
      ["FBEEE8", "Rose White", "Red"],
      ["BC8F8F", "Rosy Brown", "Brown"],
      ["B69642", "Roti", "Yellow"],
      ["A94064", "Rouge", "Red"],
      ["4169E1", "Royal Blue", "Blue"],
      ["B54B73", "Royal Heath", "Red"],
      ["6B3FA0", "Royal Purple", "Violet"],
      ["E0115F", "Ruby", "Red"],
      ["716675", "Rum", "Violet"],
      ["F1EDD4", "Rum Swizzle", "Green"],
      ["80461B", "Russet", "Brown"],
      ["7D655C", "Russett", "Brown"],
      ["B7410E", "Rust", "Red"],
      ["3A181A", "Rustic Red", "Red"],
      ["8D5F2C", "Rusty Nail", "Orange"],
      ["5D4E46", "Saddle", "Brown"],
      ["8B4513", "Saddle Brown", "Brown"],
      ["FF6600", "Safety Orange", "Orange"],
      ["F4C430", "Saffron", "Yellow"],
      ["989F7A", "Sage", "Green"],
      ["B79826", "Sahara", "Yellow"],
      ["A5CEEC", "Sail", "Blue"],
      ["177B4D", "Salem", "Green"],
      ["FA8072", "Salmon", "Red"],
      ["FFD67B", "Salomie", "Yellow"],
      ["696268", "Salt Box", "Violet"],
      ["EEF3E5", "Saltpan", "Grey"],
      ["3B2E25", "Sambuca", "Brown"],
      ["2C6E31", "San Felix", "Green"],
      ["445761", "San Juan", "Blue"],
      ["4E6C9D", "San Marino", "Blue"],
      ["867665", "Sand Dune", "Brown"],
      ["A3876A", "Sandal", "Brown"],
      ["AF937D", "Sandrift", "Brown"],
      ["786D5F", "Sandstone", "Brown"],
      ["DECB81", "Sandwisp", "Yellow"],
      ["FEDBB7", "Sandy Beach", "Orange"],
      ["F4A460", "Sandy Brown", "Brown"],
      ["92000A", "Sangria", "Red"],
      ["6C3736", "Sanguine Brown", "Red"],
      ["9998A7", "Santas Grey", "Blue"],
      ["A96A50", "Sante Fe", "Orange"],
      ["E1D5A6", "Sapling", "Yellow"],
      ["082567", "Sapphire", "Blue"],
      ["555B2C", "Saratoga", "Green"],
      ["F4EAE4", "Sauvignon", "Red"],
      ["F5DEC4", "Sazerac", "Orange"],
      ["6F63A0", "Scampi", "Violet"],
      ["ADD9D1", "Scandal", "Green"],
      ["FF2400", "Scarlet", "Red"],
      ["4A2D57", "Scarlet Gum", "Violet"],
      ["7E2530", "Scarlett", "Red"],
      ["6B6A6C", "Scarpa Flow", "Grey"],
      ["87876F", "Schist", "Green"],
      ["FFD800", "School Bus Yellow", "Yellow"],
      ["8D8478", "Schooner", "Brown"],
      ["308EA0", "Scooter", "Blue"],
      ["6A6466", "Scorpion", "Grey"],
      ["EEE7C8", "Scotch Mist", "Yellow"],
      ["66FF66", "Screamin' Green", "Green"],
      ["3D4031", "Scrub", "Green"],
      ["EF9548", "Sea Buckthorn", "Orange"],
      ["DFDDD6", "Sea Fog", "Grey"],
      ["2E8B57", "Sea Green", "Green"],
      ["C2D5C4", "Sea Mist", "Green"],
      ["8AAEA4", "Sea Nymph", "Green"],
      ["DB817E", "Sea Pink", "Red"],
      ["77B7D0", "Seagull", "Blue"],
      ["321414", "Seal Brown", "Brown"],
      ["69326E", "Seance", "Violet"],
      ["FFF5EE", "Seashell", "White"],
      ["37412A", "Seaweed", "Green"],
      ["E6DFE7", "Selago", "Violet"],
      ["FFBA00", "Selective Yellow", "Yellow"],
      ["6B4226", "Semi-Sweet Chocolate", "Brown"],
      ["9E5B40", "Sepia", "Brown"],
      ["FCE9D7", "Serenade", "Orange"],
      ["837050", "Shadow", "Green"],
      ["9AC0B6", "Shadow Green", "Green"],
      ["9F9B9D", "Shady Lady", "Grey"],
      ["609AB8", "Shakespeare", "Blue"],
      ["F8F6A8", "Shalimar", "Green"],
      ["33CC99", "Shamrock", "Green"],
      ["009E60", "Shamrock Green", "Green"],
      ["34363A", "Shark", "Grey"],
      ["00494E", "Sherpa Blue", "Green"],
      ["1B4636", "Sherwood Green", "Green"],
      ["E6B2A6", "Shilo", "Red"],
      ["745937", "Shingle Fawn", "Brown"],
      ["7988AB", "Ship Cove", "Blue"],
      ["4E4E4C", "Ship Grey", "Grey"],
      ["842833", "Shiraz", "Red"],
      ["E899BE", "Shocking", "Violet"],
      ["FC0FC0", "Shocking Pink", "Red"],
      ["61666B", "Shuttle Grey", "Grey"],
      ["686B50", "Siam", "Green"],
      ["E9D9A9", "Sidecar", "Yellow"],
      ["A0522D", "Sienna", "Brown"],
      ["BBADA1", "Silk", "Brown"],
      ["C0C0C0", "Silver", "Grey"],
      ["ACAEA9", "Silver Chalice", "Grey"],
      ["BEBDB6", "Silver Sand", "Grey"],
      ["67BE90", "Silver Tree", "Green"],
      ["A6D5D0", "Sinbad", "Green"],
      ["69293B", "Siren", "Red"],
      ["68766E", "Sirocco", "Green"],
      ["C5BAA0", "Sisal", "Yellow"],
      ["9DB4AA", "Skeptic", "Green"],
      ["87CEEB", "Sky Blue", "Blue"],
      ["6A5ACD", "Slate Blue", "Blue"],
      ["708090", "Slate Grey", "Grey"],
      ["42342B", "Slugger", "Brown"],
      ["003399", "Smalt", "Blue"],
      ["496267", "Smalt Blue", "Blue"],
      ["BB5F34", "Smoke Tree", "Orange"],
      ["605D6B", "Smoky", "Violet"],
      ["FFFAFA", "Snow", "White"],
      ["E3E3DC", "Snow Drift", "Grey"],
      ["EAF7C9", "Snow Flurry", "Green"],
      ["D6F0CD", "Snowy Mint", "Green"],
      ["E4D7E5", "Snuff", "Violet"],
      ["ECE5DA", "Soapstone", "Grey"],
      ["CFBEA5", "Soft Amber", "Yellow"],
      ["EEDFDE", "Soft Peach", "Red"],
      ["85494C", "Solid Pink", "Red"],
      ["EADAC2", "Solitaire", "Yellow"],
      ["E9ECF1", "Solitude", "Blue"],
      ["DD6B38", "Sorbus", "Orange"],
      ["9D7F61", "Sorrell Brown", "Brown"],
      ["C9B59A", "Sour Dough", "Brown"],
      ["6F634B", "Soya Bean", "Brown"],
      ["4B433B", "Space Shuttle", "Brown"],
      ["7B8976", "Spanish Green", "Green"],
      ["DED1B7", "Spanish White", "Yellow"],
      ["375D4F", "Spectra", "Green"],
      ["6C4F3F", "Spice", "Brown"],
      ["8B5F4D", "Spicy Mix", "Brown"],
      ["FF1CAE", "Spicy Pink", "Red"],
      ["B3C4D8", "Spindle", "Blue"],
      ["F1D79E", "Splash", "Yellow"],
      ["7ECDDD", "Spray", "Blue"],
      ["A7FC00", "Spring Bud", "Green"],
      ["00FF7F", "Spring Green", "Green"],
      ["A3BD9C", "Spring Rain", "Green"],
      ["F1F1C6", "Spring Sun", "Green"],
      ["E9E1D9", "Spring Wood", "Grey"],
      ["B8CA9D", "Sprout", "Green"],
      ["A2A1AC", "Spun Pearl", "Blue"],
      ["8F7D6B", "Squirrel", "Brown"],
      ["325482", "St Tropaz", "Blue"],
      ["858885", "Stack", "Grey"],
      ["A0A197", "Star Dust", "Grey"],
      ["D2C6B6", "Stark White", "Yellow"],
      ["E3DD39", "Starship", "Green"],
      ["4682B4", "Steel Blue", "Blue"],
      ["43464B", "Steel Grey", "Grey"],
      ["833D3E", "Stiletto", "Red"],
      ["807661", "Stonewall", "Yellow"],
      ["65645F", "Storm Dust", "Grey"],
      ["747880", "Storm Grey", "Blue"],
      ["DABE82", "Straw", "Yellow"],
      ["946A81", "Strikemaster", "Violet"],
      ["406356", "Stromboli", "Green"],
      ["724AA1", "Studio", "Violet"],
      ["8C9C9C", "Submarine", "Blue"],
      ["EEEFDF", "Sugar Cane", "Green"],
      ["C6EA80", "Sulu", "Green"],
      ["8FB69C", "Summer Green", "Green"],
      ["38B0DE", "Summer Sky", "Blue"],
      ["EF8E38", "Sun", "Orange"],
      ["C4AA4D", "Sundance", "Yellow"],
      ["F8AFA9", "Sundown", "Red"],
      ["DAC01A", "Sunflower", "Yellow"],
      ["C76155", "Sunglo", "Red"],
      ["FFCC33", "Sunglow", "Orange"],
      ["C0514A", "Sunset", "Red"],
      ["FE4C40", "Sunset Orange", "Orange"],
      ["FA9D49", "Sunshade", "Orange"],
      ["FFB437", "Supernova", "Yellow"],
      ["B8D4BB", "Surf", "Green"],
      ["C3D6BD", "Surf Crest", "Green"],
      ["007B77", "Surfie Green", "Green"],
      ["7C9F2F", "Sushi", "Green"],
      ["8B8685", "Suva Grey", "Grey"],
      ["252F2F", "Swamp", "Green"],
      ["DAE6DD", "Swans Down", "Grey"],
      ["F9E176", "Sweet Corn", "Yellow"],
      ["EE918D", "Sweet Pink", "Red"],
      ["D7CEC5", "Swirl", "Grey"],
      ["DBD0CA", "Swiss Coffee", "Grey"],
      ["F6AE78", "Tacao", "Orange"],
      ["D2B960", "Tacha", "Yellow"],
      ["DC722A", "Tahiti Gold", "Orange"],
      ["D8CC9B", "Tahuna Sands", "Yellow"],
      ["853534", "Tall Poppy", "Red"],
      ["A39977", "Tallow", "Yellow"],
      ["752B2F", "Tamarillo", "Red"],
      ["D2B48C", "Tan", "Brown"],
      ["B8B5A1", "Tana", "Green"],
      ["1E2F3C", "Tangaroa", "Blue"],
      ["F28500", "Tangerine", "Orange"],
      ["FFCC00", "Tangerine Yellow", "Yellow"],
      ["D46F31", "Tango", "Orange"],
      ["7C7C72", "Tapa", "Green"],
      ["B37084", "Tapestry", "Red"],
      ["DEF1DD", "Tara", "Green"],
      ["253C48", "Tarawera", "Blue"],
      ["BAC0B3", "Tasman", "Grey"],
      ["483C32", "Taupe", "Grey"],
      ["8B8589", "Taupe Grey", "Grey"],
      ["643A48", "Tawny Port", "Red"],
      ["496569", "Tax Break", "Blue"],
      ["2B4B40", "Te Papa Green", "Green"],
      ["BFB5A2", "Tea", "Yellow"],
      ["D0F0C0", "Tea Green", "Green"],
      ["F883C2", "Tea Rose", "Orange"],
      ["AB8953", "Teak", "Yellow"],
      ["008080", "Teal", "Blue"],
      ["254855", "Teal Blue", "Blue"],
      ["3C2126", "Temptress", "Brown"],
      ["CD5700", "Tenne (Tawny)", "Orange"],
      ["F4D0A4", "Tequila", "Yellow"],
      ["E2725B", "Terra Cotta", "Red"],
      ["ECE67E", "Texas", "Green"],
      ["FCB057", "Texas Rose", "Orange"],
      ["B1948F", "Thatch", "Brown"],
      ["544E31", "Thatch Green", "Yellow"],
      ["D8BFD8", "Thistle", "Violet"],
      ["4D4D4B", "Thunder", "Grey"],
      ["923830", "Thunderbird", "Red"],
      ["97422D", "Tia Maria", "Orange"],
      ["B9C3BE", "Tiara", "Grey"],
      ["184343", "Tiber", "Green"],
      ["FC80A5", "Tickle Me Pink", "Red"],
      ["F0F590", "Tidal", "Green"],
      ["BEB4AB", "Tide", "Brown"],
      ["324336", "Timber Green", "Green"],
      ["D9D6CF", "Timberwolf", "Grey"],
      ["DDD6E1", "Titan White", "Violet"],
      ["9F715F", "Toast", "Brown"],
      ["6D5843", "Tobacco Brown", "Brown"],
      ["44362D", "Tobago", "Brown"],
      ["3E2631", "Toledo", "Violet"],
      ["2D2541", "Tolopea", "Violet"],
      ["4F6348", "Tom Thumb", "Green"],
      ["FF6347", "Tomato", "Red"],
      ["E79E88", "Tonys Pink", "Orange"],
      ["817C87", "Topaz", "Violet"],
      ["FD0E35", "Torch Red", "Red"],
      ["353D75", "Torea Bay", "Blue"],
      ["374E88", "Tory Blue", "Blue"],
      ["744042", "Tosca", "Red"],
      ["9CACA5", "Tower Grey", "Green"],
      ["6DAFA7", "Tradewind", "Green"],
      ["DDEDE9", "Tranquil", "Blue"],
      ["E2DDC7", "Travertine", "Green"],
      ["E2813B", "Tree Poppy", "Orange"],
      ["7E8424", "Trendy Green", "Green"],
      ["805D80", "Trendy Pink", "Violet"],
      ["C54F33", "Trinidad", "Orange"],
      ["AEC9EB", "Tropical Blue", "Blue"],
      ["00755E", "Tropical Rain Forest", "Green"],
      ["4C5356", "Trout", "Grey"],
      ["8E72C7", "True V", "Violet"],
      ["454642", "Tuatara", "Grey"],
      ["F9D3BE", "Tuft Bush", "Orange"],
      ["E3AC3D", "Tulip Tree", "Yellow"],
      ["DEA681", "Tumbleweed", "Brown"],
      ["46494E", "Tuna", "Grey"],
      ["585452", "Tundora", "Grey"],
      ["F5CC23", "Turbo", "Yellow"],
      ["A56E75", "Turkish Rose", "Red"],
      ["AE9041", "Turmeric", "Yellow"],
      ["40E0D0", "Turquoise", "Blue"],
      ["6CDAE7", "Turquoise Blue", "Blue"],
      ["363E1D", "Turtle Green", "Green"],
      ["AD6242", "Tuscany", "Orange"],
      ["E3E5B1", "Tusk", "Green"],
      ["BF914B", "Tussock", "Yellow"],
      ["F8E4E3", "Tutu", "Red"],
      ["DAC0CD", "Twilight", "Violet"],
      ["F4F6EC", "Twilight Blue", "Grey"],
      ["C19156", "Twine", "Yellow"],
      ["66023C", "Tyrian Purple", "Violet"],
      ["FF6FFF", "Ultra Pink", "Red"],
      ["120A8F", "Ultramarine", "Blue"],
      ["D4574E", "Valencia", "Red"],
      ["382C38", "Valentino", "Violet"],
      ["2A2B41", "Valhalla", "Violet"],
      ["523936", "Van Cleef", "Brown"],
      ["CCB69B", "Vanilla", "Brown"],
      ["EBD2D1", "Vanilla Ice", "Red"],
      ["FDEFD3", "Varden", "Yellow"],
      ["C80815", "Venetian Red", "Red"],
      ["2C5778", "Venice Blue", "Blue"],
      ["8B7D82", "Venus", "Violet"],
      ["62603E", "Verdigris", "Grey"],
      ["48531A", "Verdun Green", "Green"],
      ["FF4D00", "Vermilion", "Red"],
      ["5C4033", "Very Dark Brown", "Brown"],
      ["CDCDCD", "Very Light Grey", "Grey"],
      ["A85533", "Vesuvius", "Orange"],
      ["564985", "Victoria", "Violet"],
      ["5F9228", "Vida Loca", "Green"],
      ["4DB1C8", "Viking", "Blue"],
      ["955264", "Vin Rouge", "Red"],
      ["C58F9D", "Viola", "Red"],
      ["2E2249", "Violent Violet", "Violet"],
      ["EE82EE", "Violet", "Violet"],
      ["9F5F9F", "Violet Blue", "Violet"],
      ["F7468A", "Violet Red", "Red"],
      ["40826D", "Viridian", "Blue"],
      ["4B5F56", "Viridian Green", "Green"],
      ["F9E496", "Vis Vis", "Yellow"],
      ["97D5B3", "Vista Blue", "Green"],
      ["E3DFD9", "Vista White", "Grey"],
      ["FF9980", "Vivid Tangerine", "Orange"],
      ["803790", "Vivid Violet", "Violet"],
      ["4E2728", "Volcano", "Red"],
      ["443240", "Voodoo", "Violet"],
      ["36383C", "Vulcan", "Grey"],
      ["D4BBB1", "Wafer", "Orange"],
      ["5B6E91", "Waikawa Grey", "Blue"],
      ["4C4E31", "Waiouru", "Green"],
      ["E4E2DC", "Wan White", "Grey"],
      ["849137", "Wasabi", "Green"],
      ["B6ECDE", "Water Leaf", "Green"],
      ["006E4E", "Watercourse", "Green"],
      ["D6CA3D", "Wattle", "Green"],
      ["F2CDBB", "Watusi", "Orange"],
      ["EEB39E", "Wax Flower", "Orange"],
      ["FDD7D8", "We Peep", "Red"],
      ["4C6B88", "Wedgewood", "Blue"],
      ["8E3537", "Well Read", "Red"],
      ["5C512F", "West Coast", "Yellow"],
      ["E5823A", "West Side", "Orange"],
      ["D4CFC5", "Westar", "Grey"],
      ["F1919A", "Wewak", "Red"],
      ["F5DEB3", "Wheat", "Brown"],
      ["DFD7BD", "Wheatfield", "Yellow"],
      ["D29062", "Whiskey", "Orange"],
      ["D4915D", "Whiskey Sour", "Orange"],
      ["EFE6E6", "Whisper", "Grey"],
      ["FFFFFF", "White", "White"],
      ["D7EEE4", "White Ice", "Green"],
      ["E7E5E8", "White Lilac", "Blue"],
      ["EEE7DC", "White Linen", "Grey"],
      ["F8F6D8", "White Nectar", "Green"],
      ["DAD6CC", "White Pointer", "Grey"],
      ["D4CFB4", "White Rock", "Green"],
      ["F5F5F5", "White Smoke", "White"],
      ["7A89B8", "Wild Blue Yonder", "Blue"],
      ["E3D474", "Wild Rice", "Green"],
      ["E7E4DE", "Wild Sand", "Grey"],
      ["FF3399", "Wild Strawberry", "Red"],
      ["FD5B78", "Wild Watermelon", "Red"],
      ["BECA60", "Wild Willow", "Green"],
      ["53736F", "William", "Green"],
      ["DFE6CF", "Willow Brook", "Green"],
      ["69755C", "Willow Grove", "Green"],
      ["462C77", "Windsor", "Violet"],
      ["522C35", "Wine Berry", "Red"],
      ["D0C383", "Winter Hazel", "Yellow"],
      ["F9E8E2", "Wisp Pink", "Red"],
      ["C9A0DC", "Wisteria", "Violet"],
      ["A29ECD", "Wistful", "Blue"],
      ["FBF073", "Witch Haze", "Green"],
      ["302621", "Wood Bark", "Brown"],
      ["463629", "Woodburn", "Brown"],
      ["626746", "Woodland", "Green"],
      ["45402B", "Woodrush", "Yellow"],
      ["2B3230", "Woodsmoke", "Grey"],
      ["554545", "Woody Brown", "Brown"],
      ["75876E", "Xanadu", "Green"],
      ["FFFF00", "Yellow", "Yellow"],
      ["9ACD32", "Yellow Green", "Green"],
      ["73633E", "Yellow Metal", "Yellow"],
      ["FFAE42", "Yellow Orange", "Orange"],
      ["F49F35", "Yellow Sea", "Yellow"],
      ["FFC5BB", "Your Pink", "Red"],
      ["826A21", "Yukon Gold", "Yellow"],
      ["C7B882", "Yuma", "Yellow"],
      ["6B5A5A", "Zambezi", "Brown"],
      ["B2C6B1", "Zanah", "Green"],
      ["C6723B", "Zest", "Orange"],
      ["3B3C38", "Zeus", "Grey"],
      ["81A6AA", "Ziggurat", "Blue"],
      ["EBC2AF", "Zinnwaldite", "Brown"],
      ["DEE3E3", "Zircon", "Grey"],
      ["DDC283", "Zombie", "Yellow"],
      ["A29589", "Zorba", "Brown"],
      ["17462E", "Zuccini", "Green"],
      ["CDD5D5", "Zumthor", "Grey"],
  ];
  class SpacesCanvasState {
      constructor() {
          this.animationEnd = 0;
      }
  }
  function distanceLinePoint(anchor, dir, x) {
      // See http://mathworld.wolfram.com/Point-LineDistance3-Dimensional.html
      const dir1 = dir.unit();
      const t = x.minus(anchor).dot(dir1);
      return dir1
          .times(t)
          .plus(anchor)
          .distanceTo(x);
      //return x.minus(this.anchor).cross(x.minus(this.anchor.plus(this.dir1))).length()
  }
  class Camera {
      constructor() {
          this.eye = V(1, -2.5, 1);
          this.center = V(0, 0, 0.5);
          this.up = V3.Z;
      }
  }
  class SpacesCanvas extends React.Component {
      constructor() {
          super(...arguments);
          this.interpolationAnimation = 0;
          this.getColorsForWhat = lodash_memoize(function (what) {
              return whats[what]();
          });
          this.colorPoss = [];
          this.colorPossPrev = this.colorPoss;
          this.highlightIndex = -1;
          this.state = new SpacesCanvasState();
          this.createMeshForWhat = lodash_memoize(function (what, colorSpace) {
              return this.createMeshFromColors(this.getColorsForWhat(what), colorSpace);
          }, (what, colorSpace) => what + " " + colorSpace);
          this.rotationTime = 0;
          this.windowOnResize = () => {
              this.gl.fixCanvasRes();
              this.forceUpdate();
          };
          this.onMouseMove = (e) => {
              const { anchor, dir } = this.gl.getMouseLine(e.nativeEvent);
              const t = this.colorPoss
                  .map((p, i) => [p, i])
                  .filter(([p, _i]) => distanceLinePoint(anchor, dir, p) < 0.01)
                  .withMax(([p, _i]) => -p.minus(anchor).dot(dir.unit()));
              const newHoverIndex = t ? t[1] : -1;
              const newHoverColor = this.getColorsForWhat(this.props.what)[newHoverIndex];
              if (newHoverColor != this.hoverColor) {
                  this.hoverColor = newHoverColor;
                  this.props.onHoverChange(newHoverColor);
              }
              if (this.props.onMouseMove) {
                  this.props.onMouseMove(e);
              }
          };
          this.renderCanvas = (_t) => {
              const { gl } = this;
              const { eye, center, up } = this.props.camera;
              // if (this.props.rotation) {
              // 	this.rotationTime += dt
              // }
              gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
              gl.cullFace(gl.BACK);
              gl.matrixMode(gl.PROJECTION);
              gl.loadIdentity();
              // gl.perspective(15, gl.canvas.width / gl.canvas.height, 0.1, 1000)
              const ratio = gl.canvas.width / gl.canvas.height;
              const lr = Math.max(ratio, 1) * 0.7;
              const bt = lr / ratio;
              gl.ortho(-lr, lr, -bt, bt, -1e4, 1e4);
              gl.lookAt(eye, center, up);
              gl.matrixMode(gl.MODELVIEW);
              gl.loadIdentity();
              // // cube
              // gl.pushMatrix()
              // gl.translate(-0.5, -0.5, 0)
              // gl.shaders.singleColor.uniforms({ color: chroma("black").gl() }).draw(gl.meshes.cube, gl.LINES)
              // gl.popMatrix()
              // gl.rotate((this.rotationTime / 1000) * 10, 0, 0, 1)
              gl.pushMatrix();
              gl.disable(gl.CULL_FACE);
              colorSpaces[this.props.colorSpace].render(gl);
              gl.enable(gl.CULL_FACE);
              gl.popMatrix();
              let f = 0;
              if (_t < this.state.animationEnd) {
                  f = (this.state.animationEnd - _t) / ANIMATION_DURATION;
                  requestAnimationFrame(this.renderCanvas);
              }
              gl.shaders.varyingColor.uniforms({ f }).draw(this.colorPointsMesh);
              if (-1 !== this.highlightIndex) {
                  gl.cullFace(gl.FRONT);
                  const pos = 0 == f
                      ? this.colorPoss[this.highlightIndex]
                      : this.colorPoss[this.highlightIndex].lerp(this.colorPossPrev[this.highlightIndex], f);
                  gl.translate(pos);
                  gl.scale(0.01 * 1.8);
                  gl.shaders.singleColor
                      .uniforms({
                      color: this.props.colorHighlight.textColor().gl(),
                  })
                      .draw(this.colorPointMesh);
              }
          };
      }
      render() {
          const _a = this.props, htmlAttributes = __rest(_a, ["colorSpace", "onHoverChange", "what", "colorHighlight", "rotation"]);
          return React__default.createElement("canvas", Object.assign({}, htmlAttributes, { ref: r => (this.canvas = r), onMouseMove: this.onMouseMove }));
      }
      async componentDidMount() {
          const gl = (this.gl = TSGLContext.create({ canvas: this.canvas }));
          gl.fixCanvasRes();
          gl.meshes = {
              cube: Mesh$$1.cube().compile(),
          };
          gl.shaders = {};
          // this.colorPointMesh = Mesh.cube()
          // 	.scale(2)
          // 	.translate(-1, -1, -1)
          // 	.compile()
          this.colorPointMesh = Mesh$$1.sphere(1);
          gl.shaders.singleColor = Shader$$1.create(posVS, colorFS);
          gl.shaders.varyingColor = Shader$$1.create(posNormalColorVS, varyingColorFS);
          gl.clearColor(0.8, 0.8, 0.8, 1);
          gl.enable(gl.DEPTH_TEST);
          gl.enable(gl.CULL_FACE);
          gl.getExtension("OES_element_index_uint");
          gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
          gl.enable(gl.BLEND);
          await gl.setupTextRendering("OpenSans-Regular.png", "OpenSans-Regular.json");
          this.componentDidUpdate({});
          // gl.animate((t, dt) => this.renderCanvas(t, dt))
          window.addEventListener("resize", this.windowOnResize);
      }
      componentDidUpdate(prevProps) {
          // console.time()
          if (prevProps.colorSpace != this.props.colorSpace || prevProps.what != this.props.what) {
              const newMesh = this.createMeshForWhat(this.props.what, this.props.colorSpace);
              if (this.colorPointsMesh && prevProps.what == this.props.what) {
                  newMesh.vertexBuffers.ts_Vertex2 = this.colorPointsMesh.vertexBuffers.ts_Vertex;
                  this.setState({ animationEnd: performance.now() + ANIMATION_DURATION });
              }
              else {
                  newMesh.vertexBuffers.ts_Vertex2 = newMesh.vertexBuffers.ts_Vertex;
              }
              this.colorPointsMesh = newMesh;
              this.colorPossPrev = this.colorPoss;
              this.colorPoss = this.getColorsForWhat(this.props.what).map(colorSpaces[this.props.colorSpace].convert);
          }
          if (prevProps.what != this.props.what || prevProps.colorHighlight != this.props.colorHighlight) {
              this.highlightIndex =
                  undefined == this.props.colorHighlight
                      ? -1
                      : this.getColorsForWhat(this.props.what).findIndex(color => color.equals(this.props.colorHighlight));
          }
          // console.timeEnd()
          requestAnimationFrame(this.renderCanvas);
      }
      componentWillUnmount() {
          window.removeEventListener("resize", this.windowOnResize);
      }
      createMeshFromColors(colors, colorSpace) {
          const { colorPointMesh } = this;
          const tempMatrix1 = new M4(), tempMatrix2 = new M4(), tempMatrix3 = new M4();
          const pointMeshes = colors.map(color => {
              const pos = colorSpaces[colorSpace].convert(color);
              const pointSize = 0.01;
              const glColor = (color.displayColor || color).gl();
              const result = colorPointMesh
                  .transform(M4.multiply(M4.translate(pos, tempMatrix2), M4.scale(pointSize, tempMatrix1), tempMatrix3))
                  .addVertexBuffer("colors", "ts_Color");
              result.colors = fillArray(colorPointMesh.vertices.length, glColor);
              return result;
          });
          return new Mesh$$1()
              .addIndexBuffer("TRIANGLES", this.gl.UNSIGNED_INT)
              .addVertexBuffer("normals", "ts_Normal")
              .addVertexBuffer("colors", "ts_Color")
              .concat(...pointMeshes)
              .compile();
      }
  }
  const whats = {
      hues() {
          return Array.from({ length: 180 }, (_, i) => chroma.hsl(i * 2, 1, 0.5));
      },
      rgbCube16() {
          return rgbCube(16);
      },
      w3cx11() {
          return Object.keys(chroma.w3cx11).map(x => chroma(x));
      },
      _50shadesOfGrey() {
          return Array.from({ length: 52 }, (_, i) => chroma.hsl(0, 0, i / 51));
      },
      ks() {
          const result = [];
          for (let i = 1000; i <= 40000; i += 100) {
              result.push(chroma.kelvin(i));
          }
          return result;
      },
      cubehelix() {
          return chroma.scale(chroma.cubehelix()).colors(100, false);
      },
      scalePaired() {
          return chroma.scale("Paired").colors(100, false);
      },
      hslCylinder() {
          const X = 5;
          const Y = 10;
          const R = 90;
          const result = [];
          for (let r = 0; r < R; r++) {
              for (let x = 0; x < X; x++) {
                  for (let y = 0; y < Y; y++) {
                      result.push(chroma.hsl((r / R) * 360, x / (X - 1), lerp(0.01, 0.99, y / (Y - 1))));
                  }
                  // result.push(chroma.hsl((r / R) * 360, x / X, 0))
                  // result.push(chroma.hsl((r / R) * 360, x / X, 1))
              }
          }
          return result;
      },
      colors2() {
          console.log(undefined);
          return [];
          return names.map(([hex, _name, _shade]) => {
              const c = chroma(hex);
              // c.displayColor = chroma(shade.toLowerCase())
              // c.displayColor = chroma(c.shade())
              return c;
          });
      },
      l05() {
          const outerRingCount = 1200;
          const X = Math.round(outerRingCount / (2 * Math.PI));
          const result = [];
          for (let x = 0; x < X; x++) {
              const s = x / (X - 1);
              const count = Math.round(s * outerRingCount);
              for (let r = 0; r < count; r++) {
                  result.push(chroma.hsl((r / count) * 360, s, 0.5));
              }
          }
          // const X = 50
          // const R = 90
          // const result = []
          // for (let r = 0; r < R; r++) {
          // 	for (let x = 0; x < X; x++) {
          // 		const a = (x + r / 2) / 100
          // 		const b = (r * Math.sqrt(3)) / 2
          // 		const p = V(a, b)
          // 		result.push(chroma.hsl((r / R) * 360, x / (X - 1), 0.5))
          // 	}
          // }
          return result;
      },
  };
  function rgbCube(r = 16) {
      return Mesh$$1.box(r, r, r).vertices.map(({ x, y, z }) => chroma.gl(x, y, z, 1));
  }
  function fillArray(length, value) {
      const result = new Array(length);
      let i = length;
      while (i--) {
          result[i] = value;
      }
      return result;
  }
  //# sourceMappingURL=SpacesCanvas.js.map

  var classnames = createCommonjsModule(function (module) {
  /*!
    Copyright (c) 2017 Jed Watson.
    Licensed under the MIT License (MIT), see
    http://jedwatson.github.io/classnames
  */
  /* global define */

  (function () {

  	var hasOwn = {}.hasOwnProperty;

  	function classNames () {
  		var classes = [];

  		for (var i = 0; i < arguments.length; i++) {
  			var arg = arguments[i];
  			if (!arg) continue;

  			var argType = typeof arg;

  			if (argType === 'string' || argType === 'number') {
  				classes.push(arg);
  			} else if (Array.isArray(arg) && arg.length) {
  				var inner = classNames.apply(null, arg);
  				if (inner) {
  					classes.push(inner);
  				}
  			} else if (argType === 'object') {
  				for (var key in arg) {
  					if (hasOwn.call(arg, key) && arg[key]) {
  						classes.push(key);
  					}
  				}
  			}
  		}

  		return classes.join(' ');
  	}

  	if (module.exports) {
  		classNames.default = classNames;
  		module.exports = classNames;
  	} else {
  		window.classNames = classNames;
  	}
  }());
  });

  class Picker extends React.Component {
      constructor(props) {
          super(props);
      }
      render() {
          const _a = this.props, { value, title, items, id, onchange } = _a, htmlAttributes = __rest(_a, ["value", "title", "items", "id", "onchange"]);
          return (React__default.createElement("div", Object.assign({}, htmlAttributes, { id: id }),
              React__default.createElement("div", { className: "title" }, title),
              items.map(({ value: ovalue, title, children }) => (React__default.createElement("label", { className: classnames("picker-option", ovalue === value && "selected"), key: ovalue },
                  React__default.createElement("div", { className: "title" },
                      title,
                      React__default.createElement("input", { type: "radio", value: ovalue, name: id, checked: ovalue == value, onChange: e => e.target.checked && onchange(e.target.value) })),
                  children)))));
      }
  }
  // export function PickerOption({
  // 	onClick,
  // 	title,
  // 	children,
  // 	selected,
  // 	name,
  // 	value,
  // }: {
  // 	name: string
  // 	value: string
  // 	onClick: () => void
  // 	title: string
  // 	children?: ReactNode
  // 	selected: boolean
  // }) {
  // 	return (
  // 		<label className={classNames("picker-option", selected && "selected")} onClick={onClick} key={value}>
  // 			<div className="title">{title}</div>
  // 			{children}
  // 			<input type="radio" value={value} name={name} id={name + value} />
  // 		</label>
  // 	)
  // }
  //# sourceMappingURL=Picker.js.map

  var colorsExtended = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.colorsExtended = {
      Acadia: 0x35312c,
      Acapulco: 0x75aa94,
      "Aero Blue": 0xc0e8d5,
      Affair: 0x745085,
      "Afghan Tan": 0x905e26,
      "Air Force Blue": 0x5d8aa8,
      Akaroa: 0xbeb29a,
      Alabaster: 0xf2f0e6,
      "Albescent White": 0xe1dacb,
      "Alert Tan": 0x954e2c,
      "Alice Blue": 0xf0f8ff,
      Alizarin: 0xe32636,
      Allports: 0x1f6a7d,
      Almond: 0xeed9c4,
      "Almond Frost": 0x9a8678,
      Alpine: 0xad8a3b,
      Alto: 0xcdc6c5,
      Aluminium: 0x848789,
      Amaranth: 0xe52b50,
      Amazon: 0x387b54,
      Amber: 0xffbf00,
      Americano: 0x8a7d72,
      Amethyst: 0x9966cc,
      "Amethyst Smoke": 0x95879c,
      Amour: 0xf5e6ea,
      Amulet: 0x7d9d72,
      Anakiwa: 0x8cceea,
      "Antique Brass": 0x6c461f,
      "Antique White": 0xfaebd7,
      Anzac: 0xc68e3f,
      Apache: 0xd3a95c,
      Apple: 0x66b348,
      "Apple Blossom": 0xa95249,
      "Apple Green": 0xdeeadc,
      Apricot: 0xfbceb1,
      "Apricot White": 0xf7f0db,
      "Aqua Haze": 0xd9ddd5,
      "Aqua Spring": 0xe8f3e8,
      "Aqua Squeeze": 0xdbe4dc,
      Arapawa: 0x274a5d,
      Armadillo: 0x484a46,
      "Army green": 0x4b5320,
      Arrowtown: 0x827a67,
      Arsenic: 0x3b444b,
      Ash: 0xbebaa7,
      Asparagus: 0x7ba05b,
      Astra: 0xedd5a6,
      Astral: 0x376f89,
      Astronaut: 0x445172,
      "Astronaut Blue": 0x214559,
      "Athens Grey": 0xdcdddd,
      "Aths Special": 0xd5cbb2,
      Atlantis: 0x9cd03b,
      Atoll: 0x2b797a,
      Atomic: 0x3d4b52,
      "Atomic Tangerine": 0xff9966,
      "Au Chico": 0x9e6759,
      Aubergine: 0x372528,
      Auburn: 0x712f2c,
      "Australian Mint": 0xeff8aa,
      Avocado: 0x95986b,
      Axolotl: 0x63775a,
      Azalea: 0xf9c0c4,
      Aztec: 0x293432,
      "Baby Blue": 0x6fffff,
      "Bahama Blue": 0x25597f,
      Bahia: 0xa9c01c,
      "Baker's Chocolate": 0x5c3317,
      "Bali Hai": 0x849ca9,
      "Baltic Sea": 0x3c3d3e,
      "Banana Mania": 0xfbe7b2,
      Bandicoot: 0x878466,
      Barberry: 0xd2c61f,
      "Barley Corn": 0xb6935c,
      "Barley White": 0xf7e5b7,
      Barossa: 0x452e39,
      Bastille: 0x2c2c32,
      "Battleship Grey": 0x51574f,
      "Bay Leaf": 0x7bb18d,
      "Bay Of Many": 0x353e64,
      Bazaar: 0x8f7777,
      "Beauty Bush": 0xebb9b3,
      Beaver: 0x926f5b,
      Beeswax: 0xe9d7ab,
      Bermuda: 0x86d2c1,
      "Bermuda Grey": 0x6f8c9f,
      "Beryl Green": 0xbcbfa8,
      Bianca: 0xf4efe0,
      "Big Stone": 0x334046,
      Bilbao: 0x3e8027,
      "Biloba Flower": 0xae99d2,
      Birch: 0x3f3726,
      "Bird Flower": 0xd0c117,
      Biscay: 0x2f3c53,
      Bismark: 0x486c7a,
      "Bison Hide": 0xb5ac94,
      Bistre: 0x3d2b1f,
      Bitter: 0x88896c,
      "Bitter Lemon": 0xd2db32,
      Bittersweet: 0xfe6f5e,
      Bizarre: 0xe7d2c8,
      "Black Bean": 0x232e26,
      "Black Forest": 0x2c3227,
      "Black Haze": 0xe0ded7,
      "Black Magic": 0x332c22,
      "Black Marlin": 0x383740,
      "Black Pearl": 0x1e272c,
      "Black Rock": 0x2c2d3c,
      "Black Rose": 0x532934,
      "Black Russian": 0x24252b,
      "Black Squeeze": 0xe5e6df,
      "Black White": 0xe5e4db,
      Blackberry: 0x43182f,
      Blackcurrant: 0x2e183b,
      Blanc: 0xd9d0c1,
      "Blanched Almond": 0xffebcd,
      "Bleach White": 0xebe1ce,
      "Blizzard Blue": 0xa3e3ed,
      Blossom: 0xdfb1b6,
      "Blue Bayoux": 0x62777e,
      "Blue Bell": 0x9999cc,
      "Blue Chalk": 0xe3d6e9,
      "Blue Charcoal": 0x262b2f,
      "Blue Chill": 0x408f90,
      "Blue Diamond": 0x4b2d72,
      "Blue Dianne": 0x35514f,
      "Blue Gem": 0x4b3c8e,
      "Blue Haze": 0xbdbace,
      "Blue Lagoon": 0x00626f,
      "Blue Marguerite": 0x6a5bb1,
      "Blue Romance": 0xd8f0d2,
      "Blue Smoke": 0x78857a,
      "Blue Stone": 0x166461,
      "Blue Violet": 0x8a2be2,
      "Blue Whale": 0x1e3442,
      "Blue Zodiac": 0x3c4354,
      Blumine: 0x305c71,
      Blush: 0xb55067,
      "Bokara Grey": 0x2a2725,
      Bole: 0x79443b,
      Bombay: 0xaeaead,
      "Bon Jour": 0xdfd7d2,
      "Bondi Blue": 0x0095b6,
      Bone: 0xdbc2ab,
      Bordeaux: 0x4c1c24,
      Bossanova: 0x4c3d4e,
      "Boston Blue": 0x438eac,
      Botticelli: 0x92acb4,
      "Bottle Green": 0x254636,
      Boulder: 0x7c817c,
      Bouquet: 0xa78199,
      Bourbon: 0xaf6c3e,
      Bracken: 0x5b3d27,
      Brandy: 0xdcb68a,
      "Brandy Punch": 0xc07c40,
      "Brandy Rose": 0xb6857a,
      Brass: 0xb5a642,
      "Breaker Bay": 0x517b78,
      "Brick Red": 0xc62d42,
      "Bridal Heath": 0xf8ebdd,
      Bridesmaid: 0xfae6df,
      "Bright Green": 0x66ff00,
      "Bright Grey": 0x57595d,
      "Bright Red": 0x922a31,
      "Bright Sun": 0xecbd2c,
      "Bright Turquoise": 0x08e8de,
      "Brilliant Rose": 0xff55a3,
      "Brink Pink": 0xfb607f,
      "British Racing Green": 0x004225,
      Bronco: 0xa79781,
      Bronze: 0xcd7f32,
      "Bronze Olive": 0x584c25,
      Bronzetone: 0x434c28,
      Broom: 0xeecc24,
      "Brown Bramble": 0x53331e,
      "Brown Derby": 0x594537,
      "Brown Pod": 0x3c241b,
      Bubbles: 0xe6f2ea,
      Buccaneer: 0x6e5150,
      Bud: 0xa5a88f,
      "Buddha Gold": 0xbc9b1b,
      Buff: 0xf0dc82,
      "Bulgarian Rose": 0x482427,
      "Bull Shot": 0x75442b,
      Bunker: 0x292c2f,
      Bunting: 0x2b3449,
      Burgundy: 0x800020,
      "Burly Wood": 0xdeb887,
      Burnham: 0x234537,
      "Burning Sand": 0xd08363,
      "Burnt Crimson": 0x582124,
      "Burnt Orange": 0xff7034,
      "Burnt Sienna": 0xe97451,
      "Burnt Umber": 0x8a3324,
      Buttercup: 0xda9429,
      "Buttered Rum": 0x9d702e,
      "Butterfly Bush": 0x68578c,
      Buttermilk: 0xf6e0a4,
      "Buttery White": 0xf1ebda,
      "Cab Sav": 0x4a2e32,
      Cabaret: 0xcd526c,
      "Cabbage Pont": 0x4c5544,
      Cactus: 0x5b6f55,
      "Cadet Blue": 0x5f9ea0,
      Cadillac: 0x984961,
      "Cafe Royale": 0x6a4928,
      Calico: 0xd5b185,
      California: 0xe98c3a,
      Calypso: 0x3d7188,
      Camarone: 0x206937,
      Camelot: 0x803a4b,
      Cameo: 0xcca483,
      Camouflage: 0x4f4d32,
      "Camouflage Green": 0x78866b,
      "Can Can": 0xd08a9b,
      Canary: 0xffff99,
      "Cannon Pink": 0x8e5164,
      "Cape Cod": 0x4e5552,
      "Cape Honey": 0xfee0a5,
      "Cape Palliser": 0x75482f,
      Caper: 0xafc182,
      "Caput Mortuum": 0x592720,
      Caramel: 0xffd59a,
      Cararra: 0xebe5d5,
      "Cardin Green": 0x1b3427,
      Cardinal: 0xc41e3a,
      "Careys Pink": 0xc99aa0,
      "Caribbean Green": 0x00cc99,
      Carissma: 0xe68095,
      Carla: 0xf5f9cb,
      Carmine: 0x960018,
      "Carnaby Tan": 0x5b3a24,
      "Carnation Pink": 0xffa6c9,
      "Carousel Pink": 0xf8dbe0,
      "Carrot Orange": 0xed9121,
      Casablanca: 0xf0b253,
      Casal: 0x3f545a,
      Cascade: 0x8ca8a0,
      Cashmere: 0xd1b399,
      Casper: 0xaab5b8,
      Castro: 0x44232f,
      "Catalina Blue": 0x273c5a,
      "Catskill White": 0xe0e4dc,
      "Cavern Pink": 0xe0b8b1,
      "Ce Soir": 0x9271a7,
      Cedar: 0x463430,
      Celadon: 0xace1af,
      Celery: 0xb4c04c,
      Celeste: 0xd2d2c0,
      Cello: 0x3a4e5f,
      Celtic: 0x2b3f36,
      Cement: 0x857158,
      Cerise: 0xde3163,
      Cerulean: 0x007ba7,
      "Cerulean Blue": 0x2a52be,
      Chablis: 0xfde9e0,
      "Chalet Green": 0x5a6e41,
      Chalky: 0xdfc281,
      Chambray: 0x475877,
      Chamois: 0xe8cd9a,
      Champagne: 0xeed9b6,
      Chantilly: 0xedb8c7,
      Charade: 0x394043,
      Charcoal: 0x464646,
      Chardon: 0xf8eadf,
      Chardonnay: 0xffc878,
      Charlotte: 0xa4dce6,
      Charm: 0xd0748b,
      "Chartreuse Yellow": 0xdfff00,
      "Chateau Green": 0x419f59,
      Chatelle: 0xb3abb6,
      "Chathams Blue": 0x2c5971,
      "Chelsea Cucumber": 0x88a95b,
      "Chelsea Gem": 0x95532f,
      Chenin: 0xdec371,
      Cherokee: 0xf5cd82,
      "Cherry Pie": 0x372d52,
      Cherub: 0xf5d7dc,
      Chestnut: 0xb94e48,
      "Chetwode Blue": 0x666fb4,
      Chicago: 0x5b5d56,
      Chiffon: 0xf0f5bb,
      "Chilean Fire": 0xd05e34,
      "Chilean Heath": 0xf9f7de,
      "China Ivory": 0xfbf3d3,
      Chino: 0xb8ad8a,
      Chinook: 0x9dd3a8,
      Christalle: 0x382161,
      Christi: 0x71a91d,
      Christine: 0xbf652e,
      "Chrome White": 0xcac7b7,
      Cigar: 0x7d4e38,
      Cinder: 0x242a2e,
      Cinderella: 0xfbd7cc,
      Cinnabar: 0xe34234,
      Cioccolato: 0x5d3b2e,
      Citron: 0x8e9a21,
      Citrus: 0x9fb70a,
      "Clam Shell": 0xd2b3a9,
      Claret: 0x6e2233,
      "Classic Rose": 0xf4c8db,
      "Clay Creek": 0x897e59,
      "Clear Day": 0xdfefea,
      Clinker: 0x463623,
      Cloud: 0xc2bcb1,
      "Cloud Burst": 0x353e4f,
      Cloudy: 0xb0a99f,
      Clover: 0x47562f,
      Cobalt: 0x0047ab,
      "Cocoa Bean": 0x4f3835,
      "Cocoa Brown": 0x35281e,
      "Coconut Cream": 0xe1dabb,
      "Cod Grey": 0x2d3032,
      Coffee: 0x726751,
      "Coffee Bean": 0x362d26,
      Cognac: 0x9a463d,
      Cola: 0x3c2f23,
      "Cold Purple": 0x9d8abf,
      "Cold Turkey": 0xcab5b2,
      "Columbia Blue": 0x9bddff,
      Comet: 0x636373,
      Como: 0x4c785c,
      Conch: 0xa0b1ae,
      Concord: 0x827f79,
      Concrete: 0xd2d1cd,
      Confetti: 0xddcb46,
      "Congo Brown": 0x654d49,
      Conifer: 0xb1dd52,
      Contessa: 0xc16f68,
      Copper: 0xda8a67,
      "Copper Canyon": 0x77422c,
      "Copper Rose": 0x996666,
      "Copper Rust": 0x95524c,
      "Coral Candy": 0xf5d0c9,
      "Coral Red": 0xff4040,
      "Coral Tree": 0xab6e67,
      Corduroy: 0x404d49,
      Coriander: 0xbbb58d,
      Cork: 0x5a4c42,
      Corn: 0xfbec5d,
      "Corn Field": 0xf8f3c4,
      "Corn Flower Blue": 0x42426f,
      "Corn Harvest": 0x8d702a,
      "Corn Silk": 0xfff8dc,
      "Cornflower Blue": 0x6495ed,
      Corvette: 0xe9ba81,
      Cosmic: 0x794d60,
      "Cosmic Latte": 0xe1f8e7,
      Cosmos: 0xfcd5cf,
      "Costa Del Sol": 0x625d2a,
      "Cotton Candy": 0xffb7d5,
      "Cotton Seed": 0xbfbaaf,
      "County Green": 0x1b4b35,
      Cowboy: 0x443736,
      "Crab Apple": 0x87382f,
      Crail: 0xa65648,
      Cranberry: 0xdb5079,
      "Crater Brown": 0x4d3e3c,
      Cream: 0xfffdd0,
      "Cream Brulee": 0xffe39b,
      "Cream Can": 0xeec051,
      Creole: 0x393227,
      Crete: 0x77712b,
      Crocodile: 0x706950,
      "Crown Of Thorns": 0x763c33,
      Cruise: 0xb4e2d5,
      Crusoe: 0x165b31,
      Crusta: 0xf38653,
      Cumin: 0x784430,
      Cumulus: 0xf5f4c1,
      Cupid: 0xf5b2c5,
      "Curious Blue": 0x3d85b8,
      "Cutty Sark": 0x5c8173,
      Cyprus: 0x0f4645,
      "Dairy Cream": 0xedd2a4,
      "Daisy Bush": 0x5b3e90,
      Dallas: 0x664a2d,
      Dandelion: 0xfed85d,
      Danube: 0x5b89c0,
      "Dark Blue": 0x00008b,
      "Dark Brown": 0x654321,
      "Dark Cerulean": 0x08457e,
      "Dark Chestnut": 0x986960,
      "Dark Coral": 0xcd5b45,
      "Dark Cyan": 0x008b8b,
      "Dark Goldenrod": 0xb8860b,
      "Dark Gray": 0xa9a9a9,
      "Dark Green": 0x013220,
      "Dark Green Copper": 0x4a766e,
      "Dark Khaki": 0xbdb76b,
      "Dark Magenta": 0x8b008b,
      "Dark Olive Green": 0x556b2f,
      "Dark Orange": 0xff8c00,
      "Dark Orchid": 0x9932cc,
      "Dark Pastel Green": 0x03c03c,
      "Dark Pink": 0xe75480,
      "Dark Purple": 0x871f78,
      "Dark Red": 0x8b0000,
      "Dark Rum": 0x45362b,
      "Dark Salmon": 0xe9967a,
      "Dark Sea Green": 0x8fbc8f,
      "Dark Slate": 0x465352,
      "Dark Slate Blue": 0x483d8b,
      "Dark Slate Grey": 0x2f4f4f,
      "Dark Spring Green": 0x177245,
      "Dark Tan": 0x97694f,
      "Dark Tangerine": 0xffa812,
      "Dark Turquoise": 0x00ced1,
      "Dark Violet": 0x9400d3,
      "Dark Wood": 0x855e42,
      "Davy's Grey": 0x788878,
      Dawn: 0x9f9d91,
      "Dawn Pink": 0xe6d6cd,
      "De York": 0x85ca87,
      Deco: 0xcccf82,
      "Deep Blush": 0xe36f8a,
      "Deep Bronze": 0x51412d,
      "Deep Cerise": 0xda3287,
      "Deep Fir": 0x193925,
      "Deep Koamaru": 0x343467,
      "Deep Lilac": 0x9955bb,
      "Deep Magenta": 0xcc00cc,
      "Deep Pink": 0xff1493,
      "Deep Sea": 0x167e65,
      "Deep Sky Blue": 0x00bfff,
      "Deep Teal": 0x19443c,
      "Del Rio": 0xb5998e,
      Dell: 0x486531,
      Delta: 0x999b95,
      Deluge: 0x8272a4,
      Denim: 0x1560bd,
      Derby: 0xf9e4c6,
      Desert: 0xa15f3b,
      "Desert Sand": 0xedc9af,
      "Desert Storm": 0xede7e0,
      Dew: 0xe7f2e9,
      Diesel: 0x322c2b,
      "Dim Gray": 0x696969,
      Dingley: 0x607c47,
      Disco: 0x892d4f,
      Dixie: 0xcd8431,
      "Dodger Blue": 0x1e90ff,
      Dolly: 0xf5f171,
      Dolphin: 0x6a6873,
      Domino: 0x6c5b4c,
      "Don Juan": 0x5a4f51,
      "Donkey Brown": 0x816e5c,
      Dorado: 0x6e5f56,
      "Double Colonial White": 0xe4cf99,
      "Double Pearl Lusta": 0xe9dcbe,
      "Double Spanish White": 0xd2c3a3,
      "Dove Grey": 0x777672,
      Downy: 0x6fd2be,
      Drover: 0xfbeb9b,
      Dune: 0x514f4a,
      "Dust Storm": 0xe5cac0,
      "Dusty Grey": 0xac9b9b,
      "Dutch White": 0xf0dfbb,
      Eagle: 0xb0ac94,
      "Earls Green": 0xb8a722,
      "Early Dawn": 0xfbf2db,
      "East Bay": 0x47526e,
      "East Side": 0xaa8cbc,
      "Eastern Blue": 0x00879f,
      Ebb: 0xe6d8d4,
      Ebony: 0x313337,
      "Ebony Clay": 0x323438,
      "Echo Blue": 0xa4afcd,
      Eclipse: 0x3f3939,
      Ecru: 0xc2b280,
      "Ecru White": 0xd6d1c0,
      Ecstasy: 0xc96138,
      Eden: 0x266255,
      Edgewater: 0xc1d8c5,
      Edward: 0x97a49a,
      "Egg Sour": 0xf9e4c5,
      Eggplant: 0x990066,
      "Egyptian Blue": 0x1034a6,
      "El Paso": 0x39392c,
      "El Salva": 0x8f4e45,
      "Electric Blue": 0x7df9ff,
      "Electric Indigo": 0x6600ff,
      "Electric Lime": 0xccff00,
      "Electric Purple": 0xbf00ff,
      Elephant: 0x243640,
      "Elf Green": 0x1b8a6b,
      Elm: 0x297b76,
      Emerald: 0x50c878,
      Eminence: 0x6e3974,
      Emperor: 0x50494a,
      Empress: 0x7c7173,
      Endeavour: 0x29598b,
      "Energy Yellow": 0xf5d752,
      "English Holly": 0x274234,
      Envy: 0x8ba58f,
      Equator: 0xdab160,
      Espresso: 0x4e312d,
      Eternity: 0x2d2f28,
      Eucalyptus: 0x329760,
      Eunry: 0xcda59c,
      "Evening Sea": 0x26604f,
      Everglade: 0x264334,
      "Fair Pink": 0xf3e5dc,
      Falcon: 0x6e5a5b,
      Fallow: 0xc19a6b,
      "Falu Red": 0x801818,
      Fantasy: 0xf2e6dd,
      Fedora: 0x625665,
      Feijoa: 0xa5d785,
      Feldgrau: 0x4d5d53,
      Feldspar: 0xd19275,
      Fern: 0x63b76c,
      "Fern Green": 0x4f7942,
      Ferra: 0x876a68,
      Festival: 0xeacc4a,
      Feta: 0xdbe0d0,
      "Fiery Orange": 0xb1592f,
      "Fiji Green": 0x636f22,
      Finch: 0x75785a,
      Finlandia: 0x61755b,
      Finn: 0x694554,
      Fiord: 0x4b5a62,
      Fire: 0x8f3f2a,
      "Fire Brick": 0xb22222,
      "Fire Bush": 0xe09842,
      "Fire Engine Red": 0xce1620,
      Firefly: 0x314643,
      "Flame Pea": 0xbe5c48,
      "Flame Red": 0x86282e,
      Flamenco: 0xea8645,
      Flamingo: 0xe1634f,
      Flax: 0xeedc82,
      Flint: 0x716e61,
      Flirt: 0x7a2e4d,
      "Floral White": 0xfffaf0,
      Foam: 0xd0eae8,
      Fog: 0xd5c7e8,
      "Foggy Grey": 0xa7a69d,
      "Forest Green": 0x228b22,
      "Forget Me Not": 0xfdefdb,
      "Fountain Blue": 0x65adb2,
      Frangipani: 0xffd7a0,
      "Free Speech Aquamarine": 0x029d74,
      "Free Speech Blue": 0x4156c5,
      "Free Speech Green": 0x09f911,
      "Free Speech Magenta": 0xe35bd8,
      "Free Speech Red": 0xc00000,
      "French Grey": 0xbfbdc1,
      "French Lilac": 0xdeb7d9,
      "French Pass": 0xa4d2e0,
      "French Rose": 0xf64a8a,
      "Friar Grey": 0x86837a,
      "Fringy Flower": 0xb4e1bb,
      Froly: 0xe56d75,
      Frost: 0xe1e4c5,
      "Frosted Mint": 0xe2f2e4,
      Frostee: 0xdbe5d2,
      "Fruit Salad": 0x4ba351,
      "Fuchsia Pink": 0xff77ff,
      Fuego: 0xc2d62e,
      "Fuel Yellow": 0xd19033,
      "Fun Blue": 0x335083,
      "Fun Green": 0x15633d,
      "Fuscous Grey": 0x3c3b3c,
      "Fuzzy Wuzzy Brown": 0xc45655,
      "Gable Green": 0x2c4641,
      Gallery: 0xdcd7d1,
      Galliano: 0xd8a723,
      Gamboge: 0xe49b0f,
      Geebung: 0xc5832e,
      Genoa: 0x31796d,
      Geraldine: 0xe77b75,
      Geyser: 0xcbd0cf,
      Ghost: 0xc0bfc7,
      "Ghost White": 0xf8f8ff,
      Gigas: 0x564786,
      Gimblet: 0xb9ad61,
      Gin: 0xd9dfcd,
      "Gin Fizz": 0xf8eaca,
      Givry: 0xebd4ae,
      Glacier: 0x78b1bf,
      "Glade Green": 0x5f8151,
      "Go Ben": 0x786e4c,
      Goblin: 0x34533d,
      "Gold Drop": 0xd56c30,
      "Gold Tips": 0xe2b227,
      "Golden Bell": 0xca8136,
      "Golden Brown": 0x996515,
      "Golden Dream": 0xf1cc2b,
      "Golden Fizz": 0xebde31,
      "Golden Glow": 0xf9d77e,
      "Golden Poppy": 0xfcc200,
      "Golden Sand": 0xeace6a,
      "Golden Tainoi": 0xffc152,
      "Golden Yellow": 0xffdf00,
      Gondola: 0x373332,
      "Gordons Green": 0x29332b,
      Gorse: 0xfde336,
      Gossamer: 0x399f86,
      Gossip: 0x9fd385,
      Gothic: 0x698890,
      "Governor Bay": 0x51559b,
      "Grain Brown": 0xcab8a2,
      Grandis: 0xffcd73,
      "Granite Green": 0x8b8265,
      "Granny Apple": 0xc5e7cd,
      "Granny Smith": 0x7b948c,
      "Granny Smith Apple": 0x9de093,
      Grape: 0x413d4b,
      Graphite: 0x383428,
      Gravel: 0x4a4b46,
      "Green House": 0x3e6334,
      "Green Kelp": 0x393d2a,
      "Green Leaf": 0x526b2d,
      "Green Mist": 0xbfc298,
      "Green Pea": 0x266242,
      "Green Smoke": 0x9ca664,
      "Green Spring": 0xa9af99,
      "Green Vogue": 0x23414e,
      "Green Waterloo": 0x2c2d24,
      "Green White": 0xdeddcb,
      "Green Yellow": 0xadff2f,
      Grenadier: 0xc14d36,
      "Grey Chateau": 0x9fa3a7,
      "Grey Nickel": 0xbdbaae,
      "Grey Nurse": 0xd1d3cc,
      "Grey Olive": 0xa19a7f,
      "Grey Suit": 0x9391a0,
      "Grey-Asparagus": 0x465945,
      "Guardsman Red": 0x952e31,
      "Gulf Blue": 0x343f5c,
      "Gulf Stream": 0x74b2a8,
      "Gull Grey": 0xa4adb0,
      "Gum Leaf": 0xacc9b2,
      Gumbo: 0x718f8a,
      "Gun Powder": 0x484753,
      Gunmetal: 0x2c3539,
      Gunsmoke: 0x7a7c76,
      Gurkha: 0x989171,
      Hacienda: 0x9e8022,
      "Hairy Heath": 0x633528,
      Haiti: 0x2c2a35,
      "Half And Half": 0xede7c8,
      "Half Baked": 0x558f93,
      "Half Colonial White": 0xf2e5bf,
      "Half Dutch White": 0xfbf0d6,
      "Half Pearl Lusta": 0xf1ead7,
      "Half Spanish White": 0xe6dbc7,
      Hampton: 0xe8d4a2,
      "Han Purple": 0x5218fa,
      Harlequin: 0x3fff00,
      "Harley Davidson Orange": 0xc93413,
      Harp: 0xcbcec0,
      "Harvest Gold": 0xeab76a,
      Havana: 0x3b2b2c,
      "Havelock Blue": 0x5784c1,
      "Hawaiian Tan": 0x99522b,
      "Hawkes Blue": 0xd2daed,
      Heath: 0x4f2a2c,
      Heather: 0xaebbc1,
      "Heathered Grey": 0x948c7e,
      "Heavy Metal": 0x46473e,
      Heliotrope: 0xdf73ff,
      Hemlock: 0x69684b,
      Hemp: 0x987d73,
      Highball: 0x928c3c,
      Highland: 0x7a9461,
      Hillary: 0xa7a07e,
      Himalaya: 0x736330,
      "Hint Of Green": 0xdff1d6,
      "Hint Of Red": 0xf5efeb,
      "Hint Of Yellow": 0xf6f5d7,
      "Hippie Blue": 0x49889a,
      "Hippie Green": 0x608a5a,
      "Hippie Pink": 0xab495c,
      "Hit Grey": 0xa1a9a8,
      "Hit Pink": 0xfda470,
      "Hokey Pokey": 0xbb8e34,
      Hoki: 0x647d86,
      Holly: 0x25342b,
      "Hollywood Cerise": 0xf400a1,
      "Honey Flower": 0x5c3c6d,
      Honeysuckle: 0xe8ed69,
      Hopbush: 0xcd6d93,
      Horizon: 0x648894,
      "Horses Neck": 0x6d562c,
      "Hot Curry": 0x815b28,
      "Hot Magenta": 0xff00cc,
      "Hot Pink": 0xff69b4,
      "Hot Purple": 0x4e2e53,
      "Hot Toddy": 0xa7752c,
      "Humming Bird": 0xceefe4,
      "Hunter Green": 0x355e3b,
      Hurricane: 0x8b7e77,
      Husk: 0xb2994b,
      "Ice Cold": 0xafe3d6,
      Iceberg: 0xcae1d9,
      Illusion: 0xef95ae,
      "Inch Worm": 0xb0e313,
      "Indian Red": 0xcd5c5c,
      "Indian Tan": 0x4f301f,
      Indochine: 0x9c5b34,
      "International Klein Blue": 0x002fa7,
      "International Orange": 0xff4f00,
      "Iris Blue": 0x03b4c8,
      "Irish Coffee": 0x62422b,
      Iron: 0xcbcdcd,
      "Ironside Grey": 0x706e66,
      Ironstone: 0x865040,
      "Islamic Green": 0x009900,
      "Island Spice": 0xf8eddb,
      Jacarta: 0x3d325d,
      "Jacko Bean": 0x413628,
      "Jacksons Purple": 0x3d3f7d,
      Jade: 0x00a86b,
      Jaffa: 0xe27945,
      "Jagged Ice": 0xcae7e2,
      Jagger: 0x3f2e4c,
      Jaguar: 0x29292f,
      Jambalaya: 0x674834,
      "Japanese Laurel": 0x2f7532,
      Japonica: 0xce7259,
      Java: 0x259797,
      Jazz: 0x5f2c2f,
      "Jazzberry Jam": 0xa50b5e,
      "Jelly Bean": 0x44798e,
      "Jet Stream": 0xbbd0c9,
      Jewel: 0x136843,
      Jon: 0x463d3e,
      Jonquil: 0xeef293,
      "Jordy Blue": 0x7aaae0,
      "Judge Grey": 0x5d5346,
      Jumbo: 0x878785,
      "Jungle Green": 0x29ab87,
      "Jungle Mist": 0xb0c4c4,
      Juniper: 0x74918e,
      "Just Right": 0xdcbfac,
      Kabul: 0x6c5e53,
      "Kaitoke Green": 0x245336,
      Kangaroo: 0xc5c3b0,
      Karaka: 0x2d2d24,
      Karry: 0xfedcc1,
      "Kashmir Blue": 0x576d8e,
      "Kelly Green": 0x4cbb17,
      Kelp: 0x4d503c,
      "Kenyan Copper": 0x6c322e,
      Keppel: 0x5fb69c,
      Kidnapper: 0xbfc0ab,
      Kilamanjaro: 0x3a3532,
      Killarney: 0x49764f,
      Kimberly: 0x695d87,
      "Kingfisher Daisy": 0x583580,
      Kobi: 0xe093ab,
      Kokoda: 0x7b785a,
      Korma: 0x804e2c,
      Koromiko: 0xfeb552,
      Kournikova: 0xf9d054,
      "La Palma": 0x428929,
      "La Rioja": 0xbac00e,
      "Las Palmas": 0xc6da36,
      Laser: 0xc6a95e,
      "Laser Lemon": 0xffff66,
      Laurel: 0x6e8d71,
      "Lavender Blue": 0xccccff,
      "Lavender Blush": 0xfff0f5,
      "Lavender Grey": 0xbdbbd7,
      "Lavender Pink": 0xfbaed2,
      "Lavender Rose": 0xfba0e3,
      "Lawn Green": 0x7cfc00,
      Leather: 0x906a54,
      Lemon: 0xfde910,
      "Lemon Chiffon": 0xfffacd,
      "Lemon Ginger": 0x968428,
      "Lemon Grass": 0x999a86,
      Licorice: 0x2e3749,
      "Light Blue": 0xadd8e6,
      "Light Coral": 0xf08080,
      "Light Cyan": 0xe0ffff,
      "Light Goldenrod": 0xeedd82,
      "Light Goldenrod Yellow": 0xfafad2,
      "Light Green": 0x90ee90,
      "Light Grey": 0xd3d3d3,
      "Light Pink": 0xffb6c1,
      "Light Salmon": 0xffa07a,
      "Light Sea Green": 0x20b2aa,
      "Light Sky Blue": 0x87cefa,
      "Light Slate Blue": 0x8470ff,
      "Light Slate Grey": 0x778899,
      "Light Steel Blue": 0xb0c4de,
      "Light Wood": 0x856363,
      "Light Yellow": 0xffffe0,
      "Lightning Yellow": 0xf7a233,
      Lilac: 0xc8a2c8,
      "Lilac Bush": 0x9470c4,
      Lily: 0xc19fb3,
      "Lily White": 0xe9eeeb,
      Lima: 0x7aac21,
      "Lime Green": 0x32cd32,
      Limeade: 0x5f9727,
      Limerick: 0x89ac27,
      "Link Water": 0xc7cdd8,
      Lipstick: 0x962c54,
      Liver: 0x534b4f,
      "Livid Brown": 0x312a29,
      Loafer: 0xdbd9c2,
      Loblolly: 0xb3bbb7,
      Lochinvar: 0x489084,
      Lochmara: 0x316ea0,
      Locust: 0xa2a580,
      "Log Cabin": 0x393e2e,
      Logan: 0x9d9cb4,
      Lola: 0xb9acbb,
      "London Hue": 0xae94ab,
      Lonestar: 0x522426,
      Lotus: 0x8b504b,
      Loulou: 0x4c3347,
      Lucky: 0xab9a1c,
      "Lucky Point": 0x292d4f,
      "Lunar Green": 0x4e5541,
      Lusty: 0x782e2c,
      "Luxor Gold": 0xab8d3f,
      Lynch: 0x697d89,
      Mabel: 0xcbe8e8,
      "Macaroni And Cheese": 0xffb97b,
      Madang: 0xb7e3a8,
      Madison: 0x2d3c54,
      Madras: 0x473e23,
      "Magic Mint": 0xaaf0d1,
      Magnolia: 0xf8f4ff,
      Mahogany: 0xca3435,
      "Mai Tai": 0xa56531,
      Maire: 0x2a2922,
      Maize: 0xe3b982,
      Makara: 0x695f50,
      Mako: 0x505555,
      Malachite: 0x0bda51,
      "Malachite Green": 0x97976f,
      Malibu: 0x66b7e1,
      Mallard: 0x3a4531,
      Malta: 0xa59784,
      Mamba: 0x766d7c,
      Manatee: 0x8d90a1,
      Mandalay: 0xb57b2e,
      "Mandarian Orange": 0x8e2323,
      Mandy: 0xcd525b,
      "Mandys Pink": 0xf5b799,
      "Mango Tango": 0xe77200,
      Manhattan: 0xe2af80,
      Mantis: 0x7fc15c,
      Mantle: 0x96a793,
      Manz: 0xe4db55,
      "Mardi Gras": 0x352235,
      Marigold: 0xb88a3d,
      Mariner: 0x42639f,
      Marshland: 0x2b2e26,
      Martini: 0xb7a8a3,
      Martinique: 0x3c3748,
      Marzipan: 0xebc881,
      Masala: 0x57534b,
      Matisse: 0x365c7d,
      Matrix: 0x8e4d45,
      Matterhorn: 0x524b4b,
      Mauve: 0xe0b0ff,
      "Mauve Taupe": 0x915f6d,
      Mauvelous: 0xf091a9,
      Maverick: 0xc8b1c0,
      "Maya Blue": 0x73c2fb,
      McKenzie: 0x8c6338,
      "Medium Aquamarine": 0x66cdaa,
      "Medium Blue": 0x0000cd,
      "Medium Carmine": 0xaf4035,
      "Medium Goldenrod": 0xeaeaae,
      "Medium Orchid": 0xba55d3,
      "Medium Purple": 0x9370db,
      "Medium Sea Green": 0x3cb371,
      "Medium Slate Blue": 0x7b68ee,
      "Medium Spring Green": 0x00fa9a,
      "Medium Turquoise": 0x48d1cc,
      "Medium Violet Red": 0xc71585,
      "Medium Wood": 0xa68064,
      Melanie: 0xe0b7c2,
      Melanzane: 0x342931,
      Melon: 0xfebaad,
      Melrose: 0xc3b9dd,
      Mercury: 0xd5d2d1,
      Merino: 0xe1dbd0,
      Merlin: 0x4f4e48,
      Merlot: 0x73343a,
      "Metallic Bronze": 0x554a3c,
      "Metallic Copper": 0x6e3d34,
      "Metallic Gold": 0xd4af37,
      Meteor: 0xbb7431,
      Meteorite: 0x4a3b6a,
      "Mexican Red": 0x9b3d3d,
      "Mid Grey": 0x666a6d,
      Midnight: 0x21303e,
      "Midnight Blue": 0x191970,
      "Midnight Express": 0x21263a,
      "Midnight Moss": 0x242e28,
      Mikado: 0x3f3623,
      Milan: 0xf6f493,
      "Milano Red": 0x9e3332,
      "Milk Punch": 0xf3e5c0,
      "Milk White": 0xdcd9cd,
      Millbrook: 0x595648,
      Mimosa: 0xf5f5cc,
      Mindaro: 0xdaea6f,
      "Mine Shaft": 0x373e41,
      "Mineral Green": 0x506355,
      Ming: 0x407577,
      Minsk: 0x3e3267,
      "Mint Cream": 0xf5fffa,
      "Mint Green": 0x98ff98,
      "Mint Julep": 0xe0d8a7,
      "Mint Tulip": 0xc6eadd,
      Mirage: 0x373f43,
      Mischka: 0xa5a9b2,
      "Mist Grey": 0xbab9a9,
      "Misty Rose": 0xffe4e1,
      Mobster: 0x605a67,
      Moccaccino: 0x582f2b,
      Mocha: 0x6f372d,
      Mojo: 0x97463c,
      "Mona Lisa": 0xff9889,
      Monarch: 0x6b252c,
      Mondo: 0x554d42,
      Mongoose: 0xa58b6f,
      Monsoon: 0x7a7679,
      Montana: 0x393b3c,
      "Monte Carlo": 0x7ac5b4,
      "Moody Blue": 0x8378c7,
      "Moon Glow": 0xf5f3ce,
      "Moon Mist": 0xcecdb8,
      "Moon Raker": 0xc0b2d7,
      "Moon Yellow": 0xf0c420,
      "Morning Glory": 0x9ed1d3,
      "Morocco Brown": 0x442d21,
      Mortar: 0x565051,
      Mosque: 0x005f5b,
      "Moss Green": 0xaddfad,
      "Mountain Meadow": 0x1ab385,
      "Mountain Mist": 0xa09f9c,
      "Mountbatten Pink": 0x997a8d,
      "Muddy Waters": 0xa9844f,
      Muesli: 0x9e7e53,
      Mulberry: 0xc54b8c,
      "Mule Fawn": 0x884f40,
      "Mulled Wine": 0x524d5b,
      Mustard: 0xffdb58,
      "My Pink": 0xd68b80,
      "My Sin": 0xfdae45,
      Myrtle: 0x21421e,
      Mystic: 0xd8ddda,
      Nandor: 0x4e5d4e,
      Napa: 0xa39a87,
      Narvik: 0xe9e6dc,
      "Navajo White": 0xffdead,
      "Navy Blue": 0x0066cc,
      Nebula: 0xb8c6be,
      Negroni: 0xeec7a2,
      "Neon Blue": 0x4d4dff,
      "Neon Carrot": 0xff9933,
      "Neon Pink": 0xff6ec7,
      Nepal: 0x93aab9,
      Neptune: 0x77a8ab,
      Nero: 0x252525,
      "Neutral Green": 0xaaa583,
      Nevada: 0x666f6f,
      "New Amber": 0x6d3b24,
      "New Midnight Blue": 0x00009c,
      "New Orleans": 0xe4c385,
      "New Tan": 0xebc79e,
      "New York Pink": 0xdd8374,
      Niagara: 0x29a98b,
      "Night Rider": 0x332e2e,
      "Night Shadz": 0xa23d54,
      "Nile Blue": 0x253f4e,
      Nobel: 0xa99d9d,
      Nomad: 0xa19986,
      Nordic: 0x1d393c,
      Norway: 0xa4b88f,
      Nugget: 0xbc9229,
      Nutmeg: 0x7e4a3b,
      Oasis: 0xfcedc5,
      Observatory: 0x008f70,
      "Ocean Green": 0x4ca973,
      Ochre: 0xcc7722,
      "Off Green": 0xdff0e2,
      "Off Yellow": 0xfaf3dc,
      Oil: 0x313330,
      "Old Brick": 0x8a3335,
      "Old Copper": 0x73503b,
      "Old Gold": 0xcfb53b,
      "Old Lace": 0xfdf5e6,
      "Old Lavender": 0x796878,
      "Old Rose": 0xc02e4c,
      "Olive Drab": 0x6b8e23,
      "Olive Green": 0xb5b35c,
      "Olive Haze": 0x888064,
      Olivetone: 0x747028,
      Olivine: 0x9ab973,
      Onahau: 0xc2e6ec,
      Onion: 0x48412b,
      Opal: 0xa8c3bc,
      Opium: 0x987e7e,
      Oracle: 0x395555,
      "Orange Peel": 0xffa000,
      "Orange Red": 0xff4500,
      "Orange Roughy": 0xa85335,
      "Orange White": 0xeae3cd,
      "Orchid White": 0xf1ebd9,
      Orient: 0x255b77,
      "Oriental Pink": 0xc28e88,
      Orinoco: 0xd2d3b3,
      "Oslo Grey": 0x818988,
      Ottoman: 0xd3dbcb,
      "Outer Space": 0x2d383a,
      "Outrageous Orange": 0xff6037,
      "Oxford Blue": 0x28353a,
      Oxley: 0x6d9a78,
      "Oyster Bay": 0xd1eaea,
      "Oyster Pink": 0xd4b5b0,
      Paarl: 0x864b36,
      Pablo: 0x7a715c,
      "Pacific Blue": 0x009dc4,
      Paco: 0x4f4037,
      Padua: 0x7eb394,
      "Palatinate Purple": 0x682860,
      "Pale Brown": 0x987654,
      "Pale Chestnut": 0xddadaf,
      "Pale Cornflower Blue": 0xabcdef,
      "Pale Goldenrod": 0xeee8aa,
      "Pale Green": 0x98fb98,
      "Pale Leaf": 0xbdcaa8,
      "Pale Magenta": 0xf984e5,
      "Pale Oyster": 0x9c8d72,
      "Pale Pink": 0xfadadd,
      "Pale Prim": 0xf9f59f,
      "Pale Rose": 0xefd6da,
      "Pale Sky": 0x636d70,
      "Pale Slate": 0xc3bebb,
      "Pale Taupe": 0xbc987e,
      "Pale Turquoise": 0xafeeee,
      "Pale Violet Red": 0xdb7093,
      "Palm Green": 0x20392c,
      "Palm Leaf": 0x36482f,
      Pampas: 0xeae4dc,
      Panache: 0xebf7e4,
      Pancho: 0xdfb992,
      Panda: 0x544f3a,
      "Papaya Whip": 0xffefd5,
      Paprika: 0x7c2d37,
      Paradiso: 0x488084,
      Parchment: 0xd0c8b0,
      "Paris Daisy": 0xfbeb50,
      "Paris M": 0x312760,
      "Paris White": 0xbfcdc0,
      Parsley: 0x305d35,
      "Pastel Green": 0x77dd77,
      Patina: 0x639283,
      "Pattens Blue": 0xd3e5ef,
      Paua: 0x2a2551,
      Pavlova: 0xbaab87,
      "Payne's Grey": 0x404048,
      Peach: 0xffcba4,
      "Peach Puff": 0xffdab9,
      "Peach-Orange": 0xffcc99,
      "Peach-Yellow": 0xfadfad,
      Peanut: 0x7a4434,
      Pear: 0xd1e231,
      "Pearl Bush": 0xded1c6,
      "Pearl Lusta": 0xeae0c8,
      Peat: 0x766d52,
      Pelorous: 0x2599b2,
      Peppermint: 0xd7e7d0,
      Perano: 0xacb9e8,
      Perfume: 0xc2a9db,
      "Periglacial Blue": 0xacb6b2,
      Periwinkle: 0xc3cde6,
      "Persian Blue": 0x1c39bb,
      "Persian Green": 0x00a693,
      "Persian Indigo": 0x32127a,
      "Persian Pink": 0xf77fbe,
      "Persian Plum": 0x683332,
      "Persian Red": 0xcc3333,
      "Persian Rose": 0xfe28a2,
      Persimmon: 0xec5800,
      "Peru Tan": 0x733d1f,
      Pesto: 0x7a7229,
      "Petite Orchid": 0xda9790,
      Pewter: 0x91a092,
      Pharlap: 0x826663,
      Picasso: 0xf8ea97,
      "Picton Blue": 0x5ba0d0,
      "Pig Pink": 0xfdd7e4,
      "Pigment Green": 0x00a550,
      "Pine Cone": 0x756556,
      "Pine Glade": 0xbdc07e,
      "Pine Green": 0x01796f,
      "Pine Tree": 0x2a2f23,
      "Pink Flamingo": 0xff66ff,
      "Pink Flare": 0xd8b4b6,
      "Pink Lace": 0xf6ccd7,
      "Pink Lady": 0xf3d7b6,
      "Pink Swan": 0xbfb3b2,
      Piper: 0x9d5432,
      Pipi: 0xf5e6c4,
      Pippin: 0xfcdbd2,
      "Pirate Gold": 0xba782a,
      "Pixie Green": 0xbbcda5,
      Pizazz: 0xe57f3d,
      Pizza: 0xbf8d3c,
      Plantation: 0x3e594c,
      Pohutukawa: 0x651c26,
      Polar: 0xe5f2e7,
      "Polo Blue": 0x8aa7cc,
      Pompadour: 0x6a1f44,
      Porcelain: 0xdddcdb,
      Porsche: 0xdf9d5b,
      "Port Gore": 0x3b436c,
      Portafino: 0xf4f09b,
      Portage: 0x8b98d8,
      Portica: 0xf0d555,
      "Pot Pourri": 0xefdcd4,
      "Potters Clay": 0x845c40,
      "Powder Blue": 0xb0e0e6,
      "Prairie Sand": 0x883c32,
      Prelude: 0xcab4d4,
      Prim: 0xe2cdd5,
      Primrose: 0xe4de8e,
      Promenade: 0xf8f6df,
      "Provincial Pink": 0xf6e3da,
      "Prussian Blue": 0x003366,
      "Psychedelic Purple": 0xdd00ff,
      Puce: 0xcc8899,
      Pueblo: 0x6e3326,
      "Puerto Rico": 0x59baa3,
      Pumice: 0xbac0b4,
      Pumpkin: 0xff7518,
      Punga: 0x534931,
      "Purple Heart": 0x652dc1,
      "Purple Mountain's Majesty": 0x9678b6,
      "Purple Taupe": 0x50404d,
      Putty: 0xcdae70,
      "Quarter Pearl Lusta": 0xf2eddd,
      "Quarter Spanish White": 0xebe2d2,
      Quartz: 0xd9d9f3,
      Quicksand: 0xc3988b,
      "Quill Grey": 0xcbc9c0,
      Quincy: 0x6a5445,
      "Racing Green": 0x232f2c,
      "Radical Red": 0xff355e,
      Raffia: 0xdcc6a0,
      "Rain Forest": 0x667028,
      Rainee: 0xb3c1b1,
      Rajah: 0xfcae60,
      "Rangoon Green": 0x2b2e25,
      Raven: 0x6f747b,
      "Raw Sienna": 0xd27d46,
      "Raw Umber": 0x734a12,
      "Razzle Dazzle Rose": 0xff33cc,
      Razzmatazz: 0xe30b5c,
      Rebel: 0x453430,
      "Red Berry": 0x701f28,
      "Red Damask": 0xcb6f4a,
      "Red Devil": 0x662a2c,
      "Red Orange": 0xff3f34,
      "Red Oxide": 0x5d1f1e,
      "Red Robin": 0x7d4138,
      "Red Stage": 0xad522e,
      "Medium Red Violet": 0xbb3385,
      Redwood: 0x5b342e,
      Reef: 0xd1ef9f,
      "Reef Gold": 0xa98d36,
      "Regal Blue": 0x203f58,
      "Regent Grey": 0x798488,
      "Regent St Blue": 0xa0cdd9,
      Remy: 0xf6deda,
      "Reno Sand": 0xb26e33,
      "Resolution Blue": 0x323f75,
      Revolver: 0x37363f,
      Rhino: 0x3d4653,
      "Rice Cake": 0xefecde,
      "Rice Flower": 0xeff5d1,
      "Rich Blue": 0x5959ab,
      "Rich Gold": 0xa15226,
      "Rio Grande": 0xb7c61a,
      Riptide: 0x89d9c8,
      "River Bed": 0x556061,
      "Rob Roy": 0xddad56,
      "Robin's Egg Blue": 0x00cccc,
      Rock: 0x5a4d41,
      "Rock Blue": 0x93a2ba,
      "Rock Spray": 0x9d442d,
      "Rodeo Dust": 0xc7a384,
      "Rolling Stone": 0x6d7876,
      Roman: 0xd8625b,
      "Roman Coffee": 0x7d6757,
      Romance: 0xf4f0e6,
      Romantic: 0xffc69e,
      Ronchi: 0xeab852,
      "Roof Terracotta": 0xa14743,
      Rope: 0x8e593c,
      Rose: 0xd3a194,
      "Rose Bud": 0xfeab9a,
      "Rose Bud Cherry": 0x8a2d52,
      "Rose Of Sharon": 0xac512d,
      "Rose Taupe": 0x905d5d,
      "Rose White": 0xfbeee8,
      "Rosy Brown": 0xbc8f8f,
      Roti: 0xb69642,
      Rouge: 0xa94064,
      "Royal Blue": 0x4169e1,
      "Royal Heath": 0xb54b73,
      "Royal Purple": 0x6b3fa0,
      Ruby: 0xe0115f,
      Rum: 0x716675,
      "Rum Swizzle": 0xf1edd4,
      Russet: 0x80461b,
      Russett: 0x7d655c,
      Rust: 0xb7410e,
      "Rustic Red": 0x3a181a,
      "Rusty Nail": 0x8d5f2c,
      Saddle: 0x5d4e46,
      "Saddle Brown": 0x8b4513,
      "Safety Orange": 0xff6600,
      Saffron: 0xf4c430,
      Sage: 0x989f7a,
      Sahara: 0xb79826,
      Sail: 0xa5ceec,
      Salem: 0x177b4d,
      Salomie: 0xffd67b,
      "Salt Box": 0x696268,
      Saltpan: 0xeef3e5,
      Sambuca: 0x3b2e25,
      "San Felix": 0x2c6e31,
      "San Juan": 0x445761,
      "San Marino": 0x4e6c9d,
      "Sand Dune": 0x867665,
      Sandal: 0xa3876a,
      Sandrift: 0xaf937d,
      Sandstone: 0x786d5f,
      Sandwisp: 0xdecb81,
      "Sandy Beach": 0xfedbb7,
      "Sandy Brown": 0xf4a460,
      Sangria: 0x92000a,
      "Sanguine Brown": 0x6c3736,
      "Santas Grey": 0x9998a7,
      "Sante Fe": 0xa96a50,
      Sapling: 0xe1d5a6,
      Sapphire: 0x082567,
      Saratoga: 0x555b2c,
      Sauvignon: 0xf4eae4,
      Sazerac: 0xf5dec4,
      Scampi: 0x6f63a0,
      Scandal: 0xadd9d1,
      Scarlet: 0xff2400,
      "Scarlet Gum": 0x4a2d57,
      Scarlett: 0x7e2530,
      "Scarpa Flow": 0x6b6a6c,
      Schist: 0x87876f,
      "School Bus Yellow": 0xffd800,
      Schooner: 0x8d8478,
      Scooter: 0x308ea0,
      Scorpion: 0x6a6466,
      "Scotch Mist": 0xeee7c8,
      "Screamin' Green": 0x66ff66,
      Scrub: 0x3d4031,
      "Sea Buckthorn": 0xef9548,
      "Sea Fog": 0xdfddd6,
      "Sea Green": 0x2e8b57,
      "Sea Mist": 0xc2d5c4,
      "Sea Nymph": 0x8aaea4,
      "Sea Pink": 0xdb817e,
      Seagull: 0x77b7d0,
      "Seal Brown": 0x321414,
      Seance: 0x69326e,
      Seaweed: 0x37412a,
      Selago: 0xe6dfe7,
      "Selective Yellow": 0xffba00,
      "Semi-Sweet Chocolate": 0x6b4226,
      Sepia: 0x9e5b40,
      Serenade: 0xfce9d7,
      Shadow: 0x837050,
      "Shadow Green": 0x9ac0b6,
      "Shady Lady": 0x9f9b9d,
      Shakespeare: 0x609ab8,
      Shalimar: 0xf8f6a8,
      Shamrock: 0x33cc99,
      "Shamrock Green": 0x009e60,
      Shark: 0x34363a,
      "Sherpa Blue": 0x00494e,
      "Sherwood Green": 0x1b4636,
      Shilo: 0xe6b2a6,
      "Shingle Fawn": 0x745937,
      "Ship Cove": 0x7988ab,
      "Ship Grey": 0x4e4e4c,
      Shiraz: 0x842833,
      Shocking: 0xe899be,
      "Shocking Pink": 0xfc0fc0,
      "Shuttle Grey": 0x61666b,
      Siam: 0x686b50,
      Sidecar: 0xe9d9a9,
      Silk: 0xbbada1,
      "Silver Chalice": 0xacaea9,
      "Silver Sand": 0xbebdb6,
      "Silver Tree": 0x67be90,
      Sinbad: 0xa6d5d0,
      Siren: 0x69293b,
      Sirocco: 0x68766e,
      Sisal: 0xc5baa0,
      Skeptic: 0x9db4aa,
      "Sky Blue": 0x87ceeb,
      "Slate Blue": 0x6a5acd,
      "Slate Grey": 0x708090,
      Slugger: 0x42342b,
      Smalt: 0x003399,
      "Smalt Blue": 0x496267,
      "Smoke Tree": 0xbb5f34,
      Smoky: 0x605d6b,
      "Snow Drift": 0xe3e3dc,
      "Snow Flurry": 0xeaf7c9,
      "Snowy Mint": 0xd6f0cd,
      Snuff: 0xe4d7e5,
      Soapstone: 0xece5da,
      "Soft Amber": 0xcfbea5,
      "Soft Peach": 0xeedfde,
      "Solid Pink": 0x85494c,
      Solitaire: 0xeadac2,
      Solitude: 0xe9ecf1,
      Sorbus: 0xdd6b38,
      "Sorrell Brown": 0x9d7f61,
      "Sour Dough": 0xc9b59a,
      "Soya Bean": 0x6f634b,
      "Space Shuttle": 0x4b433b,
      "Spanish Green": 0x7b8976,
      "Spanish White": 0xded1b7,
      Spectra: 0x375d4f,
      Spice: 0x6c4f3f,
      "Spicy Mix": 0x8b5f4d,
      "Spicy Pink": 0xff1cae,
      Spindle: 0xb3c4d8,
      Splash: 0xf1d79e,
      Spray: 0x7ecddd,
      "Spring Bud": 0xa7fc00,
      "Spring Green": 0x00ff7f,
      "Spring Rain": 0xa3bd9c,
      "Spring Sun": 0xf1f1c6,
      "Spring Wood": 0xe9e1d9,
      Sprout: 0xb8ca9d,
      "Spun Pearl": 0xa2a1ac,
      Squirrel: 0x8f7d6b,
      "St Tropaz": 0x325482,
      Stack: 0x858885,
      "Star Dust": 0xa0a197,
      "Stark White": 0xd2c6b6,
      Starship: 0xe3dd39,
      "Steel Blue": 0x4682b4,
      "Steel Grey": 0x43464b,
      Stiletto: 0x833d3e,
      Stonewall: 0x807661,
      "Storm Dust": 0x65645f,
      "Storm Grey": 0x747880,
      Straw: 0xdabe82,
      Strikemaster: 0x946a81,
      Stromboli: 0x406356,
      Studio: 0x724aa1,
      Submarine: 0x8c9c9c,
      "Sugar Cane": 0xeeefdf,
      Sulu: 0xc6ea80,
      "Summer Green": 0x8fb69c,
      "Summer Sky": 0x38b0de,
      Sun: 0xef8e38,
      Sundance: 0xc4aa4d,
      Sundown: 0xf8afa9,
      Sunflower: 0xdac01a,
      Sunglo: 0xc76155,
      Sunglow: 0xffcc33,
      Sunset: 0xc0514a,
      "Sunset Orange": 0xfe4c40,
      Sunshade: 0xfa9d49,
      Supernova: 0xffb437,
      Surf: 0xb8d4bb,
      "Surf Crest": 0xc3d6bd,
      "Surfie Green": 0x007b77,
      Sushi: 0x7c9f2f,
      "Suva Grey": 0x8b8685,
      Swamp: 0x252f2f,
      "Swans Down": 0xdae6dd,
      "Sweet Corn": 0xf9e176,
      "Sweet Pink": 0xee918d,
      Swirl: 0xd7cec5,
      "Swiss Coffee": 0xdbd0ca,
      Tacao: 0xf6ae78,
      Tacha: 0xd2b960,
      "Tahiti Gold": 0xdc722a,
      "Tahuna Sands": 0xd8cc9b,
      "Tall Poppy": 0x853534,
      Tallow: 0xa39977,
      Tamarillo: 0x752b2f,
      Tana: 0xb8b5a1,
      Tangaroa: 0x1e2f3c,
      Tangerine: 0xf28500,
      "Tangerine Yellow": 0xffcc00,
      Tango: 0xd46f31,
      Tapa: 0x7c7c72,
      Tapestry: 0xb37084,
      Tara: 0xdef1dd,
      Tarawera: 0x253c48,
      Tasman: 0xbac0b3,
      Taupe: 0x483c32,
      "Taupe Grey": 0x8b8589,
      "Tawny Port": 0x643a48,
      "Tax Break": 0x496569,
      "Te Papa Green": 0x2b4b40,
      Tea: 0xbfb5a2,
      "Tea Green": 0xd0f0c0,
      "Tea Rose": 0xf883c2,
      Teak: 0xab8953,
      "Teal Blue": 0x254855,
      Temptress: 0x3c2126,
      "Tenne (Tawny)": 0xcd5700,
      Tequila: 0xf4d0a4,
      "Terra Cotta": 0xe2725b,
      Texas: 0xece67e,
      "Texas Rose": 0xfcb057,
      Thatch: 0xb1948f,
      "Thatch Green": 0x544e31,
      Thunder: 0x4d4d4b,
      Thunderbird: 0x923830,
      "Tia Maria": 0x97422d,
      Tiara: 0xb9c3be,
      Tiber: 0x184343,
      "Tickle Me Pink": 0xfc80a5,
      Tidal: 0xf0f590,
      Tide: 0xbeb4ab,
      "Timber Green": 0x324336,
      Timberwolf: 0xd9d6cf,
      "Titan White": 0xddd6e1,
      Toast: 0x9f715f,
      "Tobacco Brown": 0x6d5843,
      Tobago: 0x44362d,
      Toledo: 0x3e2631,
      Tolopea: 0x2d2541,
      "Tom Thumb": 0x4f6348,
      "Tonys Pink": 0xe79e88,
      Topaz: 0x817c87,
      "Torch Red": 0xfd0e35,
      "Torea Bay": 0x353d75,
      "Tory Blue": 0x374e88,
      Tosca: 0x744042,
      "Tower Grey": 0x9caca5,
      Tradewind: 0x6dafa7,
      Tranquil: 0xddede9,
      Travertine: 0xe2ddc7,
      "Tree Poppy": 0xe2813b,
      "Trendy Green": 0x7e8424,
      "Trendy Pink": 0x805d80,
      Trinidad: 0xc54f33,
      "Tropical Blue": 0xaec9eb,
      "Tropical Rain Forest": 0x00755e,
      Trout: 0x4c5356,
      "True V": 0x8e72c7,
      Tuatara: 0x454642,
      "Tuft Bush": 0xf9d3be,
      "Tulip Tree": 0xe3ac3d,
      Tumbleweed: 0xdea681,
      Tuna: 0x46494e,
      Tundora: 0x585452,
      Turbo: 0xf5cc23,
      "Turkish Rose": 0xa56e75,
      Turmeric: 0xae9041,
      "Turquoise Blue": 0x6cdae7,
      "Turtle Green": 0x363e1d,
      Tuscany: 0xad6242,
      Tusk: 0xe3e5b1,
      Tussock: 0xbf914b,
      Tutu: 0xf8e4e3,
      Twilight: 0xdac0cd,
      "Twilight Blue": 0xf4f6ec,
      Twine: 0xc19156,
      "Tyrian Purple": 0x66023c,
      "Ultra Pink": 0xff6fff,
      Ultramarine: 0x120a8f,
      Valencia: 0xd4574e,
      Valentino: 0x382c38,
      Valhalla: 0x2a2b41,
      "Van Cleef": 0x523936,
      Vanilla: 0xccb69b,
      "Vanilla Ice": 0xebd2d1,
      Varden: 0xfdefd3,
      "Venetian Red": 0xc80815,
      "Venice Blue": 0x2c5778,
      Venus: 0x8b7d82,
      Verdigris: 0x62603e,
      "Verdun Green": 0x48531a,
      Vermilion: 0xff4d00,
      "Very Dark Brown": 0x5c4033,
      "Very Light Grey": 0xcdcdcd,
      Vesuvius: 0xa85533,
      Victoria: 0x564985,
      "Vida Loca": 0x5f9228,
      Viking: 0x4db1c8,
      "Vin Rouge": 0x955264,
      Viola: 0xc58f9d,
      "Violent Violet": 0x2e2249,
      "Violet Blue": 0x9f5f9f,
      "Violet Red": 0xf7468a,
      Viridian: 0x40826d,
      "Viridian Green": 0x4b5f56,
      "Vis Vis": 0xf9e496,
      "Vista Blue": 0x97d5b3,
      "Vista White": 0xe3dfd9,
      "Vivid Tangerine": 0xff9980,
      "Vivid Violet": 0x803790,
      Volcano: 0x4e2728,
      Voodoo: 0x443240,
      Vulcan: 0x36383c,
      Wafer: 0xd4bbb1,
      "Waikawa Grey": 0x5b6e91,
      Waiouru: 0x4c4e31,
      "Wan White": 0xe4e2dc,
      Wasabi: 0x849137,
      "Water Leaf": 0xb6ecde,
      Watercourse: 0x006e4e,
      Wattle: 0xd6ca3d,
      Watusi: 0xf2cdbb,
      "Wax Flower": 0xeeb39e,
      "We Peep": 0xfdd7d8,
      Wedgewood: 0x4c6b88,
      "Well Read": 0x8e3537,
      "West Coast": 0x5c512f,
      "West Side": 0xe5823a,
      Westar: 0xd4cfc5,
      Wewak: 0xf1919a,
      Wheatfield: 0xdfd7bd,
      Whiskey: 0xd29062,
      "Whiskey Sour": 0xd4915d,
      Whisper: 0xefe6e6,
      "White Ice": 0xd7eee4,
      "White Lilac": 0xe7e5e8,
      "White Linen": 0xeee7dc,
      "White Nectar": 0xf8f6d8,
      "White Pointer": 0xdad6cc,
      "White Rock": 0xd4cfb4,
      "White Smoke": 0xf5f5f5,
      "Wild Blue Yonder": 0x7a89b8,
      "Wild Rice": 0xe3d474,
      "Wild Sand": 0xe7e4de,
      "Wild Strawberry": 0xff3399,
      "Wild Watermelon": 0xfd5b78,
      "Wild Willow": 0xbeca60,
      William: 0x53736f,
      "Willow Brook": 0xdfe6cf,
      "Willow Grove": 0x69755c,
      Windsor: 0x462c77,
      "Wine Berry": 0x522c35,
      "Winter Hazel": 0xd0c383,
      "Wisp Pink": 0xf9e8e2,
      Wisteria: 0xc9a0dc,
      Wistful: 0xa29ecd,
      "Witch Haze": 0xfbf073,
      "Wood Bark": 0x302621,
      Woodburn: 0x463629,
      Woodland: 0x626746,
      Woodrush: 0x45402b,
      Woodsmoke: 0x2b3230,
      "Woody Brown": 0x554545,
      Xanadu: 0x75876e,
      "Yellow Green": 0x9acd32,
      "Yellow Metal": 0x73633e,
      "Yellow Orange": 0xffae42,
      "Yellow Sea": 0xf49f35,
      "Your Pink": 0xffc5bb,
      "Yukon Gold": 0x826a21,
      Yuma: 0xc7b882,
      Zambezi: 0x6b5a5a,
      Zanah: 0xb2c6b1,
      Zest: 0xc6723b,
      Zeus: 0x3b3c38,
      Ziggurat: 0x81a6aa,
      Zinnwaldite: 0xebc2af,
      Zircon: 0xdee3e3,
      Zombie: 0xddc283,
      Zorba: 0xa29589,
      Zuccini: 0x17462e,
      Zumthor: 0xcdd5d5,
  };
  });

  unwrapExports(colorsExtended);
  var colorsExtended_1 = colorsExtended.colorsExtended;

  const whats$1 = [
      {
          value: "_50shadesOfGrey",
          title: "50 shades of grey (+ black and white)",
          children: "Evenly spaced in HSL color space.",
          detail: color => {
              const l = color.hsl()[2];
              const i = (l * 51) | 0;
              return (0 == i ? "black" : 51 == i ? "white" : "grey " + i + "/50") + " Lightness: " + l.toFixed(2);
          },
      },
      {
          value: "rgbCube16",
          title: "RGB color cube",
          children: "Only the faces of the cube though.",
          detail: color => color.css("rgb"),
      },
      {
          value: "hues",
          title: "Hues",
          children: "All the colors of the rainbow.",
          detail: color => "Hue: " + (color.hsl()[0] | 0),
      },
      {
          value: "w3cx11",
          title: "CSS Colors",
          children: "All the named CSS colors.",
          detail: color => color.name(),
      },
      {
          value: "ks",
          title: "Temperatures",
          children: "",
          detail: color => "Temperature: " + (color.temperature() | 0),
      },
      {
          value: "cubehelix",
          title: "chroma.cubehelix()",
          children: "100 samples of the default settings.",
          detail: () => "",
      },
      {
          value: "scalePaired",
          title: "chroma.scale('Paired')",
          children: "100 samples.",
          detail: () => "",
      },
      {
          value: "hslCylinder",
          title: "HSL cylinder",
          children: "Lightness goes from 1% to 99%, as 0% (black) and 100% (white) colors collapse into a single point.",
          detail: color => color.css("hsl"),
      },
      {
          value: "colors2",
          title: "Extended Colors",
          detail: color => {
              const num = color.num();
              return Object.keys(colorsExtended_1).find(name => colorsExtended_1[name] === num);
          },
          children: "",
      },
      {
          value: "l05",
          title: "HSL Cylinder Slice at L=50%",
          children: "",
          detail: () => "",
      },
  ];
  let m;
  if ((m = (window.location.hash || "").match(/^#(.*?)-((?:[a-f\d]{6})+)$/))) {
      const [, name, hexes] = m;
      const colors = hexes.match(/.{6}/g).map(hex => chroma.css(hex));
      whats$1.push({ value: "hash", title: decodeURI(name), children: "from the URL hash", detail: () => "" });
      whats.hash = () => colors;
  }
  class AppState {
      constructor() {
          this.colorSpace = "rgb";
          this.what = whats.hash ? "hash" : "hslCylinder";
          this.rotation = true;
          this.highlightedColor = undefined;
          this.selectedColor = undefined;
          this.camera = new Camera();
      }
  }
  const colorSpaceItems = Object.keys(colorSpaces).map(key => {
      const colorSpace = colorSpaces[key];
      return {
          value: key,
          title: colorSpace.title,
          children: colorSpace.children,
      };
  });
  class App extends React.PureComponent {
      constructor() {
          super(...arguments);
          this.state = new AppState();
          this.canvasMousePos = V3.O;
          /** Use when dragging. */
          this.cancelNextClick = false;
          this.canvasMove = (e) => {
              let eventOffset;
              if (e.type == "mousemove") {
                  const me = e;
                  eventOffset = V(me.nativeEvent.offsetX, me.nativeEvent.offsetY);
              }
              else {
                  const te = e;
                  if (te.targetTouches.length !== 1) {
                      return;
                  }
                  eventOffset = V(te.targetTouches[0].clientX, te.targetTouches[0].clientY);
              }
              if (e.type !== "mousemove" || e.buttons & 1) {
                  const delta = this.canvasMousePos.to(eventOffset);
                  const { eye, center, up } = this.state.camera;
                  const transformation = M4.multiply(M4.rotateZ((-delta.x * DEG) / 10), M4.rotate((-delta.y * DEG) / 10, eye.to(center).cross(up)));
                  this.setState({
                      camera: { eye: transformation.transformPoint(eye), center, up: transformation.transformVector(up) },
                  });
                  this.cancelNextClick = true;
                  e.preventDefault();
              }
              this.canvasMousePos = eventOffset;
          };
          this.canvasClick = () => {
              if (!this.cancelNextClick) {
                  this.setState({ selectedColor: this.state.highlightedColor });
              }
              this.cancelNextClick = false;
          };
      }
      render() {
          const { highlightedColor, selectedColor, colorSpace, what, rotation, camera } = this.state;
          const displayColor = highlightedColor || selectedColor;
          return (React__default.createElement(React__default.Fragment, null,
              React__default.createElement(Picker, { id: "colorSpace", title: "Choose a color space...", items: colorSpaceItems, className: "picker", onchange: colorSpace => this.setState({ colorSpace }), value: this.state.colorSpace }),
              React__default.createElement(Picker, { id: "what", title: "...and what to draw:", items: whats$1, className: "picker", onchange: what => this.setState({ what }), value: this.state.what }),
              React__default.createElement("div", { id: "canvasContainer" },
                  React__default.createElement(SpacesCanvas, { id: "spacesCanvas", colorSpace: this.state.colorSpace, style: { cursor: highlightedColor ? "crosshair" : "move" }, what: this.state.what, rotation: rotation, colorHighlight: displayColor, onHoverChange: highlightedColor => this.setState({ highlightedColor }), onClick: this.canvasClick, camera: camera, onMouseMove: this.canvasMove, onTouchMove: this.canvasMove }),
                  React__default.createElement("div", { id: "info" },
                      React__default.createElement("div", { id: "activeColorPreview", style: displayColor && {
                              backgroundColor: displayColor.css(),
                              color: displayColor.textColor().name(),
                          } },
                          React__default.createElement("div", { id: "activeColorHex" }, displayColor && displayColor.hex()),
                          React__default.createElement("div", { id: "activeColorDetail" }, displayColor && whats$1.find(cs => cs.value == what).detail(displayColor))),
                      React__default.createElement("label", null,
                          React__default.createElement("input", { type: "checkbox", checked: rotation, onChange: e => this.setState({ rotation: e.target.checked }) }),
                          "Rotation"),
                      React__default.createElement("button", { onClick: () => this.setCamera(V(5, 0, 0.5), V(0, 0, 0.5), V3.Z) }, "X"),
                      React__default.createElement("button", { onClick: () => this.setCamera(V(0, 5, 0.5), V(0, 0, 0.5), V3.Z) }, "Y"),
                      React__default.createElement("button", { onClick: () => this.setCamera(V(0, 0, 5.5), V(0, 0, 0.5), V3.Y) }, "Z"),
                      React__default.createElement("button", { onClick: () => this.setState({ camera: new Camera() }) }, "Default"),
                      React__default.createElement("div", { style: { textAlign: "right" } },
                          React__default.createElement("a", { href: "github.com/NaridaL/chroma.ts" }, "view source on github"))))));
      }
      setCamera(eye, center, up) {
          this.setState({ camera: { eye, center, up } });
      }
  }

  ReactDOM.render(React__default.createElement(App), document.getElementById("vcs-root"));
  //# sourceMappingURL=index.js.map

}(React,ReactDOM));
//# sourceMappingURL=bundle.js.map
