import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categories, locations } from "@/data/mockItems";
import { toast } from "sonner";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

const ReportFound = () => {

  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
    contactEmail: "",
    contactPhone: ""
  });

  // ================= IMAGE CHANGE =================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);

    if (filesArray.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setSelectedFiles(filesArray);

    const previewArray: string[] = [];

    filesArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previewArray.push(reader.result as string);
        if (previewArray.length === filesArray.length) {
          setImagePreviews(previewArray);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!user) {
      toast.error("Please login first");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    try {

      setIsSubmitting(true);

      // ================= STEP 1 — SAVE TO FIRESTORE =================
      const docRef = await addDoc(collection(db, "items"), {

        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        date: formData.date,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,

        files: selectedFiles.map(f => f.name),

        imagePreview: imagePreviews[0],
        imagePreviews: imagePreviews,
        image: imagePreviews[0],
        imageUrl: imagePreviews[0],

        status: "found",
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      console.log("🔥 Firestore Found Item ID:", docRef.id);

      // ================= STEP 2 — SEND IMAGE TO AI =================
      const aiForm = new FormData();
      aiForm.append("image", selectedFiles[0]);
      aiForm.append("userId", user.uid);
      aiForm.append("itemId", docRef.id);

      // ⭐ PROFESSIONAL MATCHING FIX
      aiForm.append("status", "found");

      try {
        const aiRes = await fetch("http://localhost:5000/match", {
          method: "POST",
          body: aiForm
        });

        if (!aiRes.ok) {
          console.warn("AI Upload failed but item saved.");
        } else {
          const aiData = await aiRes.json();
          console.log("🤖 AI Stored Found Item:", aiData);
        }

      } catch (aiError) {
        console.warn("AI server not reachable:", aiError);
      }

      toast.success("Found item saved successfully!");

      setTimeout(() => {
        navigate(`/item/${docRef.id}`);
      }, 1000);

    } catch (error) {
      console.error("Found Report Error:", error);
      toast.error("Failed to submit found report");
    }
    finally {
      setIsSubmitting(false);
    }
  };

  // ================= INPUT HANDLER =================
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-background">

      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/20 mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>

            <h1 className="text-4xl font-bold mb-4">
              REPORT <span className="text-green-400">FOUND</span> ITEM
            </h1>

            <p className="text-muted-foreground">
              Provide details about the found item.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl p-8">

            {/* IMAGE */}
            <div className="mb-8">
              <label className="block mb-3">Item Photos (Max 5)</label>

              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {imagePreviews.map((img, i) => (
                    <img key={i} src={img} className="rounded-xl" />
                  ))}
                </div>
              ) : (
                <label className="border-2 border-dashed p-8 block text-center cursor-pointer">
                  Upload Images
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* FORM */}
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
