// Generate unique token number: MS-YYYYMMDD-XXXX
const generateTokenNumber = async (TokenModel) => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `MS-${dateStr}-`;

    // Find the last token for today
    const last = await TokenModel.findOne({
        tokenNumber: { $regex: `^${prefix}` },
    }).sort({ tokenNumber: -1 });

    let seq = 1;
    if (last) {
        const parts = last.tokenNumber.split('-');
        seq = parseInt(parts[parts.length - 1]) + 1;
    }

    return `${prefix}${String(seq).padStart(4, '0')}`;
};

module.exports = { generateTokenNumber };
