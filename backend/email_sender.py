import smtplib
from email.mime.text import MIMEText

# =============================
# EMAIL CONFIGURATION
# =============================

EMAIL_ADDRESS = "anjaliunnikrishnan001@gmail.com"
EMAIL_PASSWORD = "lbqfpokhwqggvafg"


# =============================
# SEND VERIFICATION EMAIL
# =============================
def send_verification_email(user_email, token):

    verification_link = f"http://localhost:5173/verify-email?token={token}&email={user_email}"

    subject = "Verify Your Email - Lost & Found System"

    body = f"""
Hello,

Thank you for registering in the Lost & Found system.

Please click the link below to verify your email:

{verification_link}

If you did not create this account, please ignore this email.

Regards,
Lost & Found AI System
"""

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = user_email

    try:

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)

        print("Verification email sent successfully")

    except Exception as e:
        print("Email sending error:", e)


# =============================
# SEND MATCH NOTIFICATION EMAIL
# =============================
def send_match_email(user_email, item_title, score):

    subject = "Possible Match Found for Your Lost Item"

    body = f"""
Hello,

Good news!

Our AI system has detected a possible match for your lost item.

Item: {item_title}
Confidence Score: {round(score*100,2)}%

Please login to your Lost & Found account to view the match.

http://localhost:5173

Thank you,
Lost & Found AI System
"""

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = user_email

    try:

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)

        print("Match notification email sent successfully")

    except Exception as e:
        print("Match email error:", e)

# =============================
# SEND CLAIM NOTIFICATION EMAIL
# =============================
def send_claim_email(finder_email, item_title):

    subject = "Someone Claimed Your Found Item!"

    body = f"""
Hello,

Good news!

A user has claimed the item you reported as found: "{item_title}".
They have matched your item and verified ownership.

Please log in to your account to check your chat messages and arrange to return the item to them ASAP.

http://localhost:5173/chats

Thank you for your honesty,
Lost & Found AI System
"""

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = finder_email

    try:

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)

        print("Claim notification email sent successfully")

    except Exception as e:
        print("Claim email error:", e)