import { DataProvidor } from "./DataProvider.js";

export default class LocalDataProvider extends DataProvidor {
    constructor() {
        super();

        //first save
        this.history = [];

        //save categories in memory
        this.categories = [];
        this.categoryMemory = {};


        // keys for saving in LocalStorage:
        this.HISTORY_KEY = "expense_history";
        this.CATEGORIES_KEY = "category_list";
        this.CATEGORY_MEMORY_KEY = "category_memory";

        const rawMemory = localStorage.getItem(this.CATEGORY_MEMORY_KEY);
        this.categoryMemory = rawMemory ? JSON.parse(rawMemory) : {};
    }

    async loadHistory() {
        const raw = localStorage.getItem(this.HISTORY_KEY); //return text

        if (!raw) {
            this.history = [];
            return [];
        }

        try {
            this.history = JSON.parse(raw); //text converter
            return this.history;
        } catch (err) {
            console.error("Failed to parse history from localStorage", err);
            this.history = [];
            return [];
        }
    }

    async saveHistory(history) {
        //update history in memory
        this.history = history;

        //convert history to JSON
        const json = JSON.stringify(history);

        //save in LocalStorage
        localStorage.setItem(this.HISTORY_KEY, json);

        return;
    }

    async mergeTransactions(newTransactions, history) {
        const merged = [...history];

        for (const tx of newTransactions) {
            //every new transaction gets unique id
            tx.id = crypto.randomUUID();

            //add to history
            merged.push(tx);
        }

        return merged;
    }

    async getUncategorized() {
        if (!this.history || this.history.length === 0) {
            return [];
        }

        const result = this.history.filter(tx =>
            !tx.category ||              //no category
            tx.category.main === null ||
            tx.category.main === undefined ||
            tx.category.main === ""
        );

        return result;
    }

    async updateCategory(transactionId, category) {

        //find transaction location in history
        const index = this.history.findIndex(tx => tx.id === transactionId);

        //if did not find
        if (index === -1) {
            throw new Error(`Transaction with ID ${transactionId} not found`);
        }

        //update category
        this.history[index].category = {
            main: category.main,
            sub: category.sub ?? null   //if there is no sub-category put null
        };

        //smart recognize: save the decision for next use
        const key = tx.description.toLowerCase().trim();
        this.categoryMemory[key] = tx.category;
        localStorage.setItem(
            this.CATEGORY_MEMORY_KEY,
            JSON.stringify(this.categoryMemory)
        );


        //return the update history
        return this.history[index];
    }

    async getAllCategories() {
        //load categories from memory or from LocalStorge
        const raw = localStorage.getItem(this.CATEGORIES_KEY);

        if (raw) {
            try {
                this.categories = JSON.parse(raw);
            } catch (err) {
                console.error("Failed to parse categories from localStorage", err);
                this.categories = [];
            }
        } else {
            this.categories = [];
        }

        return [...this.categories];
    }

    async addCustomCategory(mainCategoryName) {
        //verify correct string
        if (!mainCategoryName || typeof mainCategoryName !== "string") {
            throw new Error("Category name must be a non-empty string");
        }

        const exists = this.categories.some(cat => cat.name === mainCategoryName);
        if (exists) {
            throw new Error(`Category '${mainCategoryName}' already exists`);
        }

        //creating new object of category
        const newCategory = {
            name: mainCategoryName,
            subcategories: []
        };

        //add to cateories list
        this.categories.push(newCategory);
        localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(this.categories));

        return newCategory;
    }

    /**
     * Loads the list of categories from localStorage.
     *
     * Storage Format:
     * ---------------
     * Categories are stored under the key CATEGORIES_KEY as a JSON string.
     *
     * Example structure:
     * [
     *   { 
     *     name: "Food",
     *     subcategories: ["Groceries", "Eating Out"]
     *   },
     *   {
     *     name: "Transport",
     *     subcategories: ["Fuel", "Parking"]
     *   }
     * ]
     *
     * Return value:
     * --------------
     * - If no categories were saved yet → returns an empty array.
     * - If JSON is corrupted → logs an error and returns an empty array.
     *
     * This function does NOT write anything — it only reads.
     *
     * @returns {Array<{name: string, subcategories: Array<string>}>}
     *          Array of categories with their subcategories.
     */
    async loadCategories() {
        const raw = localStorage.getItem(this.CATEGORIES_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch (err) {
            console.error("Failed to parse categories JSON:", err);
            return [];
        }
    }


    async addSubcategory(mainCategoryName, subName) {

        if (!mainCategoryName || !subName) {
            throw new Error("Both main category and subcategory names are required");
        }

        //find main category
        const category = this.categories.find(cat => cat.name === mainCategoryName);

        if (!category) {
            throw new Error(`Main category '${mainCategoryName}' does not exist`);
        }

        const exists = category.subcategories.includes(subName);
        if (exists) {
            throw new Error(`Subcategory '${subName}' already exists under '${mainCategoryName}'`);
        }

        //add to sub-categories list of the main category
        category.subcategories.push(subName);
        localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(this.categories));

        return category;
    }

    async deleteCategory(mainCategoryName) {

        if (!mainCategoryName) {
            throw new Error("Category name is required");
        }

        //find category's index
        const index = this.categories.findIndex(cat => cat.name === mainCategoryName);

        if (index === -1) {
            throw new Error(`Category '${mainCategoryName}' does not exist`);
        }

        //delete from list
        this.categories.splice(index, 1);

        //update transactions that used this category
        this.history = this.history.map(tx => {
            if (tx.category && tx.category.main === mainCategoryName) {
                return {
                    ...tx,
                    category: { main: null, sub: null }
                };
            }
            return tx;
        });
        for (const key in this.categoryMemory) {
            if (this.categoryMemory[key].main === mainCategoryName) {
                delete this.categoryMemory[key];
            }
        }

        localStorage.setItem(
            this.CATEGORY_MEMORY_KEY,
            JSON.stringify(this.categoryMemory)
        );


        return;
    }

    async deleteSubcategory(mainCategoryName, subName) {

        if (!mainCategoryName || !subName) {
            throw new Error("Both main category and subcategory names are required");
        }

        //find main category
        const category = this.categories.find(cat => cat.name === mainCategoryName);

        if (!category) {
            throw new Error(`Main category '${mainCategoryName}' does not exist`);
        }

        // find sub-category's index
        const index = category.subcategories.indexOf(subName);

        if (index === -1) {
            throw new Error(`Subcategory '${subName}' does not exist under '${mainCategoryName}'`);
        }

        //delete from list
        category.subcategories.splice(index, 1);

        //update transactions that used this sub-category
        this.history = this.history.map(tx => {
            if (tx.category &&
                tx.category.main === mainCategoryName &&
                tx.category.sub === subName) {
                return {
                    ...tx,
                    category: { main: mainCategoryName, sub: null }
                };
            }
            return tx;
        });

        //update categoryMemory (for the auto categorize)
        for (const key in this.categoryMemory) {
            const cat = this.categoryMemory[key];

            if (cat.main === mainCategoryName && cat.sub === subName) {
                this.categoryMemory[key] = { main: mainCategoryName, sub: null };
            }
        }
        localStorage.setItem(
            this.CATEGORY_MEMORY_KEY,
            JSON.stringify(this.categoryMemory)
        );

        return;
    }

    async deleteTransaction(transactionId) {

        if (!transactionId) {
            throw new Error("Transaction ID is required");
        }

        //find index
        const index = this.history.findIndex(tx => tx.id === transactionId);

        if (index === -1) {
            throw new Error(`Transaction with ID '${transactionId}' does not exist`);
        }

        //delete
        this.history.splice(index, 1);

        return;
    }

    async searchTransactions(query) {

        if (!query || query.trim() === "") {
            return [...this.history];
        }

        const q = query.toLowerCase();

        return this.history.filter(tx => {
            const desc = (tx.description || "").toLowerCase();
            const amount = String(tx.amount);
            const date = (tx.date || "").toLowerCase();

            const main = tx.category?.main ? tx.category.main.toLowerCase() : "";
            const sub = tx.category?.sub ? tx.category.sub.toLowerCase() : "";

            return (
                desc.includes(q) ||
                amount.includes(q) ||
                date.includes(q) ||
                main.includes(q) ||
                sub.includes(q)
            );
        });
    }

    async filterByDateRange(startDate, endDate) {

        return this.history.filter(tx => {

            const txDate = new Date(tx.date);

            //startDate    
            if (startDate && txDate < new Date(startDate)) {
                return false;
            }

            //endDate     
            if (endDate && txDate > new Date(endDate)) {
                return false;
            }

            return true;
        });
    }

    async getTransactionsByCategory(main) {

        if (!main) {
            throw new Error("Main category name is required");
        }

        return this.history.filter(tx =>
            tx.category &&
            tx.category.main === main
        );
    }

    async getTransactionsBySubcategory(main, sub) {

        if (!main || !sub) {
            throw new Error("Both main and subcategory names are required");
        }

        return this.history.filter(tx =>
            tx.category &&
            tx.category.main === main &&
            tx.category.sub === sub
        );
    }


    async exportToCSV() {

        const header = [
            "id",
            "date",
            "amount",
            "description",
            "category_main",
            "category_sub"
        ].join(",");

        //clean text
        const escapeCSV = (text) => {
            if (text == null) return "";
            const safe = String(text).replace(/\n/g, " ").replace(/"/g, '""');
            return `"${safe}"`;
        };

        const rows = this.history.map(tx => {
            return [
                escapeCSV(tx.id),
                escapeCSV(tx.date),
                escapeCSV(tx.amount),
                escapeCSV(tx.description),
                escapeCSV(tx.category?.main),
                escapeCSV(tx.category?.sub),
            ].join(",");
        });

        const csv = [header, ...rows].join("\n");

        //create blob for download
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "transactions.csv";
        a.click();

        URL.revokeObjectURL(url);
    }


    async exportToExcel() {

        const formatted = this.history.map(tx => ({
            id: tx.id || "",
            date: tx.date || "",
            amount: tx.amount ?? "",
            description: tx.description?.replace(/\n/g, " ") ?? "",
            category_main: tx.category?.main ?? "",
            category_sub: tx.category?.sub ?? ""
        }));

        //create workbook
        const wb = XLSX.utils.book_new();

        //convert for sheets
        const ws = XLSX.utils.json_to_sheet(formatted, {
            skipHeader: false
        });

        // add sheet
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");

        // download
        XLSX.writeFile(wb, "transactions.xlsx");
    }

    async getMonthlyTotals() {

        const totals = {};

        for (const tx of this.history) {

            if (tx.amount >= 0) continue;

            const month = tx.date.slice(0, 7);   // "YYYY-MM"

            if (!totals[month]) {
                totals[month] = 0;
            }

            totals[month] += Math.abs(tx.amount);
        }

        //convert for objects array
        return Object.entries(totals).map(([month, total]) => ({
            month,
            total
        }));
    }

    async getYearlyTotals() {

        const totals = {};

        for (const tx of this.history) {

            if (tx.amount >= 0) continue;

            const year = tx.date.slice(0, 4);  // "YYYY"

            if (!totals[year]) {
                totals[year] = 0;
            }

            totals[year] += Math.abs(tx.amount);
        }

        return Object.entries(totals).map(([year, total]) => ({
            year,
            total
        }));
    }

    async getSpendingTrends() {

        const totals = {};

        for (const tx of this.history) {

            if (tx.amount >= 0) continue;

            const date = tx.date; // YYYY-MM-DD

            if (!totals[date]) {
                totals[date] = 0;
            }

            totals[date] += Math.abs(tx.amount);
        }

        //convert for objects array & sory by date
        return Object.entries(totals)
            .map(([date, total]) => ({ date, total }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    async autoCategorize(transaction) {

        if (!transaction || !transaction.description) {
            return null;
        }

        const key = transaction.description.toLowerCase().trim();

        //if we have a guess - return it
        if (this.categoryMemory[key]) {
            return this.categoryMemory[key];
        }

        return null; //if we dont guess
    }


    async splitTransaction(transactionId, parts) {

        if (!transactionId) {
            throw new Error("Transaction ID is required");
        }

        if (!Array.isArray(parts) || parts.length === 0) {
            throw new Error("parts must be a non-empty array");
        }

        //find te origin category
        const index = this.history.findIndex(tx => tx.id === transactionId);
        if (index === -1) {
            throw new Error(`Transaction '${transactionId}' not found`);
        }

        const original = this.history[index];

        //check correcting for every part
        for (const p of parts) {

            if (p.amount == null) {
                throw new Error("Each split part must contain an amount");
            }

            //convert if it needed
            p.amount = Number(p.amount);

            if (Number.isNaN(p.amount)) {
                throw new Error("Split part amount must be a valid number");
            }

            //main category
            if (!p.category || !p.category.main) {
                throw new Error("Each split part must contain a category with a valid 'main'");
            }

            if (p.category.sub === undefined) {
                p.category.sub = null;
            }
        }

        //make sure that sum of all parts equal to the origin sum
        const sumParts = parts.reduce((sum, p) => sum + p.amount, 0);

        if (sumParts !== original.amount) {
            throw new Error("Sum of split parts must equal original transaction amount");
        }

        //delete the origin
        this.history.splice(index, 1);

        //create new transactions
        const newTransactions = parts.map(p => ({
            id: crypto.randomUUID(),
            date: original.date,
            amount: p.amount,
            description: original.description?.replace(/\n/g, " ") || "",
            category: {
                main: p.category.main,
                sub: p.category.sub ?? null
            }
        }));

        //add to history
        this.history.push(...newTransactions);

        return newTransactions;
    }



}
