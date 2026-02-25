import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [matchedItem, setMatchedItem] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const normalize = (text?: string) => {
    if (!text) return "unknown";
    return text.toLowerCase().replace(/[_-]/g, " ").trim();
  };

  // ================= FILE HANDLING =================
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

  const processFile = (file: File) => {
    if (loading) return;
    setPreview(URL.createObjectURL(file));
    runAIMatching(file);
  };

  // ================= MATCHING =================
  const runAIMatching = async (file: File) => {

    const auth = getAuth();
    const db = getFirestore();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      toast.error("Login required");
      return;
    }

    try {

      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", userId);

      const res = await fetch("http://localhost:5000/match", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Backend match failed");

      const data = await res.json();
      setResult(data);

      if (data?.matches?.length > 0) {

        const detected = normalize(data.detected_object);
        const bestMatch = data.matches[0];

        notifyMatch(detected);

        await addDoc(collection(db, "matches"), {
          userId,
          itemName: detected,
          label: bestMatch?.label || detected,
          confidence: bestMatch?.confidence_percent || 0,
          status: "found",
          file: bestMatch?.file || null,
          ownerId: bestMatch?.ownerId || null,
          itemId: bestMatch?.itemId || null,
          createdAt: serverTimestamp()
        });

        await handleItemMatch(
          userId,
          bestMatch?.label,
          (bestMatch?.confidence_percent || 0) / 100
        );

        setMatchedItem(bestMatch);
        setShowPopup(true);
      }

      else {
        toast.info("No matches found");

        await addDoc(collection(db, "matches"), {
          userId,
          itemName: normalize(data.detected_object),
          label: data.detected_object || "Unknown",
          confidence: 0,
          status: "not_found",
          file: null,
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
          dragActive ? "border-cyan-400 bg-cyan-400/10" : "border-slate-700"
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
          <img src={preview} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Upload size={48} />
            <p className="mt-2">Upload Image</p>
          </div>
        )}

        {loading && (
          <motion.div className="absolute inset-0 bg-black/60">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ScanLine className="animate-pulse text-cyan-400 mb-3" size={42} />
              <p className="text-cyan-300">AI Scanning Image...</p>
            </div>
          </motion.div>
        )}

      </motion.div>

      {/* MATCH SUCCESS POPUP */}
      {showPopup && matchedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-slate-900 p-10 rounded-3xl max-w-md text-center border border-cyan-500/30">

            <h2 className="text-3xl font-bold text-cyan-400 mb-4">
              🎉 Match Found!
            </h2>

            <p className="text-slate-300 mb-6">
              Your item matched successfully
            </p>

            {matchedItem?.file && (
              <img
                src={`http://localhost:5000/database/${matchedItem.file}`}
                className="h-40 mx-auto rounded-xl object-contain bg-slate-800 p-3 mb-6"
              />
            )}

            <p className="text-cyan-300 mb-6">
              Confidence: {matchedItem?.confidence_percent || 0}%
            </p>

            <button
              onClick={() => {
                setShowPopup(false);
                navigate(`/match-result/${matchedItem.itemId}`, {
                  state: matchedItem
                });
              }}
              className="bg-cyan-500 hover:bg-cyan-400 px-8 py-3 rounded-xl font-semibold text-black"
            >
              View Result
            </button>

          </div>

        </div>
      )}

    </div>
  );
}