import smtplib
from email.mime.text import MIMEText

EMAIL = "yourgmail@gmail.com"
APP_PASSWORD = "your_app_password"

def send_match_email(to_email, item_name, location):

    subject = "Match Found For Your Lost Item!"

    body = f"""
    Good News!

    A match was found for your lost item.

    Item: {item_name}
    Location Found: {location}

    Please login and verify.
    """

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL
    msg["To"] = to_email

    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(EMAIL, APP_PASSWORD)
        server.send_message(msg)
        server.quit()

        print("Email Sent Successfully")

    except Exception as e:
        print("Email Error:", e)
