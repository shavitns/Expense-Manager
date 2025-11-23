import { useState } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import ParserFactory from "../parsers/ParserFactory";
import LocalDataProvider from "../data/LocalDataProvider";

export default function ImportPage() {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [bank, setBank] = useState("");
    const [error, setError] = useState("");

    const provider = new LocalDataProvider();

    // מסיר HTML מהתחלת הקובץ (שכבות "זבל" של לאומי)
    function stripHtmlTables(tables) {
        return tables.map(table => {
            let started = false;
            const cleaned = [];

            for (const row of table) {
                const values = Object.values(row).join(" ").trim();

                // אם מתחיל HTML → לדלג
                if (!started) {
                    if (
                        values.startsWith("<html") ||
                        values.startsWith("<HTML") ||
                        values.includes("<head") ||
                        values.includes("<meta") ||
                        values.includes("<style")
                    ) {
                        continue; // לא להתחיל עדיין
                    }

                    // מזהה שורה שיש בה תאריך — זה סימן שהטבלה התחילה
                    if (values.match(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/)) {
                        started = true;
                        cleaned.push(row);
                    }
                } else {
                    cleaned.push(row);
                }
            }

            return cleaned;
        });
    }


    function handleSelectFile(e) {
        const f = e.target.files[0];
        if (!f) return;

        const allowed = [".xls", ".xlsx", ".csv"];
        const ext = f.name.toLowerCase().substring(f.name.lastIndexOf("."));

        if (!allowed.includes(ext)) {
            setError("❌ אפשר להעלות רק Excel או CSV");
            return;
        }

        setError("");
        setFile(f);
        setFileName(f.name);
    }

    async function handleProcessFile() {
        if (!file) {
            setError("❌ אין קובץ");
            return;
        }

        if (!bank) {
            setError("❌ חובה לבחור בנק");
            return;
        }

        try {
            let tables = [];

            // CSV
            if (file.name.endsWith(".csv")) {
                const result = await new Promise((resolve, reject) => {
                    Papa.parse(file, {
                        header: true,
                        complete: res => resolve(res.data),
                        error: reject
                    });
                });
                tables = [result];
            }

            // Excel
            else {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: "array" });

                tables = workbook.SheetNames.map(name =>
                    XLSX.utils.sheet_to_json(workbook.Sheets[name], { defval: "" })
                );
            }
            // ----- REMOVE LEUMI HTML NOISE -----
            const stripped = stripHtmlTables(tables);
            console.log("Stripped HTML:", stripped);

            // ----- REMOVE EMPTY ROWS -----
            //const cleanTables = ParserFactory.cleanTables(stripped);
            console.log("Clean tables:", tables);


            // Get parser
            const parser = ParserFactory.getParser(bank);

            // Parse
            const normalized = parser.parse(stripped);

            console.log("תוצאות לאחר תקנון", normalized);

            // Merge with history
            const history = await provider.loadHistory();
            const merged = await provider.mergeTransactions(normalized, history);
            await provider.saveHistory(merged);

            alert("✔ הקובץ נטען בהצלחה!");
            window.location.href = "/categorize";

        } catch (err) {
            console.error(err);
            setError("❌ שגיאה: " + err.message);
        }
    }

    return (
        <div className="p-6 min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Import Bank File</h1>

            <label className="font-semibold">בחר בנק:</label>
            <select
                className="border ml-2 p-2 bg-white"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
            >
                <option value="">בחר...</option>
                <option value="leumi">בנק לאומי</option>
            </select>

            <br /><br />

            <input
                type="file"
                accept=".xls,.xlsx,.csv"
                onChange={handleSelectFile}
                className="border p-2 bg-white"
            />

            {fileName && (
                <p className="mt-2 text-lg">📄 קובץ נבחר: <strong>{fileName}</strong></p>
            )}

            {error && (
                <p className="text-red-600 mt-3 font-bold">{error}</p>
            )}

            {file && (
                <button
                    onClick={handleProcessFile}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Process File
                </button>
            )}
        </div>
    );
}
