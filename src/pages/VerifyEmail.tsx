import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"

export default function VerifyEmail() {

  const [params] = useSearchParams()

  useEffect(() => {

    const email = params.get("email")
    const token = params.get("token")

    fetch(`${import.meta.env.VITE_API_BASE_URL}/verify-email?email=${email}&token=${token}`)
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