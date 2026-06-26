// Mathematics Engine for MAT264 Implied Volatility & Yield Curve Interpolation

export interface SplineCoefficients {
    a: number[];
    b: number[];
    c: number[];
    d: number[];
}

export interface TreasuryTenor {
    name: string;
    maturity: number; // in years
    yield: number;    // in percent
}

// 14 Bloomberg Yield Curve data points as of Feb 27, 2026
export const DEFAULT_TREASURY_DATA: TreasuryTenor[] = [
    { name: '1M', maturity: 1 / 12, yield: 3.68 },
    { name: '2M', maturity: 2 / 12, yield: 3.67 },
    { name: '3M', maturity: 3 / 12, yield: 3.65 },
    { name: '4M', maturity: 4 / 12, yield: 3.62 },
    { name: '6M', maturity: 6 / 12, yield: 3.48 },
    { name: '1Y', maturity: 1.0, yield: 3.38 },
    { name: '2Y', maturity: 2.0, yield: 3.37 },
    { name: '3Y', maturity: 3.0, yield: 3.38 },
    { name: '5Y', maturity: 5.0, yield: 3.51 },
    { name: '7Y', maturity: 7.0, yield: 3.70 },
    { name: '10Y', maturity: 10.0, yield: 3.94 },
    { name: '15Y', maturity: 15.0, yield: 4.30 },
    { name: '20Y', maturity: 20.0, yield: 4.54 },
    { name: '30Y', maturity: 30.0, yield: 4.61 }
];

/**
 * Calculates Natural Cubic Spline coefficients (a, b, c, d)
 * for a set of knots (x, y). Uses the O(N) Thomas Algorithm to
 * solve the tridiagonal system.
 */
export function calculateSplineCoefficients(x: number[], y: number[]): SplineCoefficients {
    const N = x.length;
    const n = N - 1; // number of intervals
    
    const h: number[] = [];
    for (let i = 0; i < n; i++) {
        h.push(x[i+1] - x[i]);
    }
    
    // a[i] = y[i]
    const a = [...y];
    
    // Setup tridiagonal system elements: l[i]*c[i-1] + d[i]*c[i] + u[i]*c[i+1] = B[i]
    const l = new Array(N).fill(0); // sub-diagonal
    const d = new Array(N).fill(0); // diagonal
    const u = new Array(N).fill(0); // super-diagonal
    const B = new Array(N).fill(0); // RHS vector
    
    // Boundary conditions: Natural boundary conditions S''(x_0) = S''(x_n) = 0
    // sets c_0 = 0 and c_n = 0
    d[0] = 1.0;
    u[0] = 0.0;
    B[0] = 0.0;
    
    d[n] = 1.0;
    l[n] = 0.0;
    B[n] = 0.0;
    
    for (let j = 1; j < n; j++) {
        l[j] = h[j-1];
        d[j] = 2.0 * (h[j-1] + h[j]);
        u[j] = h[j];
        B[j] = (3.0 / h[j]) * (a[j+1] - a[j]) - (3.0 / h[j-1]) * (a[j] - a[j-1]);
    }
    
    // Solve tridiagonal system using Thomas Algorithm
    const cp = new Array(N).fill(0);
    const dp = new Array(N).fill(0);
    
    cp[0] = u[0] / d[0];
    dp[0] = B[0] / d[0];
    
    for (let i = 1; i < N; i++) {
        const denom = d[i] - l[i] * cp[i-1];
        if (i < n) {
            cp[i] = u[i] / denom;
        }
        dp[i] = (B[i] - l[i] * dp[i-1]) / denom;
    }
    
    const c = new Array(N).fill(0);
    c[n] = dp[n];
    for (let i = n - 1; i >= 0; i--) {
        c[i] = dp[i] - cp[i] * c[i+1];
    }
    
    // Solve for b and d using algebraic substitution
    const b = new Array(n).fill(0);
    const d_coef = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        b[i] = (a[i+1] - a[i]) / h[i] - h[i] * (2.0 * c[i] + c[i+1]) / 3.0;
        d_coef[i] = (c[i+1] - c[i]) / (3.0 * h[i]);
    }
    
    return { a, b, c, d: d_coef };
}

/**
 * Interpolates y for a given target x, using the precomputed spline coefficients.
 */
export function interpolateSpline(
    xTarget: number,
    xNodes: number[],
    yNodes: number[],
    coef: SplineCoefficients
): number {
    const N = xNodes.length;
    
    // Flat extrapolation safety checks (Slide 10 code)
    if (xTarget <= xNodes[0]) return yNodes[0];
    if (xTarget >= xNodes[N-1]) return yNodes[N-1];
    
    // Find the correct interval
    let i = 0;
    for (let j = 0; j < N - 1; j++) {
        if (xTarget >= xNodes[j] && xTarget <= xNodes[j+1]) {
            i = j;
            break;
        }
    }
    
    const dx = xTarget - xNodes[i];
    const { a, b, c, d } = coef;
    return a[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
}

/**
 * High-precision standard normal Cumulative Distribution Function (CDF).
 * Rational approximation formula from Abramowitz & Stegun.
 */
export function normalCDF(x: number): number {
    const p = 0.2316419;
    const b1 = 0.319381530;
    const b2 = -0.356563782;
    const b3 = 1.781477937;
    const b4 = -1.821255978;
    const b5 = 1.330274429;
    
    const absX = Math.abs(x);
    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * absX * absX) * 
              (b1 * t + b2 * t * t + b3 * Math.pow(t, 3) + b4 * Math.pow(t, 4) + b5 * Math.pow(t, 5));
    return x >= 0 ? y : 1.0 - y;
}

/**
 * Standard normal Probability Density Function (PDF).
 */
export function normalPDF(x: number): number {
    return (1.0 / Math.sqrt(2.0 * Math.PI)) * Math.exp(-0.5 * x * x);
}

/**
 * Black-Scholes European Call Option pricing formula (incorporating continuous dividend yield q).
 */
export function blackScholesCall(
    S: number,
    K: number,
    T: number,
    r: number,
    q: number,
    sigma: number
): number {
    if (T <= 0) {
        return Math.max(0, S * Math.exp(-q * T) - K);
    }
    if (sigma <= 0.0001) {
        return Math.max(0, S * Math.exp(-q * T) - K * Math.exp(-r * T));
    }
    const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    return S * Math.exp(-q * T) * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
}

/**
 * Option Vega (derivative of price with respect to volatility sigma).
 */
export function vegaCall(
    S: number,
    K: number,
    T: number,
    r: number,
    q: number,
    sigma: number
): number {
    if (T <= 0 || sigma <= 0.0001) return 0;
    const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    return S * Math.exp(-q * T) * Math.sqrt(T) * normalPDF(d1);
}

export interface IterationStep {
    iteration: number;
    sigmaOld: number;
    modelPrice: number;
    vega: number;
    diff: number;
    sigmaNew: number;
    converged: boolean;
}

export interface SolverResult {
    impliedVolatility: number;
    iterations: number;
    converged: boolean;
    history: IterationStep[];
}

/**
 * Finds option implied volatility using vectorized Newton-Raphson
 * with custom boundary protections.
 */
export function impliedVolatilityNewton(
    S: number,
    K: number,
    T: number,
    r: number, // risk free rate (as fraction, e.g. 0.035)
    q: number, // dividend yield (as fraction, e.g. 0.0)
    marketPrice: number,
    maxIter = 100,
    tol = 1e-6
): SolverResult {
    let sigma = 0.5; // Initial guess (Slide 21: sigma0 = 0.5)
    const history: IterationStep[] = [];
    let converged = false;
    
    // Bounds Check: Intrinsic value checks
    const intrinsicValue = Math.max(0, S * Math.exp(-q * T) - K * Math.exp(-r * T));
    if (marketPrice <= intrinsicValue) {
        return {
            impliedVolatility: 0.001,
            iterations: 0,
            converged: true,
            history: []
        };
    }

    const maxPossiblePrice = S * Math.exp(-q * T);
    if (marketPrice >= maxPossiblePrice) {
        return {
            impliedVolatility: 5.0, // extreme IV cap
            iterations: 0,
            converged: false,
            history: []
        };
    }
    
    for (let iter = 1; iter <= maxIter; iter++) {
        const modelPrice = blackScholesCall(S, K, T, r, q, sigma);
        const vega = vegaCall(S, K, T, r, q, sigma);
        const diff = marketPrice - modelPrice; // f(sigma) = BS(sigma) - P_market = 0
        
        // Convergence criteria check (Slide 22: absolute error < 1e-6)
        if (Math.abs(diff) < tol) {
            converged = true;
            history.push({
                iteration: iter,
                sigmaOld: sigma,
                modelPrice,
                vega,
                diff,
                sigmaNew: sigma,
                converged: true
            });
            break;
        }
        
        // Divide-by-zero Fail-safe (Slide 22: 1e-15 added to Vega)
        const sigmaNewRaw = sigma + diff / (vega + 1e-15);
        
        // Floor limit: sigma = max(sigma, 0.001) (Slide 22)
        const sigmaNew = Math.max(sigmaNewRaw, 0.001);
        
        history.push({
            iteration: iter,
            sigmaOld: sigma,
            modelPrice,
            vega,
            diff,
            sigmaNew,
            converged: false
        });
        
        if (Math.abs(sigmaNew - sigma) < 1e-9) {
            sigma = sigmaNew;
            converged = true;
            break;
        }
        
        sigma = sigmaNew;
    }
    
    return {
        impliedVolatility: sigma,
        iterations: history.length,
        converged,
        history
    };
}
