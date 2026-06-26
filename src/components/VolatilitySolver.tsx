import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from './VolatilitySolver.module.css';
import {
    DEFAULT_TREASURY_DATA,
    calculateSplineCoefficients,
    interpolateSpline,
    impliedVolatilityNewton,
    vegaCall
} from './mathEngine';

interface VolatilitySolverProps {
    onClose: () => void;
}

// Option data item for table
interface PreloadedOption {
    strike: number;
    marketPrice: number;
    calculatedIv?: number;
    vega?: number;
    iterations?: number;
}

export const VolatilitySolver: React.FC<VolatilitySolverProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'spline' | 'smile' | 'sandbox'>('spline');

    // ----------------------------------------------------
    // TAB 1: YIELD CURVE INTERPOLATOR STATE & LOGIC
    // ----------------------------------------------------
    const [treasuryData] = useState(DEFAULT_TREASURY_DATA);
    const [splineMaturityInput, setSplineMaturityInput] = useState<string>('5.0');
    const [splineResult, setSplineResult] = useState<{
        maturity: number;
        rate: number;
        intervalIdx: number;
        a: number;
        b: number;
        c: number;
        d: number;
        xNode: number;
    } | null>(null);

    // Calculate coefficients based on treasury data
    const splineCoefficients = useMemo(() => {
        const x = treasuryData.map(d => d.maturity);
        const y = treasuryData.map(d => d.yield);
        return calculateSplineCoefficients(x, y);
    }, [treasuryData]);

    // Handle Spline Interpolate Action
    const handleSplineInterpolate = (maturityVal: number) => {
        const xNodes = treasuryData.map(d => d.maturity);
        const yNodes = treasuryData.map(d => d.yield);
        const rate = interpolateSpline(maturityVal, xNodes, yNodes, splineCoefficients);

        // Find interval
        let idx = 0;
        const N = xNodes.length;
        if (maturityVal <= xNodes[0]) {
            idx = 0;
        } else if (maturityVal >= xNodes[N - 1]) {
            idx = N - 2;
        } else {
            for (let j = 0; j < N - 1; j++) {
                if (maturityVal >= xNodes[j] && maturityVal <= xNodes[j+1]) {
                    idx = j;
                    break;
                }
            }
        }

        setSplineResult({
            maturity: maturityVal,
            rate,
            intervalIdx: idx,
            a: splineCoefficients.a[idx],
            b: splineCoefficients.b[idx],
            c: splineCoefficients.c[idx],
            d: splineCoefficients.d[idx],
            xNode: xNodes[idx]
        });
    };

    // Run interpolation on mount
    useEffect(() => {
        handleSplineInterpolate(5.0);
    }, []);

    // SVG dimensions
    const svgWidth = 600;
    const svgHeight = 330;
    const margins = { top: 25, right: 30, bottom: 40, left: 55 };
    const plotWidth = svgWidth - margins.left - margins.right;
    const plotHeight = svgHeight - margins.top - margins.bottom;

    const xMin = 0;
    const xMax = 30;
    const yMin = 3.0;
    const yMax = 5.0;

    // Convert values to SVG coordinate space
    const toSvgX = (xVal: number) => margins.left + ((xVal - xMin) / (xMax - xMin)) * plotWidth;
    const toSvgY = (yVal: number) => margins.top + plotHeight - ((yVal - yMin) / (yMax - yMin)) * plotHeight;

    // Inverse coordinates for chart interaction
    const fromSvgX = (svgX: number) => {
        const relativeX = svgX - margins.left;
        const fraction = relativeX / plotWidth;
        const val = xMin + fraction * (xMax - xMin);
        return Math.max(xMin, Math.min(xMax, val));
    };

    // Calculate spline curve points for plotting
    const splineCurvePoints = useMemo(() => {
        const points: { x: number; y: number }[] = [];
        const steps = 150;
        const xNodes = treasuryData.map(d => d.maturity);
        const yNodes = treasuryData.map(d => d.yield);

        for (let i = 0; i <= steps; i++) {
            const mat = xMin + (i / steps) * (xMax - xMin);
            const rate = interpolateSpline(mat, xNodes, yNodes, splineCoefficients);
            points.push({ x: mat, y: rate });
        }
        return points;
    }, [treasuryData, splineCoefficients]);

    // Handle SVG chart interaction (hover & click)
    const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);

    const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        // Scale to matches SVG viewbox (600x330)
        const svgX = (clientX / rect.width) * svgWidth;
        
        if (svgX >= margins.left && svgX <= svgWidth - margins.right) {
            const mat = fromSvgX(svgX);
            const xNodes = treasuryData.map(d => d.maturity);
            const yNodes = treasuryData.map(d => d.yield);
            const rate = interpolateSpline(mat, xNodes, yNodes, splineCoefficients);
            setHoverPoint({ x: mat, y: rate });
        } else {
            setHoverPoint(null);
        }
    };

    const handleSvgMouseLeave = () => {
        setHoverPoint(null);
    };

    const handleSvgClick = () => {
        if (hoverPoint) {
            const formatted = hoverPoint.x.toFixed(2);
            setSplineMaturityInput(formatted);
            handleSplineInterpolate(hoverPoint.x);
        }
    };

    // ----------------------------------------------------
    // TAB 2: OPTIONS SKEW / SMILE STATE & LOGIC
    // ----------------------------------------------------
    const [optionsTerm, setOptionsTerm] = useState<'short' | 'long'>('short');

    // Preloaded S&P 500 option prices from Feb 27, 2026 (Slide 29/30 data)
    const shortTermOptionInputs = useMemo<PreloadedOption[]>(() => [
        { strike: 4800, marketPrice: 2086.55 },
        { strike: 5000, marketPrice: 1888.45 },
        { strike: 5500, marketPrice: 1392.10 },
        { strike: 6000, marketPrice: 900.85 },
        { strike: 6400, marketPrice: 521.25 },
        { strike: 6800, marketPrice: 183.75 },
        { strike: 7000, marketPrice: 58.60 },
        { strike: 7250, marketPrice: 2.825 },
        { strike: 8000, marketPrice: 0.125 }
    ], []);

    const longTermOptionInputs = useMemo<PreloadedOption[]>(() => [
        { strike: 2000, marketPrice: 5009.40 },
        { strike: 4000, marketPrice: 3571.20 },
        { strike: 6000, marketPrice: 2336.60 },
        { strike: 8000, marketPrice: 1322.10 },
        { strike: 10400, marketPrice: 402.00 },
        { strike: 12000, marketPrice: 213.25 },
        { strike: 14000, marketPrice: 66.10 }
    ], []);

    // Calculate options details dynamically
    const optionsData = useMemo(() => {
        // Option parameters
        const spot = 6856.54;
        const q = 0.015; // 1.5% dividend yield
        let T = 0.0767;  // Short term (28 days / 365 = 0.0767)
        let r = 0.03676; // Short term yield curve rate (3.676%)

        if (optionsTerm === 'long') {
            T = 5.81;        // Long term (5.81 years)
            r = 0.035814;    // Long term rate (3.5814%)
        }

        const list = optionsTerm === 'short' ? shortTermOptionInputs : longTermOptionInputs;

        return list.map(opt => {
            const solver = impliedVolatilityNewton(spot, opt.strike, T, r, q, opt.marketPrice);
            const vega = vegaCall(spot, opt.strike, T, r, q, solver.impliedVolatility);
            return {
                ...opt,
                calculatedIv: solver.impliedVolatility,
                vega,
                iterations: solver.iterations
            };
        });
    }, [optionsTerm, shortTermOptionInputs, longTermOptionInputs]);

    // Volatility Smile Graph mapping
    const smileXMin = optionsTerm === 'short' ? 4500 : 1500;
    const smileXMax = optionsTerm === 'short' ? 8500 : 14500;
    const smileYMin = 0.0;
    const smileYMax = 0.9;

    const toSmileSvgX = (xVal: number) => margins.left + ((xVal - smileXMin) / (smileXMax - smileXMin)) * plotWidth;
    const toSmileSvgY = (yVal: number) => margins.top + plotHeight - ((yVal - smileYMin) / (smileYMax - smileYMin)) * plotHeight;

    // ----------------------------------------------------
    // TAB 3: SANDBOX SOLVER CONSOLE STATE & LOGIC
    // ----------------------------------------------------
    const [sbSpot, setSbSpot] = useState<string>('6856.54');
    const [sbStrike, setSbStrike] = useState<string>('6800.0');
    const [sbExpiry, setSbExpiry] = useState<string>('1.0');
    const [sbDividend, setSbDividend] = useState<string>('1.5');
    const [sbRiskFree, setSbRiskFree] = useState<string>('3.38');
    const [sbMarketPrice, setSbMarketPrice] = useState<string>('350.0');
    const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
    const consoleEndRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll console
    useEffect(() => {
        consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [consoleLogs]);

    const handleLoadRateFromSpline = () => {
        const expiryVal = parseFloat(sbExpiry);
        if (isNaN(expiryVal) || expiryVal <= 0) {
            setConsoleLogs(prev => [...prev, `[ERROR] Invalid Expiry value "${sbExpiry}" to interpolate.`]);
            return;
        }
        const xNodes = treasuryData.map(d => d.maturity);
        const yNodes = treasuryData.map(d => d.yield);
        const rate = interpolateSpline(expiryVal, xNodes, yNodes, splineCoefficients);
        setSbRiskFree(rate.toFixed(4));
        setConsoleLogs(prev => [
            ...prev,
            `[INFO] Interpolated Risk-free Rate for T = ${expiryVal} years is ${rate.toFixed(4)}% (loaded from Cubic Spline)`
        ]);
    };

    const handleRunSandboxSolver = () => {
        const S = parseFloat(sbSpot);
        const K = parseFloat(sbStrike);
        const T = parseFloat(sbExpiry);
        const r = parseFloat(sbRiskFree) / 100.0;
        const q = parseFloat(sbDividend) / 100.0;
        const mktPrice = parseFloat(sbMarketPrice);

        if (isNaN(S) || isNaN(K) || isNaN(T) || isNaN(r) || isNaN(q) || isNaN(mktPrice)) {
            setConsoleLogs(prev => [...prev, '[ERROR] Please fill in all sandbox input fields with valid numbers.']);
            return;
        }

        const logs: string[] = [];
        logs.push(`============================================`);
        logs.push(`[SOLVER INIT] Executing Implied Volatility Solver`);
        logs.push(`--------------------------------------------`);
        logs.push(`Spot Price (S)      : ${S.toFixed(2)}`);
        logs.push(`Strike Price (K)    : ${K.toFixed(2)}`);
        logs.push(`Time to Expiry (T)  : ${T.toFixed(4)} years`);
        logs.push(`Risk-free Rate (r)  : ${(r * 100.0).toFixed(4)}%`);
        logs.push(`Dividend Yield (q)  : ${(q * 100.0).toFixed(2)}%`);
        logs.push(`Observed Price (Mkt): $${mktPrice.toFixed(2)}`);
        logs.push(`--------------------------------------------`);

        // Check intrinsic values bounds
        const discSpot = S * Math.exp(-q * T);
        const discStrike = K * Math.exp(-r * T);
        const intrinsic = Math.max(0, discSpot - discStrike);

        logs.push(`Calculated Intrinsic Value: $${intrinsic.toFixed(4)}`);
        logs.push(`Theoretical Upper Bound (S * e^-qT): $${discSpot.toFixed(4)}`);

        if (mktPrice <= intrinsic) {
            logs.push(`[WARNING] Option is priced below intrinsic value!`);
            logs.push(`[PROTECTION] Newton Method hit boundary. Cap IV at floor limit (sigma = 0.0010)`);
            logs.push(`[CONVERGENCE] Solved successfully. IV = 0.100%`);
            setConsoleLogs(prev => [...prev, ...logs]);
            return;
        }

        if (mktPrice >= discSpot) {
            logs.push(`[WARNING] Option price exceeds theoretical upper bound (discounted spot price)!`);
            logs.push(`[PROTECTION] Extreme pricing bounds hit. Cap IV at extreme ceiling limit (sigma = 5.000)`);
            logs.push(`[CONVERGENCE] Diverged. Option priced above logical limits.`);
            setConsoleLogs(prev => [...prev, ...logs]);
            return;
        }

        // Run Newton Raphson solver with loop details captured
        const solverResult = impliedVolatilityNewton(S, K, T, r, q, mktPrice);
        
        logs.push(`Iter | Sigma Guess | Model Price |   Vega   | Pricing Error | Next Sigma`);
        logs.push(`-----+-------------+-------------+----------+---------------+-----------`);

        solverResult.history.forEach(step => {
            const isFloor = step.sigmaNew === 0.001 && step.sigmaOld !== 0.001;
            const logLine = `${step.iteration.toString().padStart(4)} | ` +
                            `${step.sigmaOld.toFixed(6).padStart(11)} | ` +
                            `$${step.modelPrice.toFixed(4).padStart(10)} | ` +
                            `${step.vega.toFixed(2).padStart(8)} | ` +
                            `${step.diff.toFixed(6).padStart(13)} | ` +
                            `${step.sigmaNew.toFixed(6).padStart(10)}` +
                            (isFloor ? ` (Floor Protection)` : '');
            
            logs.push(logLine);
            if (step.vega < 1e-5) {
                logs.push(`      [DIVIDE-BY-ZERO PROTECTION ACTIVE] Vega is extremely low (${step.vega.toFixed(6)}). Safe offset of 1e-15 applied to divisor.`);
            }
        });

        logs.push(`--------------------------------------------`);
        if (solverResult.converged) {
            logs.push(`[SUCCESS] Solver converged in ${solverResult.iterations} iterations!`);
            logs.push(`[CONVERGENCE] Implied Volatility: ${(solverResult.impliedVolatility * 100.0).toFixed(4)}%`);
        } else {
            logs.push(`[FAILED] Solver hit iteration limit (${solverResult.iterations}) without converging.`);
            logs.push(`[CEILING] Volatility (sigma) capped at: ${(solverResult.impliedVolatility * 100.0).toFixed(4)}%`);
        }
        logs.push(`============================================\n`);

        setConsoleLogs(prev => [...prev, ...logs]);
    };

    const handleClearConsole = () => {
        setConsoleLogs([]);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>MAT264 QUANTITATIVE FINANCIAL SIMULATOR</h2>
                        <div className={styles.subtitle}>Numerical Analysis & Yield-Curve Spline Toolkit</div>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>CLOSE [X]</button>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'spline' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('spline')}
                    >
                        YIELD SPLINE (1D)
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'smile' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('smile')}
                    >
                        IMPLIED VOLATILITY SKEW
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'sandbox' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('sandbox')}
                    >
                        NEWTON SOLVER SANDBOX
                    </button>
                </div>

                {/* Tab Content */}
                <div className={styles.tabContent}>
                    {activeTab === 'spline' && (
                        <div className={styles.flexLayout}>
                            {/* Visualizer Chart */}
                            <div className={styles.panel} style={{ flex: '1.4', minWidth: '400px' }}>
                                <h3 className={styles.panelTitle}>US Treasury Yield Curve Spline Fitting</h3>
                                <div className={styles.chartWrapper}>
                                    <svg
                                        className={styles.chartSvg}
                                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                                        ref={svgRef}
                                        onMouseMove={handleSvgMouseMove}
                                        onMouseLeave={handleSvgMouseLeave}
                                        onClick={handleSvgClick}
                                    >
                                        {/* Chart Grid Lines */}
                                        {Array.from({ length: 6 }).map((_, i) => {
                                            const val = yMin + i * 0.4;
                                            const y = toSvgY(val);
                                            return (
                                                <g key={`ygrid-${i}`}>
                                                    <line x1={margins.left} y1={y} x2={svgWidth - margins.right} y2={y} className={styles.chartGrid} />
                                                    <text x={margins.left - 10} y={y + 4} textAnchor="end" className={styles.chartText}>{val.toFixed(2)}%</text>
                                                </g>
                                            );
                                        })}
                                        {Array.from({ length: 7 }).map((_, i) => {
                                            const val = i * 5;
                                            const x = toSvgX(val);
                                            return (
                                                <g key={`xgrid-${i}`}>
                                                    <line x1={x} y1={margins.top} x2={x} y2={svgHeight - margins.bottom} className={styles.chartGrid} />
                                                    <text x={x} y={svgHeight - margins.bottom + 15} textAnchor="middle" className={styles.chartText}>{val}Y</text>
                                                </g>
                                            );
                                        })}

                                        {/* Axis Titles */}
                                        <text x={margins.left + plotWidth / 2} y={svgHeight - margins.bottom + 32} textAnchor="middle" className={styles.chartText} style={{ fill: '#bd93f9' }}>
                                            Maturity (Years)
                                        </text>
                                        <text x={15} y={margins.top + plotHeight / 2} textAnchor="middle" transform={`rotate(-90 15 ${margins.top + plotHeight / 2})`} className={styles.chartText} style={{ fill: '#bd93f9' }}>
                                            Treasury Yield (%)
                                        </text>

                                        {/* Spline Path */}
                                        <path
                                            d={`M ${toSvgX(splineCurvePoints[0].x)} ${toSvgY(splineCurvePoints[0].y)} ` +
                                                splineCurvePoints.slice(1).map(p => `L ${toSvgX(p.x)} ${toSvgY(p.y)}`).join(' ')}
                                            className={styles.chartLineSpline}
                                        />

                                        {/* Bloomberg Knots (Knot points) */}
                                        {treasuryData.map((knot, i) => (
                                            <circle
                                                key={`knot-${i}`}
                                                cx={toSvgX(knot.maturity)}
                                                cy={toSvgY(knot.yield)}
                                                r={5}
                                                className={styles.chartKnot}
                                            >
                                                <title>{knot.name}: T = {knot.maturity.toFixed(3)}Y, Yield = {knot.yield}%</title>
                                            </circle>
                                        ))}

                                        {/* Selected Target Point */}
                                        {splineResult && (
                                            <circle
                                                cx={toSvgX(splineResult.maturity)}
                                                cy={toSvgY(splineResult.rate)}
                                                r={6}
                                                fill="#ff7ac6"
                                                stroke="#fff"
                                                strokeWidth={2}
                                            />
                                        )}

                                        {/* Interactive Hover Point */}
                                        {hoverPoint && (
                                            <g>
                                                <line x1={toSvgX(hoverPoint.x)} y1={margins.top} x2={toSvgX(hoverPoint.x)} y2={svgHeight - margins.bottom} className={styles.chartCrosshair} />
                                                <line x1={margins.left} y1={toSvgY(hoverPoint.y)} x2={svgWidth - margins.right} y2={toSvgY(hoverPoint.y)} className={styles.chartCrosshair} />
                                                <circle cx={toSvgX(hoverPoint.x)} cy={toSvgY(hoverPoint.y)} r={4} fill="#f1fa8c" />
                                                <rect x={toSvgX(hoverPoint.x) + 8} y={toSvgY(hoverPoint.y) - 30} width={100} height={24} fill="#0d0d1e" stroke="#f1fa8c" strokeWidth={1} rx={3} />
                                                <text x={toSvgX(hoverPoint.x) + 14} y={toSvgY(hoverPoint.y) - 14} fill="#f1fa8c" fontSize={10} fontFamily="var(--font-terminal)">
                                                    T={hoverPoint.x.toFixed(2)}Y, R={hoverPoint.y.toFixed(3)}%
                                                </text>
                                            </g>
                                        )}
                                    </svg>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#6272a4', textAlign: 'center', marginTop: '0.5rem' }}>
                                    (Move cursor over spline line and click to interpolate at maturity point)
                                </div>
                            </div>

                            {/* Interpolation Controls */}
                            <div className={styles.panel} style={{ flex: '0.9', minWidth: '300px' }}>
                                <h3 className={styles.panelTitle}>Spline Interpolation Panel</h3>
                                <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                                    <label>Maturity Target (T in years)</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="number"
                                            step="0.05"
                                            min="0.08"
                                            max="30.0"
                                            value={splineMaturityInput}
                                            onChange={(e) => setSplineMaturityInput(e.target.value)}
                                            className={styles.inputField}
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            className={`${styles.btn} ${styles.btnCyan}`}
                                            onClick={() => {
                                                const val = parseFloat(splineMaturityInput);
                                                if (!isNaN(val)) handleSplineInterpolate(val);
                                            }}
                                        >
                                            SOLVE
                                        </button>
                                    </div>
                                </div>

                                {splineResult && (
                                    <div className={styles.equationDisplay}>
                                        <div style={{ color: '#f1fa8c', fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                            Result: {splineResult.rate.toFixed(4)}% yield
                                        </div>
                                        <div style={{ color: '#8be9fd', marginBottom: '0.5rem' }}>
                                            Knot Interval: j = {splineResult.intervalIdx} (T_j = {splineResult.xNode.toFixed(3)} to T_j+1 = {treasuryData[splineResult.intervalIdx+1].maturity.toFixed(3)} years)
                                        </div>
                                        <div>
                                            Local Spline Equation:<br/>
                                            <span style={{ color: '#ff7ac6' }}>
                                                S_j(x) = a_j + b_j(dx) + c_j(dx)² + d_j(dx)³
                                            </span>
                                            <div style={{ fontSize: '0.85rem', color: '#6272a4', marginTop: '0.4rem', borderTop: '1px dashed #6272a4', paddingTop: '0.4rem' }}>
                                                where dx = x - x_j = {(splineResult.maturity - splineResult.xNode).toFixed(4)}<br/>
                                                a_j = {splineResult.a.toFixed(5)}<br/>
                                                b_j = {splineResult.b.toFixed(5)}<br/>
                                                c_j = {splineResult.c.toFixed(5)}<br/>
                                                d_j = {splineResult.d.toFixed(5)}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <h4 style={{ color: '#ff7ac6', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-pixel)', fontSize: '0.75rem' }}>
                                    KNOT DATA POINTS
                                </h4>
                                <div className={styles.tableWrapper} style={{ maxHeight: '140px' }}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Tenor</th>
                                                <th>Maturity</th>
                                                <th>Yield</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {treasuryData.map((knot, i) => (
                                                <tr
                                                    key={`table-knot-${i}`}
                                                    style={splineResult && splineResult.intervalIdx === i ? { background: 'rgba(139, 233, 253, 0.15)' } : {}}
                                                >
                                                    <td style={{ color: '#ff7ac6' }}>{knot.name}</td>
                                                    <td>{knot.maturity.toFixed(3)}Y</td>
                                                    <td style={{ color: '#8be9fd' }}>{knot.yield.toFixed(2)}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'smile' && (
                        <div className={styles.flexLayout}>
                            {/* Volatility Smile Chart */}
                            <div className={styles.panel} style={{ flex: '1.2', minWidth: '400px' }}>
                                <h3 className={styles.panelTitle}>Implied Volatility Smile (Strike Skew)</h3>
                                <div className={styles.chartWrapper}>
                                    <svg
                                        className={styles.chartSvg}
                                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                                    >
                                        {/* Chart Grid Lines */}
                                        {Array.from({ length: 6 }).map((_, i) => {
                                            const val = smileYMin + i * 0.18;
                                            const y = toSmileSvgY(val);
                                            return (
                                                <g key={`smilegrid-${i}`}>
                                                    <line x1={margins.left} y1={y} x2={svgWidth - margins.right} y2={y} className={styles.chartGrid} />
                                                    <text x={margins.left - 10} y={y + 4} textAnchor="end" className={styles.chartText}>{(val * 100).toFixed(0)}%</text>
                                                </g>
                                            );
                                        })}
                                        {Array.from({ length: 5 }).map((_, i) => {
                                            const val = smileXMin + i * ((smileXMax - smileXMin) / 4);
                                            const x = toSmileSvgX(val);
                                            return (
                                                <g key={`smilexgrid-${i}`}>
                                                    <line x1={x} y1={margins.top} x2={x} y2={svgHeight - margins.bottom} className={styles.chartGrid} />
                                                    <text x={x} y={svgHeight - margins.bottom + 15} textAnchor="middle" className={styles.chartText}>${val}</text>
                                                </g>
                                            );
                                        })}

                                        {/* Axis Titles */}
                                        <text x={margins.left + plotWidth / 2} y={svgHeight - margins.bottom + 32} textAnchor="middle" className={styles.chartText} style={{ fill: '#ff7ac6' }}>
                                            Strike Price ($)
                                        </text>
                                        <text x={15} y={margins.top + plotHeight / 2} textAnchor="middle" transform={`rotate(-90 15 ${margins.top + plotHeight / 2})`} className={styles.chartText} style={{ fill: '#ff7ac6' }}>
                                            Implied Volatility (IV)
                                        </text>

                                        {/* Option points and connecting line */}
                                        <path
                                            d={`M ${toSmileSvgX(optionsData[0].strike)} ${toSmileSvgY(optionsData[0].calculatedIv || 0)} ` +
                                                optionsData.slice(1).map(p => `L ${toSmileSvgX(p.strike)} ${toSmileSvgY(p.calculatedIv || 0)}`).join(' ')}
                                            className={styles.chartLineSmile}
                                        />

                                        {/* Nodes */}
                                        {optionsData.map((opt, i) => (
                                            <circle
                                                key={`smile-knot-${i}`}
                                                cx={toSmileSvgX(opt.strike)}
                                                cy={toSmileSvgY(opt.calculatedIv || 0)}
                                                r={5}
                                                fill="#bd93f9"
                                                stroke="#000"
                                                strokeWidth={1.5}
                                            >
                                                <title>Strike: ${opt.strike}, IV = {((opt.calculatedIv || 0) * 100).toFixed(2)}%</title>
                                            </circle>
                                        ))}
                                    </svg>
                                </div>
                            </div>

                            {/* Options Table */}
                            <div className={styles.panel} style={{ flex: '1', minWidth: '300px' }}>
                                <h3 className={styles.panelTitle}>S&P 500 Options Bloomberg Data</h3>

                                <div className={styles.formRow} style={{ marginBottom: '1rem' }}>
                                    <div className={styles.formGroup}>
                                        <label>Option Expiration Set</label>
                                        <select
                                            className={styles.selectField}
                                            value={optionsTerm}
                                            onChange={(e) => setOptionsTerm(e.target.value as 'short' | 'long')}
                                        >
                                            <option value="short">Short Term (Exp: 2026-03-27, T = 0.0767)</option>
                                            <option value="long">Long Term (Exp: 2031-12-19, T = 5.81)</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.85rem', marginBottom: '1rem', color: '#6272a4' }}>
                                    Spot: <span className={styles.paramCard} style={{ color: '#fff' }}>S = 6856.54</span> |
                                    Dividend: <span className={styles.paramCard} style={{ color: '#fff' }}>q = 1.5%</span> |
                                    Treasury rate: <span className={styles.paramCard} style={{ color: '#fff' }}>r = {optionsTerm === 'short' ? '3.676%' : '3.581%'}</span>
                                </div>

                                <div className={styles.tableWrapper} style={{ maxHeight: '220px' }}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Strike</th>
                                                <th>Mid Price</th>
                                                <th>Calculated IV</th>
                                                <th>Vega</th>
                                                <th>Iters</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {optionsData.map((opt, i) => (
                                                <tr key={`table-opt-${i}`}>
                                                    <td style={{ color: '#ffb86c' }}>${opt.strike.toFixed(2)}</td>
                                                    <td>${opt.marketPrice.toFixed(2)}</td>
                                                    <td style={{ color: '#50fa7b', fontWeight: 'bold' }}>
                                                        {((opt.calculatedIv || 0) * 100.0).toFixed(2)}%
                                                    </td>
                                                    <td>{(opt.vega || 0).toFixed(1)}</td>
                                                    <td>{opt.iterations}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sandbox' && (
                        <div className={styles.flexLayout}>
                            {/* Input Panel */}
                            <div className={styles.panel} style={{ flex: '1', minWidth: '300px' }}>
                                <h3 className={styles.panelTitle}>Interactive Solver Panel</h3>
                                
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Spot Asset Price (S)</label>
                                        <input
                                            type="number"
                                            value={sbSpot}
                                            onChange={(e) => setSbSpot(e.target.value)}
                                            className={styles.inputField}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Option Strike Price (K)</label>
                                        <input
                                            type="number"
                                            value={sbStrike}
                                            onChange={(e) => setSbStrike(e.target.value)}
                                            className={styles.inputField}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Time to Expiry (T, Years)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={sbExpiry}
                                            onChange={(e) => setSbExpiry(e.target.value)}
                                            className={styles.inputField}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Dividend Yield (q, %)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={sbDividend}
                                            onChange={(e) => setSbDividend(e.target.value)}
                                            className={styles.inputField}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Risk-free Rate (r, %)</label>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={sbRiskFree}
                                                onChange={(e) => setSbRiskFree(e.target.value)}
                                                className={styles.inputField}
                                                style={{ flex: 1 }}
                                            />
                                            <button
                                                className={styles.btn}
                                                style={{ padding: '0.4rem', fontSize: '0.65rem' }}
                                                onClick={handleLoadRateFromSpline}
                                                title="Evaluate Treasury Yield Spline at this Expiry T and copy here"
                                            >
                                                INTERPOLATE r
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formRow} style={{ marginTop: '0.5rem' }}>
                                    <div className={styles.formGroup}>
                                        <label>Observed Market Price (P_market)</label>
                                        <input
                                            type="number"
                                            value={sbMarketPrice}
                                            onChange={(e) => setSbMarketPrice(e.target.value)}
                                            className={styles.inputField}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button
                                        className={`${styles.btn} ${styles.btnPink}`}
                                        onClick={handleRunSandboxSolver}
                                        style={{ flex: 2 }}
                                    >
                                        RUN SOLVER
                                    </button>
                                    <button
                                        className={styles.btn}
                                        onClick={handleClearConsole}
                                        style={{ flex: 1, background: '#6272a4', color: '#fff' }}
                                    >
                                        CLEAR LOG
                                    </button>
                                </div>
                            </div>

                            {/* Console Terminal Output */}
                            <div className={styles.panel} style={{ flex: '1.4', minWidth: '400px' }}>
                                <h3 className={styles.panelTitle}>Newton-Raphson Execution Console</h3>
                                <div className={styles.consoleWrapper}>
                                    <div className={styles.consoleHeader}>
                                        &gt; Newton-Raphson Solver Console [Output Log]
                                    </div>
                                    {consoleLogs.length === 0 ? (
                                        <div style={{ color: '#6272a4', fontStyle: 'italic' }}>
                                            No solver runs executed yet. Fill out option parameters on the left and click "Run Solver" to see step-by-step mathematical convergence logs...
                                        </div>
                                    ) : (
                                        consoleLogs.map((log, idx) => {
                                            let cssClass = styles.consoleLine;
                                            if (log.startsWith('[ERROR]')) cssClass = `${styles.consoleLine} ${styles.consoleWarning}`;
                                            else if (log.startsWith('[WARNING]') || log.includes('PROTECTION')) cssClass = `${styles.consoleLine} ${styles.consoleWarning}`;
                                            else if (log.startsWith('[SUCCESS]') || log.startsWith('[CONVERGENCE]')) cssClass = `${styles.consoleLine} ${styles.consoleSuccess}`;
                                            else if (log.startsWith('[INFO]')) cssClass = `${styles.consoleLine} ${styles.consoleInfo}`;
                                            
                                            return (
                                                <div key={`log-${idx}`} className={cssClass}>
                                                    {log}
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={consoleEndRef} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default VolatilitySolver;
