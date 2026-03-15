import { useState } from "react";
import { auth } from "../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function PhoneLogin() {

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const sendOTP = () => {

    (window as any).recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      { size: "invisible" }
    );

    const appVerifier = (window as any).recaptchaVerifier;

    signInWithPhoneNumber(auth, phone, appVerifier)
      .then((confirmationResult) => {

        (window as any).confirmationResult = confirmationResult;
        alert("OTP Sent");

      })
      .catch((error) => {
        console.log(error);
        alert(error.message);
      });

  };

  const verifyOTP = () => {

    (window as any).confirmationResult
      .confirm(otp)
      .then((result) => {

        alert("Phone verified successfully");

        console.log(result.user);

      })
      .catch((error) => {

        console.log(error);
        alert("Invalid OTP");

      });

  };

  return (
    <div>

      <input
        placeholder="+91 phone number"
        onChange={(e)=>setPhone(e.target.value)}
      />

      <button onClick={sendOTP}>
        Send OTP
      </button>

      <br/><br/>

      <input
        placeholder="Enter OTP"
        onChange={(e)=>setOtp(e.target.value)}
      />

      <button onClick={verifyOTP}>
        Verify OTP
      </button>

      <div id="recaptcha-container"></div>

    </div>
  );
}