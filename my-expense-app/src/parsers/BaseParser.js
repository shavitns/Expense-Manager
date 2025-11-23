export default class BaseParser {
    constructor(bankName) {
        this.bankName = bankName;
    }

    clean(str) {
        if (str === undefined || str === null) return "";
        return String(str).trim();
    }

    fixDate(str) {
        if (!str) return "";
        // לדוגמה: "02/11/2025" → "2025-11-02"
        const parts = str.split("/");
        if (parts.length !== 3) return str;

        const [day, month, year] = parts;
        return `${year}-${month}-${day}`;
    }

    parseAmount(debit, credit) {
        debit = Number(String(debit || "0").replace(",", ""));
        credit = Number(String(credit || "0").replace(",", ""));

        if (debit) return -Math.abs(debit);
        if (credit) return Math.abs(credit);
        return 0;
    }
}
