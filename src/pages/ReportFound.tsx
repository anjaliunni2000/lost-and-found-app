import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categories, locations } from "@/data/mockItems";
import { toast } from "sonner";

import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { checkForMatches } from "@/lib/matchService";
import { useAuth } from "@/context/AuthContext";

const ReportFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
    contactEmail: "",
    contactPhone: "",
  });

  /* IMAGE PREVIEW */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    try {
      setIsSubmitting(true);

      /* ⭐ CREATE ITEM DATA */
      const itemData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        date: formData.date,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        image: imagePreview || "",
        status: "found",
        userId: user.uid,
        createdAt: new Date()
      };

      /* ⭐ SAVE ITEM */
      const docRef = await addDoc(collection(db, "items"), itemData);

      /* ⭐ RUN MATCH CHECK */
      await checkForMatches({
        id: docRef.id,
        ...itemData
      });

      toast.success("Found item reported!", {
        description: "Checking for lost item matches..."
      });

      navigate("/browse");

    } catch (error) {
      console.log("SAVE FOUND ERROR:", error);
      toast.error("Failed to save item");
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

          {/* HEADER */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 mx-auto mb-6 flex items-center justify-center">
              <Gift className="w-8 h-8 text-green-500" />
            </div>

            <h1 className="text-4xl font-bold mb-4">
              REPORT <span className="text-green-500">FOUND</span> ITEM
            </h1>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8">

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
                    required
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* DETAILS */}
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
              className="w-full mt-6 bg-green-500 p-4 rounded-xl font-bold"
            >
              {isSubmitting ? "Saving..." : "Submit Found Report"}
            </button>

          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReportFound;
