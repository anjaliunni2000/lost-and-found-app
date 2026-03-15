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

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const ReportFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const storage = getStorage();

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);

    if (filesArray.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setSelectedFiles(filesArray);

    const previewPromises = filesArray.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(previewPromises).then((previews) => {
      setImagePreviews(previews);
    });
  };

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

      const imageUrls: string[] = [];

      for (const file of selectedFiles) {
        const fileName = `${Date.now()}-${file.name}`;
        const imageRef = ref(storage, `found-items/${user.uid}/${fileName}`);

        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }

      const primaryImage = imageUrls[0] || "";

      const docRef = await addDoc(collection(db, "found_items"), {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,

        foundLocation: formData.location,
        location: formData.location,

        foundDate: formData.date,
        date: formData.date,

        finderEmail: formData.contactEmail.trim(),
        contactEmail: formData.contactEmail.trim(),
        email: formData.contactEmail.trim(),

        finderPhone: formData.contactPhone.trim(),
        contactPhone: formData.contactPhone.trim(),
        phone: formData.contactPhone.trim(),

        image: primaryImage,
        imageUrl: primaryImage,
        photoURL: primaryImage,
        foundImage: primaryImage,
        imageUrls: imageUrls,

        status: "found",
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      console.log("Found item saved:", docRef.id);
      console.log("Saved image URL:", primaryImage);

      const aiForm = new FormData();
      aiForm.append("image", selectedFiles[0]);
      aiForm.append("itemId", docRef.id);
      aiForm.append("status", "found");
      aiForm.append("title", formData.title.trim());
      aiForm.append("description", formData.description.trim());
      aiForm.append("category", formData.category);

      try {
        await fetch("http://127.0.0.1:8000/upload", {
          method: "POST",
          body: aiForm,
        });
      } catch (error) {
        console.warn("AI indexing skipped:", error);
      }

      toast.success("Found item reported successfully!");

      setTimeout(() => {
        navigate(`/item/${docRef.id}`);
      }, 1000);
    } catch (error) {
      console.error("Failed to submit found report:", error);
      toast.error("Failed to submit found report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>

            <h1 className="mb-4 text-4xl font-bold">
              REPORT <span className="text-green-400">FOUND</span> ITEM
            </h1>

            <p className="text-muted-foreground">
              Provide details about the found item.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl p-8">
            <div className="mb-8">
              <label className="mb-3 block">Item Photos (Max 5)</label>

              <label className="block cursor-pointer rounded-xl border-2 border-dashed p-8 text-center">
                {imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {imagePreviews.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Preview ${i + 1}`}
                        className="h-40 w-full rounded-xl object-cover"
                      />
                    ))}
                  </div>
                ) : (
                  <span>Upload Images</span>
                )}

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid gap-4">
              <input
                placeholder="Item Name"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="input-dark"
                required
              />

              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="input-dark"
                required
              >
                <option value="">Category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="input-dark"
                required
              >
                <option value="">Location</option>
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="input-dark"
                required
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="input-dark"
              />

              <input
                type="email"
                placeholder="Contact Email"
                value={formData.contactEmail}
                onChange={(e) =>
                  handleInputChange("contactEmail", e.target.value)
                }
                className="input-dark"
                required
              />

              <input
                placeholder="Contact Phone"
                value={formData.contactPhone}
                onChange={(e) =>
                  handleInputChange("contactPhone", e.target.value)
                }
                className="input-dark"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-xl bg-green-500 p-4 font-bold text-black disabled:cursor-not-allowed disabled:opacity-70"
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