// database/db.ts
import * as SQLite from "expo-sqlite";

// Mở database SQLite (API đồng bộ của Expo SDK mới)
const db = SQLite.openDatabaseSync("contacts.db");

/**
 * Khởi tạo database:
 * - Tạo bảng contacts nếu chưa có
 * - Kiểm tra số dòng
 * - Nếu trống -> seed dữ liệu mẫu
 */
export const initDB = () => {
  // 1. Tạo bảng
  db.execSync(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        favorite INTEGER DEFAULT 0,
        created_at INTEGER
      );
  `);

  // 2. Kiểm tra có bao nhiêu bản ghi
  const result = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM contacts;"
  );

  // 3. Nếu bảng trống -> seed dữ liệu mẫu
  if (result && result.count === 0) {
    const now = Date.now();

    db.runSync(
      `
        INSERT INTO contacts (name, phone, email, favorite, created_at)
        VALUES (?, ?, ?, ?, ?),
               (?, ?, ?, ?, ?),
               (?, ?, ?, ?, ?)
      `,
      "Nguyễn Văn A", "0901234567", "vana@example.com", 0, now,
      "Trần Thị B", "0912345678", "thib@example.com", 0, now,
      "Phạm Minh C", "0987654321", "minhc@example.com", 1, now
    );

    console.log("✅ Seeded sample contacts");
  }
};

export default db;
