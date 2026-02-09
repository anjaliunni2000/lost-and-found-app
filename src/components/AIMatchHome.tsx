import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, ScanLine } from "lucide-react";
import { toast } from "sonner";

import { getAuth } from "firebase/auth";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { notifyMatch } from "@/lib/matchNotifier";
import { handleItemMatch } from "@/lib/matchingEngine";

export default function AIMatchHome() {

  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ TEXT NORMALIZER (SAFE)
  const normalize = (text?: string) => {
    if (!text) return "unknown";
    return text.toLowerCase().replace(/[_-]/g, " ").trim();
  };

  // ================= DRAG HANDLERS =================
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // ================= PROCESS IMAGE =================
  const processFile = (file: File) => {

    if (loading) return; // ✅ prevent double scan

    setPreview(URL.createObjectURL(file));
    runAIMatching(file);
  };

  // ================= AI MATCHING =================
  const runAIMatching = async (file: File) => {

    const auth = getAuth();
    const db = getFirestore();
    const userId = auth.currentUser?.uid;

    try {

      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("http://localhost:5000/match", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      setResult(data);

      if (!userId) {
        toast.error("Login required");
        return;
      }

      // ================= MATCH FOUND =================
      if (data?.matches?.length > 0) {

        const detected = normalize(data.detected_object);
        const bestMatch = data.matches[0]; // ✅ Only best match

        toast.success("Match Found!", {
          description: `Possible match for ${detected}`
        });

        notifyMatch(detected);

        // ✅ SAVE MATCH RECORD (ADMIN)
        await addDoc(collection(db, "matches"), {
          userId,
          itemName: detected,
          label: bestMatch.label || detected,
          confidence: bestMatch.confidence_percent || 0,
          status: "found",
          createdAt: serverTimestamp()
        });

        // ✅ SAVE USER NOTIFICATION
        await addDoc(collection(db, "notifications"), {
          userId,
          message: `Match Found for ${detected}`,
          itemName: detected,
          matched: true,
          confidence: bestMatch.confidence_percent || 0,
          createdAt: serverTimestamp(),
          read: false
        });

        // ✅ MATCH ENGINE
        await handleItemMatch(
          userId,
          bestMatch.label,
          (bestMatch.confidence_percent || 0) / 100
        );

      }

      // ================= NO MATCH =================
      else {

        toast.info("No matches found");

        await addDoc(collection(db, "matches"), {
          userId,
          itemName: normalize(data.detected_object),
          label: data.detected_object || "Unknown",
          confidence: 0,
          status: "not_found",
          createdAt: serverTimestamp()
        });

      }

    } catch (err) {

      console.error("Matching Error:", err);
      toast.error("Matching failed");

    } finally {

      setLoading(false);

    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white">

      <h1 className="text-5xl font-bold mb-6">
        Try AI Matching Now
      </h1>

      <motion.div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.02 }}
        className={`relative w-full max-w-xl border-2 border-dashed rounded-3xl overflow-hidden cursor-pointer transition ${
          dragActive
            ? "border-cyan-400 bg-cyan-400/10"
            : "border-slate-700"
        }`}
        style={{ minHeight: "280px" }}
      >

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*"
        />

        {preview ? (
          <img
            src={preview}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Upload size={48} />
            <p className="mt-2">Upload Image</p>
          </div>
        )}

        {loading && (
          <motion.div
            className="absolute inset-0 bg-black/60 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="absolute left-0 w-full h-1 bg-cyan-400"
              initial={{ top: "-10%" }}
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ScanLine className="animate-pulse mb-3 text-cyan-400" size={42} />
              <p className="text-cyan-300 font-medium">
                AI Scanning Image...
              </p>
            </div>
          </motion.div>
        )}

      </motion.div>

      {result && (
        <div className="mt-8 text-center">
          <h2 className="text-xl font-semibold">
            Detected: {result.detected_object}
          </h2>

          {result.matches?.length > 0 && (
            <p className="text-green-400 mt-2">
              Match Found Successfully ✅
            </p>
          )}
        </div>
      )}

    </div>
  );
}
