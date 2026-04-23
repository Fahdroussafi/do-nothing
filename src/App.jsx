import { useQuery } from "@tanstack/react-query";
import { supabase } from "./utils/supabase";

const fetchPlayers = async () => {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("total_spent", { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message);
  return data;
};

function App() {
  const { data: players = [], isLoading } = useQuery({
    queryKey: ["players"],
    queryFn: fetchPlayers,
    refetchInterval: 10000,
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-[#c9d1d9] flex flex-col items-center p-4 md:p-12 font-sans selection:bg-brand-blue/30 selection:text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-green/5 rounded-full blur-[120px]"></div>
      </div>

      <header className="text-center w-full max-w-[800px] mb-16 flex flex-col items-center relative z-10">
        <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] uppercase text-brand-blue bg-brand-blue/10 rounded-full border border-brand-blue/20 animate-pulse">
          Join the Elite
        </div>
        <h1 className="w-full text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-tight text-center">
          THE DO NOTHING <br />
          <span className="text-transparent bg-clip-text bg-linear-to-b from-white to-gray-500">
            LEADERBOARD
          </span>
        </h1>
        <p className="text-[#8b949e] text-lg md:text-2xl mb-10 max-w-[600px] font-light leading-relaxed text-center">
          Pay <span className="text-white font-semibold">$1</span> or more to
          join the exclusive group of humans doing absolutely nothing. The more
          you spend, the higher you climb.
        </p>
      </header>

      <main className="w-full max-w-[900px] glass rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/5 text-[#8b949e] text-[10px] uppercase tracking-[0.2em] border-b border-white/5">
                <th className="p-6 text-left font-black w-24">Rank</th>
                <th className="p-6 text-left font-black">Name</th>
                <th className="p-6 text-right font-black">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-24 text-center text-[#8b949e] font-light italic tracking-widest animate-pulse">
                    Loading...
                  </td>
                </tr>
              ) : (
                players.map((player, index) => (
                  <tr
                    key={player.id}
                    className={`transition-colors duration-500 hover:bg-white/2 ${index === 0 ? "bg-yellow-400/5" : ""}`}>
                    <td className="p-6">
                      <span
                        className={`font-black italic tabular-nums ${index === 0 ? "text-4xl text-yellow-400" : "text-xl text-brand-blue/60"}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-white text-xl">
                          {player.name}
                        </span>
                        {index === 0 && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500/80 mt-1">
                            Biggest Spender
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <span className="font-mono text-brand-green text-2xl md:text-3xl tabular-nums">
                        {formatCurrency(player.total_spent)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <section className="mt-16 mb-8 flex flex-col items-center relative z-10 w-full max-w-[500px]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Want to join?</h2>
          <p className="text-[#8b949e] text-xs tracking-[0.3em] uppercase font-black">
            Lifetime Entry • $1 One-time (or more if you're feeling generous)
          </p>
        </div>

        <div className="w-full flex justify-center py-8 px-4 bg-white/5 rounded-3xl border border-white/10 shadow-2xl">
          <form
            action="https://www.paypal.com/ncp/payment/KKL56BXX7PPAN"
            method="post"
            target="_blank"
            style={{
              display: "inline-grid",
              justifyItems: "center",
              alignContent: "start",
              gap: "0.5rem",
              width: "100%",
            }}>
            <input
              className="cursor-pointer hover:scale-105 transition-transform"
              style={{
                textAlign: "center",
                border: "none",
                borderRadius: "0.5rem",
                minWidth: "15rem",
                padding: "0 2rem",
                height: "3.5rem",
                fontWeight: "bold",
                backgroundColor: "#FFD140",
                color: "#000000",
                fontFamily: "Helvetica Neue, Arial, sans-serif",
                fontSize: "1.2rem",
              }}
              type="submit"
              value="Buy Now"
            />
            <img
              src="https://www.paypalobjects.com/images/Debit_Credit.svg"
              alt="cards"
              className="h-8 mt-2"
            />
            <section
              style={{
                fontSize: "0.8rem",
                color: "#8b949e",
                marginTop: "0.5rem",
              }}>
              Powered by{" "}
              <img
                src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg"
                alt="paypal"
                style={{
                  height: "1rem",
                  verticalAlign: "middle",
                  filter: "grayscale(1)",
                }}
              />
            </section>
          </form>
        </div>
      </section>

      <footer className="mt-12 py-12 text-[#8b949e] text-center relative z-10 w-full max-w-[1000px] border-t border-white/5">
        <p className="text-sm mb-4 font-light max-w-[500px] mx-auto leading-relaxed">
          Disclaimer: This is a digital novelty. $1 for lifetime bragging
          rights. No physical product is shipped. All sales are final.
        </p>
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">
          © 2026 The Do Nothing Club • All rights ignored.
        </p>
      </footer>
    </div>
  );
}

export default App;
