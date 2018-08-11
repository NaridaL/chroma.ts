(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
(function (React,ReactDOM) {
    'use strict';

    var React__default = 'default' in React ? React['default'] : React;
    ReactDOM = ReactDOM && ReactDOM.hasOwnProperty('default') ? ReactDOM['default'] : ReactDOM;

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
    const NLA_DEBUG = true;
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
            assertVectors.apply(undefined, vs);
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
            assertVectors.apply(undefined, vs);
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

    function __awaiter$1(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var chroma = createCommonjsModule(function (module, exports) {
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
     *
     */

    (function() {
      var Color, DEG2RAD, LAB_CONSTANTS, PI, PITHIRD, RAD2DEG, TWOPI, _average_lrgb, _guess_formats, _guess_formats_sorted, _input, _interpolators, abs, atan2, bezier, blend, blend_f, brewer, burn, chroma, clip_rgb, cmyk2rgb, colors, cos, css2rgb, darken, dodge, each, floor, hcg2rgb, hex2rgb, hsi2rgb, hsl2css, hsl2rgb, hsv2rgb, interpolate, interpolate_hsx, interpolate_lab, interpolate_lrgb, interpolate_num, interpolate_rgb, lab2lch, lab2rgb, lab_xyz, lch2lab, lch2rgb, lighten, limit, log, luminance_x, m, max, multiply, normal, num2rgb, overlay, pow, rgb2cmyk, rgb2css, rgb2hcg, rgb2hex, rgb2hsi, rgb2hsl, rgb2hsv, rgb2lab, rgb2lch, rgb2luminance, rgb2num, rgb2temperature, rgb2xyz, rgb_xyz, rnd, root, round, screen, sin, sqrt, temperature2rgb, type, unpack, w3cx11, xyz_lab, xyz_rgb,
        slice = [].slice;

      type = (function() {

        /*
        for browser-safe type checking+
        ported from jQuery's $.type
         */
        var classToType, len, name, o, ref;
        classToType = {};
        ref = "Boolean Number String Function Array Date RegExp Undefined Null".split(" ");
        for (o = 0, len = ref.length; o < len; o++) {
          name = ref[o];
          classToType["[object " + name + "]"] = name.toLowerCase();
        }
        return function(obj) {
          var strType;
          strType = Object.prototype.toString.call(obj);
          return classToType[strType] || "object";
        };
      })();

      limit = function(x, min, max) {
        if (min == null) {
          min = 0;
        }
        if (max == null) {
          max = 1;
        }
        if (x < min) {
          x = min;
        }
        if (x > max) {
          x = max;
        }
        return x;
      };

      unpack = function(args) {
        if (args.length >= 3) {
          return Array.prototype.slice.call(args);
        } else {
          return args[0];
        }
      };

      clip_rgb = function(rgb) {
        var i, o;
        rgb._clipped = false;
        rgb._unclipped = rgb.slice(0);
        for (i = o = 0; o < 3; i = ++o) {
          if (i < 3) {
            if (rgb[i] < 0 || rgb[i] > 255) {
              rgb._clipped = true;
            }
            if (rgb[i] < 0) {
              rgb[i] = 0;
            }
            if (rgb[i] > 255) {
              rgb[i] = 255;
            }
          } else if (i === 3) {
            if (rgb[i] < 0) {
              rgb[i] = 0;
            }
            if (rgb[i] > 1) {
              rgb[i] = 1;
            }
          }
        }
        if (!rgb._clipped) {
          delete rgb._unclipped;
        }
        return rgb;
      };

      PI = Math.PI, round = Math.round, cos = Math.cos, floor = Math.floor, pow = Math.pow, log = Math.log, sin = Math.sin, sqrt = Math.sqrt, atan2 = Math.atan2, max = Math.max, abs = Math.abs;

      TWOPI = PI * 2;

      PITHIRD = PI / 3;

      DEG2RAD = PI / 180;

      RAD2DEG = 180 / PI;

      chroma = function() {
        if (arguments[0] instanceof Color) {
          return arguments[0];
        }
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Color, arguments, function(){});
      };

      chroma["default"] = chroma;

      _interpolators = [];

      if ((module !== null) && (module.exports != null)) {
        module.exports = chroma;
      }

      {
        root = exports !== null ? exports : this;
        root.chroma = chroma;
      }

      chroma.version = '1.3.7';

      _input = {};

      _guess_formats = [];

      _guess_formats_sorted = false;

      Color = (function() {
        function Color() {
          var arg, args, chk, len, len1, me, mode, o, w;
          me = this;
          args = [];
          for (o = 0, len = arguments.length; o < len; o++) {
            arg = arguments[o];
            if (arg != null) {
              args.push(arg);
            }
          }
          if (args.length > 1) {
            mode = args[args.length - 1];
          }
          if (_input[mode] != null) {
            me._rgb = clip_rgb(_input[mode](unpack(args.slice(0, -1))));
          } else {
            if (!_guess_formats_sorted) {
              _guess_formats = _guess_formats.sort(function(a, b) {
                return b.p - a.p;
              });
              _guess_formats_sorted = true;
            }
            for (w = 0, len1 = _guess_formats.length; w < len1; w++) {
              chk = _guess_formats[w];
              mode = chk.test.apply(chk, args);
              if (mode) {
                break;
              }
            }
            if (mode) {
              me._rgb = clip_rgb(_input[mode].apply(_input, args));
            }
          }
          if (me._rgb == null) {
            console.warn('unknown format: ' + args);
          }
          if (me._rgb == null) {
            me._rgb = [0, 0, 0];
          }
          if (me._rgb.length === 3) {
            me._rgb.push(1);
          }
        }

        Color.prototype.toString = function() {
          return this.hex();
        };

        Color.prototype.clone = function() {
          return chroma(me._rgb);
        };

        return Color;

      })();

      chroma._input = _input;


      /**
      	ColorBrewer colors for chroma.js
      
      	Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The 
      	Pennsylvania State University.
      
      	Licensed under the Apache License, Version 2.0 (the "License"); 
      	you may not use this file except in compliance with the License.
      	You may obtain a copy of the License at	
      	http://www.apache.org/licenses/LICENSE-2.0
      
      	Unless required by applicable law or agreed to in writing, software distributed
      	under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
      	CONDITIONS OF ANY KIND, either express or implied. See the License for the
      	specific language governing permissions and limitations under the License.
      
          @preserve
       */

      chroma.brewer = brewer = {
        OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
        PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
        BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
        Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
        BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
        YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
        YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
        Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
        RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
        Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
        YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
        Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
        GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
        Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
        YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
        PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
        Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
        PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
        Viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],
        Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
        RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
        RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
        PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
        PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
        RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
        BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
        RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
        PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],
        Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
        Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
        Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
        Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
        Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
        Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
        Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
        Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2']
      };

      (function() {
        var key, results;
        results = [];
        for (key in brewer) {
          results.push(brewer[key.toLowerCase()] = brewer[key]);
        }
        return results;
      })();


      /**
      	X11 color names
      
      	http://www.w3.org/TR/css3-color/#svg-color
       */

      w3cx11 = {
        aliceblue: '#f0f8ff',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        aquamarine: '#7fffd4',
        azure: '#f0ffff',
        beige: '#f5f5dc',
        bisque: '#ffe4c4',
        black: '#000000',
        blanchedalmond: '#ffebcd',
        blue: '#0000ff',
        blueviolet: '#8a2be2',
        brown: '#a52a2a',
        burlywood: '#deb887',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        cornflower: '#6495ed',
        cornflowerblue: '#6495ed',
        cornsilk: '#fff8dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkgray: '#a9a9a9',
        darkgreen: '#006400',
        darkgrey: '#a9a9a9',
        darkkhaki: '#bdb76b',
        darkmagenta: '#8b008b',
        darkolivegreen: '#556b2f',
        darkorange: '#ff8c00',
        darkorchid: '#9932cc',
        darkred: '#8b0000',
        darksalmon: '#e9967a',
        darkseagreen: '#8fbc8f',
        darkslateblue: '#483d8b',
        darkslategray: '#2f4f4f',
        darkslategrey: '#2f4f4f',
        darkturquoise: '#00ced1',
        darkviolet: '#9400d3',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        dimgray: '#696969',
        dimgrey: '#696969',
        dodgerblue: '#1e90ff',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        forestgreen: '#228b22',
        fuchsia: '#ff00ff',
        gainsboro: '#dcdcdc',
        ghostwhite: '#f8f8ff',
        gold: '#ffd700',
        goldenrod: '#daa520',
        gray: '#808080',
        green: '#008000',
        greenyellow: '#adff2f',
        grey: '#808080',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        indianred: '#cd5c5c',
        indigo: '#4b0082',
        ivory: '#fffff0',
        khaki: '#f0e68c',
        laserlemon: '#ffff54',
        lavender: '#e6e6fa',
        lavenderblush: '#fff0f5',
        lawngreen: '#7cfc00',
        lemonchiffon: '#fffacd',
        lightblue: '#add8e6',
        lightcoral: '#f08080',
        lightcyan: '#e0ffff',
        lightgoldenrod: '#fafad2',
        lightgoldenrodyellow: '#fafad2',
        lightgray: '#d3d3d3',
        lightgreen: '#90ee90',
        lightgrey: '#d3d3d3',
        lightpink: '#ffb6c1',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        lightskyblue: '#87cefa',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        lightsteelblue: '#b0c4de',
        lightyellow: '#ffffe0',
        lime: '#00ff00',
        limegreen: '#32cd32',
        linen: '#faf0e6',
        magenta: '#ff00ff',
        maroon: '#800000',
        maroon2: '#7f0000',
        maroon3: '#b03060',
        mediumaquamarine: '#66cdaa',
        mediumblue: '#0000cd',
        mediumorchid: '#ba55d3',
        mediumpurple: '#9370db',
        mediumseagreen: '#3cb371',
        mediumslateblue: '#7b68ee',
        mediumspringgreen: '#00fa9a',
        mediumturquoise: '#48d1cc',
        mediumvioletred: '#c71585',
        midnightblue: '#191970',
        mintcream: '#f5fffa',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        navajowhite: '#ffdead',
        navy: '#000080',
        oldlace: '#fdf5e6',
        olive: '#808000',
        olivedrab: '#6b8e23',
        orange: '#ffa500',
        orangered: '#ff4500',
        orchid: '#da70d6',
        palegoldenrod: '#eee8aa',
        palegreen: '#98fb98',
        paleturquoise: '#afeeee',
        palevioletred: '#db7093',
        papayawhip: '#ffefd5',
        peachpuff: '#ffdab9',
        peru: '#cd853f',
        pink: '#ffc0cb',
        plum: '#dda0dd',
        powderblue: '#b0e0e6',
        purple: '#800080',
        purple2: '#7f007f',
        purple3: '#a020f0',
        rebeccapurple: '#663399',
        red: '#ff0000',
        rosybrown: '#bc8f8f',
        royalblue: '#4169e1',
        saddlebrown: '#8b4513',
        salmon: '#fa8072',
        sandybrown: '#f4a460',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        sienna: '#a0522d',
        silver: '#c0c0c0',
        skyblue: '#87ceeb',
        slateblue: '#6a5acd',
        slategray: '#708090',
        slategrey: '#708090',
        snow: '#fffafa',
        springgreen: '#00ff7f',
        steelblue: '#4682b4',
        tan: '#d2b48c',
        teal: '#008080',
        thistle: '#d8bfd8',
        tomato: '#ff6347',
        turquoise: '#40e0d0',
        violet: '#ee82ee',
        wheat: '#f5deb3',
        white: '#ffffff',
        whitesmoke: '#f5f5f5',
        yellow: '#ffff00',
        yellowgreen: '#9acd32'
      };

      chroma.colors = colors = w3cx11;

      lab2rgb = function() {
        var a, args, b, g, l, r, x, y, z;
        args = unpack(arguments);
        l = args[0], a = args[1], b = args[2];
        y = (l + 16) / 116;
        x = isNaN(a) ? y : y + a / 500;
        z = isNaN(b) ? y : y - b / 200;
        y = LAB_CONSTANTS.Yn * lab_xyz(y);
        x = LAB_CONSTANTS.Xn * lab_xyz(x);
        z = LAB_CONSTANTS.Zn * lab_xyz(z);
        r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);
        g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
        b = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);
        return [r, g, b, args.length > 3 ? args[3] : 1];
      };

      xyz_rgb = function(r) {
        return 255 * (r <= 0.00304 ? 12.92 * r : 1.055 * pow(r, 1 / 2.4) - 0.055);
      };

      lab_xyz = function(t) {
        if (t > LAB_CONSTANTS.t1) {
          return t * t * t;
        } else {
          return LAB_CONSTANTS.t2 * (t - LAB_CONSTANTS.t0);
        }
      };

      LAB_CONSTANTS = {
        Kn: 18,
        Xn: 0.950470,
        Yn: 1,
        Zn: 1.088830,
        t0: 0.137931034,
        t1: 0.206896552,
        t2: 0.12841855,
        t3: 0.008856452
      };

      rgb2lab = function() {
        var b, g, r, ref, ref1, x, y, z;
        ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
        ref1 = rgb2xyz(r, g, b), x = ref1[0], y = ref1[1], z = ref1[2];
        return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
      };

      rgb_xyz = function(r) {
        if ((r /= 255) <= 0.04045) {
          return r / 12.92;
        } else {
          return pow((r + 0.055) / 1.055, 2.4);
        }
      };

      xyz_lab = function(t) {
        if (t > LAB_CONSTANTS.t3) {
          return pow(t, 1 / 3);
        } else {
          return t / LAB_CONSTANTS.t2 + LAB_CONSTANTS.t0;
        }
      };

      rgb2xyz = function() {
        var b, g, r, ref, x, y, z;
        ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
        r = rgb_xyz(r);
        g = rgb_xyz(g);
        b = rgb_xyz(b);
        x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / LAB_CONSTANTS.Xn);
        y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / LAB_CONSTANTS.Yn);
        z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / LAB_CONSTANTS.Zn);
        return [x, y, z];
      };

      chroma.lab = function() {
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Color, slice.call(arguments).concat(['lab']), function(){});
      };

      _input.lab = lab2rgb;

      Color.prototype.lab = function() {
        return rgb2lab(this._rgb);
      };

      bezier = function(colors) {
        var I, I0, I1, c, lab0, lab1, lab2, lab3, ref, ref1, ref2;
        colors = (function() {
          var len, o, results;
          results = [];
          for (o = 0, len = colors.length; o < len; o++) {
            c = colors[o];
            results.push(chroma(c));
          }
          return results;
        })();
        if (colors.length === 2) {
          ref = (function() {
            var len, o, results;
            results = [];
            for (o = 0, len = colors.length; o < len; o++) {
              c = colors[o];
              results.push(c.lab());
            }
            return results;
          })(), lab0 = ref[0], lab1 = ref[1];
          I = function(t) {
            var i, lab;
            lab = (function() {
              var o, results;
              results = [];
              for (i = o = 0; o <= 2; i = ++o) {
                results.push(lab0[i] + t * (lab1[i] - lab0[i]));
              }
              return results;
            })();
            return chroma.lab.apply(chroma, lab);
          };
        } else if (colors.length === 3) {
          ref1 = (function() {
            var len, o, results;
            results = [];
            for (o = 0, len = colors.length; o < len; o++) {
              c = colors[o];
              results.push(c.lab());
            }
            return results;
          })(), lab0 = ref1[0], lab1 = ref1[1], lab2 = ref1[2];
          I = function(t) {
            var i, lab;
            lab = (function() {
              var o, results;
              results = [];
              for (i = o = 0; o <= 2; i = ++o) {
                results.push((1 - t) * (1 - t) * lab0[i] + 2 * (1 - t) * t * lab1[i] + t * t * lab2[i]);
              }
              return results;
            })();
            return chroma.lab.apply(chroma, lab);
          };
        } else if (colors.length === 4) {
          ref2 = (function() {
            var len, o, results;
            results = [];
            for (o = 0, len = colors.length; o < len; o++) {
              c = colors[o];
              results.push(c.lab());
            }
            return results;
          })(), lab0 = ref2[0], lab1 = ref2[1], lab2 = ref2[2], lab3 = ref2[3];
          I = function(t) {
            var i, lab;
            lab = (function() {
              var o, results;
              results = [];
              for (i = o = 0; o <= 2; i = ++o) {
                results.push((1 - t) * (1 - t) * (1 - t) * lab0[i] + 3 * (1 - t) * (1 - t) * t * lab1[i] + 3 * (1 - t) * t * t * lab2[i] + t * t * t * lab3[i]);
              }
              return results;
            })();
            return chroma.lab.apply(chroma, lab);
          };
        } else if (colors.length === 5) {
          I0 = bezier(colors.slice(0, 3));
          I1 = bezier(colors.slice(2, 5));
          I = function(t) {
            if (t < 0.5) {
              return I0(t * 2);
            } else {
              return I1((t - 0.5) * 2);
            }
          };
        }
        return I;
      };

      chroma.bezier = function(colors) {
        var f;
        f = bezier(colors);
        f.scale = function() {
          return chroma.scale(f);
        };
        return f;
      };


      /*
          chroma.js
      
          Copyright (c) 2011-2013, Gregor Aisch
          All rights reserved.
      
          Redistribution and use in source and binary forms, with or without
          modification, are permitted provided that the following conditions are met:
      
          * Redistributions of source code must retain the above copyright notice, this
            list of conditions and the following disclaimer.
      
          * Redistributions in binary form must reproduce the above copyright notice,
            this list of conditions and the following disclaimer in the documentation
            and/or other materials provided with the distribution.
      
          * The name Gregor Aisch may not be used to endorse or promote products
            derived from this software without specific prior written permission.
      
          THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
          AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
          IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
          DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
          INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
          BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
          DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
          OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
          NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
          EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
      
          @source: https://github.com/gka/chroma.js
       */

      chroma.cubehelix = function(start, rotations, hue, gamma, lightness) {
        var dh, dl, f;
        if (start == null) {
          start = 300;
        }
        if (rotations == null) {
          rotations = -1.5;
        }
        if (hue == null) {
          hue = 1;
        }
        if (gamma == null) {
          gamma = 1;
        }
        if (lightness == null) {
          lightness = [0, 1];
        }
        dh = 0;
        if (type(lightness) === 'array') {
          dl = lightness[1] - lightness[0];
        } else {
          dl = 0;
          lightness = [lightness, lightness];
        }
        f = function(fract) {
          var a, amp, b, cos_a, g, h, l, r, sin_a;
          a = TWOPI * ((start + 120) / 360 + rotations * fract);
          l = pow(lightness[0] + dl * fract, gamma);
          h = dh !== 0 ? hue[0] + fract * dh : hue;
          amp = h * l * (1 - l) / 2;
          cos_a = cos(a);
          sin_a = sin(a);
          r = l + amp * (-0.14861 * cos_a + 1.78277 * sin_a);
          g = l + amp * (-0.29227 * cos_a - 0.90649 * sin_a);
          b = l + amp * (+1.97294 * cos_a);
          return chroma(clip_rgb([r * 255, g * 255, b * 255]));
        };
        f.start = function(s) {
          if (s == null) {
            return start;
          }
          start = s;
          return f;
        };
        f.rotations = function(r) {
          if (r == null) {
            return rotations;
          }
          rotations = r;
          return f;
        };
        f.gamma = function(g) {
          if (g == null) {
            return gamma;
          }
          gamma = g;
          return f;
        };
        f.hue = function(h) {
          if (h == null) {
            return hue;
          }
          hue = h;
          if (type(hue) === 'array') {
            dh = hue[1] - hue[0];
            if (dh === 0) {
              hue = hue[1];
            }
          } else {
            dh = 0;
          }
          return f;
        };
        f.lightness = function(h) {
          if (h == null) {
            return lightness;
          }
          if (type(h) === 'array') {
            lightness = h;
            dl = h[1] - h[0];
          } else {
            lightness = [h, h];
            dl = 0;
          }
          return f;
        };
        f.scale = function() {
          return chroma.scale(f);
        };
        f.hue(hue);
        return f;
      };

      chroma.random = function() {
        var code, digits, i, o;
        digits = '0123456789abcdef';
        code = '#';
        for (i = o = 0; o < 6; i = ++o) {
          code += digits.charAt(floor(Math.random() * 16));
        }
        return new Color(code);
      };

      _interpolators = [];

      interpolate = function(col1, col2, f, m) {
        var interpol, len, o, res;
        if (f == null) {
          f = 0.5;
        }
        if (m == null) {
          m = 'rgb';
        }

        /*
        interpolates between colors
        f = 0 --> me
        f = 1 --> col
         */
        if (type(col1) !== 'object') {
          col1 = chroma(col1);
        }
        if (type(col2) !== 'object') {
          col2 = chroma(col2);
        }
        for (o = 0, len = _interpolators.length; o < len; o++) {
          interpol = _interpolators[o];
          if (m === interpol[0]) {
            res = interpol[1](col1, col2, f, m);
            break;
          }
        }
        if (res == null) {
          throw "color mode " + m + " is not supported";
        }
        return res.alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
      };

      chroma.interpolate = interpolate;

      Color.prototype.interpolate = function(col2, f, m) {
        return interpolate(this, col2, f, m);
      };

      chroma.mix = interpolate;

      Color.prototype.mix = Color.prototype.interpolate;

      _input.rgb = function() {
        var k, ref, results, v;
        ref = unpack(arguments);
        results = [];
        for (k in ref) {
          v = ref[k];
          results.push(v);
        }
        return results;
      };

      chroma.rgb = function() {
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Color, slice.call(arguments).concat(['rgb']), function(){});
      };

      Color.prototype.rgb = function(round) {
        if (round == null) {
          round = true;
        }
        if (round) {
          return this._rgb.map(Math.round).slice(0, 3);
        } else {
          return this._rgb.slice(0, 3);
        }
      };

      Color.prototype.rgba = function(round) {
        if (round == null) {
          round = true;
        }
        if (!round) {
          return this._rgb.slice(0);
        }
        return [Math.round(this._rgb[0]), Math.round(this._rgb[1]), Math.round(this._rgb[2]), this._rgb[3]];
      };

      _guess_formats.push({
        p: 3,
        test: function(n) {
          var a;
          a = unpack(arguments);
          if (type(a) === 'array' && a.length === 3) {
            return 'rgb';
          }
          if (a.length === 4 && type(a[3]) === "number" && a[3] >= 0 && a[3] <= 1) {
            return 'rgb';
          }
        }
      });

      _input.lrgb = _input.rgb;

      interpolate_lrgb = function(col1, col2, f, m) {
        var xyz0, xyz1;
        xyz0 = col1._rgb;
        xyz1 = col2._rgb;
        return new Color(sqrt(pow(xyz0[0], 2) * (1 - f) + pow(xyz1[0], 2) * f), sqrt(pow(xyz0[1], 2) * (1 - f) + pow(xyz1[1], 2) * f), sqrt(pow(xyz0[2], 2) * (1 - f) + pow(xyz1[2], 2) * f), m);
      };

      _average_lrgb = function(colors) {
        var col, f, len, o, rgb, xyz;
        f = 1 / colors.length;
        xyz = [0, 0, 0, 0];
        for (o = 0, len = colors.length; o < len; o++) {
          col = colors[o];
          rgb = col._rgb;
          xyz[0] += pow(rgb[0], 2) * f;
          xyz[1] += pow(rgb[1], 2) * f;
          xyz[2] += pow(rgb[2], 2) * f;
          xyz[3] += rgb[3] * f;
        }
        xyz[0] = sqrt(xyz[0]);
        xyz[1] = sqrt(xyz[1]);
        xyz[2] = sqrt(xyz[2]);
        return new Color(xyz);
      };

      _interpolators.push(['lrgb', interpolate_lrgb]);

      chroma.average = function(colors, mode) {
        var A, alpha, c, cnt, dx, dy, first, i, l, len, o, xyz, xyz2;
        if (mode == null) {
          mode = 'rgb';
        }
        l = colors.length;
        colors = colors.map(function(c) {
          return chroma(c);
        });
        first = colors.splice(0, 1)[0];
        if (mode === 'lrgb') {
          return _average_lrgb(colors);
        }
        xyz = first.get(mode);
        cnt = [];
        dx = 0;
        dy = 0;
        for (i in xyz) {
          xyz[i] = xyz[i] || 0;
          cnt.push(isNaN(xyz[i]) ? 0 : 1);
          if (mode.charAt(i) === 'h' && !isNaN(xyz[i])) {
            A = xyz[i] / 180 * PI;
            dx += cos(A);
            dy += sin(A);
          }
        }
        alpha = first.alpha();
        for (o = 0, len = colors.length; o < len; o++) {
          c = colors[o];
          xyz2 = c.get(mode);
          alpha += c.alpha();
          for (i in xyz) {
            if (!isNaN(xyz2[i])) {
              cnt[i] += 1;
              if (mode.charAt(i) === 'h') {
                A = xyz2[i] / 180 * PI;
                dx += cos(A);
                dy += sin(A);
              } else {
                xyz[i] += xyz2[i];
              }
            }
          }
        }
        for (i in xyz) {
          if (mode.charAt(i) === 'h') {
            A = atan2(dy / cnt[i], dx / cnt[i]) / PI * 180;
            while (A < 0) {
              A += 360;
            }
            while (A >= 360) {
              A -= 360;
            }
            xyz[i] = A;
          } else {
            xyz[i] = xyz[i] / cnt[i];
          }
        }
        return chroma(xyz, mode).alpha(alpha / l);
      };

      hex2rgb = function(hex) {
        var a, b, g, r, rgb, u;
        if (hex.match(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
          if (hex.length === 4 || hex.length === 7) {
            hex = hex.substr(1);
          }
          if (hex.length === 3) {
            hex = hex.split("");
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
          }
          u = parseInt(hex, 16);
          r = u >> 16;
          g = u >> 8 & 0xFF;
          b = u & 0xFF;
          return [r, g, b, 1];
        }
        if (hex.match(/^#?([A-Fa-f0-9]{8})$/)) {
          if (hex.length === 9) {
            hex = hex.substr(1);
          }
          u = parseInt(hex, 16);
          r = u >> 24 & 0xFF;
          g = u >> 16 & 0xFF;
          b = u >> 8 & 0xFF;
          a = round((u & 0xFF) / 0xFF * 100) / 100;
          return [r, g, b, a];
        }
        if ((_input.css != null) && (rgb = _input.css(hex))) {
          return rgb;
        }
        throw "unknown color: " + hex;
      };

      rgb2hex = function(channels, mode) {
        var a, b, g, hxa, r, str, u;
        if (mode == null) {
          mode = 'rgb';
        }
        r = channels[0], g = channels[1], b = channels[2], a = channels[3];
        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);
        u = r << 16 | g << 8 | b;
        str = "000000" + u.toString(16);
        str = str.substr(str.length - 6);
        hxa = '0' + round(a * 255).toString(16);
        hxa = hxa.substr(hxa.length - 2);
        return "#" + (function() {
          switch (mode.toLowerCase()) {
            case 'rgba':
              return str + hxa;
            case 'argb':
              return hxa + str;
            default:
              return str;
          }
        })();
      };

      _input.hex = function(h) {
        return hex2rgb(h);
      };

      chroma.hex = function() {
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Color, slice.call(arguments).concat(['hex']), function(){});
      };

      Color.prototype.hex = function(mode) {
        if (mode == null) {
          mode = 'rgb';
        }
        return rgb2hex(this._rgb, mode);
      };

      _guess_formats.push({
        p: 4,
        test: function(n) {
          if (arguments.length === 1 && type(n) === "string") {
            return 'hex';
          }
        }
      });

      hsl2rgb = function() {
        var args, b, c, g, h, i, l, o, r, ref, s, t1, t2, t3;
        args = unpack(arguments);
        h = args[0], s = args[1], l = args[2];
        if (s === 0) {
          r = g = b = l * 255;
        } else {
          t3 = [0, 0, 0];
          c = [0, 0, 0];
          t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
          t1 = 2 * l - t2;
          h /= 360;
          t3[0] = h + 1 / 3;
          t3[1] = h;
          t3[2] = h - 1 / 3;
          for (i = o = 0; o <= 2; i = ++o) {
            if (t3[i] < 0) {
              t3[i] += 1;
            }
            if (t3[i] > 1) {
              t3[i] -= 1;
            }
            if (6 * t3[i] < 1) {
              c[i] = t1 + (t2 - t1) * 6 * t3[i];
            } else if (2 * t3[i] < 1) {
              c[i] = t2;
            } else if (3 * t3[i] < 2) {
              c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6;
            } else {
              c[i] = t1;
            }
          }
          ref = [round(c[0] * 255), round(c[1] * 255), round(c[2] * 255)], r = ref[0], g = ref[1], b = ref[2];
        }
        if (args.length > 3) {
          return [r, g, b, args[3]];
        } else {
          return [r, g, b];
        }
      };

      rgb2hsl = function(r, g, b) {
        var h, l, min, ref, s;
        if (r !== void 0 && r.length >= 3) {
          ref = r, r = ref[0], g = ref[1], b = ref[2];
        }
        r /= 255;
        g /= 255;
        b /= 255;
        min = Math.min(r, g, b);
        max = Math.max(r, g, b);
        l = (max + min) / 2;
        if (max === min) {
          s = 0;
          h = Number.NaN;
        } else {
          s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
        }
        if (r === max) {
          h = (g - b) / (max - min);
        } else if (g === max) {
          h = 2 + (b - r) / (max - min);
        } else if (b === max) {
          h = 4 + (r - g) / (max - min);
        }
        h *= 60;
        if (h < 0) {
          h += 360;
        }
        return [h, s, l];
      };

      chroma.hsl = function() {
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Color, slice.call(arguments).concat(['hsl']), function(){});
      };

      _input.hsl = hsl2rgb;

      Color.prototype.hsl = function() {
        return rgb2hsl(this._rgb);
      };

      hsv2rgb = function() {
        var args, b, f, g, h, i, p, q, r, ref, ref1, ref2, ref3, ref4, ref5, s, t, v;
        args = unpack(arguments);
        h = args[0], s = args[1], v = args[2];
        v *= 255;
        if (s === 0) {
          r = g = b = v;
        } else {
          if (h === 360) {
            h = 0;
          }
          if (h > 360) {
            h -= 360;
          }
          if (h < 0) {
            h += 360;
          }
          h /= 60;
          i = floor(h);
          f = h - i;
          p = v * (1 - s);
          q = v * (1 - s * f);
          t = v * (1 - s * (1 - f));
          switch (i) {
            case 0:
              ref = [v, t, p], r = ref[0], g = ref[1], b = ref[2];
              break;
            case 1:
              ref1 = [q, v, p], r = ref1[0], g = ref1[1], b = ref1[2];
              break;
            case 2:
              ref2 = [p, v, t], r = ref2[0], g = ref2[1], b = ref2[2];
              break;
            case 3:
              ref3 = [p, q, v], r = ref3[0], g = ref3[1], b = ref3[2];
              break;
            case 4:
              ref4 = [t, p, v], r = ref4[0], g = ref4[1], b = ref4[2];
              break;
            case 5:
              ref5 = [v, p, q], r = ref5[0], g = ref5[1], b = ref5[2];
          }
        }
        return [r, g, b, args.length > 3 ? args[3] : 1];
      };

      rgb2hsv = function() {
        var b, delta, g, h, min, r, ref, s, v;
        ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
        min = Math.min(r, g, b);
        max = Math.max(r, g, b);
        delta = max - min;
        v = max / 255.0;
        if (max === 0) {
          h = Number.NaN;
          s = 0;
        } else {
          s = delta / max;
          if (r === max) {
            h = (g - b) / delta;
          }
          if (g === max) {
            h = 2 + (b - r) / delta;
          }
          if (b === max) {
            h = 4 + (r - g) / delta;
          }
          h *= 60;
          if (h < 0) {
            h += 360;
          }
        }
        return [h, s, v];
      };

      chroma.hsv = function() {
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Color, slice.call(arguments).concat(['hsv']), function(){});
      };

      _input.hsv = hsv2rgb;

      Color.prototype.hsv = function() {
        return rgb2hsv(this._rgb);
      };

      num2rgb = function(num) {
        var b, g, r;
        if (type(num) === "number" && num >= 0 && num <= 0xFFFFFF) {
          r = num >> 16;
          g = (num >> 8) & 0xFF;
          b = num & 0xFF;
          return [r, g, b, 1];
        }
        console.warn("unknown num color: " + num);
        return [0, 0, 0, 1];
      };

      rgb2num = function() {
        var b, g, r, ref;
        ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
        return (r << 16) + (g << 8) + b;
      };

      chroma.num = function(num) {
        return new Color(num, 'num');
      };

      Color.prototype.num = function(mode) {
        if (mode == null) {
          mode = 'rgb';
        }
        return rgb2num(this._rgb, mode);
      };

      _input.num = num2rgb;

      _guess_formats.push({
        p: 1,
        test: function(n) {
          if (arguments.length === 1 && type(n) === "number" && n >= 0 && n <= 0xFFFFFF) {
            return 'num';
          }
        }
      });

      hcg2rgb = function() {
        var _c, _g, args, b, c, f, g, h, i, p, q, r, ref, ref1, ref2, ref3, ref4, ref5, t, v;
        args = unpack(arguments);
        h = args[0], c = args[1], _g = args[2];
        c = c / 100;
        g = g / 100 * 255;
        _c = c * 255;
        if (c === 0) {
          r = g = b = _g;
        } else {
          if (h === 360) {
            h = 0;
          }
          if (h > 360) {
            h -= 360;
          }
          if (h < 0) {
            h += 360;
          }
          h /= 60;
          i = floor(h);
          f = h - i;
          p = _g * (1 - c);
          q = p + _c * (1 - f);
          t = p + _c * f;
          v = p + _c;
          switch (i) {
            case 0:
              ref = [v, t, p], r = ref[0], g = ref[1], b = ref[2];
              break;
            case 1:
              ref1 = [q, v, p], r = ref1[0], g = ref1[1], b = ref1[2];
              break;
            case 2:
              ref2 = [p, v, t], r = ref2[0], g = ref2[1], b = ref2[2];
              break;
            case 3:
              ref3 = [p, q, v], r = ref3[0], g = ref3[1], b = ref3[2];
              break;
            case 4:
              ref4 = [t, p, v], r = ref4[0], g = ref4[1], b = ref4[2];
              break;
            case 5:
              ref5 = [v, p, q], r = ref5[0], g = ref5[1], b = ref5[2];
          }
        }
        return [r, g, b, args.length > 3 ? args[3] : 1];
      };

      rgb2hcg = function() {
        var _g, b, c, delta, g, h, min, r, ref;
        ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
        min = Math.min(r, g, b);
        max = Math.max(r, g, b);
        delta = max - min;
        c = delta * 100 / 255;
        _g = min / (255 - delta) * 100;
        if (delta === 0) {
          h = Number.NaN;
        } else {
          if (r === max) {
            h = (g - b) / delta;
          }
          if (g === max) {
            h = 2 + (b - r) / delta;
          }
          if (b === max) {
            h = 4 + (r - g) / delta;
          }
          h *= 60;
          if (h < 0) {
            h += 360;
          }
        }
        return [h, c, _g];
      };

      chroma.hcg = function() {
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Color, slice.call(arguments).concat(['hcg']), function(){});
      };

      _input.hcg = hcg2rgb;

      Color.prototype.hcg = function() {
        return rgb2hcg(this._rgb);
      };

      css2rgb = function(css) {
        var aa, ab, hsl, i, m, o, rgb, w;
        css = css.toLowerCase();
        if ((chroma.colors != null) && chroma.colors[css]) {
          return hex2rgb(chroma.colors[css]);
        }
        if (m = css.match(/rgb\(\s*(\-?\d+),\s*(\-?\d+)\s*,\s*(\-?\d+)\s*\)/)) {
          rgb = m.slice(1, 4);
          for (i = o = 0; o <= 2; i = ++o) {
            rgb[i] = +rgb[i];
          }
          rgb[3] = 1;
        } else if (m = css.match(/rgba\(\s*(\-?\d+),\s*(\-?\d+)\s*,\s*(\-?\d+)\s*,\s*([01]|[01]?\.\d+)\)/)) {
          rgb = m.slice(1, 5);
          for (i = w = 0; w <= 3; i = ++w) {
            rgb[i] = +rgb[i];
          }
        } else if (m = css.match(/rgb\(\s*(\-?\d+(?:\.\d+)?)%,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*\)/)) {
          rgb = m.slice(1, 4);
          for (i = aa = 0; aa <= 2; i = ++aa) {
            rgb[i] = round(rgb[i] * 2.55);
          }
          rgb[3] = 1;
        } else if (m = css.match(/rgba\(\s*(\-?\d+(?:\.\d+)?)%,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)/)) {
          rgb = m.slice(1, 5);
          for (i = ab = 0; ab <= 2; i = ++ab) {
            rgb[i] = round(rgb[i] * 2.55);
          }
          rgb[3] = +rgb[3];
        } else if (m = css.match(/hsl\(\s*(\-?\d+(?:\.\d+)?),\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*\)/)) {
          hsl = m.slice(1, 4);
          hsl[1] *= 0.01;
          hsl[2] *= 0.01;
          rgb = hsl2rgb(hsl);
          rgb[3] = 1;
        } else if (m = css.match(/hsla\(\s*(\-?\d+(?:\.\d+)?),\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)/)) {
          hsl = m.slice(1, 4);
          hsl[1] *= 0.01;
          hsl[2] *= 0.01;
          rgb = hsl2rgb(hsl);
          rgb[3] = +m[4];
        }
        return rgb;
      };

      rgb2css = function(rgba) {
        var mode;
        mode = rgba[3] < 1 ? 'rgba' : 'rgb';
        if (mode === 'rgb') {
          return mode + '(' + rgba.slice(0, 3).map(round).join(',') + ')';
        } else if (mode === 'rgba') {
          return mode + '(' + rgba.slice(0, 3).map(round).join(',') + ',' + rgba[3] + ')';
        }
      };

      rnd = function(a) {
        return round(a * 100) / 100;
      };

      hsl2css = function(hsl, alpha) {
        var mode;
        mode = alpha < 1 ? 'hsla' : 'hsl';
        hsl[0] = rnd(hsl[0] || 0);
        hsl[1] = rnd(hsl[1] * 100) + '%';
        hsl[2] = rnd(hsl[2] * 100) + '%';
        if (mode === 'hsla') {
          hsl[3] = alpha;
        }
        return mode + '(' + hsl.join(',') + ')';
      };

      _input.css = function(h) {
        return css2rgb(h);
      };

      chroma.css = function() {
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Color, slice.call(arguments).concat(['css']), function(){});
      };

      Color.prototype.css = function(mode) {
        if (mode == null) {
          mode = 'rgb';
        }
        if (mode.slice(0, 3) === 'rgb') {
          return rgb2css(this._rgb);
        } else if (mode.slice(0, 3) === 'hsl') {
          return hsl2css(this.hsl(), this.alpha());
        }
      };

      _input.named = function(name) {
        return hex2rgb(w3cx11[name]);
      };

      _guess_formats.push({
        p: 5,
        test: function(n) {
          if (arguments.length === 1 && (w3cx11[n] != null)) {
            return 'named';
          }
        }
      });

      Color.prototype.name = function(n) {
        var h, k;
        if (arguments.length) {
          if (w3cx11[n]) {
            this._rgb = hex2rgb(w3cx11[n]);
          }
          this._rgb[3] = 1;
        }
        h = this.hex();
        for (k in w3cx11) {
          if (h === w3cx11[k]) {
            return k;
          }
        }
        return h;
      };

      lch2lab = function() {

        /*
        Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
        These formulas were invented by David Dalrymple to obtain maximum contrast without going
        out of gamut if the parameters are in the range 0-1.
        
        A saturation multiplier was added by Gregor Aisch
         */
        var c, h, l, ref;
        ref = unpack(arguments), l = ref[0], c = ref[1], h = ref[2];
        h = h * DEG2RAD;
        return [l, cos(h) * c, sin(h) * c];
      };

      lch2rgb = function() {
        var L, a, args, b, c, g, h, l, r, ref, ref1;
        args = unpack(arguments);
        l = args[0], c = args[1], h = args[2];
        ref = lch2lab(l, c, h), L = ref[0], a = ref[1], b = ref[2];
        ref1 = lab2rgb(L, a, b), r = ref1[0], g = ref1[1], b = ref1[2];
        return [r, g, b, args.length > 3 ? args[3] : 1];
      };

      lab2lch = function() {
        var a, b, c, h, l, ref;
        ref = unpack(arguments), l = ref[0], a = ref[1], b = ref[2];
        c = sqrt(a * a + b * b);
        h = (atan2(b, a) * RAD2DEG + 360) % 360;
        if (round(c * 10000) === 0) {
          h = Number.NaN;
        }
        return [l, c, h];
      };

      rgb2lch = function() {
        var a, b, g, l, r, ref, ref1;
        ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
        ref1 = rgb2lab(r, g, b), l = ref1[0], a = ref1[1], b = ref1[2];
        return lab2lch(l, a, b);
      };

      chroma.lch = function() {
        var args;
        args = unpack(arguments);
        return new Color(args, 'lch');
      };

      chroma.hcl = function() {
        var args;
        args = unpack(arguments);
        return new Color(args, 'hcl');
      };

      _input.lch = lch2rgb;

      _input.hcl = function() {
        var c, h, l, ref;
        ref = unpack(arguments), h = ref[0], c = ref[1], l = ref[2];
        return lch2rgb([l, c, h]);
      };

      Color.prototype.lch = function() {
        return rgb2lch(this._rgb);
      };

      Color.prototype.hcl = function() {
        return rgb2lch(this._rgb).reverse();
      };

      rgb2cmyk = function(mode) {
        var b, c, f, g, k, m, r, ref, y;
        if (mode == null) {
          mode = 'rgb';
        }
        ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
        r = r / 255;
        g = g / 255;
        b = b / 255;
        k = 1 - Math.max(r, Math.max(g, b));
        f = k < 1 ? 1 / (1 - k) : 0;
        c = (1 - r - k) * f;
        m = (1 - g - k) * f;
        y = (1 - b - k) * f;
        return [c, m, y, k];
      };

      cmyk2rgb = function() {
        var alpha, args, b, c, g, k, m, r, y;
        args = unpack(arguments);
        c = args[0], m = args[1], y = args[2], k = args[3];
        alpha = args.length > 4 ? args[4] : 1;
        if (k === 1) {
          return [0, 0, 0, alpha];
        }
        r = c >= 1 ? 0 : 255 * (1 - c) * (1 - k);
        g = m >= 1 ? 0 : 255 * (1 - m) * (1 - k);
        b = y >= 1 ? 0 : 255 * (1 - y) * (1 - k);
        return [r, g, b, alpha];
      };

      _input.cmyk = function() {
        return cmyk2rgb(unpack(arguments));
      };

      chroma.cmyk = function() {
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Color, slice.call(arguments).concat(['cmyk']), function(){});
      };

      Color.prototype.cmyk = function() {
        return rgb2cmyk(this._rgb);
      };

      _input.gl = function() {
        var i, k, o, rgb, v;
        rgb = (function() {
          var ref, results;
          ref = unpack(arguments);
          results = [];
          for (k in ref) {
            v = ref[k];
            results.push(v);
          }
          return results;
        }).apply(this, arguments);
        for (i = o = 0; o <= 2; i = ++o) {
          rgb[i] *= 255;
        }
        return rgb;
      };

      chroma.gl = function() {
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Color, slice.call(arguments).concat(['gl']), function(){});
      };

      Color.prototype.gl = function() {
        var rgb;
        rgb = this._rgb;
        return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, rgb[3]];
      };

      rgb2luminance = function(r, g, b) {
        var ref;
        ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
        r = luminance_x(r);
        g = luminance_x(g);
        b = luminance_x(b);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };

      luminance_x = function(x) {
        x /= 255;
        if (x <= 0.03928) {
          return x / 12.92;
        } else {
          return pow((x + 0.055) / 1.055, 2.4);
        }
      };

      interpolate_rgb = function(col1, col2, f, m) {
        var xyz0, xyz1;
        xyz0 = col1._rgb;
        xyz1 = col2._rgb;
        return new Color(xyz0[0] + f * (xyz1[0] - xyz0[0]), xyz0[1] + f * (xyz1[1] - xyz0[1]), xyz0[2] + f * (xyz1[2] - xyz0[2]), m);
      };

      _interpolators.push(['rgb', interpolate_rgb]);

      Color.prototype.luminance = function(lum, mode) {
        var cur_lum, eps, max_iter, rgba, test;
        if (mode == null) {
          mode = 'rgb';
        }
        if (!arguments.length) {
          return rgb2luminance(this._rgb);
        }
        rgba = this._rgb;
        if (lum === 0) {
          rgba = [0, 0, 0, this._rgb[3]];
        } else if (lum === 1) {
          rgba = [255, 255, 255, this[3]];
        } else {
          cur_lum = rgb2luminance(this._rgb);
          eps = 1e-7;
          max_iter = 20;
          test = function(l, h) {
            var lm, m;
            m = l.interpolate(h, 0.5, mode);
            lm = m.luminance();
            if (Math.abs(lum - lm) < eps || !max_iter--) {
              return m;
            }
            if (lm > lum) {
              return test(l, m);
            }
            return test(m, h);
          };
          if (cur_lum > lum) {
            rgba = test(chroma('black'), this).rgba();
          } else {
            rgba = test(this, chroma('white')).rgba();
          }
        }
        return chroma(rgba).alpha(this.alpha());
      };

      temperature2rgb = function(kelvin) {
        var b, g, r, temp;
        temp = kelvin / 100;
        if (temp < 66) {
          r = 255;
          g = -155.25485562709179 - 0.44596950469579133 * (g = temp - 2) + 104.49216199393888 * log(g);
          b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp - 10) + 115.67994401066147 * log(b);
        } else {
          r = 351.97690566805693 + 0.114206453784165 * (r = temp - 55) - 40.25366309332127 * log(r);
          g = 325.4494125711974 + 0.07943456536662342 * (g = temp - 50) - 28.0852963507957 * log(g);
          b = 255;
        }
        return [r, g, b];
      };

      rgb2temperature = function() {
        var b, eps, g, maxTemp, minTemp, r, ref, rgb, temp;
        ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
        minTemp = 1000;
        maxTemp = 40000;
        eps = 0.4;
        while (maxTemp - minTemp > eps) {
          temp = (maxTemp + minTemp) * 0.5;
          rgb = temperature2rgb(temp);
          if ((rgb[2] / rgb[0]) >= (b / r)) {
            maxTemp = temp;
          } else {
            minTemp = temp;
          }
        }
        return round(temp);
      };

      chroma.temperature = chroma.kelvin = function() {
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Color, slice.call(arguments).concat(['temperature']), function(){});
      };

      _input.temperature = _input.kelvin = _input.K = temperature2rgb;

      Color.prototype.temperature = function() {
        return rgb2temperature(this._rgb);
      };

      Color.prototype.kelvin = Color.prototype.temperature;

      chroma.contrast = function(a, b) {
        var l1, l2, ref, ref1;
        if ((ref = type(a)) === 'string' || ref === 'number') {
          a = new Color(a);
        }
        if ((ref1 = type(b)) === 'string' || ref1 === 'number') {
          b = new Color(b);
        }
        l1 = a.luminance();
        l2 = b.luminance();
        if (l1 > l2) {
          return (l1 + 0.05) / (l2 + 0.05);
        } else {
          return (l2 + 0.05) / (l1 + 0.05);
        }
      };

      chroma.distance = function(a, b, mode) {
        var d, i, l1, l2, ref, ref1, sum_sq;
        if (mode == null) {
          mode = 'lab';
        }
        if ((ref = type(a)) === 'string' || ref === 'number') {
          a = new Color(a);
        }
        if ((ref1 = type(b)) === 'string' || ref1 === 'number') {
          b = new Color(b);
        }
        l1 = a.get(mode);
        l2 = b.get(mode);
        sum_sq = 0;
        for (i in l1) {
          d = (l1[i] || 0) - (l2[i] || 0);
          sum_sq += d * d;
        }
        return Math.sqrt(sum_sq);
      };

      chroma.deltaE = function(a, b, L, C) {
        var L1, L2, a1, a2, b1, b2, c1, c2, c4, dH2, delA, delB, delC, delL, f, h1, ref, ref1, ref2, ref3, sc, sh, sl, t, v1, v2, v3;
        if (L == null) {
          L = 1;
        }
        if (C == null) {
          C = 1;
        }
        if ((ref = type(a)) === 'string' || ref === 'number') {
          a = new Color(a);
        }
        if ((ref1 = type(b)) === 'string' || ref1 === 'number') {
          b = new Color(b);
        }
        ref2 = a.lab(), L1 = ref2[0], a1 = ref2[1], b1 = ref2[2];
        ref3 = b.lab(), L2 = ref3[0], a2 = ref3[1], b2 = ref3[2];
        c1 = sqrt(a1 * a1 + b1 * b1);
        c2 = sqrt(a2 * a2 + b2 * b2);
        sl = L1 < 16.0 ? 0.511 : (0.040975 * L1) / (1.0 + 0.01765 * L1);
        sc = (0.0638 * c1) / (1.0 + 0.0131 * c1) + 0.638;
        h1 = c1 < 0.000001 ? 0.0 : (atan2(b1, a1) * 180.0) / PI;
        while (h1 < 0) {
          h1 += 360;
        }
        while (h1 >= 360) {
          h1 -= 360;
        }
        t = (h1 >= 164.0) && (h1 <= 345.0) ? 0.56 + abs(0.2 * cos((PI * (h1 + 168.0)) / 180.0)) : 0.36 + abs(0.4 * cos((PI * (h1 + 35.0)) / 180.0));
        c4 = c1 * c1 * c1 * c1;
        f = sqrt(c4 / (c4 + 1900.0));
        sh = sc * (f * t + 1.0 - f);
        delL = L1 - L2;
        delC = c1 - c2;
        delA = a1 - a2;
        delB = b1 - b2;
        dH2 = delA * delA + delB * delB - delC * delC;
        v1 = delL / (L * sl);
        v2 = delC / (C * sc);
        v3 = sh;
        return sqrt(v1 * v1 + v2 * v2 + (dH2 / (v3 * v3)));
      };

      Color.prototype.get = function(modechan) {
        var channel, i, me, mode, ref, src;
        me = this;
        ref = modechan.split('.'), mode = ref[0], channel = ref[1];
        src = me[mode]();
        if (channel) {
          i = mode.indexOf(channel);
          if (i > -1) {
            return src[i];
          } else {
            return console.warn('unknown channel ' + channel + ' in mode ' + mode);
          }
        } else {
          return src;
        }
      };

      Color.prototype.set = function(modechan, value) {
        var channel, i, me, mode, ref, src;
        me = this;
        ref = modechan.split('.'), mode = ref[0], channel = ref[1];
        if (channel) {
          src = me[mode]();
          i = mode.indexOf(channel);
          if (i > -1) {
            if (type(value) === 'string') {
              switch (value.charAt(0)) {
                case '+':
                  src[i] += +value;
                  break;
                case '-':
                  src[i] += +value;
                  break;
                case '*':
                  src[i] *= +(value.substr(1));
                  break;
                case '/':
                  src[i] /= +(value.substr(1));
                  break;
                default:
                  src[i] = +value;
              }
            } else {
              src[i] = value;
            }
          } else {
            console.warn('unknown channel ' + channel + ' in mode ' + mode);
          }
        } else {
          src = value;
        }
        return chroma(src, mode).alpha(me.alpha());
      };

      Color.prototype.clipped = function() {
        return this._rgb._clipped || false;
      };

      Color.prototype.alpha = function(a) {
        if (arguments.length) {
          return chroma.rgb([this._rgb[0], this._rgb[1], this._rgb[2], a]);
        }
        return this._rgb[3];
      };

      Color.prototype.darken = function(amount) {
        var lab, me;
        if (amount == null) {
          amount = 1;
        }
        me = this;
        lab = me.lab();
        lab[0] -= LAB_CONSTANTS.Kn * amount;
        return chroma.lab(lab).alpha(me.alpha());
      };

      Color.prototype.brighten = function(amount) {
        if (amount == null) {
          amount = 1;
        }
        return this.darken(-amount);
      };

      Color.prototype.darker = Color.prototype.darken;

      Color.prototype.brighter = Color.prototype.brighten;

      Color.prototype.saturate = function(amount) {
        var lch, me;
        if (amount == null) {
          amount = 1;
        }
        me = this;
        lch = me.lch();
        lch[1] += amount * LAB_CONSTANTS.Kn;
        if (lch[1] < 0) {
          lch[1] = 0;
        }
        return chroma.lch(lch).alpha(me.alpha());
      };

      Color.prototype.desaturate = function(amount) {
        if (amount == null) {
          amount = 1;
        }
        return this.saturate(-amount);
      };

      Color.prototype.premultiply = function() {
        var a, rgb;
        rgb = this.rgb();
        a = this.alpha();
        return chroma(rgb[0] * a, rgb[1] * a, rgb[2] * a, a);
      };

      blend = function(bottom, top, mode) {
        if (!blend[mode]) {
          throw 'unknown blend mode ' + mode;
        }
        return blend[mode](bottom, top);
      };

      blend_f = function(f) {
        return function(bottom, top) {
          var c0, c1;
          c0 = chroma(top).rgb();
          c1 = chroma(bottom).rgb();
          return chroma(f(c0, c1), 'rgb');
        };
      };

      each = function(f) {
        return function(c0, c1) {
          var i, o, out;
          out = [];
          for (i = o = 0; o <= 3; i = ++o) {
            out[i] = f(c0[i], c1[i]);
          }
          return out;
        };
      };

      normal = function(a, b) {
        return a;
      };

      multiply = function(a, b) {
        return a * b / 255;
      };

      darken = function(a, b) {
        if (a > b) {
          return b;
        } else {
          return a;
        }
      };

      lighten = function(a, b) {
        if (a > b) {
          return a;
        } else {
          return b;
        }
      };

      screen = function(a, b) {
        return 255 * (1 - (1 - a / 255) * (1 - b / 255));
      };

      overlay = function(a, b) {
        if (b < 128) {
          return 2 * a * b / 255;
        } else {
          return 255 * (1 - 2 * (1 - a / 255) * (1 - b / 255));
        }
      };

      burn = function(a, b) {
        return 255 * (1 - (1 - b / 255) / (a / 255));
      };

      dodge = function(a, b) {
        if (a === 255) {
          return 255;
        }
        a = 255 * (b / 255) / (1 - a / 255);
        if (a > 255) {
          return 255;
        } else {
          return a;
        }
      };

      blend.normal = blend_f(each(normal));

      blend.multiply = blend_f(each(multiply));

      blend.screen = blend_f(each(screen));

      blend.overlay = blend_f(each(overlay));

      blend.darken = blend_f(each(darken));

      blend.lighten = blend_f(each(lighten));

      blend.dodge = blend_f(each(dodge));

      blend.burn = blend_f(each(burn));

      chroma.blend = blend;

      chroma.analyze = function(data) {
        var len, o, r, val;
        r = {
          min: Number.MAX_VALUE,
          max: Number.MAX_VALUE * -1,
          sum: 0,
          values: [],
          count: 0
        };
        for (o = 0, len = data.length; o < len; o++) {
          val = data[o];
          if ((val != null) && !isNaN(val)) {
            r.values.push(val);
            r.sum += val;
            if (val < r.min) {
              r.min = val;
            }
            if (val > r.max) {
              r.max = val;
            }
            r.count += 1;
          }
        }
        r.domain = [r.min, r.max];
        r.limits = function(mode, num) {
          return chroma.limits(r, mode, num);
        };
        return r;
      };

      chroma.scale = function(colors, positions) {
        var _classes, _colorCache, _colors, _correctLightness, _domain, _gamma, _max, _min, _mode, _nacol, _out, _padding, _pos, _spread, _useCache, f, getClass, getColor, resetCache, setColors, tmap;
        _mode = 'rgb';
        _nacol = chroma('#ccc');
        _spread = 0;
        _domain = [0, 1];
        _pos = [];
        _padding = [0, 0];
        _classes = false;
        _colors = [];
        _out = false;
        _min = 0;
        _max = 1;
        _correctLightness = false;
        _colorCache = {};
        _useCache = true;
        _gamma = 1;
        setColors = function(colors) {
          var c, col, o, ref, ref1, w;
          if (colors == null) {
            colors = ['#fff', '#000'];
          }
          if ((colors != null) && type(colors) === 'string' && (chroma.brewer != null)) {
            colors = chroma.brewer[colors] || chroma.brewer[colors.toLowerCase()] || colors;
          }
          if (type(colors) === 'array') {
            colors = colors.slice(0);
            for (c = o = 0, ref = colors.length - 1; 0 <= ref ? o <= ref : o >= ref; c = 0 <= ref ? ++o : --o) {
              col = colors[c];
              if (type(col) === "string") {
                colors[c] = chroma(col);
              }
            }
            _pos.length = 0;
            for (c = w = 0, ref1 = colors.length - 1; 0 <= ref1 ? w <= ref1 : w >= ref1; c = 0 <= ref1 ? ++w : --w) {
              _pos.push(c / (colors.length - 1));
            }
          }
          resetCache();
          return _colors = colors;
        };
        getClass = function(value) {
          var i, n;
          if (_classes != null) {
            n = _classes.length - 1;
            i = 0;
            while (i < n && value >= _classes[i]) {
              i++;
            }
            return i - 1;
          }
          return 0;
        };
        tmap = function(t) {
          return t;
        };
        getColor = function(val, bypassMap) {
          var c, col, i, k, o, p, ref, t;
          if (bypassMap == null) {
            bypassMap = false;
          }
          if (isNaN(val)) {
            return _nacol;
          }
          if (!bypassMap) {
            if (_classes && _classes.length > 2) {
              c = getClass(val);
              t = c / (_classes.length - 2);
            } else if (_max !== _min) {
              t = (val - _min) / (_max - _min);
            } else {
              t = 1;
            }
          } else {
            t = val;
          }
          if (!bypassMap) {
            t = tmap(t);
          }
          if (_gamma !== 1) {
            t = pow(t, _gamma);
          }
          t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));
          t = Math.min(1, Math.max(0, t));
          k = Math.floor(t * 10000);
          if (_useCache && _colorCache[k]) {
            col = _colorCache[k];
          } else {
            if (type(_colors) === 'array') {
              for (i = o = 0, ref = _pos.length - 1; 0 <= ref ? o <= ref : o >= ref; i = 0 <= ref ? ++o : --o) {
                p = _pos[i];
                if (t <= p) {
                  col = _colors[i];
                  break;
                }
                if (t >= p && i === _pos.length - 1) {
                  col = _colors[i];
                  break;
                }
                if (t > p && t < _pos[i + 1]) {
                  t = (t - p) / (_pos[i + 1] - p);
                  col = chroma.interpolate(_colors[i], _colors[i + 1], t, _mode);
                  break;
                }
              }
            } else if (type(_colors) === 'function') {
              col = _colors(t);
            }
            if (_useCache) {
              _colorCache[k] = col;
            }
          }
          return col;
        };
        resetCache = function() {
          return _colorCache = {};
        };
        setColors(colors);
        f = function(v) {
          var c;
          c = chroma(getColor(v));
          if (_out && c[_out]) {
            return c[_out]();
          } else {
            return c;
          }
        };
        f.classes = function(classes) {
          var d;
          if (classes != null) {
            if (type(classes) === 'array') {
              _classes = classes;
              _domain = [classes[0], classes[classes.length - 1]];
            } else {
              d = chroma.analyze(_domain);
              if (classes === 0) {
                _classes = [d.min, d.max];
              } else {
                _classes = chroma.limits(d, 'e', classes);
              }
            }
            return f;
          }
          return _classes;
        };
        f.domain = function(domain) {
          var c, d, k, len, o, ref, w;
          if (!arguments.length) {
            return _domain;
          }
          _min = domain[0];
          _max = domain[domain.length - 1];
          _pos = [];
          k = _colors.length;
          if (domain.length === k && _min !== _max) {
            for (o = 0, len = domain.length; o < len; o++) {
              d = domain[o];
              _pos.push((d - _min) / (_max - _min));
            }
          } else {
            for (c = w = 0, ref = k - 1; 0 <= ref ? w <= ref : w >= ref; c = 0 <= ref ? ++w : --w) {
              _pos.push(c / (k - 1));
            }
          }
          _domain = [_min, _max];
          return f;
        };
        f.mode = function(_m) {
          if (!arguments.length) {
            return _mode;
          }
          _mode = _m;
          resetCache();
          return f;
        };
        f.range = function(colors, _pos) {
          setColors(colors, _pos);
          return f;
        };
        f.out = function(_o) {
          _out = _o;
          return f;
        };
        f.spread = function(val) {
          if (!arguments.length) {
            return _spread;
          }
          _spread = val;
          return f;
        };
        f.correctLightness = function(v) {
          if (v == null) {
            v = true;
          }
          _correctLightness = v;
          resetCache();
          if (_correctLightness) {
            tmap = function(t) {
              var L0, L1, L_actual, L_diff, L_ideal, max_iter, pol, t0, t1;
              L0 = getColor(0, true).lab()[0];
              L1 = getColor(1, true).lab()[0];
              pol = L0 > L1;
              L_actual = getColor(t, true).lab()[0];
              L_ideal = L0 + (L1 - L0) * t;
              L_diff = L_actual - L_ideal;
              t0 = 0;
              t1 = 1;
              max_iter = 20;
              while (Math.abs(L_diff) > 1e-2 && max_iter-- > 0) {
                (function() {
                  if (pol) {
                    L_diff *= -1;
                  }
                  if (L_diff < 0) {
                    t0 = t;
                    t += (t1 - t) * 0.5;
                  } else {
                    t1 = t;
                    t += (t0 - t) * 0.5;
                  }
                  L_actual = getColor(t, true).lab()[0];
                  return L_diff = L_actual - L_ideal;
                })();
              }
              return t;
            };
          } else {
            tmap = function(t) {
              return t;
            };
          }
          return f;
        };
        f.padding = function(p) {
          if (p != null) {
            if (type(p) === 'number') {
              p = [p, p];
            }
            _padding = p;
            return f;
          } else {
            return _padding;
          }
        };
        f.colors = function(numColors, out) {
          var dd, dm, i, ref, result, results, samples, w;
          if (arguments.length < 2) {
            out = 'hex';
          }
          result = [];
          if (arguments.length === 0) {
            result = _colors.slice(0);
          } else if (numColors === 1) {
            result = [f(0.5)];
          } else if (numColors > 1) {
            dm = _domain[0];
            dd = _domain[1] - dm;
            result = (function() {
              results = [];
              for (var o = 0; 0 <= numColors ? o < numColors : o > numColors; 0 <= numColors ? o++ : o--){ results.push(o); }
              return results;
            }).apply(this).map(function(i) {
              return f(dm + i / (numColors - 1) * dd);
            });
          } else {
            colors = [];
            samples = [];
            if (_classes && _classes.length > 2) {
              for (i = w = 1, ref = _classes.length; 1 <= ref ? w < ref : w > ref; i = 1 <= ref ? ++w : --w) {
                samples.push((_classes[i - 1] + _classes[i]) * 0.5);
              }
            } else {
              samples = _domain;
            }
            result = samples.map(function(v) {
              return f(v);
            });
          }
          if (chroma[out]) {
            result = result.map(function(c) {
              return c[out]();
            });
          }
          return result;
        };
        f.cache = function(c) {
          if (c != null) {
            _useCache = c;
            return f;
          } else {
            return _useCache;
          }
        };
        f.gamma = function(g) {
          if (g != null) {
            _gamma = g;
            return f;
          } else {
            return _gamma;
          }
        };
        return f;
      };

      if (chroma.scales == null) {
        chroma.scales = {};
      }

      chroma.scales.cool = function() {
        return chroma.scale([chroma.hsl(180, 1, .9), chroma.hsl(250, .7, .4)]);
      };

      chroma.scales.hot = function() {
        return chroma.scale(['#000', '#f00', '#ff0', '#fff'], [0, .25, .75, 1]).mode('rgb');
      };

      chroma.analyze = function(data, key, filter) {
        var add, k, len, o, r, val, visit;
        r = {
          min: Number.MAX_VALUE,
          max: Number.MAX_VALUE * -1,
          sum: 0,
          values: [],
          count: 0
        };
        if (filter == null) {
          filter = function() {
            return true;
          };
        }
        add = function(val) {
          if ((val != null) && !isNaN(val)) {
            r.values.push(val);
            r.sum += val;
            if (val < r.min) {
              r.min = val;
            }
            if (val > r.max) {
              r.max = val;
            }
            r.count += 1;
          }
        };
        visit = function(val, k) {
          if (filter(val, k)) {
            if ((key != null) && type(key) === 'function') {
              return add(key(val));
            } else if ((key != null) && type(key) === 'string' || type(key) === 'number') {
              return add(val[key]);
            } else {
              return add(val);
            }
          }
        };
        if (type(data) === 'array') {
          for (o = 0, len = data.length; o < len; o++) {
            val = data[o];
            visit(val);
          }
        } else {
          for (k in data) {
            val = data[k];
            visit(val, k);
          }
        }
        r.domain = [r.min, r.max];
        r.limits = function(mode, num) {
          return chroma.limits(r, mode, num);
        };
        return r;
      };

      chroma.limits = function(data, mode, num) {
        var aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al, am, assignments, best, centroids, cluster, clusterSizes, dist, i, j, kClusters, limits, max_log, min, min_log, mindist, n, nb_iters, newCentroids, o, p, pb, pr, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, repeat, sum, tmpKMeansBreaks, v, value, values, w;
        if (mode == null) {
          mode = 'equal';
        }
        if (num == null) {
          num = 7;
        }
        if (type(data) === 'array') {
          data = chroma.analyze(data);
        }
        min = data.min;
        max = data.max;
        sum = data.sum;
        values = data.values.sort(function(a, b) {
          return a - b;
        });
        if (num === 1) {
          return [min, max];
        }
        limits = [];
        if (mode.substr(0, 1) === 'c') {
          limits.push(min);
          limits.push(max);
        }
        if (mode.substr(0, 1) === 'e') {
          limits.push(min);
          for (i = o = 1, ref = num - 1; 1 <= ref ? o <= ref : o >= ref; i = 1 <= ref ? ++o : --o) {
            limits.push(min + (i / num) * (max - min));
          }
          limits.push(max);
        } else if (mode.substr(0, 1) === 'l') {
          if (min <= 0) {
            throw 'Logarithmic scales are only possible for values > 0';
          }
          min_log = Math.LOG10E * log(min);
          max_log = Math.LOG10E * log(max);
          limits.push(min);
          for (i = w = 1, ref1 = num - 1; 1 <= ref1 ? w <= ref1 : w >= ref1; i = 1 <= ref1 ? ++w : --w) {
            limits.push(pow(10, min_log + (i / num) * (max_log - min_log)));
          }
          limits.push(max);
        } else if (mode.substr(0, 1) === 'q') {
          limits.push(min);
          for (i = aa = 1, ref2 = num - 1; 1 <= ref2 ? aa <= ref2 : aa >= ref2; i = 1 <= ref2 ? ++aa : --aa) {
            p = (values.length - 1) * i / num;
            pb = floor(p);
            if (pb === p) {
              limits.push(values[pb]);
            } else {
              pr = p - pb;
              limits.push(values[pb] * (1 - pr) + values[pb + 1] * pr);
            }
          }
          limits.push(max);
        } else if (mode.substr(0, 1) === 'k') {

          /*
          implementation based on
          http://code.google.com/p/figue/source/browse/trunk/figue.js#336
          simplified for 1-d input values
           */
          n = values.length;
          assignments = new Array(n);
          clusterSizes = new Array(num);
          repeat = true;
          nb_iters = 0;
          centroids = null;
          centroids = [];
          centroids.push(min);
          for (i = ab = 1, ref3 = num - 1; 1 <= ref3 ? ab <= ref3 : ab >= ref3; i = 1 <= ref3 ? ++ab : --ab) {
            centroids.push(min + (i / num) * (max - min));
          }
          centroids.push(max);
          while (repeat) {
            for (j = ac = 0, ref4 = num - 1; 0 <= ref4 ? ac <= ref4 : ac >= ref4; j = 0 <= ref4 ? ++ac : --ac) {
              clusterSizes[j] = 0;
            }
            for (i = ad = 0, ref5 = n - 1; 0 <= ref5 ? ad <= ref5 : ad >= ref5; i = 0 <= ref5 ? ++ad : --ad) {
              value = values[i];
              mindist = Number.MAX_VALUE;
              for (j = ae = 0, ref6 = num - 1; 0 <= ref6 ? ae <= ref6 : ae >= ref6; j = 0 <= ref6 ? ++ae : --ae) {
                dist = abs(centroids[j] - value);
                if (dist < mindist) {
                  mindist = dist;
                  best = j;
                }
              }
              clusterSizes[best]++;
              assignments[i] = best;
            }
            newCentroids = new Array(num);
            for (j = af = 0, ref7 = num - 1; 0 <= ref7 ? af <= ref7 : af >= ref7; j = 0 <= ref7 ? ++af : --af) {
              newCentroids[j] = null;
            }
            for (i = ag = 0, ref8 = n - 1; 0 <= ref8 ? ag <= ref8 : ag >= ref8; i = 0 <= ref8 ? ++ag : --ag) {
              cluster = assignments[i];
              if (newCentroids[cluster] === null) {
                newCentroids[cluster] = values[i];
              } else {
                newCentroids[cluster] += values[i];
              }
            }
            for (j = ah = 0, ref9 = num - 1; 0 <= ref9 ? ah <= ref9 : ah >= ref9; j = 0 <= ref9 ? ++ah : --ah) {
              newCentroids[j] *= 1 / clusterSizes[j];
            }
            repeat = false;
            for (j = ai = 0, ref10 = num - 1; 0 <= ref10 ? ai <= ref10 : ai >= ref10; j = 0 <= ref10 ? ++ai : --ai) {
              if (newCentroids[j] !== centroids[i]) {
                repeat = true;
                break;
              }
            }
            centroids = newCentroids;
            nb_iters++;
            if (nb_iters > 200) {
              repeat = false;
            }
          }
          kClusters = {};
          for (j = aj = 0, ref11 = num - 1; 0 <= ref11 ? aj <= ref11 : aj >= ref11; j = 0 <= ref11 ? ++aj : --aj) {
            kClusters[j] = [];
          }
          for (i = ak = 0, ref12 = n - 1; 0 <= ref12 ? ak <= ref12 : ak >= ref12; i = 0 <= ref12 ? ++ak : --ak) {
            cluster = assignments[i];
            kClusters[cluster].push(values[i]);
          }
          tmpKMeansBreaks = [];
          for (j = al = 0, ref13 = num - 1; 0 <= ref13 ? al <= ref13 : al >= ref13; j = 0 <= ref13 ? ++al : --al) {
            tmpKMeansBreaks.push(kClusters[j][0]);
            tmpKMeansBreaks.push(kClusters[j][kClusters[j].length - 1]);
          }
          tmpKMeansBreaks = tmpKMeansBreaks.sort(function(a, b) {
            return a - b;
          });
          limits.push(tmpKMeansBreaks[0]);
          for (i = am = 1, ref14 = tmpKMeansBreaks.length - 1; am <= ref14; i = am += 2) {
            v = tmpKMeansBreaks[i];
            if (!isNaN(v) && limits.indexOf(v) === -1) {
              limits.push(v);
            }
          }
        }
        return limits;
      };

      hsi2rgb = function(h, s, i) {

        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
         */
        var args, b, g, r;
        args = unpack(arguments);
        h = args[0], s = args[1], i = args[2];
        if (isNaN(h)) {
          h = 0;
        }
        h /= 360;
        if (h < 1 / 3) {
          b = (1 - s) / 3;
          r = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
          g = 1 - (b + r);
        } else if (h < 2 / 3) {
          h -= 1 / 3;
          r = (1 - s) / 3;
          g = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
          b = 1 - (r + g);
        } else {
          h -= 2 / 3;
          g = (1 - s) / 3;
          b = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
          r = 1 - (g + b);
        }
        r = limit(i * r * 3);
        g = limit(i * g * 3);
        b = limit(i * b * 3);
        return [r * 255, g * 255, b * 255, args.length > 3 ? args[3] : 1];
      };

      rgb2hsi = function() {

        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
         */
        var b, g, h, i, min, r, ref, s;
        ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
        TWOPI = Math.PI * 2;
        r /= 255;
        g /= 255;
        b /= 255;
        min = Math.min(r, g, b);
        i = (r + g + b) / 3;
        s = 1 - min / i;
        if (s === 0) {
          h = 0;
        } else {
          h = ((r - g) + (r - b)) / 2;
          h /= Math.sqrt((r - g) * (r - g) + (r - b) * (g - b));
          h = Math.acos(h);
          if (b > g) {
            h = TWOPI - h;
          }
          h /= TWOPI;
        }
        return [h * 360, s, i];
      };

      chroma.hsi = function() {
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Color, slice.call(arguments).concat(['hsi']), function(){});
      };

      _input.hsi = hsi2rgb;

      Color.prototype.hsi = function() {
        return rgb2hsi(this._rgb);
      };

      interpolate_hsx = function(col1, col2, f, m) {
        var dh, hue, hue0, hue1, lbv, lbv0, lbv1, res, sat, sat0, sat1, xyz0, xyz1;
        if (m === 'hsl') {
          xyz0 = col1.hsl();
          xyz1 = col2.hsl();
        } else if (m === 'hsv') {
          xyz0 = col1.hsv();
          xyz1 = col2.hsv();
        } else if (m === 'hcg') {
          xyz0 = col1.hcg();
          xyz1 = col2.hcg();
        } else if (m === 'hsi') {
          xyz0 = col1.hsi();
          xyz1 = col2.hsi();
        } else if (m === 'lch' || m === 'hcl') {
          m = 'hcl';
          xyz0 = col1.hcl();
          xyz1 = col2.hcl();
        }
        if (m.substr(0, 1) === 'h') {
          hue0 = xyz0[0], sat0 = xyz0[1], lbv0 = xyz0[2];
          hue1 = xyz1[0], sat1 = xyz1[1], lbv1 = xyz1[2];
        }
        if (!isNaN(hue0) && !isNaN(hue1)) {
          if (hue1 > hue0 && hue1 - hue0 > 180) {
            dh = hue1 - (hue0 + 360);
          } else if (hue1 < hue0 && hue0 - hue1 > 180) {
            dh = hue1 + 360 - hue0;
          } else {
            dh = hue1 - hue0;
          }
          hue = hue0 + f * dh;
        } else if (!isNaN(hue0)) {
          hue = hue0;
          if ((lbv1 === 1 || lbv1 === 0) && m !== 'hsv') {
            sat = sat0;
          }
        } else if (!isNaN(hue1)) {
          hue = hue1;
          if ((lbv0 === 1 || lbv0 === 0) && m !== 'hsv') {
            sat = sat1;
          }
        } else {
          hue = Number.NaN;
        }
        if (sat == null) {
          sat = sat0 + f * (sat1 - sat0);
        }
        lbv = lbv0 + f * (lbv1 - lbv0);
        return res = chroma[m](hue, sat, lbv);
      };

      _interpolators = _interpolators.concat((function() {
        var len, o, ref, results;
        ref = ['hsv', 'hsl', 'hsi', 'hcl', 'lch', 'hcg'];
        results = [];
        for (o = 0, len = ref.length; o < len; o++) {
          m = ref[o];
          results.push([m, interpolate_hsx]);
        }
        return results;
      })());

      interpolate_num = function(col1, col2, f, m) {
        var n1, n2;
        n1 = col1.num();
        n2 = col2.num();
        return chroma.num(n1 + (n2 - n1) * f, 'num');
      };

      _interpolators.push(['num', interpolate_num]);

      interpolate_lab = function(col1, col2, f, m) {
        var res, xyz0, xyz1;
        xyz0 = col1.lab();
        xyz1 = col2.lab();
        return res = new Color(xyz0[0] + f * (xyz1[0] - xyz0[0]), xyz0[1] + f * (xyz1[1] - xyz0[1]), xyz0[2] + f * (xyz1[2] - xyz0[2]), m);
      };

      _interpolators.push(['lab', interpolate_lab]);

    }).call(commonjsGlobal);
    });

    const WGL = WebGLRenderingContext;
    class Buffer$$1 {
        /**
         * Provides a simple method of uploading data to a GPU buffer. Example usage:
         *
         *     const vertices = new Buffer(WGL.ARRAY_BUFFER, Float32Array)
         *     vertices.data = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]]
         *     vertices.compile()
         *
         *     const indices = new Buffer(WGL.ELEMENT_ARRAY_BUFFER, Uint16Array)
         *     indices.data = [[0, 1, 2], [2, 1, 3]]
         *     indices.compile()
         *
         * Specifies the target to which the buffer object is bound.
         * The symbolic constant must be GL_ARRAY_BUFFER or GL_ELEMENT_ARRAY_BUFFER.
         */
        constructor(target, type) {
            this.target = target;
            this.type = type;
            assert(target == WGL.ARRAY_BUFFER || target == WGL.ELEMENT_ARRAY_BUFFER, 'target == WGL.ARRAY_BUFFER || target == WGL.ELEMENT_ARRAY_BUFFER');
            assert(type == Float32Array || type == Uint16Array, 'type == Float32Array || type == Uint16Array');
            this.buffer = undefined;
            this.type = type;
            this.data = [];
            this.count = 0;
            this.spacing = 1;
            this.hasBeenCompiled = false;
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
        addIndexBuffer(name) {
            this.hasBeenCompiled = false;
            const buffer = (this.indexBuffers[name] = new Buffer$$1(WGL$1.ELEMENT_ARRAY_BUFFER, Uint16Array));
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
                result.addIndexBuffer(name);
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
                    gl.drawElements(mode, count, WGL$2.UNSIGNED_SHORT, 2 * start);
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
     *
     */
    const { abs: abs$2, atan2, cos: cos$1, floor, log: log$1, max: max$1, round, sin: sin$1, sqrt, PI: PI$3 } = Math;
    function newtonIterate1d$1(f, xStart, max_steps, eps = 1e-8) {
        let x = xStart, fx;
        while (max_steps-- && Math.abs((fx = f(x))) > eps) {
            const dfdx = (f(x + eps) - fx) / eps;
            console.log("fx / dfdx", fx / dfdx, "fx", fx, "x", x);
            x = x - fx / dfdx;
        }
        return x;
    }
    const TWOPI = 2 * PI$3;
    const DEG2RAD = PI$3 / 180;
    const RAD2DEG = 180 / PI$3;
    class Color {
        /** internal */
        constructor(rgb) {
            if (rgb.length == 3) {
                rgb.push(1);
            }
            this._rgb = rgb;
        }
        shade() {
            const shades = [
                ["ff0000", "red"],
                ["ffa500", "orange"],
                ["ffff00", "yellow"],
                ["008000", "green"],
                ["0000ff", "blue"],
                ["ee82ee", "violet"],
                ["a52a2a", "brown"],
                ["000000", "black"],
                ["808080", "grey"],
                ["ffffff", "white"],
            ];
            shades.forEach(arr => arr.push(chroma$1(arr[0]).hsl()[0]));
            const [h, s, l] = this.hsl();
            if (l > 0.9)
                return "white";
            //return withMax(shades, ([_hex, _name, _hue]) => {
            //	return -Math.abs(angleDiff(this.hsl()[0], _hue))
            //})[1]
            return withMax(shades, ([_hex, _name, _hue]) => {
                const [thisL, thisA, thisB] = this.lab();
                const [L, A, B] = chroma$1(_hex).lab();
                return -Math.hypot(thisL - L, thisA - A, thisB - B);
            })[1];
        }
        interpolate(col2, f, m) {
            return chroma$1.interpolate(this, col2, f, m);
        }
        rgb(round = true) {
            return (round ? this._rgb.map(Math.round) : this._rgb).slice(0, 3);
        }
        rgba(round = true, clamp_ = true) {
            const f = (t) => {
                if (round)
                    t = Math.round(t);
                if (clamp_)
                    t = clamp$1(t, 0, 255);
                return t;
            };
            return [f(this._rgb[0]), f(this._rgb[1]), f(this._rgb[2]), this._rgb[3]];
        }
        hex(mode = "rgb") {
            return rgb2hex(this._rgb, mode);
        }
        hsl() {
            const [r, g, b] = this._rgb;
            return rgb2hsl(r, g, b);
        }
        hsv() {
            const [r, g, b] = this._rgb;
            return rgb2hsv(r, g, b);
        }
        hcg() {
            const [r, g, b] = this._rgb;
            return rgb2hcg(r, g, b);
        }
        css(mode = "rgb") {
            if ("rgb" == mode) {
                const [r, g, b, a] = this._rgb;
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
            const name = Object.keys(chroma$1.w3cx11).find(name => chroma$1.w3cx11[name] == num);
            if (!name && closest) {
                const [thisLStar, thisAStar, thisBStar] = this.lab();
                return withMax(Object.keys(chroma$1.w3cx11), name => {
                    const [lStar, aStar, bStar] = chroma$1.num(chroma$1.w3cx11[name]).lab();
                    return -Math.hypot(thisLStar - lStar, thisAStar - aStar, thisBStar - bStar);
                });
            }
            return name;
        }
        cmyk() {
            const [r, g, b] = this._rgb;
            return rgb2cmyk(r, g, b);
        }
        gl() {
            const [r, g, b, a] = this._rgb;
            return [r / 255, g / 255, b / 255, a];
        }
        luminance(lum0_1) {
            const [r, g, b, alpha] = this._rgb;
            const [, Y] = rgb2xyz(r, g, b);
            if (undefined === lum0_1) {
                return Y;
            }
            const inverseLerp = (a, b, val) => (val - a) / (b - a);
            if (lum0_1 > Y) {
                // lerp to white
                return chroma$1.interpolate(this, chroma$1("white"), inverseLerp(Y, 1, lum0_1), "xyz").alpha(alpha);
            }
            else {
                // lerp to black
                return chroma$1.interpolate(chroma$1("black"), this, inverseLerp(0, Y, lum0_1), "xyz").alpha(alpha);
            }
        }
        /**
         * Get color temperature of this color in Kelvin. This only ma TODO
         */
        temperature() {
            const [r, g, b] = this._rgb;
            return rgb2kelvin(r, g, b);
        }
        //public get(modeAndChannel: string) {
        //	const [mode, channel] = modeAndChannel.split(".") as [ColorMode, string]
        //	const src = this[mode]()
        //	if (channel) {
        //		const i = mode.indexOf(channel)
        //		if (-1 == i) throw new Error("invalid channel")
        //		return src[i]
        //	} else {
        //		return src
        //	}
        //}
        set(modeAndChannel, value) {
            const [mode, channel] = modeAndChannel.split(".");
            let src;
            if (channel) {
                src = this[mode]();
                const i = mode.indexOf(channel);
                if (-1 == i)
                    throw new Error("invalid channel");
                if ("string" == typeof value) {
                    switch (value.charAt(0)) {
                        case "+":
                        case "-":
                            src[i] += +value;
                            break;
                        case "*":
                            src[i] *= +value.substr(1);
                            break;
                        case "/":
                            src[i] /= +value.substr(1);
                            break;
                        default:
                            src[i] = +value;
                    }
                }
                else {
                    src[i] = value;
                }
            }
            else {
                src = value;
            }
            const rgba = _input[mode](src);
            rgba[3] = this.alpha();
            return new Color(rgba);
        }
        clipped() {
            const [r, g, b] = this._rgb;
            return !(0 <= r && r <= 255 && (0 <= g && g <= 255) && (0 <= b && b <= 255));
        }
        /**
         * Returns black or white, whichever has the highest contrast to [this].
         */
        textColor() {
            return this.luminance() > 0.5 ? chroma$1.black : chroma$1.white;
        }
        alpha(alpha0_1) {
            if (undefined === alpha0_1) {
                return this._rgb[3];
            }
            const [r, g, b] = this._rgb;
            return chroma$1.rgb(r, g, b, alpha0_1);
        }
        darker(amount = 1) {
            const [l, a, b] = this.lab();
            return chroma$1.lab(l - LAB_Kn * amount, a, b, this.alpha());
        }
        brighter(amount = 1) {
            return this.darker(-amount);
        }
        saturate(amount = 1) {
            const [l, c, h] = this.lch();
            return chroma$1.lch(l, max$1(0, c + amount * LAB_Kn), h, this.alpha());
        }
        desaturate(amount = 1) {
            return this.saturate(-amount);
        }
        premultiplied() {
            const [r, g, b, a] = this._rgb;
            return chroma$1.rgb(r * a, g * a, b * a, a);
        }
        hsi() {
            const [r, g, b] = this._rgb;
            return rgb2hsi(r, g, b);
        }
        lab() {
            const [r, g, b] = this._rgb;
            return rgb2lab(r, g, b);
        }
        num() {
            const [r, g, b] = this._rgb;
            return rgb2num(r, g, b);
        }
        lch() {
            const [r, g, b] = this._rgb;
            return rgb2lch(r, g, b);
        }
        hcl() {
            const [r, g, b] = this._rgb;
            return rgb2lch(r, g, b).reverse();
        }
        xyz() {
            const [r, g, b] = this._rgb;
            return rgb2xyz(r, g, b);
        }
        equals(color) {
            const [r, g, b, a] = this._rgb;
            const [r2, g2, b2, a2] = color._rgb;
            return r == r2 && g == g2 && b == b2 && a == a2;
        }
    }
    Color.prototype.mix = Color.prototype.interpolate;
    Color.prototype.toString = Color.prototype.hex;
    //Color.prototype.darker = Color.prototype.darken
    //Color.prototype.brighter = Color.prototype.brighten
    Color.prototype.kelvin = Color.prototype.temperature;
    function lerp$1(a, b, f) {
        return a + (b - a) * f;
    }
    function clamp$1(x, min = 0, max = 1) {
        return x < min ? min : x > max ? max : x;
    }
    function chroma$1(...args) {
        if (args[0] instanceof Color) {
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
    var chroma$2 = chroma$1;
    (function (chroma) {
        chroma.black = new Color([0, 0, 0, 1]);
        chroma.white = new Color([255, 255, 255, 1]);
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
            scale() {
                return chroma.scale(this);
            }
            at(fract) {
                const a = TWOPI * ((this._start + 120) / 360 + this._rotations * fract);
                const l = lerp$1(this._lightness[0], this._lightness[1], fract) ** this._gamma;
                const h = lerp$1(this._hue[0], this._hue[1], fract);
                const amp = (h * l * (1 - l)) / 2;
                const cos_a = Math.cos(a);
                const sin_a = Math.sin(a);
                const r = l + amp * (-0.14861 * cos_a + 1.78277 * sin_a);
                const g = l + amp * (-0.29227 * cos_a - 0.90649 * sin_a);
                const b = l + amp * (+1.97294 * cos_a);
                return chroma.rgb([r * 255, g * 255, b * 255, 1]);
            }
        }
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
        function randomLab(randomSource = Math.random) {
            let maxIterations = 100;
            while (maxIterations--) {
                const u = randomSource(), v = randomSource(), w = randomSource();
                // The following matrix multiplication transform the random point (u v w) in the unit cube into the
                // oriented bounding box (OBB) of the projection of the RGB space into the LAB space. This is necessary to
                // avoid a huge number of misses.
                const color = chroma.lab(u * -53.903 + v * -88.755 + w * 71.7 + 99.707, u * -82.784 + v * 187.036 + w * -2.422 + -28.17, u * -75.813 + v * -141.406 + w * -48.261 + 152.469);
                console.log(color.lab());
                console.log(color.rgba(false, false));
                if (!color.clipped())
                    return color;
            }
            throw new Error("Could find a random color in 100 iterations");
        }
        chroma.randomLab = randomLab;
        function interpolate(col1, col2, f = 0.5, m = "rgb") {
            const c1 = chroma(col1);
            const c2 = chroma(col2);
            const res = interpolators[m] && interpolators[m](c1, c2, f, m);
            if (!res) {
                throw new Error("color mode " + m + " is not supported");
            }
            return res.alpha(lerp$1(c1.alpha(), c2.alpha(), f));
        }
        chroma.interpolate = interpolate;
        chroma.mix = interpolate;
        function css(cssString) {
            return new Color(css2rgb(cssString));
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
        function hcl(...args) {
            return guess(args, "hcl");
        }
        chroma.hcl = hcl;
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
        function kelvin(temperature) {
            return new Color(kelvin2rgb(temperature));
        }
        chroma.kelvin = kelvin;
        function lab(...args) {
            return guess(args, "lab");
        }
        chroma.lab = lab;
        function num(num) {
            return new Color(num2rgb(num));
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
        function average(chromables, mode = "rgb") {
            const colors = chromables.map(c => chroma(c));
            if (mode == "lrgb") {
                return _average_lrgb(colors);
            }
            const xyz = [0, 0, 0];
            let dx = 0;
            let dy = 0;
            let alpha = 0;
            for (const c of colors) {
                const xyz2 = c[mode]();
                alpha += c.alpha();
                for (let i = 0; i < xyz.length; i++) {
                    if (mode.charAt(i) == "h") {
                        const A = (xyz2[i] / 180) * PI$3;
                        dx += Math.cos(A);
                        dy += Math.sin(A);
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
            return guess(xyz, mode).alpha(alpha / colors.length);
        }
        chroma.average = average;
        function bezier(...args) {
            const chromables = Array.isArray(args[0]) ? args[0] : args;
            const f = _bezier(chromables);
            f.scale = CubeHelix.prototype.scale;
            return f;
        }
        chroma.bezier = bezier;
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
            blend_fs.darken = blend_f(each(Math.min));
            blend_fs.lighten = blend_f(each(Math.max));
            blend_fs.dodge = blend_f(each(_dodge));
            blend_fs.burn = blend_f(each(_burn));
        })(blend_fs || (blend_fs = {}));
        class Scale {
            /** @internal */
            init(colorsOrFunction) {
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
                    const d = chroma.analyze(this.domain());
                    this._classes = chroma.limits(this.domain(), "e", classes);
                }
                return this;
            }
            domain(...domain) {
                if (undefined === domain[0]) {
                    return "function" !== typeof this._colors
                        ? this._pos.map(p => lerp$1(this._min, this._max, p))
                        : [this._min, this._max];
                }
                this._min = domain[0];
                this._max = domain[domain.length - 1];
                if (2 == domain.length) {
                    if ("function" !== typeof this._colors) {
                        this._pos = this._colors.map((_, c) => c / (this._colors.length - 1));
                    }
                }
                else if (domain.length == this._colors.length && "function" !== typeof this._colors) {
                    // equidistant positions
                    this._pos = domain.map(d => (d - this._min) / (this._max - this._min));
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
                this.resetCache();
                return this;
            }
            /**
             * Set the output format return by `this(x)` and `this.colors(n)`.
             * @param _o The color format to use. Pass `undefined` to return [Color] objects.
             * @return `this`
             * @example chroma.scale("red", "white").out("hex")(0) // "#ff0000"
             * @example chroma.scale("red", "white").out("num").colors(2) // [0xff0000, 0xffffff]
             */
            out(_o) {
                this._out = _o;
                return this;
            }
            correctLightness(v = true) {
                if (this._correctLightness != v)
                    this.resetCache();
                this._correctLightness = v;
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
             * @param format Output format. Defaults to `"hex"`. Pass `false` to get [Color] objects.
             * @returns If `numColors` is `undefined`, the colors which define this [Scale]. If `numColors` is 1,
             * `[this((min + max) / 2)]`. Otherwise, an array where the first element is `this(min)`, the last one is
             * `this(max)` and the rest are equidistant samples between min and max.
             */
            colors(numColors, format = "hex") {
                let result;
                if (undefined === numColors) {
                    result = this._colors.slice();
                }
                else if (numColors == 1) {
                    result = [this((this._min + this._max) / 2)];
                }
                else if (numColors > 1) {
                    result = Array.from({ length: numColors }, (_, i) => this(lerp$1(this._min, this._max, i / (numColors - 1))));
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
                    result = samples.map(this);
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
            at(t) {
                const c = this.color(t);
                return this._out ? c[this._out]() : c;
            }
            getClass(value) {
                return this._classes.findIndex(cls => value <= cls) - 1;
            }
            color(val, bypassMap = false) {
                let t;
                if (!bypassMap) {
                    const min = this._min, max = this._max;
                    if (this._classes && this._classes.length > 2) {
                        const c = this.getClass(val);
                        t = c / (this._classes.length - 2);
                    }
                    else if (max !== min) {
                        t = (val - min) / (max - min);
                    }
                    else {
                        t = 1;
                    }
                    if (this._correctLightness) {
                        t = this.tCorrectedLightness(t);
                    }
                }
                else {
                    t = val;
                }
                t = t ** this._gamma;
                t = (this._paddingLeft + t) / (1 + this._paddingLeft + this._paddingRight);
                //	t = this._paddingLeft + t * (1 - this._paddingLeft - this._paddingRight)
                t = clamp$1(t, 0, 1);
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
                                col = chroma.interpolate(this._colors[i], this._colors[i + 1], t, this._mode);
                                break;
                            }
                        }
                    }
                    else {
                        col = this._colors(t);
                    }
                    if (this._cache) {
                        this._cache.set(tHash, col);
                    }
                    return col;
                }
            }
            tCorrectedLightness(t0_1) {
                const L0 = this.color(0, true).lab()[0];
                const L1 = this.color(1, true).lab()[0];
                const L_ideal = lerp$1(L0, L1, t0_1);
                return newtonIterate1d$1(t => this.color(t, true).lab()[0] - L_ideal, t0_1, 8);
            }
            resetCache() {
                this._cache.clear();
            }
        }
        function scale(...args) {
            const f = (t => f.at(t));
            Object.getOwnPropertyNames(Scale.prototype).forEach(key => (f[key] = Scale.prototype[key]));
            if (Array.isArray(args[0]))
                args = args[0];
            if (args.length == 1 && "string" == typeof args[0])
                args = chroma.brewer[args[0]];
            f.init("function" == typeof args[0] ? args[0] : args.map(a => chroma(a)));
            //f.setColors(args.length > 1 ? args : args[0])
            return f;
        }
        chroma.scale = scale;
        let scales;
        (function (scales) {
            function cool() {
                return chroma.scale([chroma.hsl(180, 1, 0.9), chroma.hsl(250, 0.7, 0.4)]);
            }
            scales.cool = cool;
            function hot() {
                return chroma.scale(["#000", "#f00", "#ff0", "#fff"]).mode("rgb");
            }
            scales.hot = hot;
        })(scales = chroma.scales || (chroma.scales = {}));
        /**
         * Computes the WCAG contrast ratio between two colors. A minimum contrast of 4.5:1 is recommended to ensure that
         * text is still readable against a background color.
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
         * Compute the euclidean distance between two colors.
         * @param a First color.
         * @param b Second color.
         * @param mode The color space in which to compute the distance. Defaults to "lab".
         */
        function distance(a, b, mode = "lab") {
            const l1 = chroma(a)[mode]();
            const l2 = chroma(b)[mode]();
            const channelDifferences = l1.map((channelValue, channelIndex) => channelValue - l2[channelIndex]);
            return Math.hypot(...channelDifferences);
        }
        chroma.distance = distance;
        function deltaE(a, b, L = 1, C = 1) {
            const [L1, a1, b1] = chroma(a).lab();
            const [L2, a2, b2] = chroma(b).lab();
            const c1 = sqrt(a1 * a1 + b1 * b1);
            const c2 = sqrt(a2 * a2 + b2 * b2);
            const sl = L1 < 16.0 ? 0.511 : (0.040975 * L1) / (1.0 + 0.01765 * L1);
            const sc = (0.0638 * c1) / (1.0 + 0.0131 * c1) + 0.638;
            let h1 = c1 < 0.000001 ? 0.0 : (atan2(b1, a1) * 180.0) / PI$3;
            while (h1 < 0) {
                h1 += 360;
            }
            while (h1 >= 360) {
                h1 -= 360;
            }
            const t = h1 >= 164.0 && h1 <= 345.0
                ? 0.56 + abs$2(0.2 * cos$1((PI$3 * (h1 + 168.0)) / 180.0))
                : 0.36 + abs$2(0.4 * cos$1((PI$3 * (h1 + 35.0)) / 180.0));
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
                return chroma.limits(this, mode, num);
            };
            return r;
        }
        chroma.analyze = analyze;
        function limits(data, mode = "e", num = 7) {
            const info = Array.isArray(data) ? chroma.analyze(data) : data;
            const { min, max, values } = info;
            values.sort((a, b) => a - b);
            if (num == 1) {
                return [min, max];
            }
            if (mode.startsWith("c")) {
                return [min, max];
            }
            else if (mode.startsWith("e")) {
                return Array.from({ length: num + 1 }, (_, i) => lerp$1(min, max, i / num));
            }
            else if (mode.startsWith("l")) {
                if (min <= 0) {
                    throw new Error("Logarithmic scales are only possible for values > 0");
                }
                const min_log = Math.LOG10E * log$1(min);
                const max_log = Math.LOG10E * log$1(max);
                return Array.from({ length: num + 1 }, (_, i) => 10 ** lerp$1(min_log, max_log, i / num));
            }
            else if (mode.startsWith("q")) {
                return Array.from({ length: num + 1 }, (_, i) => {
                    const p = ((values.length - 1) * i) / num;
                    const pb = floor(p);
                    return pb == p ? values[pb] : lerp$1(values[pb], values[pb + 1], p - pb);
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
                let centroids = Array.from({ length: num + 1 }, (_, i) => lerp$1(min, max, i / num));
                do {
                    // assignment step
                    clusterSizes.fill(0);
                    for (let i = 0; i < values.length; i++) {
                        const value = values[i];
                        const minDistIndex = indexOfMax(centroids, c => -abs$2(c - value));
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
    })(chroma$1 || (chroma$1 = {}));
    const interpolators = {};
    // const _guess_formats: { p: number; test: (args: any[]) => ColorFormat | undefined }[] = []
    const _input = {};
    function linear_interpolator(col1, col2, f, m) {
        const xyz1 = col1[m]();
        const xyz2 = col2[m]();
        return guess([
            lerp$1(xyz1[0], xyz2[0], f),
            lerp$1(xyz1[1], xyz2[1], f),
            lerp$1(xyz1[2], xyz2[2], f),
            lerp$1(col1.alpha(), col2.alpha(), f),
        ], m);
    }
    interpolators.xyz = linear_interpolator;
    interpolators.rgb = linear_interpolator;
    interpolators.lab = linear_interpolator;
    interpolators.num = function (col1, col2, f) {
        const n1 = col1.num();
        const n2 = col2.num();
        return chroma$1.num(lerp$1(n1, n2, f));
    };
    interpolators.lrgb = function (col1, col2, f) {
        const [r1, g1, b1, a1] = col1.rgba(false, false);
        const [r2, g2, b2, a2] = col2.rgba(false, false);
        return new Color([
            Math.sqrt(r1 ** 2 * (1 - f) + r2 ** 2 * f),
            Math.sqrt(g1 ** 2 * (1 - f) + g2 ** 2 * f),
            Math.sqrt(b1 ** 2 * (1 - f) + b2 ** 2 * f),
            lerp$1(a1, a2, f),
        ]);
    };
    function _bezier(chromables) {
        const colors = chromables.map(c => chroma$1(c));
        const [lab0, lab1, lab2, lab3] = colors.map(c => c.lab());
        if (2 == chromables.length) {
            // linear interpolation
            return t => {
                return chroma$1.lab([0, 1, 2].map(i => lerp$1(lab0[i], lab1[i], t)));
            };
        }
        else if (3 == chromables.length) {
            // quadratic bezier interpolation
            const bezier2 = (p0, p1, p2, t) => (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2;
            return t => chroma$1.lab([0, 1, 2].map(i => bezier2(lab0[i], lab1[i], lab2[i], t)));
        }
        else if (4 == chromables.length) {
            // cubic bezier interpolation
            const bezier3 = (p0, p1, p2, p3, t) => (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;
            return t => chroma$1.lab([0, 1, 2].map(i => bezier3(lab0[i], lab1[i], lab2[i], lab3[i], t)));
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
            if (args.length == 1 && args[0] in chroma$1.w3cx11) {
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
        const rgb = _input[mode](...args);
        if (rgb.some(x => "number" != typeof x)) {
            throw new Error("invalid rgb");
        }
        return new Color(rgb);
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
        return new Color([
            Math.sqrt(rSquareSum) / colors.length,
            Math.sqrt(gSquareSum) / colors.length,
            Math.sqrt(bSquareSum) / colors.length,
            alphaSum / colors.length,
        ]);
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
    function rgb2hex(channels, mode = "rgb") {
        let [r, g, b, a] = channels;
        r = clamp$1(Math.round(r), 0, 255);
        g = clamp$1(Math.round(g), 0, 255);
        b = clamp$1(Math.round(b), 0, 255);
        const rgb = (r << 16) | (g << 8) | b;
        const rgbString = rgb.toString(16).padStart(6, "0");
        const alphaString = round(clamp$1(a) * 255)
            .toString(16)
            .padStart(2, "0");
        return "#" + ("argb" == mode ? alphaString + rgbString : "rgba" == mode ? rgbString + alphaString : rgbString);
    }
    _input.lrgb = _input.rgb;
    _input.hex = hex2rgb;
    function rgb2hsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const l = (max + min) / 2;
        let s, hueTurnX6 = 0;
        if (max == min) {
            s = 0;
            hueTurnX6 = 0;
        }
        else {
            s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
            if (r == max) {
                hueTurnX6 = (g - b) / (max - min) + (g < b ? 6 : 0);
            }
            else if (g == max) {
                hueTurnX6 = 2 + (b - r) / (max - min);
            }
            else if (b == max) {
                hueTurnX6 = 4 + (r - g) / (max - min);
            }
        }
        return [hueTurnX6 * 60, s, l];
    }
    _input.hsl = hsl2rgb;
    function norm360(degrees) {
        return ((degrees % 360) + 360) % 360;
    }
    function hsv2rgb(h, s, v, a = 1) {
        v *= 255;
        if (s == 0) {
            return [v, v, v, a];
        }
        else {
            const hueTurnX6 = norm360(h / 60);
            const i = floor(hueTurnX6);
            const f = hueTurnX6 - i;
            const p = v * (1 - s);
            const q = v * (1 - s * f);
            const t = v * (1 - s * (1 - f));
            if (h < 60) {
                return [v, t, p, a];
            }
            else if (h < 120) {
                return [q, v, p, a];
            }
            else if (h < 180) {
                return [p, v, t, a];
            }
            else if (h < 240) {
                return [p, q, v, a];
            }
            else if (h < 300) {
                return [t, p, v, a];
            }
            else {
                return [v, p, q, a];
            }
        }
    }
    function rgb2hsv(r, g, b) {
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const delta = max - min;
        const v = max / 255.0;
        let hueTurnX6;
        const s = max == 0 ? 0 : delta / max;
        if (0 == delta) {
            hueTurnX6 = 0;
        }
        else if (r == max) {
            hueTurnX6 = (g - b) / delta + (g < b ? 6 : 0);
        }
        else if (g == max) {
            hueTurnX6 = 2 + (b - r) / delta;
        }
        else {
            hueTurnX6 = 4 + (r - g) / delta;
        }
        return [hueTurnX6 * 60, s, v];
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
    function rgb2num(r, g, b) {
        return (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b);
    }
    _input.num = num2rgb;
    function hcg2rgb(h, c, g, a = 1) {
        if (c == 0) {
            return [g * 255, g * 255, g * 255, a];
        }
        else {
            const hueTurnX6 = norm360(h / 60);
            const i = floor(hueTurnX6);
            const f = hueTurnX6 - i;
            const p = g * (1 - c);
            const q = 255 * (p + c * (1 - f));
            const t = 255 * (p + c * f);
            const v = 255 * (p + c);
            if (0 == i) {
                return [v, t, p, a];
            }
            else if (1 == i) {
                return [q, v, p, a];
            }
            else if (2 == i) {
                return [p, v, t, a];
            }
            else if (3 == i) {
                return [p, q, v, a];
            }
            else if (4 == i) {
                return [t, p, v, a];
            }
            else {
                return [v, p, q, a];
            }
        }
    }
    function rgb2hcg(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const c = max - min;
        const _g = c < 1 ? min / (1 - c) : 0;
        let hueTurnX6; // angle as value between 0 and 6
        if (0 === c) {
            hueTurnX6 = 0;
        }
        else if (r == max) {
            // second term to make sure the value is > 0
            hueTurnX6 = (g - b) / c + (b > g ? 6 : 0);
        }
        else if (g == max) {
            hueTurnX6 = 2 + (b - r) / c;
        }
        else {
            hueTurnX6 = 4 + (r - g) / c;
        }
        return [hueTurnX6 * 60, c, _g];
    }
    _input.hcg = hcg2rgb;
    const WS = "\\s*";
    const FLOAT = "([+-]?(?:\\d*\\.?)?\\d+(?:[eE][+-]?\\d+)?)";
    const CSS_RGB_REGEX = new RegExp(["^rgba?\\(", FLOAT, ",", FLOAT, ",", FLOAT, "(?:,", FLOAT + "(%)?", ")?\\)$"].join(WS), "i");
    const CSS_RGB_WS_REGEX = new RegExp(["^rgba?\\(", FLOAT, FLOAT, FLOAT, "(?:/", FLOAT + "(%)?", ")?\\)$"].join(WS), "i");
    const CSS_RGB_PERCENT_REGEX = new RegExp(["^rgba?\\(", FLOAT + "%", ",", FLOAT + "%", ",", FLOAT + "%", "(?:,", FLOAT + "(%)?", ")?\\)$"].join(WS), "i");
    const CSS_RGB_WS_PERCENT_REGEX = new RegExp(["^rgba?\\(", FLOAT + "%", FLOAT + "%", FLOAT + "%", "(?:/", FLOAT + "(%)?", ")?\\)$"].join(WS), "i");
    const CSS_HSL_REGEX = new RegExp(["^hsla?\\(", FLOAT + "(deg|rad|turn)?", ",", FLOAT + "%", ",", FLOAT + "%", "(?:,", FLOAT + "(%)?", ")?\\)$"].join(WS), "i");
    const CSS_HSL_WS_REGEX = new RegExp(["^hsla?\\(", FLOAT + "(deg|rad|turn)?\\s+" + FLOAT + "%", FLOAT + "%", "(?:/", FLOAT + "(%)?", ")?\\)$"].join(WS), "i");
    function css2rgb(css) {
        if (chroma$1.w3cx11 && chroma$1.w3cx11[css.toLowerCase()]) {
            return num2rgb(chroma$1.w3cx11[css.toLowerCase()]);
        }
        let m;
        if ((m = css.match(CSS_RGB_REGEX) || css.match(CSS_RGB_WS_REGEX))) {
            return [
                clamp$1(+m[1], 0, 255),
                clamp$1(+m[2], 0, 255),
                clamp$1(+m[3], 0, 255),
                m[4] ? clamp$1(m[5] ? +m[4] / 100 : +m[4]) : 1,
            ];
        }
        else if ((m = css.match(CSS_RGB_PERCENT_REGEX) || css.match(CSS_RGB_WS_PERCENT_REGEX))) {
            return [
                clamp$1(+m[1] / 100) * 255,
                clamp$1(+m[2] / 100) * 255,
                clamp$1(+m[3] / 100) * 255,
                m[4] ? clamp$1(m[5] ? +m[4] / 100 : +m[4]) : 1,
            ];
        }
        else if ((m = css.match(CSS_HSL_REGEX) || css.match(CSS_HSL_WS_REGEX))) {
            const CONVERSION = { deg: 1, rad: RAD2DEG, turn: 360 };
            const angleUnit = (m[2] ? m[2].toLowerCase() : "deg");
            return hsl2rgb((((+m[1] * CONVERSION[angleUnit]) % 360) + 360) % 360, clamp$1(+m[3] / 100), clamp$1(+m[4] / 100), m[5] ? clamp$1(m[6] ? +m[5] / 100 : +m[5]) : 1);
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
        return num2rgb(chroma$1.w3cx11[name]);
    };
    function lch2lab(l, c, hueDegrees) {
        /*
        Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
        These formulas were invented by David Dalrymple to obtain maximum contrast without going
        out of gamut if the parameters are in the range 0-1.

        A saturation multiplier was added by Gregor Aisch
         */
        return [l, cos$1(hueDegrees * DEG2RAD) * c, sin$1(hueDegrees * DEG2RAD) * c];
    }
    function lch2rgb(l, c, h, alpha = 1) {
        const [, a, b] = lch2lab(l, c, h);
        return cielab2rgb(l, a, b, alpha);
    }
    function lab2lch(l, a, b) {
        const c = Math.hypot(a, b);
        const h = (Math.atan2(b, a) * RAD2DEG + 360) % 360;
        return [l, c, h];
    }
    function rgb2lch(r, g, b) {
        const [l, a, b2] = rgb2lab(r, g, b);
        return lab2lch(l, a, b2);
    }
    _input.lch = lch2rgb;
    _input.hcl = (h, c, l) => lch2rgb(l, c, h);
    function rgb2cmyk(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const k = 1 - Math.max(r, g, b);
        if (1 == k)
            return [0, 0, 0, 1];
        const c = (1 - r - k) / (1 - k);
        const m = (1 - g - k) / (1 - k);
        const y = (1 - b - k) / (1 - k);
        return [c, m, y, k];
    }
    function cmyk2rgb(c, m, y, k, alpha = 1) {
        if (k == 1) {
            return [0, 0, 0, alpha];
        }
        const r = c >= 1 ? 0 : 255 * (1 - c) * (1 - k);
        const g = m >= 1 ? 0 : 255 * (1 - m) * (1 - k);
        const b = y >= 1 ? 0 : 255 * (1 - y) * (1 - k);
        return [r, g, b, alpha];
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
    function rgbChannel2RgbLinear(xIn0_255) {
        const xIn0_1 = xIn0_255 / 255;
        // http://entropymine.com/imageworsener/srgbformula/
        if (xIn0_1 <= 0.04045) {
            return xIn0_1 / 12.92;
        }
        else {
            return ((xIn0_1 + 0.055) / 1.055) ** 2.4;
        }
    }
    function rgbLinearChannel2Rgb(xLinearIn0_1) {
        if (xLinearIn0_1 <= 0.0031308) {
            return 255 * (12.92 * xLinearIn0_1);
        }
        else {
            return 255 * ((1 + 0.055) * xLinearIn0_1 ** (1 / 2.4) - 0.055);
        }
    }
    function kelvin2rgb(kelvin) {
        const temp = kelvin / 100;
        let r, g, b;
        if (temp < 66) {
            r = 255;
            g = -155.25485562709179 - 0.44596950469579133 * (temp - 2) + 104.49216199393888 * log$1(temp - 2);
            b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (temp - 10) + 115.67994401066147 * log$1(temp - 10);
        }
        else {
            r = 351.97690566805693 + 0.114206453784165 * (temp - 55) - 40.25366309332127 * log$1(temp - 55);
            g = 325.4494125711974 + 0.07943456536662342 * (temp - 50) - 28.0852963507957 * log$1(temp - 50);
            b = 255;
        }
        return [r, g, b];
    }
    _input.rgb = (...args) => args;
    function rgb2kelvin(r, g, b) {
        return newtonIterate1d$1(k => {
            const eps = 1e-9;
            const [kr, kg, kb] = kelvin2rgb(k);
            const [kr2, kg2, kb2] = kelvin2rgb(k + eps);
            const dkr = (kr2 - kr) / eps, dkg = (kg2 - kg) / eps, dkb = (kb2 - kb) / eps;
            return dkr * (kr - r) + dkg * (kg - g) + dkb * (kb - b);
            return kb / kr - b / r;
        }, 
        //1000,
        //40000,
        Math.E ** ((b / r + 2.5) / 0.4), 20);
        let maxTemp = 40000;
        let minTemp = 1000;
        const eps = 0.4;
        let temp = 0;
        let rgb;
        while (maxTemp - minTemp > eps) {
            temp = (maxTemp + minTemp) * 0.5;
            rgb = kelvin2rgb(temp);
            if (rgb[2] / rgb[0] >= b / r) {
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
            const [r, g, b] = f(chroma$1(top).rgb(), chroma$1(bottom).rgb());
            return chroma$1.rgb(r, g, b);
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
        return 255 * Math.min(1, b / 255 / (1 - a / 255));
    }
    function hsl2rgb(h, s, l, a = 1) {
        let r, g, b;
        if (s == 0) {
            r = g = b = l * 255;
        }
        else {
            const t3 = [0, 0, 0];
            const c = [0, 0, 0];
            const t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const t1 = 2 * l - t2;
            h /= 360;
            t3[0] = h + 1 / 3;
            t3[1] = h;
            t3[2] = h - 1 / 3;
            for (let i = 0; i <= 2; i++) {
                if (t3[i] < 0) {
                    t3[i] += 1;
                }
                if (t3[i] > 1) {
                    t3[i] -= 1;
                }
                if (6 * t3[i] < 1) {
                    c[i] = t1 + (t2 - t1) * 6 * t3[i];
                }
                else if (2 * t3[i] < 1) {
                    c[i] = t2;
                }
                else if (3 * t3[i] < 2) {
                    c[i] = t1 + (t2 - t1) * (2 / 3 - t3[i]) * 6;
                }
                else {
                    c[i] = t1;
                }
            }
            [r, g, b] = [c[0] * 255, c[1] * 255, c[2] * 255];
        }
        return [r, g, b, a];
    }
    function cielab2rgb(LStart, aStar, bStar, alpha = 1) {
        const [x, y, z] = cielab2xyz(LStart, aStar, bStar);
        return xyz2rgb(x, y, z, alpha);
    }
    function cielab2xyz(LStar, aStar, bStar) {
        function fInv(t) {
            if (t > LAB_delta) {
                return t ** 3;
            }
            else {
                return LAB_3DeltaPow2 * (t - 4 / 29);
            }
        }
        return [
            LAB_Xn * fInv((LStar + 16) / 116 + aStar / 500),
            LAB_Yn * fInv((LStar + 16) / 116),
            LAB_Zn * fInv((LStar + 16) / 116 - bStar / 200),
        ];
    }
    function xyz2cielab(x, y, z) {
        // https://en.wikipedia.org/w/index.php?title=CIELAB_color_space&oldid=849576085#Forward_transformation
        function f(t) {
            if (t > LAB_deltaPow3) {
                return Math.cbrt(t);
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
    function rgb2lab(r, g, b) {
        const [x, y, z] = rgb2xyz(r, g, b);
        return xyz2cielab(x, y, z);
    }
    function rgb2xyz(r, g, b) {
        // https://en.wikipedia.org/wiki/SRGB#The_reverse_transformation
        const rLinear = rgbChannel2RgbLinear(r);
        const gLinear = rgbChannel2RgbLinear(g);
        const bLinear = rgbChannel2RgbLinear(b);
        const X = 0.4124564 * rLinear + 0.3575761 * gLinear + 0.1804375 * bLinear;
        const Y = 0.2126729 * rLinear + 0.7151522 * gLinear + 0.072175 * bLinear;
        const Z = 0.0193339 * rLinear + 0.119192 * gLinear + 0.9503041 * bLinear;
        return [X, Y, Z];
    }
    function xyz2rgb(X0_1, Y0_1, Z0_1, alpha0_1 = 1) {
        // https://en.wikipedia.org/wiki/SRGB#The_forward_transformation_(CIE_XYZ_to_sRGB)
        const rLinear = 3.2404542 * X0_1 - 1.5371385 * Y0_1 - 0.4985314 * Z0_1;
        const gLinear = -0.969266 * X0_1 + 1.8760108 * Y0_1 + 0.041556 * Z0_1;
        const bLinear = 0.0556434 * X0_1 - 0.2040259 * Y0_1 + 1.0572252 * Z0_1;
        return [rgbLinearChannel2Rgb(rLinear), rgbLinearChannel2Rgb(gLinear), rgbLinearChannel2Rgb(bLinear), alpha0_1];
    }
    _input.xyz = xyz2rgb;
    _input.lab = cielab2rgb;
    function hsi2rgb(hDegrees, s, i, a = 1) {
        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
         */
        let r, g, b;
        let hRad = hDegrees * DEG2RAD;
        if (hRad < (2 * PI$3) / 3) {
            b = (1 - s) / 3;
            r = (1 + (s * cos$1(hRad)) / cos$1(PI$3 / 3 - hRad)) / 3;
            g = 1 - (b + r);
        }
        else if (hRad < (4 * PI$3) / 3) {
            hRad -= (2 * PI$3) / 3;
            r = (1 - s) / 3;
            g = (1 + (s * cos$1(hRad)) / cos$1(PI$3 / 3 - hRad)) / 3;
            b = 1 - (r + g);
        }
        else {
            hRad -= (4 * PI$3) / 3;
            g = (1 - s) / 3;
            b = (1 + (s * cos$1(hRad)) / cos$1(PI$3 / 3 - hRad)) / 3;
            r = 1 - (g + b);
        }
        return [3 * i * r * 255, 3 * i * g * 255, 3 * i * b * 255, a];
    }
    function rgb2hsi(r, g, b) {
        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
         */
        r /= 255;
        g /= 255;
        b /= 255;
        const i = (r + g + b) / 3;
        let h, s;
        if (r == g && g == b) {
            h = 0;
            s = 0;
        }
        else {
            const min = Math.min(r, g, b);
            h = Math.acos((r - g + (r - b)) / 2 / Math.sqrt((r - g) ** 2 + (r - b) * (g - b)));
            if (b > g) {
                h = TWOPI - h;
            }
            s = 1 - min / i;
        }
        return [h * RAD2DEG, s, i];
    }
    _input.hsi = hsi2rgb;
    function interpolate_hsx(color1, color2, f, m) {
        if ("lch" == m)
            m = "hcl";
        if (m.substr(0, 1) !== "h") {
            throw new Error();
        }
        const [hue0, sat0, lbv0] = color1[m]();
        const [hue1, sat1, lbv1] = color2[m]();
        let dh;
        if (hue1 > hue0 && hue1 - hue0 > 180) {
            dh = hue1 - (hue0 + 360);
        }
        else if (hue1 < hue0 && hue0 - hue1 > 180) {
            dh = hue1 + 360 - hue0;
        }
        else {
            dh = hue1 - hue0;
        }
        const hue = hue0 + f * dh;
        return chroma$1[m](hue, lerp$1(sat0, sat1, f), lerp$1(lbv0, lbv1, f));
    }
    ["hsv", "hsl", "hsi", "hcl", "lch", "hcg"].forEach(mode => (interpolators[mode] = interpolate_hsx));
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

    const colorSpaces = {
        rgb: {
            render(gl) {
                gl.translate(-1, -1, -1);
                gl.begin(gl.LINES);
                gl.color("black");
                gl.vertex(V3.O);
                gl.vertex(V(2, 0, 0));
                gl.vertex(V3.O);
                gl.vertex(V(0, 2, 0));
                gl.vertex(V3.O);
                gl.vertex(V(0, 0, 2));
                gl.end();
                gl.pushMatrix();
                gl.rotate(90, 1, 0, 0);
                gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "top");
                gl.translate(1, 0, 0);
                gl.renderText("red", [1, 0, 0, 1], 0.05, "center", "top");
                gl.translate(1, 0, 0);
                gl.renderText("255", [0, 0, 0, 1], 0.05, "right", "top");
                gl.popMatrix();
                gl.pushMatrix();
                gl.rotate(90, 0, 0, 1);
                gl.rotate(90, 1, 0, 0);
                gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "top");
                gl.translate(1, 0, 0);
                gl.renderText("green", [0, 1, 0, 1], 0.05, "center", "top");
                gl.translate(1, 0, 0);
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
                const [x, y, z] = color.gl().map(v => lerp(-1, 1, v));
                return new V3(x, y, z);
            },
            title: "RGB",
            children: (React__default.createElement(React__default.Fragment, null, "The RGB color space. What your screen uses. Red, green and blue channels, generally 8 bits each, for a total of 16 million colors.")),
        },
        hsl: {
            render(gl) {
                gl.begin(gl.LINES);
                gl.color("black");
                // lightness
                gl.vertex(V3.O);
                gl.vertex(V3.Z);
                // saturation
                gl.vertex(V3.O);
                gl.vertex(V3.X);
                // hue
                for (let i = 0; i < 256; i++) {
                    gl.vertex(V3.sphere((i / 256) * 2 * Math.PI, 0));
                    gl.vertex(V3.sphere(((i + 1) / 256) * 2 * Math.PI, 0));
                }
                gl.end();
                for (let hue = 0; hue < 360; hue += 30) {
                    gl.pushMatrix();
                    gl.rotate(hue, 0, 0, 1);
                    gl.translate(1, 0);
                    gl.rotate(90, 0, 0, 1.0);
                    gl.renderText(hue + "°", chroma$2.hsl(hue, 1, 0.5).gl(), 0.05, "center", "top");
                    gl.renderText(hue + "°", [0, 0, 0, 1], 0.05, "center", "top", 0.2);
                    gl.popMatrix();
                }
                gl.pushMatrix();
                gl.rotate(90, 1, 0, 0);
                gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "top");
                gl.translate(0.5, 0, 0);
                gl.renderText("saturation", [0, 0, 0, 1], 0.05, "center", "top");
                gl.translate(0.5, 0, 0);
                gl.renderText("100%", [0, 0, 0, 1], 0.05, "right", "top");
                gl.popMatrix();
                gl.pushMatrix();
                // gl.rotate(-135, 0, 0, 1)
                gl.rotate(90, 1, 0, 0);
                gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "bottom");
                gl.translate(0, 0.5, 0);
                gl.renderText("lightness", [0, 0, 0, 1], 0.05, "left", "middle");
                gl.translate(0, 0.5, 0);
                gl.renderText("100%", [0, 0, 0, 1], 0.05, "left", "top");
                gl.popMatrix();
            },
            convert(color) {
                const [h, s, l] = color.hsl();
                return V3.polar(s, h * DEG).plus(new V3(0, 0, l));
            },
            title: "HSL",
            children: React__default.createElement(React__default.Fragment, null, "Hue, saturation and lightness. Also supported by CSS."),
        },
        hsv: {
            render(gl) {
                gl.begin(gl.LINES);
                gl.color("black");
                // lightness
                gl.vertex(V3.O);
                gl.vertex(V3.Z);
                // saturation
                gl.vertex(V3.O);
                gl.vertex(V3.X);
                // hue
                for (let i = 0; i < 256; i++) {
                    gl.vertex(V3.sphere((i / 256) * 2 * Math.PI, 0));
                    gl.vertex(V3.sphere(((i + 1) / 256) * 2 * Math.PI, 0));
                }
                gl.end();
                for (let hue = 0; hue < 360; hue += 30) {
                    gl.pushMatrix();
                    gl.rotate(hue, 0, 0, 1);
                    gl.translate(1, 0);
                    gl.rotate(90, 0, 0, 1.0);
                    gl.renderText(hue + "°", chroma$2.hsl(hue, 1, 0.5).gl(), 0.05, "center", "top");
                    gl.renderText(hue + "°", [0, 0, 0, 1], 0.05, "center", "top", 0.2);
                    gl.popMatrix();
                }
                gl.pushMatrix();
                gl.rotate(90, 1, 0, 0);
                gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "top");
                gl.translate(0.5, 0, 0);
                gl.renderText("saturation", [0, 0, 0, 1], 0.05, "center", "top");
                gl.translate(0.5, 0, 0);
                gl.renderText("100%", [0, 0, 0, 1], 0.05, "right", "top");
                gl.popMatrix();
                gl.pushMatrix();
                // gl.rotate(-135, 0, 0, 1)
                gl.rotate(90, 1, 0, 0);
                gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "bottom");
                gl.translate(0, 0.5, 0);
                gl.renderText("value", [0, 0, 0, 1], 0.05, "left", "middle");
                gl.translate(0, 0.5, 0);
                gl.renderText("100%", [0, 0, 0, 1], 0.05, "left", "top");
                gl.popMatrix();
            },
            convert(color) {
                const [h, s, v] = color.hsv();
                return V3.polar(s, h * DEG).plus(new V3(0, 0, v));
            },
            title: "HSV",
            children: React__default.createElement(React__default.Fragment, null),
        },
        hcl: {
            render(gl) {
                gl.begin(gl.LINES);
                gl.color("black");
                // lightness
                gl.vertex(V3.O);
                gl.vertex(V3.Z);
                // saturation
                gl.vertex(V3.O);
                gl.vertex(V3.X);
                // hue
                for (let i = 0; i < 256; i++) {
                    gl.vertex(V3.sphere((i / 256) * 2 * Math.PI, 0));
                    gl.vertex(V3.sphere(((i + 1) / 256) * 2 * Math.PI, 0));
                }
                gl.end();
                for (let hue = 0; hue < 360; hue += 30) {
                    gl.pushMatrix();
                    gl.rotate(hue, 0, 0, 1);
                    gl.translate(1, 0);
                    gl.rotate(90, 0, 0, 1.0);
                    gl.renderText(hue + "°", chroma$2.hsl(hue, 1, 0.5).gl(), 0.05, "center", "top");
                    gl.renderText(hue + "°", [0, 0, 0, 1], 0.05, "center", "top", 0.2);
                    gl.popMatrix();
                }
                gl.pushMatrix();
                gl.rotate(90, 1, 0, 0);
                gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "top");
                gl.translate(0.5, 0, 0);
                gl.renderText("chroma", [0, 0, 0, 1], 0.05, "center", "top");
                gl.translate(0.5, 0, 0);
                gl.renderText("200", [0, 0, 0, 1], 0.05, "right", "top");
                gl.popMatrix();
                gl.pushMatrix();
                // gl.rotate(-135, 0, 0, 1)
                gl.rotate(90, 1, 0, 0);
                gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "bottom");
                gl.translate(0, 0.5, 0);
                gl.renderText("luminance", [0, 0, 0, 1], 0.05, "left", "middle");
                gl.translate(0, 0.5, 0);
                gl.renderText("100", [0, 0, 0, 1], 0.05, "left", "top");
                gl.popMatrix();
            },
            convert(color) {
                const [h, c, l] = color.hcl();
                return V3.polar(c / 200, h * DEG).plus(new V3(0, 0, l / 100));
            },
            title: "HCL",
            children: (React__default.createElement(React__default.Fragment, null,
                React__default.createElement("a", { href: "https://en.wikipedia.org/wiki/HCL_color_space" }, "wiki"))),
        },
        lab: {
            render(gl) {
                // gl.translate(-0.5, -0.5, -0.5)
                gl.begin(gl.LINES);
                gl.color("black");
                // L*
                gl.vertex(V3.O);
                gl.vertex(new V3(0, 0, 1));
                // A*
                gl.vertex(new V3(-128 / 100, 0, 0));
                gl.vertex(new V3(128 / 100, 0, 0));
                // B*
                gl.vertex(new V3(0, -128 / 100, 0));
                gl.vertex(new V3(0, 128 / 100, 0));
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
                const [l, a, b] = color.lab();
                return new V3(a / 100, b / 100, l / 100);
            },
            title: "CIELAB",
            children: (React__default.createElement(React__default.Fragment, null,
                "CIELAB color space. Much closer to perceptual uniform that RGB or HSL.",
                " ",
                React__default.createElement("a", { href: "https://en.wikipedia.org/wiki/CIELAB_color_space" }, "wiki"))),
        },
    };

    class SpacesCanvasState {
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
            this.eye = V(0, -2.5, 0.5);
            this.center = V3.O;
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
            this.state = new SpacesCanvasState();
            this.createMeshForWhat = lodash_memoize(function (what, colorSpace) {
                return this.createMeshFromColors(this.getColorsForWhat(what), colorSpace);
            }, (what, colorSpace) => what + " " + colorSpace);
            this.rotationTime = 0;
            this.windowOnResize = () => {
                this.gl.fixCanvasRes();
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
            };
        }
        render() {
            const _a = this.props, htmlAttributes = __rest(_a, ["colorSpace", "onHoverChange", "what", "colorHighlight", "rotation"]);
            return React__default.createElement("canvas", Object.assign({}, htmlAttributes, { ref: r => (this.canvas = r), onMouseMove: this.onMouseMove }));
        }
        async componentDidMount() {
            const gl = (this.gl = TSGLContext.create({ canvas: this.canvas }));
            gl.fixCanvasRes();
            gl.meshes = {};
            gl.shaders = {};
            this.sphereMesh = Mesh$$1.sphere(0);
            gl.shaders.singleColor = Shader$$1.create(posVS, colorFS);
            gl.shaders.varyingColor = Shader$$1.create(posNormalColorVS, varyingColorFS);
            gl.clearColor(0.8, 0.8, 0.8, 1);
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
            gl.enable(gl.BLEND);
            await gl.setupTextRendering("OpenSans-Regular.png", "OpenSans-Regular.json");
            this.componentDidUpdate();
            gl.animate((t, dt) => this.renderCanvas(t, dt));
            window.addEventListener("resize", this.windowOnResize);
        }
        componentDidUpdate(prevProps) {
            console.time();
            const newMesh = this.createMeshForWhat(this.props.what, this.props.colorSpace);
            if (this.colorPointsMesh && prevProps && prevProps.what == this.props.what) {
                newMesh.vertexBuffers.ts_Vertex2 = this.colorPointsMesh.vertexBuffers.ts_Vertex;
                this.interpolationAnimation = 2000;
            }
            else {
                newMesh.vertexBuffers.ts_Vertex2 = newMesh.vertexBuffers.ts_Vertex;
            }
            this.colorPointsMesh = newMesh;
            this.colorPossPrev = this.colorPoss;
            this.colorPoss = this.getColorsForWhat(this.props.what).map(colorSpaces[this.props.colorSpace].convert);
            this.highlightIndex =
                undefined == this.props.colorHighlight
                    ? -1
                    : this.getColorsForWhat(this.props.what).findIndex(color => color.equals(this.props.colorHighlight));
            console.timeEnd();
        }
        componentWillUnmount() {
            window.removeEventListener("resize", this.windowOnResize);
        }
        renderCanvas(_t, dt) {
            const { gl } = this;
            const { eye, center, up } = this.props.camera;
            if (this.props.rotation) {
                this.rotationTime += dt;
            }
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.cullFace(gl.BACK);
            gl.matrixMode(gl.PROJECTION);
            gl.loadIdentity();
            gl.perspective(40, gl.canvas.width / gl.canvas.height, 0.1, 1000);
            gl.lookAt(eye, center, up);
            gl.matrixMode(gl.MODELVIEW);
            gl.loadIdentity();
            // gl.rotate((this.rotationTime / 1000) * 10, 0, 0, 1)
            gl.pushMatrix();
            colorSpaces[this.props.colorSpace].render(gl);
            gl.popMatrix();
            let f = 0;
            if (this.interpolationAnimation > 0) {
                f = this.interpolationAnimation / 2000;
                this.interpolationAnimation -= dt;
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
                    .uniforms({ color: this.props.colorHighlight.textColor().gl() })
                    .draw(this.sphereMesh);
            }
        }
        createMeshFromColors(colors, colorSpace) {
            const { sphereMesh } = this;
            const tempMatrix1 = new M4(), tempMatrix2 = new M4(), tempMatrix3 = new M4();
            const pointMeshes = colors.map(color => {
                const pos = colorSpaces[colorSpace].convert(color);
                const pointSize = 0.01;
                const glColor = color.gl();
                const result = sphereMesh
                    .transform(M4.multiply(M4.translate(pos, tempMatrix2), M4.scale(pointSize, tempMatrix1), tempMatrix3))
                    .addVertexBuffer("colors", "ts_Color");
                result.colors = fillArray(sphereMesh.vertices.length, glColor);
                return result;
            });
            return new Mesh$$1()
                .addIndexBuffer("TRIANGLES")
                .addVertexBuffer("normals", "ts_Normal")
                .addVertexBuffer("colors", "ts_Color")
                .concat(...pointMeshes)
                .compile();
        }
    }
    const whats = {
        hues() {
            return Array.from({ length: 180 }, (_, i) => chroma$2.hsl(i * 2, 1, 0.5));
        },
        rgbCube16() {
            return rgbCube(16);
        },
        w3cx11() {
            return Object.keys(chroma$2.w3cx11).map(x => chroma$2(x));
        },
        _50shadesOfGrey() {
            return Array.from({ length: 52 }, (_, i) => chroma$2.hsl(0, 0, i / 51));
        },
        ks() {
            const result = [];
            for (let i = 1000; i <= 40000; i += 100) {
                result.push(chroma$2.kelvin(i));
            }
            return result;
        },
        cubehelix() {
            return chroma$2.scale(chroma$2.cubehelix()).colors(100, false);
        },
        scalePaired() {
            return chroma$2.scale("Paired").colors(100, false);
        },
        hslCylinder() {
            const X = 5;
            const Y = 10;
            const R = 90;
            const result = [];
            for (let r = 0; r < R; r++) {
                for (let x = 0; x < X; x++) {
                    for (let y = 0; y < Y; y++) {
                        result.push(chroma$2.hsl((r / R) * 360, x / (X - 1), lerp(0.01, 0.99, y / (Y - 1))));
                    }
                    // result.push(chroma.hsl((r / R) * 360, x / X, 0))
                    // result.push(chroma.hsl((r / R) * 360, x / X, 1))
                }
            }
            return result;
        },
    };
    function rgbCube(r = 16) {
        return Mesh$$1.box(r, r, r).vertices.map(({ x, y, z }) => chroma$2.gl(x, y, z, 1));
    }
    function fillArray(length, value) {
        const result = new Array(length);
        let i = length;
        while (i--) {
            result[i] = value;
        }
        return result;
    }

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

    class AppState {
        constructor() {
            this.colorSpace = "hsl";
            this.what = "hslCylinder";
            this.rotation = true;
            this.highlightedColor = undefined;
            this.selectedColor = undefined;
            this.camera = new Camera();
        }
    }
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
            children: "Lightness goes from 1% to 99%, as 0% (black) and 100% (white) colors collapse into a single",
            detail: color => color.css("hsl"),
        },
    ];
    const colorSpaceItems = Object.keys(colorSpaces).map(key => {
        const colorSpace = colorSpaces[key];
        return {
            value: key,
            title: colorSpace.title,
            children: colorSpace.children,
        };
    });
    class App extends React.Component {
        constructor() {
            super(...arguments);
            this.state = new AppState();
        }
        render() {
            const { highlightedColor, selectedColor, colorSpace, what, rotation, camera } = this.state;
            const displayColor = highlightedColor || selectedColor;
            return (React__default.createElement("div", { id: "container" },
                React__default.createElement(Picker, { id: "colorSpace", title: "Choose a color space...", items: colorSpaceItems, className: "picker", onchange: colorSpace => this.setState({ colorSpace }), value: this.state.colorSpace }),
                React__default.createElement(Picker, { id: "what", title: "...and what to draw:", items: whats$1, className: "picker", onchange: what => this.setState({ what }), value: this.state.what }),
                React__default.createElement("div", { id: "canvasContainer" },
                    // @ts-ignore
                    React__default.createElement(SpacesCanvas, { id: "spacesCanvas", colorSpace: this.state.colorSpace, what: this.state.what, rotation: rotation, colorHighlight: displayColor, onHoverChange: highlightedColor => this.setState({ highlightedColor }), onClick: () => this.setState({ selectedColor: this.state.highlightedColor }), camera: camera }),
                    React__default.createElement("div", { id: "info" },
                        React__default.createElement("div", { id: "activeColorPreview", style: displayColor && {
                                backgroundColor: displayColor.css(),
                                color: displayColor.textColor().name(),
                            } },
                            React__default.createElement("div", { id: "activeColorHex" }, (displayColor && displayColor.hex()) || "goo"),
                            React__default.createElement("div", { id: "activeColorDetail" }, displayColor && whats$1.find(cs => cs.value == what).detail(displayColor))),
                        React__default.createElement("label", null,
                            React__default.createElement("input", { type: "checkbox", checked: rotation, onChange: e => this.setState({ rotation: e.target.checked }) }),
                            "Rotation"),
                        React__default.createElement("button", { onClick: () => this.setState({ camera: { eye: V(5, 0, 0), center: V3.O, up: V3.Z } }) }, "X"),
                        React__default.createElement("button", { onClick: () => this.setState({ camera: { eye: V(0, 5, 0), center: V3.O, up: V3.Z } }) }, "Y"),
                        React__default.createElement("button", { onClick: () => this.setState({ camera: { eye: V(0, 0, 5), center: V3.O, up: V3.Y } }) }, "Z")))));
        }
    }

    console.log("foo");
    ReactDOM.render(React__default.createElement(App), document.getElementById("react-root"));

}(React,ReactDOM));
//# sourceMappingURL=bundle.js.map
