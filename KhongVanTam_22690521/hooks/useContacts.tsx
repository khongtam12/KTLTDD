import db from "../database/db";
// ContactListScreen.tsx
export interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
  favorite: number;
  created_at: number;
}

// Không cần import { Contact } từ chính file này

export const addContact = (name: string, phone?: string, email?: string) => {
  const now = Date.now();
  db.runSync(
    `INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES (?, ?, ?, ?, ?)`,
    [name, phone || "", email || "", 0, now]
  );
};
