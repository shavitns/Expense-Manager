export class DataProvidor {
    constructor() {
        //make sure that creating dircetly DataProvider object is impossible
        if (new.target === DataProvidor) {
            throw new Error("DataProvider is an abstract class and cannot beinstantiated directly.")
        }
    }

    /**
     * Loads the full transaction history.
     * This should return an array of all transactions stored by the system.
     *
     * @returns {Promise<Array>} - A promise that resolves to an array of transaction objects.
     */
    async loadHistory() {
        throw new Error("loadHistory() must be implemented by subclass");
    }

    /**
     * Saves the full transaction history.
     * The system will call this function whenever the user finishes categorizing
     * or when new transactions have been merged into the existing history.
     *
     * @param {Array} history - The full list of transactions to be saved.
     * @returns {Promise<void>}
     */
    async saveHistory(history) {
        throw new Error("saveHistory() must be implemented by subclass");
    }

    /**
     * Merges newly extracted transactions with the existing history.
     *
     * Responsibilities:
     *  1. Add all new transactions that do NOT already exist in history.
     *  2. Avoid inserting duplicates (see note below).
     *  3. Generate unique IDs for new transactions (if needed).
     *  4. Return a fully merged, clean, unified list.
     *
     * IMPORTANT:
     * This function does NOT save the result.
     * Saving is done separately via saveHistory().
     *
     * Duplicate handling:
     * -------------------
     * Duplicate detection must be CONSERVATIVE.
     * A transaction is considered a duplicate ONLY IF:
     *    - the date is identical
     *    - the amount is identical
     *    - the description is EXACTLY the same
     *
     * NOTE:
     * Many Israeli bank files DO NOT include time-of-day,
     * so it is VERY common to have multiple transactions
     * on the same date with the same amount.
     * Therefore we MUST allow multiple transactions on the same day.
     *
     * If even ONE field is different (amount, date, description),
     * we treat the transaction as a NEW transaction.
     *
     * @param {Array} newTransactions - Transactions parsed from a newly uploaded file.
     * @param {Array} history - The existing saved transaction list.
     * @returns {Promise<Array>} - A full merged list of all transactions.
     */
    async mergeTransactions(newTransactions, history) {
        throw new Error("mergeTransactions() must be implemented by subclass");
    }

    /**
     * Returns all transactions that have no assigned category.
     *
     * A transaction is considered "uncategorized" if:
     *   - category is null
     *   - OR category is undefined
     *   - OR category is an empty string (optional, based on implementation)
     *
     * This function is used by the Categorize Page to show the user
     * which transactions still require manual classification.
     *
     * NOTE:
     * This function does NOT modify any data — it only reads.
     *
     * @returns {Promise<Array>} - A promise resolved with a list of uncategorized transactions.
     */
    async getUncategorized() {
        throw new Error("getUncategorized() must be implemented by subclass");
    }

    /**
     * Updates the category of a specific transaction.
     *
     * Category structure:
     * -------------------
     * A category is represented as an object with:
     * {
     *   main: string,     // Main category (e.g. "Food", "Health", "Transport")
     *   sub:  string|null // Subcategory (e.g. "Groceries", "Dentist", "Fuel")
     * }
     *
     * Examples:
     *   { main: "Food", sub: "Groceries" }
     *   { main: "Health", sub: "Dentist" }
     *   { main: "Transport", sub: null }
     *
     * This design supports hierarchical categorization.
     *
     * Notes:
     * ------
     * 1. This function should update ONLY the specific transaction in memory.
     * 2. It should NOT save the history — saving must be done separately
     *    via saveHistory().
     * 3. If the transaction ID does not exist, the implementation should
     *    throw an appropriate error or return null.
     *
     * @param {string} transactionId - The unique ID of the transaction.
     * @param {{main: string, sub: string|null}} category - The new category to assign.
     *
     * @returns {Promise<Object>} - A promise resolved with the UPDATED transaction object.
     */
    async updateCategory(transactionId, category) {
        throw new Error("updateCategory() must be implemented by subclass");
    }


    /**
     * Returns the full list of categories and their subcategories.
     *
     * The structure returned should be:
     * [
     *   { name: "Food",    subcategories: ["Groceries", "Healthy Food", "Eating Out"] },
     *   { name: "Health",  subcategories: ["Clinic", "Dentist", "Alternative Medicine"] },
     *   { name: "Transport", subcategories: ["Fuel", "Bus", "Parking"] }
     * ]
     *
     * This format supports hierarchical organization of expenses.
     *
     * @returns {Promise<Array<{name: string, subcategories: Array<string>}>>}
     */
    async getAllCategories() {
        throw new Error("getAllCategories() must be implemented by subclass");
    }



    /**
     * Adds a new main category to the system.
     *
     * Example:
     *   addCustomCategory("Pets")
     *   addCustomCategory("Education")
     *
     * After adding:
     *   The category should appear in getAllCategories().
     *
     * Notes:
     * ------
     * 1. The name must be unique — providers should prevent duplicates.
     * 2. Subcategories for a newly added category should start as an empty array.
     * 3. This function does NOT automatically save — saving is done via saveHistory()
     *    or a dedicated save function if categories are stored separately.
     *
     * @param {string} mainCategoryName - The name of the new category.
     * @returns {Promise<{name: string, subcategories: Array<string>}>}
     *          The newly created category object.
     */
    async addCustomCategory(mainCategoryName) {
        throw new Error("addCustomCategory() must be implemented by subclass");
    }

    /**
 * Loads the list of categories from localStorage.
 *
 * Storage Format:
 * ---------------
 * Categories are stored under the key CATEGORY_KEY as a JSON string.
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
        throw new Error("loadCategories() must be implemented by subclass");
    }


    /**
    * Adds a new subcategory under a specific main category.
    *
    * Example:
    *   addSubcategory("Food", "Bakery")
    *   addSubcategory("Health", "Alternative Medicine")
    *
    * Notes:
    * ------
    * 1. The main category MUST already exist.
    * 2. Providers should prevent duplicate subcategory names.
    * 3. This function does NOT automatically save — saving is done via saveHistory()
    *    or a dedicated category storage system.
    *
    * Resulting structure:
    *   {
    *     name: "Food",
    *     subcategories: ["Groceries", "Eating Out", "Bakery"]
    *   }
    *
    * @param {string} mainCategoryName - Name of the main category.
    * @param {string} subName - The new subcategory to add.
    *
    * @returns {Promise<{name: string, subcategories: Array<string>}>}
    *          The UPDATED category object.
    */
    async addSubcategory(mainCategoryName, subName) {
        throw new Error("addSubcategory() must be implemented by subclass");
    }

    /**
    * Deletes an entire main category and all its subcategories.
    *
    * Example:
    *   deleteCategory("Food")
    *
    * This should remove:
    *   - the category "Food"
    *   - all its subcategories (e.g. "Groceries", "Eating Out")
    *
    * Notes:
    * ------
    * 1. If the category does not exist, providers may throw an error or simply do nothing.
    * 2. Providers must decide what to do with transactions that currently use this category.
    *    Option A: Set their category to null (recommended for now).
    *    Option B: Reject deletion unless all linked transactions are recategorized.
    * 3. This function should NOT auto-save — saving is handled by saveHistory().
    *
    * @param {string} mainCategoryName - The category to delete.
    * @returns {Promise<void>} - Resolves when the category is deleted.
    */
    async deleteCategory(mainCategoryName) {
        throw new Error("deleteCategory() must be implemented by subclass");
    }

    /**
* Deletes a specific subcategory under a given main category.
*
* Example:
*   deleteSubcategory("Food", "Eating Out")
*
* Notes:
* ------
* 1. The main category must exist — otherwise the provider may throw an error.
* 2. If the subcategory does not exist, providers may throw or ignore.
* 3. Transactions that used this subcategory should be updated:
*      Option A: Set category.sub = null (recommended)
*      Option B: Set category = null entirely
* 4. This function DOES NOT auto-save. Saving is separate.
*
* @param {string} mainCategoryName - The parent category.
* @param {string} subName - The subcategory to delete.
* @returns {Promise<void>}
*/
    async deleteSubcategory(mainCategoryName, subName) {
        throw new Error("deleteSubcategory() must be implemented by subclass");
    }

    /**
    * Deletes a specific transaction from the system.
    *
    * Example:
    *   deleteTransaction("a9331")
    *
    * Notes:
    * ------
    * 1. If the transaction ID does not exist, the provider may throw an error,
    *    or simply skip deletion.
    * 2. This function MUST remove the transaction ONLY in memory.
    *    Saving the change is done separately via saveHistory().
    * 3. Providers should ensure that the deletion affects:
    *    - History
    *    - Uncategorized list (if relevant)
    *    - Any cached transaction lists
    *
    * @param {string} transactionId - The unique ID of the transaction to delete.
    * @returns {Promise<void>}
    */
    async deleteTransaction(transactionId) {
        throw new Error("deleteTransaction() must be implemented by subclass");
    }

    /**
    * Searches transactions by a free-text query.
    *
    * The search should match:
    *   - description (partial match)
    *   - amount (string comparison allowed)
    *   - date (YYYY-MM-DD or partial)
    *   - category main or sub names (optional)
    *
    * Examples:
    *   searchTransactions("shufersal")
    *   searchTransactions("2024-11")
    *   searchTransactions("50")
    *
    * Notes:
    * ------
    * 1. Providers should perform the search on the CURRENT in-memory list.
    * 2. The search should be case-insensitive.
    * 3. Returns ONLY the matching transactions (does not modify anything).
    *
    * @param {string} query - The text the user searches for.
    * @returns {Promise<Array<Object>>} - A list of matching transactions.
    */
    async searchTransactions(query) {
        throw new Error("searchTransactions() must be implemented by subclass");
    }


    /**
    * Filters transactions by a date range.
    *
    * Both startDate and endDate should be ISO strings ("YYYY-MM-DD")
    * or Date objects (depending on implementation).
    *
    * Example:
    *   filterByDateRange("2024-01-01", "2024-01-31")
    *
    * Notes:
    * ------
    * 1. If startDate is null → no lower bound.
    * 2. If endDate is null → no upper bound.
    * 3. Returns ONLY the filtered list (does NOT modify data).
    * 4. Providers may assume dates are stored in ISO format.
    *
    * @param {string|Date|null} startDate - Starting date (inclusive).
    * @param {string|Date|null} endDate - Ending date (inclusive).
    *
    * @returns {Promise<Array<Object>>}
    */
    async filterByDateRange(startDate, endDate) {
        throw new Error("filterByDateRange() must be implemented by subclass");
    }

    /**
     * Returns ALL transactions that belong to the given main category,
     * regardless of which subcategory they belong to.
     *
     * Examples:
     *   getTransactionsByCategory("Food")
     *       → returns: Food/Groceries, Food/Eating Out, Food/Healthy Food...
     *
     * Notes:
     * -------
     * 1. Returns only transactions where transaction.category.main === main.
     * 2. Does NOT filter by subcategory.
     * 3. Does NOT modify any data.
     *
     * @param {string} main - Name of the main category.
     * @returns {Promise<Array<Object>>} - A list of matching transactions.
     */
    async getTransactionsByCategory(main) {
        throw new Error("getTransactionsByCategory() must be implemented by subclass");
    }

    /**
     * Returns ONLY transactions matching the given main category AND subcategory.
     *
     * Example:
     *   getTransactionsBySubcategory("Food", "Groceries")
     *       → returns only Food/Groceries transactions.
     *
     * Notes:
     * -------
     * 1. Must match BOTH:
     *        transaction.category.main === main
     *        transaction.category.sub  === sub
     * 2. Does NOT modify any data.
     *
     * @param {string} main - Main category name.
     * @param {string} sub - Subcategory name.
     * @returns {Promise<Array<Object>>}
     */
    async getTransactionsBySubcategory(main, sub) {
        throw new Error("getTransactionsBySubcategory() must be implemented by subclass");
    }



    /**
     * Exports ALL transactions into a downloadable CSV file.
     *
     * Example output columns:
     *   id, date, amount, description, category_main, category_sub
     *
     * Notes:
     * ------
     * 1. The provider should generate a CSV string.
     * 2. In the browser: implementation should trigger a file download.
     * 3. In backend mode: provider may return a URL or file buffer.
     * 4. This function does NOT modify any data.
     *
     * @returns {Promise<void>} - Triggers CSV download or returns CSV data.
     */
    async exportToCSV() {
        throw new Error("exportToCSV() must be implemented by subclass");
    }

    async getTransactionsBySubcategory(main, sub) {
        throw new Error("getTransactionsBySubcategory() must be implemented");
    }


    /**
     * Exports ALL transactions into an Excel (.xlsx) file.
     *
     * Notes:
     * ------
     * 1. Providers may use a library such as SheetJS (xlsx) to create the file.
     * 2. In frontend-only mode: download the file directly.
     * 3. In backend mode: generate file server-side and return URL or buffer.
     *
     * @returns {Promise<void>}
     */
    async exportToExcel() {
        throw new Error("exportToExcel() must be implemented by subclass");
    }

    /**
     * Returns total spending grouped by month.
     *
     * Output format example:
     * [
     *   { month: "2024-01", total: 3200.50 },
     *   { month: "2024-02", total: 2850.10 },
     *   ...
     * ]
     *
     * Notes:
     * ------
     * 1. Month is always represented as "YYYY-MM".
     * 2. Total should include ONLY negative amounts (expenses).
     * 3. Income can be included separately in future versions.
     * 4. Function does NOT modify any data.
     *
     * @returns {Promise<Array<{month: string, total: number}>>}
     */
    async getMonthlyTotals() {
        throw new Error("getMonthlyTotals() must be implemented by subclass");
    }

    /**
     * Returns total spending grouped by year.
     *
     * Example output:
     * [
     *   { year: "2023", total: 38200 },
     *   { year: "2024", total: 41150 },
     * ]
     *
     * Notes:
     * ------
     * 1. Year is always "YYYY".
     * 2. Only expenses (negative amounts) are included.
     *
     * @returns {Promise<Array<{year: string, total: number}>>}
     */
    async getYearlyTotals() {
        throw new Error("getYearlyTotals() must be implemented by subclass");
    }

    /**
     * Returns spending trends over time.
     *
     * Example output:
     * [
     *   { date: "2024-01-01", total: -120.50 },
     *   { date: "2024-01-02", total: -80 },
     *   ...
     * ]
     *
     * Notes:
     * ------
     * 1. Providers may choose to group by day, week, or month.
     * 2. Should return chronological ordering.
     * 3. Useful for charts showing spending patterns.
     *
     * @returns {Promise<Array<{date: string, total: number}>>}
     */
    async getSpendingTrends() {
        throw new Error("getSpendingTrends() must be implemented by subclass");
    }

    /**
     * Suggests a category for a transaction based on its description.
     *
     * Example:
     *   autoCategorize({ description: "Shufersal Gmall" })
     *     → { main: "Food", sub: "Groceries" }
     *
     * Notes:
     * ------
     * 1. This is a helper/smart function — it does NOT modify data.
     * 2. Implementation may use:
     *    - keyword matching
     *    - previous user choices
     *    - simple heuristics
     * 3. Returns null if no good match is found.
     *
     * @param {Object} transaction - Transaction object.
     * @returns {Promise<{main: string, sub: string} | null>}
     */
    async autoCategorize(transaction) {
        throw new Error("autoCategorize() must be implemented by subclass");
    }

    /**
     * Splits a transaction into multiple smaller transactions.
     *
     * Example:
     *   splitTransaction("a991", [
     *     { amount: -200, category: { main: "Food", sub: "Groceries" } },
     *     { amount: -100, category: { main: "Home", sub: "Cleaning" } }
     *   ])
     *
     * Notes:
     * ------
     * 1. The sum of parts MUST equal the original amount.
     * 2. The original transaction should be removed.
     * 3. New transactions should receive unique IDs.
     * 4. Saving is done by saveHistory().
     *
     * @param {string} transactionId
     * @param {Array<{amount: number, category: {main: string, sub: string|null}}>} parts
     *
     * @returns {Promise<Array<Object>>} - The newly created transactions.
     */
    async splitTransaction(transactionId, parts) {
        throw new Error("splitTransaction() must be implemented by subclass");
    }


}
