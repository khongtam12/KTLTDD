import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import db from "../database/db";

export interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
  favorite: number;
  created_at: number;
}

export default function ContactListScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Load danh sách contact
  const loadContacts = () => {
    try {
      const rows = db.getAllSync<Contact>(
        "SELECT * FROM contacts ORDER BY id DESC;"
      );
      setContacts(rows);
    } catch (err) {
      console.error("Load contacts error:", err);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const renderItem = ({ item }: { item: Contact }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        {item.phone ? (
          <Text style={styles.phone}>{item.phone}</Text>
        ) : (
          <Text style={styles.phoneEmpty}>Không có số điện thoại</Text>
        )}
      </View>

      {item.favorite === 1 && (
        <Text style={styles.favorite}>⭐</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh bạ</Text>

      {contacts.length === 0 ? (
        <Text style={styles.empty}>Chưa có liên hệ nào.</Text>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  empty: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    opacity: 0.5,
  },
  item: {
    flexDirection: "row",
    padding: 14,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    alignItems: "center",
  },
  name: { fontSize: 18, fontWeight: "600" },
  phone: { fontSize: 14, color: "#666" },
  phoneEmpty: { fontSize: 14, color: "#bbb", fontStyle: "italic" },
  favorite: { fontSize: 22, marginLeft: 8 },
});
