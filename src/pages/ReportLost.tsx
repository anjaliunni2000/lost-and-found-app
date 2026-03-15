import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categories, locations } from "@/data/mockItems";
import { toast } from "sonner";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

const ReportLost = () => {

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
    contactPhone: "",
  });

  const storage = getStorage();

  // IMAGE CHANGE
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);

    if (filesArray.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setSelectedFiles(filesArray);

    const previews = filesArray.map(file => URL.createObjectURL(file));

    setImagePreviews(previews);

  };

  // INPUT HANDLER
  const handleInputChange = (field: string, value: string) => {

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

  };

  // SUBMIT
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

      // UPLOAD IMAGES
      const imageUrls: string[] = [];

      for (const file of selectedFiles) {

        const imageRef = ref(
          storage,
          `lost-items/${user.uid}/${Date.now()}-${file.name}`
        );

        await uploadBytes(imageRef, file);

        const url = await getDownloadURL(imageRef);

        imageUrls.push(url);

      }

      // SAVE IN FIRESTORE
      const docRef = await addDoc(collection(db, "items"), {

        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        date: formData.date,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,

        imageUrl: imageUrls[0],
        imageUrls: imageUrls,

        status: "lost",

        userId: user.uid,
        userEmail: user.email, // ⭐ IMPORTANT FOR EMAIL NOTIFICATION

        createdAt: serverTimestamp()

      });

      console.log("Lost Item Saved:", docRef.id);

      // RUN AI MATCHING
      const aiForm = new FormData();

      aiForm.append("image", selectedFiles[0]);
      aiForm.append("title", formData.title);
      aiForm.append("description", formData.description);

      let matches: any[] = [];

      try {

        const aiRes = await fetch("http://127.0.0.1:8000/match", {
          method: "POST",
          body: aiForm
        });

        const aiData = await aiRes.json();

        matches = aiData.matches || [];

        console.log("AI Matches:", matches);

      } catch (error) {

        console.warn("AI Matching failed:", error);

      }

      toast.success("Lost item reported successfully!");

      // REDIRECT
      navigate("/ai-results", {
        state: {
          matches,
          itemId: docRef.id
        }
      });

    }
    catch (error) {

      console.error("Submission error:", error);

      toast.error("Failed to submit lost report");

    }
    finally {

      setIsSubmitting(false);

    }

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

            {/* IMAGE UPLOAD */}
            <div className="mb-8">

              <label className="block mb-3">
                Item Photos (Max 5)
              </label>

              {imagePreviews.length > 0 ? (

                <div className="grid grid-cols-2 gap-4 mb-4">

                  {imagePreviews.map((img, i) => (

                    <img
                      key={i}
                      src={img}
                      className="rounded-xl object-cover"
                    />

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

                {categories.map(c => (
                  <option key={c}>{c}</option>
                ))}

              </select>

              <select
                value={formData.location}
                onChange={(e)=>handleInputChange("location", e.target.value)}
                className="input-dark"
                required
              >

                <option value="">Location</option>

                {locations.map(l => (
                  <option key={l}>{l}</option>
                ))}

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