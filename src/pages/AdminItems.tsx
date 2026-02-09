import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function AdminItems() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const snap = await getDocs(collection(db, "items"));
    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setItems(data);
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, "items", id));
    loadItems();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Manage Items</h2>

      {items.map(item => (
        <div key={item.id} style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
          <p><b>Name:</b> {item.name}</p>
          <p><b>Type:</b> {item.type}</p>

          <button onClick={() => deleteItem(item.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
