// src/parsers/LeumiParser.js

export default class LeumiParser {
    constructor() {
        this.bankName = "Leumi";

        this.headerKeywords = [
            "תאריך",
            "תאריך ערך",
            "תיאור",
            "חובה",
            "זכות",
            "סכום",
            "אסמכתא",
        ];
    }

    /**
     * מאתר שורת כותרות מתוך השורות שעברו ניקוי
     */
    findHeaderRow(rows) {
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const values = Object.values(row);

            const matches = values.filter(v =>
                this.headerKeywords.some(h =>
                    String(v || "").includes(h)
                )
            );

            if (matches.length >= 2) {
                return { index: i, row };
            }
        }
        return null;
    }

    parse(tables) {
        const rows = tables[0];

        if (!rows || rows.length === 0) {
            throw new Error("קובץ לאומי ריק");
        }

        // --- מוצאים את שורת הכותרות ---
        const headerInfo = this.findHeaderRow(rows);

        if (!headerInfo) {
            console.log("DEBUG rows:", rows.slice(0, 20));
            throw new Error("קובץ לאומי לא תקין — לא נמצאו כותרות");
        }

        const headerIndex = headerInfo.index;
        const headerRow = headerInfo.row;

        const headers = Object.values(headerRow).map(h => String(h || "").trim());

        const dataRows = rows.slice(headerIndex + 1);

        const transactions = [];

        for (const r of dataRows) {
            const vals = Object.values(r);

            if (vals.every(v => !v || String(v).trim() === "")) continue;

            let obj = {};
            headers.forEach((h, i) => {
                obj[h] = vals[i];
            });

            const date = obj["תאריך"] || obj["תאריך ערך"] || "";
            const desc = obj["תיאור"] || "";

            let debit = parseFloat((obj["חובה"] || "").toString().replace(/,/g, "")) || 0;
            let credit = parseFloat((obj["זכות"] || "").toString().replace(/,/g, "")) || 0;

            let amount = credit - debit;

            transactions.push({
                date,
                description: desc,
                amount
            });
        }

        return transactions;
    }
}
