from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from PIL import Image
import torch
import clip
import numpy as np
from io import BytesIO

import firebase_admin
from firebase_admin import credentials, firestore

import uuid

from email_sender import send_verification_email, send_match_email, send_claim_email


# -----------------------------
# FIREBASE INITIALIZATION
# -----------------------------
import os

cred_path = "/etc/secrets/serviceAccountKey.json" if os.path.exists("/etc/secrets/serviceAccountKey.json") else "serviceAccountKey.json"
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()


# -----------------------------
# FASTAPI APP
# -----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# LOAD AI MODELS
# -----------------------------
device = "cpu"

text_model = SentenceTransformer("all-MiniLM-L6-v2")
clip_model, preprocess = clip.load("ViT-B/32", device=device)


# -----------------------------
# EMAIL TOKEN STORAGE
# -----------------------------
verification_tokens = {}


# -----------------------------
# IMAGE EMBEDDING FUNCTION
# -----------------------------
def get_image_embedding(image_file):
    try:
        image = Image.open(image_file).convert("RGB")
        image = preprocess(image).unsqueeze(0).to(device)

        with torch.no_grad():
            features = clip_model.encode_image(image)

        features = features / features.norm(dim=-1, keepdim=True)

        return features.cpu().numpy()[0]

    except Exception as e:
        print("IMAGE EMBEDDING ERROR:", e)
        return None


# -----------------------------
# TEXT EMBEDDING FUNCTION
# -----------------------------
def get_text_embedding(text):
    return text_model.encode(text)


# -----------------------------
# STORE IMAGE EMBEDDING API
# -----------------------------
@app.post("/upload")
async def upload_embedding(
    image: UploadFile = File(...),
    itemId: str = Form(...),
    status: str = Form("found"),
    title: str = Form(""),
    description: str = Form("")
):
    try:
        image_bytes = await image.read()
        image_embedding = get_image_embedding(BytesIO(image_bytes))

        if image_embedding is None:
            return {"error": "Embedding generation failed"}

        embedding_list = image_embedding.tolist()

        collection_name = "found_items" if status == "found" else "items"

        db.collection(collection_name).document(itemId).update({
            "imageEmbedding": embedding_list
        })

        print("Embedding stored for item:", itemId, "in collection:", collection_name)

        # ==========================================
        # REVERSE MATCHING FOR FOUND ITEMS -> LOST UR
        # ==========================================
        if status == "found":
            query_text = f"{title} {description}"
            text_embedding = get_text_embedding(query_text)

            lost_items = db.collection("items").stream()

            for doc in lost_items:
                item = doc.to_dict()

                # MUST HAVE NOTIFICATION EMAIL
                lost_user_email = item.get("userEmail") or item.get("contactEmail")
                if not lost_user_email:
                    continue

                item_text = f"{item.get('title','')} {item.get('description','')}"
                item_embedding = get_text_embedding(item_text)

                text_score = cosine_similarity(
                    [text_embedding],
                    [item_embedding]
                )[0][0]

                image_score = 0
                if item.get("imageEmbedding"):
                    stored_embedding = np.array(item.get("imageEmbedding"))
                    image_score = cosine_similarity(
                        [image_embedding],
                        [stored_embedding]
                    )[0][0]
                    final_score = (text_score * 0.3) + (image_score * 0.7)
                else:
                    final_score = text_score

                if final_score > 0.20:
                    try:
                        send_match_email(
                            lost_user_email,
                            item.get("title", title),
                            final_score
                        )
                        print(f"Reverse match email sent to {lost_user_email} (Score: {final_score})")

                        # IN-APP NOTIFICATION PUSH
                        lost_user_id = item.get("userId")
                        if lost_user_id:
                            db.collection("notifications").add({
                                "userId": lost_user_id,
                                "title": "Possible Match Found!",
                                "message": f"A newly found item '{title}' might be your lost item!",
                                "link": f"/finder-details/{itemId}",
                                "read": False,
                                "createdAt": firestore.SERVER_TIMESTAMP
                            })
                            print(f"In-app Notification sent to {lost_user_id}")
                            
                    except Exception as e:
                        print("Email to lost user error:", e)

        return {"message": "Embedding stored successfully"}

    except Exception as e:
        print("UPLOAD ERROR:", e)
        return {"error": "Embedding storage failed"}


# -----------------------------
# AI MATCHING API
# -----------------------------
@app.post("/match")
async def match_item(
    image: UploadFile = File(None),
    title: str = Form(""),
    description: str = Form(""),
    category: str = Form("")
):

    try:

        query_text = f"{title} {description}"

        text_embedding = get_text_embedding(query_text)

        image_embedding = None

        if image is not None:
            image_bytes = await image.read()
            image_embedding = get_image_embedding(BytesIO(image_bytes))

        # FETCH ALL FOUND ITEMS
        items_docs = db.collection("found_items").stream()

        results = []

        for doc in items_docs:

            item = doc.to_dict()

           

            item_text = f"{item.get('title','')} {item.get('description','')}"

            item_embedding = get_text_embedding(item_text)

            text_score = cosine_similarity(
                [text_embedding],
                [item_embedding]
            )[0][0]

            image_score = 0

            if image_embedding is not None and item.get("imageEmbedding"):
                stored_embedding = np.array(item.get("imageEmbedding"))

                image_score = cosine_similarity(
                    [image_embedding],
                    [stored_embedding]
                )[0][0]
                
                final_score = (text_score * 0.3) + (image_score * 0.7)
            else:
                final_score = text_score
                
            print("TEXT:", text_score, "IMAGE:", image_score, "FINAL:", final_score)

            if final_score > 0.20:

                if item.get("contactEmail"):
                    try:
                        send_match_email(
                            item.get("contactEmail"),
                            item.get("title"),
                            final_score
                        )
                    except Exception as e:
                        print("Email error:", e)

                results.append({
    "id": doc.id,   # IMPORTANT → this is used by React router
    "userId": item.get("userId"), # This is the critically missing uploader Auth ID
    "title": item.get("title"),
    "description": item.get("description"),
    "image": item.get("imageUrl"),
    "score": round(float(final_score * 100), 2),

    "finderEmail": item.get("contactEmail"),
    "finderPhone": item.get("contactPhone"),
    "location": item.get("location"),
    "date": item.get("date"),
    "secretQuestion": item.get("secretQuestion"),
    "secretAnswer": item.get("secretAnswer")
})
        results.sort(key=lambda x: x["score"], reverse=True)

        return {"matches": results[:5]}

    except Exception as e:
        print("AI MATCH ERROR:", e)

        return {
            "matches": [],
            "error": "AI processing failed"
        }


# -----------------------------
# SEND EMAIL VERIFICATION
# -----------------------------
@app.post("/send-verification")
async def send_verification(email: str = Form(...)):

    try:
        token = str(uuid.uuid4())

        verification_tokens[email] = token

        send_verification_email(email, token)

        return {"message": "Verification email sent"}

    except Exception as e:
        print("EMAIL ERROR:", e)
        return {"error": "Email sending failed"}


# -----------------------------
# VERIFY EMAIL
# -----------------------------
@app.get("/verify-email")
async def verify_email(email: str, token: str):

    if verification_tokens.get(email) == token:

        del verification_tokens[email]

        return {
            "verified": True,
            "message": "Email verified successfully"
        }

    return {
        "verified": False,
        "message": "Invalid verification link"
    }

# =============================
# SEND CLAIM NOTIFICATION
# =============================
@app.post("/send-claim-notification")
async def send_claim_notification(email: str = Form(...), itemTitle: str = Form(...)):

    try:
        send_claim_email(email, itemTitle)
        return {"message": "Claim notification email sent"}
    except Exception as e:
        print("CLAIM EMAIL ERROR:", e)
        return {"error": "Email sending failed"}