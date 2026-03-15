import { useLocation, useNavigate } from "react-router-dom";

export default function MatchDetails() {

  const location = useLocation();
  const navigate = useNavigate();

  const item = location.state;

  if (!item) return null;

  return (

    <div className="min-h-screen flex items-center justify-center bg-[#020617]">

      <div className="bg-slate-900 border border-emerald-400/20 rounded-xl p-8 w-[420px]">

        <h2 className="text-2xl font-bold text-emerald-400 mb-6">
          Item Details
        </h2>

        {/* IMAGE */}
        {item.image && (
  <img
    src={
      item.image.startsWith("http")
        ? item.image
        : `http://localhost:8000${item.image}`
    }
    className="w-full h-52 object-cover rounded-lg mb-4"
    alt={item.title}
  />
)}
        <p className="text-xl text-white font-semibold">
          {item.title}
        </p>

        <p className="text-gray-400 mt-2">
          {item.description}
        </p>

        <p className="text-emerald-400 font-semibold mt-3">
          AI Confidence: {item.score}%
        </p>

        <div className="flex gap-4 mt-6">

          <button
            onClick={() => navigate(`/finder-details/${item.id}`)}
            className="flex-1 bg-emerald-400 text-black py-3 rounded-lg font-semibold"
          >
            My Item Found
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold"
          >
            Not My Item
          </button>

        </div>

      </div>

    </div>

  );

}