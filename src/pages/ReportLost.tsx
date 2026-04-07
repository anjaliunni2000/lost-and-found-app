import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, UploadCloud, X, FileText, Tag, MapPin, Calendar, AlignLeft, Mail, Phone, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categories, locations } from "@/data/mockItems";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import { compressImage } from "../utils/imageUtils";

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

    const totalFiles = selectedFiles.length + filesArray.length;
    if (totalFiles > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newFiles = [...selectedFiles, ...filesArray];
    setSelectedFiles(newFiles);

    const previews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    setImagePreviews(newFiles.map(file => URL.createObjectURL(file)));
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

        try {
          await uploadBytes(imageRef, file);
          const url = await getDownloadURL(imageRef);
          imageUrls.push(url);
        } catch (uploadError) {
          console.warn("Storage upload rejected, using Base64 fallback:", uploadError);
          const base64DataUrl = await compressImage(file);
          imageUrls.push(base64DataUrl);
        }
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

      // CACHE IMAGE EMBEDDING FOR LOST ITEM
      try {
        const uploadForm = new FormData();
        uploadForm.append("image", selectedFiles[0]);
        uploadForm.append("itemId", docRef.id);
        uploadForm.append("status", "lost");
        uploadForm.append("title", formData.title);
        uploadForm.append("description", formData.description);
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
          method: "POST",
          body: uploadForm
        });
      } catch (err) {
        console.warn("Lost item AI indexing skipped:", err);
      }

      let matches: any[] = [];

      try {
        const aiRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/match`, {
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

  const inputVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col pt-24 pb-16 text-white">
      
      <Header />

      {/* Ambient Red/Orange Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#334155_1px,transparent_0)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* Main Content */}
      <main className="container mx-auto px-4 z-10 flex-1 flex flex-col max-w-3xl mt-6">

        {/* Header Block */}
        <motion.div 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)] mb-6">
            <AlertCircle className="w-8 h-8 text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
          </div>

          <h1 className="text-4xl md:text-5xl font-sans font-bold tracking-tight mb-4 text-white">
            Report <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Lost Item</span>
          </h1>

          <p className="text-slate-400 max-w-lg mx-auto text-lg">
            Our AI engine will scan database records and instantly compare your photo against all recently found items.
          </p>
        </motion.div>

        {/* Glassmorphic Form Container */}
        <motion.div 
           initial="hidden"
           animate="show"
           variants={{ show: { transition: { staggerChildren: 0.1 } } }}
           className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6">

            {/* UPLOAD IMAGES */}
            <motion.div variants={inputVariants} className="mb-2">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Item Photos (Max 5)
              </label>

              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {imagePreviews.map((img, i) => (
                      <motion.div 
                         key={i} 
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.8 }}
                         className="relative group/img aspect-square rounded-2xl overflow-hidden border border-slate-700/50 shadow-inner"
                      >
                        <img
                          src={img}
                          className="w-full h-full object-cover"
                          alt={`preview ${i}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 bg-slate-950/60 backdrop-blur text-white p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}

                    {imagePreviews.length < 5 && (
                      <motion.label 
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-rose-400/50 hover:bg-rose-500/5 rounded-2xl cursor-pointer transition-colors"
                      >
                         <UploadCloud className="w-8 h-8 text-slate-500 mb-2" />
                         <span className="text-xs text-slate-400 font-medium">Add More</span>
                         <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                      </motion.label>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 hover:border-rose-500/40 hover:bg-rose-500/5 rounded-3xl p-10 cursor-pointer transition-all duration-300 group/upload">
                  <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 group-hover/upload:scale-110 group-hover/upload:bg-rose-500/10 transition-all">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover/upload:text-rose-400" />
                  </div>
                  <span className="font-semibold text-slate-300 mb-1">Upload Item Photos</span>
                  <span className="text-sm text-slate-500">Drag & drop or click to browse</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </motion.div>

            {/* TITLE */}
            <motion.div variants={inputVariants} className="relative group/input">
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Item Name</label>
              <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-rose-400 transition-colors">
                   <FileText className="w-5 h-5" />
                 </div>
                 <input
                   placeholder="e.g. MacBook Pro M2, Blue Wallet..."
                   value={formData.title}
                   onChange={(e)=>handleInputChange("title", e.target.value)}
                   className="w-full bg-slate-950/40 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-12 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 transition-all shadow-inner"
                   required
                 />
              </div>
            </motion.div>

            {/* CATEGORY & LOCATION Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={inputVariants} className="relative group/input">
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Category</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-rose-400 transition-colors">
                     <Tag className="w-5 h-5" />
                   </div>
                   <select
                     value={formData.category}
                     onChange={(e)=>handleInputChange("category", e.target.value)}
                     className="w-full appearance-none bg-slate-950/40 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-12 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 transition-all shadow-inner cursor-pointer"
                     required
                   >
                     <option value="" disabled className="bg-slate-900 text-slate-500">Select Category</option>
                     {categories.map(c => (
                       <option key={c} value={c} className="bg-slate-900">{c}</option>
                     ))}
                   </select>
                </div>
              </motion.div>

              <motion.div variants={inputVariants} className="relative group/input">
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Location Lost</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-rose-400 transition-colors">
                     <MapPin className="w-5 h-5" />
                   </div>
                   <select
                     value={formData.location}
                     onChange={(e)=>handleInputChange("location", e.target.value)}
                     className="w-full appearance-none bg-slate-950/40 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-12 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 transition-all shadow-inner cursor-pointer"
                     required
                   >
                     <option value="" disabled className="bg-slate-900 text-slate-500">Select Location</option>
                     {locations.map(l => (
                       <option key={l} value={l} className="bg-slate-900">{l}</option>
                     ))}
                   </select>
                </div>
              </motion.div>
            </div>

            {/* DATE */}
            <motion.div variants={inputVariants} className="relative group/input">
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Date Lost</label>
              <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-rose-400 transition-colors">
                   <Calendar className="w-5 h-5" />
                 </div>
                 <input
                   type="date"
                   value={formData.date}
                   onChange={(e)=>handleInputChange("date", e.target.value)}
                   className="w-full bg-slate-950/40 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-12 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 transition-all shadow-inner cursor-text"
                   required
                 />
              </div>
            </motion.div>

            {/* DESCRIPTION */}
            <motion.div variants={inputVariants} className="relative group/input">
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Additional Details</label>
              <div className="relative">
                 <div className="absolute left-4 top-4 text-slate-500 group-focus-within/input:text-rose-400 transition-colors">
                   <AlignLeft className="w-5 h-5" />
                 </div>
                 <textarea
                   placeholder="Provide any identifying marks, serial numbers, or context..."
                   value={formData.description}
                   onChange={(e)=>handleInputChange("description", e.target.value)}
                   className="w-full bg-slate-950/40 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-12 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 transition-all shadow-inner min-h-[120px] resize-y"
                 />
              </div>
            </motion.div>

            {/* CONTACT Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={inputVariants} className="relative group/input">
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Contact Email</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-rose-400 transition-colors">
                     <Mail className="w-5 h-5" />
                   </div>
                   <input
                     type="email"
                     placeholder="your@email.com"
                     value={formData.contactEmail}
                     onChange={(e)=>handleInputChange("contactEmail", e.target.value)}
                     className="w-full bg-slate-950/40 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-12 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 transition-all shadow-inner"
                     required
                   />
                </div>
              </motion.div>

              <motion.div variants={inputVariants} className="relative group/input">
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Contact Phone</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-rose-400 transition-colors">
                     <Phone className="w-5 h-5" />
                   </div>
                   <input
                     placeholder="(Optional) Mobile Number"
                     value={formData.contactPhone}
                     onChange={(e)=>handleInputChange("contactPhone", e.target.value)}
                     className="w-full bg-slate-950/40 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-12 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 transition-all shadow-inner"
                   />
                </div>
              </motion.div>
            </div>

            {/* SUBMIT BUTTON */}
            <motion.div variants={inputVariants} className="mt-4">
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className="group relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 text-slate-950 font-bold text-lg px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_35px_rgba(244,63,94,0.6)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none overflow-hidden"
               >
                 <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 transform -skew-x-[30deg] -translate-x-full" />
                 
                 {isSubmitting ? (
                   <>
                     <Loader2 className="w-6 h-6 animate-spin" />
                     <span>Processing Image & Saving...</span>
                   </>
                 ) : (
                   <span>Run AI Match & Report Lost</span>
                 )}
               </button>
            </motion.div>

          </form>
        </motion.div>

      </main>

      {/* Put Footer below main but within the screen min-h */}
      <div className="mt-12">
        <Footer />
      </div>

    </div>
  );
};

export default ReportLost;