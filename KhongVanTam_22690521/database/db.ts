// database/db.ts
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("todos.db"); // dùng openDatabaseSync của Expo SDK mới

// Khởi tạo DB và seed sample nếu trống
// Hàm khởi tạo DB
export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER DEFAULT 0,
      created_at INTEGER
    );
  `);

  // Kiểm tra nếu bảng trống thì seed dữ liệu mẫu
  const result = db.getFirstSync<{ count: number }>("SELECT COUNT(*) as count FROM todos;");
  if (result && result.count === 0) {
    const now = Date.now();
    db.runSync(
      `INSERT INTO todos (title, done, created_at) VALUES (?, ?, ?), (?, ?, ?)`,
      "Học React Native",
      0,
      now,
      "Viết ứng dụng Todo với SQLite",
      0,
      now
    );
    console.log("✅ Seeded sample todos");
  }
};
export default db;
