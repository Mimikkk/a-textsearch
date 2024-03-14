var O;
((f) => {
  f.create = (c, r) => {
    r.sensitive || (c = c.toLowerCase());
    const s = t.create(c);
    return (e) => {
      if (r.sensitive || (e = e.toLowerCase()), c === e)
        return { isMatch: !0, score: 0, indices: [[0, e.length - 1]] };
      const n = [];
      let a = 0;
      for (const h of s) {
        const l = o(e, h, r);
        a += l.score, l.isMatch && n.push(...l.indices);
      }
      return a /= s.length, n.length ? { isMatch: !0, score: a, indices: n } : { isMatch: !1, score: void 0, indices: void 0 };
    };
  };
  const u = (c, r, s, e, n) => {
    const a = r / c.length, h = Math.abs(e - s);
    return n ? a + h / n : h ? 1 : a;
  }, d = (c, r) => {
    const s = [];
    let e = -1, n = -1, a = 0;
    for (let h = c.length; a < h; ++a) {
      const l = c[a];
      l && e === -1 ? e = a : !l && e !== -1 && (n = a - 1, n - e + 1 >= r && s.push([e, n]), e = -1);
    }
    return c[a - 1] && a - e >= r && s.push([e, a - 1]), s;
  }, o = (c, { text: r, mask: s }, { distance: e, threshold: n, minMatch: a }) => {
    const h = r.length, l = c.length, M = Math.max(0, Math.min(0, l));
    let g = n, v = M;
    const z = Array(l);
    let S;
    for (; (S = c.indexOf(r, v)) > -1; ) {
      const y = u(r, 0, S, M, e);
      g = Math.min(y, g), v = S + h;
      let w = 0;
      for (; w < h; )
        z[S + w] = 1, ++w;
    }
    v = -1;
    let k = [], b = 1, A = h + l;
    const V = 1 << h - 1;
    for (let y = 0; y < h; ++y) {
      let w = 0, x = A;
      for (; w < x; )
        u(r, y, M + x, M, e) <= g ? w = x : A = x, x = Math.floor((A - w) / 2 + w);
      A = x;
      let K = Math.max(1, M - x + 1), j = Math.min(M + x, l) + h, B = Array(j + 2);
      B[j + 1] = (1 << y) - 1;
      for (let m = j; m >= K; m -= 1) {
        let C = m - 1, T = s.get(c[C]);
        if (z[C] = +!!T, B[m] = (B[m + 1] << 1 | 1) & T, y && (B[m] |= (k[m + 1] | k[m]) << 1 | 1 | k[m + 1]), B[m] & V && (b = u(r, y, C, M, e), b <= g)) {
          if (g = b, v = C, v <= M)
            break;
          K = Math.max(1, 2 * M - v);
        }
      }
      if (u(r, y + 1, M, M, e) > g)
        break;
      k = B;
    }
    const I = Math.max(1e-3, b);
    return v >= 0 ? { isMatch: !0, score: I, indices: d(z, a) } : { isMatch: !1, score: I, indices: void 0 };
  };
  let i;
  ((c) => {
    c.create = (r) => {
      const s = /* @__PURE__ */ new Map();
      for (let e = 0, n = r.length; e < n; ++e) {
        const a = r[e];
        s.set(a, (s.get(a) ?? 0) | 1 << n - e - 1);
      }
      return s;
    };
  })(i || (i = {}));
  let t;
  ((c) => {
    const r = (e, n) => ({
      text: e,
      mask: i.create(e),
      startIndex: n
    });
    c.create = (e) => {
      const n = [], a = e.length;
      if (a > 32) {
        let h = 0;
        const l = a % 32, M = a - l;
        for (; h < M; )
          n.push(r(e.substring(h, 32), h)), h += 32;
        if (l) {
          const g = a - 32;
          n.push(r(e.substring(g), g));
        }
      } else
        a > 0 && n.push(r(e, 0));
      return n;
    };
  })(t || (t = {}));
})(O || (O = {}));
const D = (f) => {
  let u = 0;
  for (let d = 0, o = f.length; d < o; ++d)
    f[d] !== " " && ++u;
  return u;
}, Q = (f) => Math.round(1 / Math.sqrt(D(f)) * 1e3) / 1e3, F = (f) => typeof f[0] == "string", G = (f) => f !== null;
var R;
((f) => {
  f.find = (r, s) => s.flatMap((e) => u(e, r)).filter(G);
  const u = (r, s) => "norm" in r ? d(r, s) : o(r, s), d = ({ item: r, index: s, norm: e }, n) => {
    const { isMatch: a, score: h, indices: l } = n(r);
    return a ? { item: r, index: s, matches: [{ score: h, item: r, norm: e, indices: l }], depth: 0, score: Math.pow(h, e) } : null;
  }, o = (r, s) => {
    const e = (h) => {
      var l;
      return [
        h,
        ...((l = h.children) == null ? void 0 : l.flatMap((M) => e(M))) ?? []
      ];
    }, n = [], a = e(r);
    for (const h of a) {
      const l = i(h, s);
      if (!l.length)
        continue;
      const { item: M, index: g, depth: v } = h, z = l.reduce((S, { key: k, norm: b, score: A }) => S * Math.pow(A, k.weight * b), 1);
      n.push({ item: M, index: g, matches: l, score: z, depth: v });
    }
    return n;
  }, i = ({ entries: r }, s) => {
    const e = [];
    for (const [n, a] of r)
      if (Array.isArray(a))
        for (const h of a) {
          const l = c(h, n, s);
          l && e.push(l);
        }
      else {
        const h = t(a, n, s);
        h && e.push(h);
      }
    return e;
  }, t = ({ item: r, norm: s }, e, n) => {
    const { isMatch: a, score: h, indices: l } = n(r);
    return a ? { score: h, key: e, item: r, norm: s, indices: l } : null;
  }, c = ({ item: r, norm: s, index: e }, n, a) => {
    const { isMatch: h, score: l, indices: M } = a(r);
    return h ? { score: l, key: n, index: e, item: r, norm: s, indices: M } : null;
  };
})(R || (R = {}));
var L;
((f) => {
  f.get = (u, d) => {
    try {
      const o = d.split(".");
      let i = u;
      for (let t = 0, c = o.length; t < c; ++t)
        i = i[o[t]];
      return i;
    } catch {
      return;
    }
  }, f.set = (u, d, o) => {
    const i = d.split(".");
    let t = u;
    for (let c = 0, r = i.length - 1; c < r; ++c) {
      const s = i[c];
      s in t || (t[s] = {}), t = t[s];
    }
    return t[i[i.length - 1]] = o, u;
  };
})(L || (L = {}));
var p;
((f) => {
  f.create = (t, c) => F(t) ? t.map(d.create) : t.map((r, s) => o.create(r, s, c, 0));
  let u;
  ((t) => {
    t.create = (c) => ({ item: c, norm: Q(c) });
  })(u || (u = {}));
  let d;
  ((t) => {
    t.create = (c, r) => ({ item: c, index: r, norm: Q(c) }), t.array = (c) => {
      const r = [], s = [[c, 0]];
      for (; s.length; ) {
        const [e, n] = s.pop();
        typeof e == "string" ? r.unshift(t.create(e, n)) : s.push(...e.map((a, h) => [a, h]));
      }
      return r;
    };
  })(d || (d = {}));
  let o;
  ((t) => {
    t.create = (c, r, s, e) => {
      const n = L.get(c, s.recursiveBy);
      return {
        item: c,
        index: r,
        depth: e,
        entries: i.create(c, s.keys),
        children: n == null ? void 0 : n.map((a, h) => (0, t.create)(a, h, s, e + 1))
      };
    };
  })(o || (o = {}));
  let i;
  ((t) => {
    t.create = (c, r) => r.map((s) => {
      const e = L.get(c, s.path), n = Array.isArray(e) ? d.array(e) : u.create(e);
      return [s, n];
    });
  })(i || (i = {}));
})(p || (p = {}));
var E;
((f) => {
  f.create = (o, i) => {
    const t = u.from(i), c = p.create(o, t);
    return (r, s) => {
      const e = R.find(O.create(r, t), c);
      return t.sortBy && e.sort(t.sortBy), s && (e.length = Math.min(e.length, s)), e;
    };
  };
  let u;
  ((o) => {
    o.from = (t) => {
      var c;
      return {
        recursiveBy: t == null ? void 0 : t.recursiveBy,
        sensitive: (t == null ? void 0 : t.sensitive) ?? !1,
        threshold: (t == null ? void 0 : t.threshold) ?? 0.6,
        distance: (t == null ? void 0 : t.distance) ?? 100,
        minMatch: (t == null ? void 0 : t.minMatch) ?? 1,
        sortBy: (t == null ? void 0 : t.sortBy) ?? d,
        keys: ((c = t == null ? void 0 : t.keys) == null ? void 0 : c.map(i.from)) ?? []
      };
    };
    let i;
    ((t) => {
      t.from = (c) => typeof c == "string" ? { path: c, weight: 1 } : { path: c.path, weight: c.weight ?? 1 };
    })(i || (i = {}));
  })(u = f.Configuration || (f.Configuration = {}));
  const d = (o, i) => o.score === i.score ? o.index - i.index : o.score - i.score;
})(E || (E = {}));
const J = E.create;
export {
  E as TextSearch,
  J as create
};
