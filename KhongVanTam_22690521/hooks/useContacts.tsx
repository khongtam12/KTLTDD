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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load contacts
  const loadContacts = useCallback(() => {
    try {
      const rows = db.getAllSync<Contact>("SELECT * FROM contacts ORDER BY id DESC;");
      setContacts(rows);
    } catch (err) {
      console.error("Load contacts error:", err);
      setError("Lỗi khi tải danh bạ");
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Add contact
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

  // Edit contact
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

  // Delete contact
  const deleteContact = useCallback((contact: Contact) => {
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc muốn xóa "${contact.name}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            db.runSync("DELETE FROM contacts WHERE id = ?", [contact.id]);
            setContacts(prev => prev.filter(c => c.id !== contact.id));
          },
        },
      ],
      { cancelable: true }
    );
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((contact: Contact) => {
    const newFav = contact.favorite === 1 ? 0 : 1;
    db.runSync("UPDATE contacts SET favorite = ? WHERE id = ?", [newFav, contact.id]);
    setContacts(prev => prev.map(c => (c.id === contact.id ? { ...c, favorite: newFav } : c)));
  }, []);

  // Import contacts từ API
  const importContacts = useCallback(async (apiUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data: { name: string; phone: string; email: string }[] = await res.json();

      let imported = 0;
      data.forEach(c => {
        if (c.phone && !contacts.some(existing => existing.phone === c.phone)) {
          addContact(c.name, c.phone, c.email);
          imported++;
        }
      });

      Alert.alert("Import thành công", `Đã thêm ${imported} liên hệ mới.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [contacts, addContact]);

  // Search contacts
  const searchContacts = useCallback((query: string, favoritesOnly: boolean) => {
    return contacts.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.toLowerCase().includes(query.toLowerCase());
      const matchesFavorite = !favoritesOnly || c.favorite === 1;
      return matchesSearch && matchesFavorite;
    });
  }, [contacts]);

  return {
    contacts,
    loadContacts,
    addContact,
    editContact,
    deleteContact,
    toggleFavorite,
    importContacts,
    searchContacts,
    loading,
    error,
  };
}
