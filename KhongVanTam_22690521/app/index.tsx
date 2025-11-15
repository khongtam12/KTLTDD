import { Contact, addContact } from "@/hooks/useContacts";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import db, { initDB } from "../database/db";

export default function ContactListScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const loadContacts = () => {
    try {
      const rows = db.getAllSync<Contact>("SELECT * FROM contacts ORDER BY id DESC;");
      setContacts(rows);
    } catch (err) {
      console.error("Load contacts error:", err);
    }
  };

  useEffect(() => {
    initDB(); // Khởi tạo DB nếu chưa có bảng
    loadContacts();
  }, []);


  // Thêm hàm toggle favorite
const toggleFavorite = (contact: Contact) => {
  const newFav = contact.favorite === 1 ? 0 : 1;
  db.runSync("UPDATE contacts SET favorite = ? WHERE id = ?", [newFav, contact.id]);
  // Cập nhật trực tiếp UI
  setContacts(prev =>
    prev.map(c => (c.id === contact.id ? { ...c, favorite: newFav } : c))
  );
};
  const handleAddContact = () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Tên liên hệ không được để trống!");
      return;
    }
    if (email && !email.includes("@")) {
      Alert.alert("Lỗi", "Email không hợp lệ!");
      return;
    }
    addContact(name, phone, email);
    loadContacts();
    setModalVisible(false);
    setName(""); setPhone(""); setEmail("");
  };

  const renderItem = ({ item }: { item: Contact }) => (
  <View style={styles.item}>
    <View style={{ flex: 1 }}>
      <Text style={styles.name}>{item.name}</Text>
      {item.phone ? <Text style={styles.phone}>{item.phone}</Text> : <Text style={styles.phoneEmpty}>Không có số điện thoại</Text>}
      {item.email ? <Text style={styles.phone}>{item.email}</Text> : null}
    </View>

    <TouchableOpacity onPress={() => toggleFavorite(item)}>
      <Text style={[styles.favorite, { color: item.favorite ? "#f5c518" : "#ccc" }]}>★</Text>
    </TouchableOpacity>
  </View>
);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.header}>Danh bạ</Text>

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>＋</Text>
        </TouchableOpacity>

        {contacts.length === 0 ? (
          <Text style={styles.empty}>Chưa có liên hệ nào.</Text>
        ) : (
          <FlatList data={contacts} keyExtractor={item => item.id.toString()} renderItem={renderItem} />
        )}

        {/* Modal thêm contact */}
        <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Thêm liên hệ mới</Text>
              <TextInput placeholder="Tên" style={styles.input} value={name} onChangeText={setName} />
              <TextInput placeholder="Số điện thoại" style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                <Button title="Hủy" onPress={() => setModalVisible(false)} />
                <Button title="Lưu" onPress={handleAddContact} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 16 },
  empty: { textAlign: "center", marginTop: 50, fontSize: 18, opacity: 0.5 },
  item: { flexDirection: "row", padding: 14, borderBottomColor: "#eee", borderBottomWidth: 1, alignItems: "center" },
  name: { fontSize: 18, fontWeight: "600" },
  phone: { fontSize: 14, color: "#666" },
  phoneEmpty: { fontSize: 14, color: "#bbb", fontStyle: "italic" },
  favorite: { fontSize: 22, marginLeft: 8 },
  addButton: { position: "absolute", right: 20, bottom: 20, backgroundColor: "#007bff", width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", zIndex: 10 },
  addButtonText: { fontSize: 30, color: "#fff" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "80%", padding: 20, backgroundColor: "#fff", borderRadius: 10 },
  modalHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 8, marginBottom: 10 },
});