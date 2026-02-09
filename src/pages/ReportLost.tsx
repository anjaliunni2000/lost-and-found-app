import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categories, locations } from "@/data/mockItems";
import { toast } from "sonner";

import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

const ReportLost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
    contactEmail: "",
    contactPhone: "",
  });

  /* IMAGE PREVIEW + STORE FILE */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /* SUBMIT */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login first");
      return;
    }

    if (!selectedFile) {
      toast.error("Please upload image");
      return;
    }

    try {
      setIsSubmitting(true);

      // ⭐ 1️⃣ SAVE TO FIREBASE
      await addDoc(collection(db, "items"), {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        date: formData.date,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        image: imagePreview || "",
        status: "lost",
        userId: user.uid,
        createdAt: new Date()
      });

      // ⭐ 2️⃣ SEND IMAGE TO AI SERVER
      const formDataAI = new FormData();
      formDataAI.append("image", selectedFile);

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formDataAI
      });

      if (!response.ok) {
        throw new Error("AI upload failed");
      }

      const aiResult = await response.json();
      console.log("AI Stored:", aiResult);

      toast.success("Lost item saved + AI learned this item!");

      navigate("/browse");

    } catch (error) {
      console.error(error);
      toast.error("Failed to submit lost report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/20 mb-6">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>

            <h1 className="text-4xl font-bold mb-4">
              REPORT <span className="text-destructive">LOST</span> ITEM
            </h1>

            <p className="text-muted-foreground">
              Provide details about your lost item.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl p-8">

            {/* IMAGE */}
            <div className="mb-8">
              <label className="block mb-3">Item Photo</label>

              {imagePreview ? (
                <img src={imagePreview} className="rounded-xl mb-4" />
              ) : (
                <label className="border-2 border-dashed p-8 block text-center cursor-pointer">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* FORM FIELDS */}
            <div className="grid gap-4">

              <input
                placeholder="Item Name"
                value={formData.title}
                onChange={(e)=>handleInputChange("title", e.target.value)}
                className="input-dark"
                required
              />

              <select
                value={formData.category}
                onChange={(e)=>handleInputChange("category", e.target.value)}
                className="input-dark"
                required
              >
                <option value="">Category</option>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>

              <select
                value={formData.location}
                onChange={(e)=>handleInputChange("location", e.target.value)}
                className="input-dark"
                required
              >
                <option value="">Location</option>
                {locations.map(l => <option key={l}>{l}</option>)}
              </select>

              <input
                type="date"
                value={formData.date}
                onChange={(e)=>handleInputChange("date", e.target.value)}
                className="input-dark"
                required
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e)=>handleInputChange("description", e.target.value)}
                className="input-dark"
              />

              <input
                type="email"
                placeholder="Contact Email"
                value={formData.contactEmail}
                onChange={(e)=>handleInputChange("contactEmail", e.target.value)}
                className="input-dark"
                required
              />

              <input
                placeholder="Contact Phone"
                value={formData.contactPhone}
                onChange={(e)=>handleInputChange("contactPhone", e.target.value)}
                className="input-dark"
              />

            </div>

            <button
              disabled={isSubmitting}
              className="w-full mt-6 bg-red-500 p-4 rounded-xl font-bold"
            >
              {isSubmitting ? "Saving..." : "Submit Lost Report"}
            </button>

          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReportLost;
