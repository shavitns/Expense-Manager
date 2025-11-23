import LeumiParser from "./LeumiParser";

// export default class ParserFactory {
//     static getParser(bankName) {
//         switch (bankName) {
//             case "leumi":
//                 return new LeumiParser();
//             default:
//                 throw new Error("הבנק הזה עדיין לא נתמך");
//         }
//     }
// }
export default class ParserFactory {
    static getParser(bank) {
        if (bank === "leumi") return new LeumiParser();

        throw new Error("Bank parser not implemented: " + bank);
    }
}
