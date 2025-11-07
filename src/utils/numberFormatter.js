
export const formatCompactNumber = (num, decimals = 1) => {
    if (typeof num !== 'number' || isNaN(num)) {
        return '0';
    }

    // Handle negative numbers
    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    if (absNum >= 1000000000) {
        return sign + (absNum / 1000000000).toFixed(decimals) + 'B';
    } else if (absNum >= 1000000) {
        return sign + (absNum / 1000000).toFixed(decimals) + 'M';
    } else if (absNum >= 1000) {
        return sign + (absNum / 1000).toFixed(decimals) + 'K';
    } else {
        return sign + absNum.toString();
    }
};

export const formatNumberWithCommas = (num) => {
    if (typeof num !== 'number' || isNaN(num)) {
        return '0';
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const formatNumberSmart = (num) => {
    if (typeof num !== 'number' || isNaN(num)) {
        return '0';
    }

    const absNum = Math.abs(num);

    if (absNum >= 1000000) {
        return formatCompactNumber(num, 1);
    } else if (absNum >= 10000) {
        return formatCompactNumber(num, 0);
    } else {
        return formatNumberWithCommas(num);
    }
};