import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Camera,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categories, locations } from "@/data/mockItems";
import { toast } from "sonner";
import { addItem } from "@/lib/firestore";
import { auth } from "@/lib/firebase";

const ReportLost = () => {
  const navigate = useNavigate();
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!auth.currentUser) {
        toast.error("Please login to report an item");
        setIsSubmitting(false);
        return;
      }

      await addItem({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        date: formData.date,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        status: "lost",
        imageUrl: imagePreview || "",
        userId: auth.currentUser.uid,
      });

      // ✅ SUCCESS MESSAGE
      toast.success("Report submitted successfully!", {
        description: "Your lost item has been saved.",
      });

      // ✅ DELAY BEFORE REDIRECT
      setTimeout(() => {
        navigate("/browse");
      }, 1500);

    } catch (error) {
      console.error(error);
      toast.error("Failed to report item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Page Header */}
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

          {/* FORM */}
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8">
            {/* Image Upload */}
            <div className="mb-8">
              <label className="block mb-3">Item Photo</label>
              <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed cursor-pointer">
                <Camera className="mb-2" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            </div>

            {/* Item Name */}
            <input
              type="text"
              required
              placeholder="Item name"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full input-dark mb-4"
            />

            {/* Category */}
            <select
              required
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="w-full input-dark mb-4"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Location */}
            <select
              required
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full input-dark mb-4"
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {/* Date */}
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="w-full input-dark mb-4"
            />

            {/* Description */}
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full input-dark mb-4"
            />

            {/* Contact Email */}
            <input
              type="email"
              required
              placeholder="Contact email"
              value={formData.contactEmail}
              onChange={(e) =>
                handleInputChange("contactEmail", e.target.value)
              }
              className="w-full input-dark mb-6"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl font-semibold bg-destructive text-white transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 animate-pulse" />
                  Submitting...
                </span>
              ) : (
                "Submit Report"
              )}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReportLost;
