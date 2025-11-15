import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import db from "../database/db";

export interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
  favorite: number;
  created_at: number;
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Load tất cả contact
  const loadContacts = useCallback(() => {
    try {
      const rows = db.getAllSync<Contact>("SELECT * FROM contacts ORDER BY id DESC;");
      setContacts(rows);
    } catch (err) {
      console.error("Load contacts error:", err);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Thêm contact
  const addContact = useCallback((name: string, phone?: string, email?: string) => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Tên liên hệ không được để trống!");
      return;
    }
    if (email && !email.includes("@")) {
      Alert.alert("Lỗi", "Email không hợp lệ!");
      return;
    }

    const now = Date.now();
    db.runSync(
      "INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES (?, ?, ?, ?, ?)",
      [name, phone || "", email || "", 0, now]
    );
    loadContacts();
  }, [loadContacts]);

  // Sửa contact
  const editContact = useCallback((id: number, name: string, phone?: string, email?: string) => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Tên liên hệ không được để trống!");
      return;
    }
    if (email && !email.includes("@")) {
      Alert.alert("Lỗi", "Email không hợp lệ!");
      return;
    }

    db.runSync(
      "UPDATE contacts SET name = ?, phone = ?, email = ? WHERE id = ?",
      [name, phone || "", email || "", id]
    );
    loadContacts();
  }, [loadContacts]);

//   // Xóa contact
//   const deleteContact = useCallback((contact: Contact) => {
//     Alert.alert(
//       "Xác nhận",
//       `Bạn có chắc muốn xóa "${contact.name}" không?`,
//       [
//         { text: "Hủy", style: "cancel" },
//         {
//           text: "Xóa",
//           style: "destructive",
//           onPress: () => {
//             db.runSync("DELETE FROM contacts WHERE id = ?", [contact.id]);
//             setContacts(prev => prev.filter(c => c.id !== contact.id));
//           },
//         },
//       ],
//       { cancelable: true }
//     );
//   }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((contact: Contact) => {
    const newFav = contact.favorite === 1 ? 0 : 1;
    db.runSync("UPDATE contacts SET favorite = ? WHERE id = ?", [newFav, contact.id]);
    setContacts(prev => prev.map(c => (c.id === contact.id ? { ...c, favorite: newFav } : c)));
  }, []);

  return {
    contacts,
    loadContacts,
    addContact,
    editContact,
    // deleteContact,
    toggleFavorite,
  };
}
