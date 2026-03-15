import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"

export default function VerifyEmail() {

  const [params] = useSearchParams()

  useEffect(() => {

    const email = params.get("email")
    const token = params.get("token")

    fetch(`http://127.0.0.1:8000/verify-email?email=${email}&token=${token}`)
      .then(res => res.json())
      .then(data => {

        if (data.verified) {
          alert("Email verified successfully")
        } else {
          alert("Invalid verification link")
        }

      })

  }, [])

  return (
    <div style={{padding:"50px", textAlign:"center"}}>
      <h2>Verifying your email...</h2>
    </div>
  )

}