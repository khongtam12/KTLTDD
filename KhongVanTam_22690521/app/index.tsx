import { Contact, useContacts } from "@/hooks/useContacts";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function ContactListScreen() {
  const {
    contacts,
    addContact,
    editContact,
    toggleFavorite,
    deleteContact,
    importContacts,
    searchContacts,
    loading,
    error
  } = useContacts();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const openModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setName(contact.name);
      setPhone(contact.phone);
      setEmail(contact.email);
    } else {
      setEditingContact(null);
      setName("");
      setPhone("");
      setEmail("");
    }
    setModalVisible(true);
  };

  const handleSave = () => {
    if (editingContact) {
      editContact(editingContact.id, name, phone, email);
    } else {
      addContact(name, phone, email);
    }
    setModalVisible(false);
    setEditingContact(null);
    setName("");
    setPhone("");
    setEmail("");
  };

  const filteredContacts = useMemo(() => {
    return searchContacts(searchQuery, showFavoritesOnly);
  }, [contacts, searchQuery, showFavoritesOnly, searchContacts]);

  const renderItem = ({ item }: { item: Contact }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, item.favorite ? { color: "#f5c518" } : {}]}>
          {item.name} {item.favorite ? "★" : ""}
        </Text>
        <Text style={item.phone ? styles.phone : styles.phoneEmpty}>
          {item.phone || "Không có số điện thoại"}
        </Text>
        {item.email ? <Text style={styles.phone}>{item.email}</Text> : null}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity style={{ marginRight: 12 }} onPress={() => toggleFavorite(item)}>
          <Text style={[styles.favorite, { color: item.favorite ? "#f5c518" : "#ccc" }]}>★</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => openModal(item)}
          style={{ marginRight: 8, padding: 6, backgroundColor: "#007bff", borderRadius: 5 }}
        >
          <Text style={{ color: "#fff" }}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => deleteContact(item)}
          style={{ padding: 6, backgroundColor: "red", borderRadius: 5 }}
        >
          <Text style={{ color: "#fff" }}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.header}>Danh bạ</Text>

        <TextInput
          placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Switch value={showFavoritesOnly} onValueChange={setShowFavoritesOnly} />
          <Text style={{ marginLeft: 8 }}>Chỉ hiển thị yêu thích</Text>
        </View>

        <Button
          title="Import từ API"
          onPress={() => importContacts("https://jsonplaceholder.typicode.com/users")}
          disabled={loading}
        />

        {loading && <ActivityIndicator size="small" color="#007bff" style={{ marginTop: 8 }} />}
        {error && <Text style={{ color: "red", marginTop: 8 }}>{error}</Text>}

        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>＋</Text>
        </TouchableOpacity>

        {filteredContacts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>Không tìm thấy liên hệ nào.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        )}

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>
                {editingContact ? "Sửa liên hệ" : "Thêm liên hệ mới"}
              </Text>

              <TextInput placeholder="Tên" style={styles.input} value={name} onChangeText={setName} />
              <TextInput placeholder="Số điện thoại" style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                <Button title="Hủy" onPress={() => setModalVisible(false)} />
                <Button title="Lưu" onPress={handleSave} />
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
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { textAlign: "center", fontSize: 18, opacity: 0.5 },
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
