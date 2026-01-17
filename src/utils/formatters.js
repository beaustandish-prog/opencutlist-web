
// Helper to simplify fractions
const getGCD = (a, b) => {
    return b ? getGCD(b, a % b) : a;
};

export const toFraction = (decimal) => {
    if (decimal === 0) return "0";

    // 1/64 precision
    const precision = 64;

    const whole = Math.floor(decimal);
    const remainder = decimal - whole;

    if (Math.abs(remainder) < 1.0 / (2 * precision)) {
        return whole.toString();
    }

    let numerator = Math.round(remainder * precision);
    let denominator = precision;

    // Check if rounding pushed us to the next whole number
    if (numerator === denominator) {
        return (whole + 1).toString();
    }

    // Simplify
    const gcd = getGCD(numerator, denominator);
    numerator /= gcd;
    denominator /= gcd;

    const fraction = `${numerator}/${denominator}`;
    return whole > 0 ? `${whole} ${fraction}` : fraction;
};

// Expects value in MM
export const formatDimension = (valueMM, targetUnit) => {
    if (valueMM === undefined || valueMM === null) return '';
    const mm = parseFloat(valueMM);
    if (isNaN(mm)) return valueMM;

    if (targetUnit === 'inch') {
        // Convert MM to Inch
        const inches = mm / 25.4;
        return toFraction(inches);
    } else if (targetUnit === 'cm') {
        const cm = mm / 10;
        return Number.isInteger(cm) ? cm.toString() : cm.toFixed(2);
    } else {
        // MM
        return Number.isInteger(mm) ? mm.toString() : mm.toFixed(1);
    }
};
