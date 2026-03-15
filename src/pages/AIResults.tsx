import { useLocation, useNavigate } from "react-router-dom";

const AIResults = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const matches = location.state?.matches || [];

  return (

    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#020617] to-[#03122a] text-white flex items-center justify-center px-6">

      <div className="max-w-3xl w-full">

        {/* TITLE */}

        <h1 className="text-4xl font-bold text-center mb-10 tracking-wide">
          AI Match <span className="text-emerald-400">Results</span>
        </h1>

        {/* NO MATCH STATE */}

        {matches.length === 0 ? (

          <div className="text-center bg-slate-900 border border-slate-800 rounded-2xl p-10">

            <p className="text-gray-400 text-lg mb-6">
              No possible matches found.
            </p>

            <div className="flex justify-center gap-4">

              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg font-semibold transition"
              >
                Back to Home
              </button>

              <button
                onClick={() => navigate("/report-lost")}
                className="px-6 py-3 border border-emerald-400 text-emerald-400 rounded-lg hover:bg-emerald-400 hover:text-black transition"
              >
                Report Another Item
              </button>

            </div>

          </div>

        ) : (

          <div className="space-y-6">

            {matches.map((item:any) => (

              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-400 transition"
              >

                {/* IMAGE */}

                <img
                  src={item.image}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />

                {/* TITLE */}

                <h2 className="text-xl font-semibold mb-1">
                  {item.title}
                </h2>

                {/* DESCRIPTION */}

                <p className="text-gray-400 mb-3">
                  {item.description}
                </p>

                {/* CONFIDENCE */}

                <div className="mb-3">

                  <p className="text-emerald-400 font-semibold mb-1">
                    Confidence: {item.score}%
                  </p>

                  <div className="w-full bg-slate-800 rounded-full h-2">

                    <div
                      className="bg-emerald-400 h-2 rounded-full"
                      style={{ width: `${item.score}%` }}
                    ></div>

                  </div>

                </div>

                {/* BUTTONS */}

                <div className="flex gap-3 mt-4">

                  <button
                    onClick={() => navigate(`/match-details/${item.id}`)}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg font-semibold"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => navigate("/")}
                    className="px-5 py-2 border border-emerald-400 text-emerald-400 rounded-lg hover:bg-emerald-400 hover:text-black transition"
                  >
                    Home
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

};

export default AIResults;