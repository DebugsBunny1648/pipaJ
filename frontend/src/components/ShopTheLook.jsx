import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, inr } from "@/lib/api";

const ShopTheLook = () => {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => { api.get("/lookbook").then((r) => setItems(r.data)); }, []);

  if (items.length === 0) return null;

  return (
    <section data-testid="shop-the-look" className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#B45F45] mb-3">Inspiration</p>
          <h2 className="font-serif-pipa text-4xl sm:text-5xl">Shop The Look</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it) => (
          <button
            key={it.id}
            data-testid={`look-${it.id}`}
            onClick={() => setActive(it)}
            className="relative aspect-[3/4] overflow-hidden group block"
          >
            <img src={it.image} alt={it.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-left">
              <p className="font-serif-pipa text-xl">{it.caption}</p>
              <p className="text-[10px] tracking-widest uppercase opacity-90">Tap to shop ↗</p>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <div className="bg-[#FAF8F5] max-w-3xl w-full max-h-[90vh] overflow-auto grid md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
            <img src={active.image} alt="" className="w-full h-full object-cover" />
            <div className="p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-[#B45F45] mb-3">{active.caption}</p>
              <h3 className="font-serif-pipa text-3xl mb-6">Pieces in this look</h3>
              <div className="space-y-3 max-h-96 overflow-auto scrollbar-thin">
                {(active.products || []).map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    data-testid={`look-product-${p.id}`}
                    onClick={() => setActive(null)}
                    className="flex gap-3 items-center bg-white border border-[#E5E0D8] p-2 hover:border-[#B45F45]"
                  >
                    <img src={p.images?.[0]} alt={p.name} className="w-16 h-16 object-cover" />
                    <div>
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-[#4A4A4A]">{inr(p.price)}</div>
                    </div>
                  </Link>
                ))}
                {(active.products || []).length === 0 && <p className="text-sm text-[#4A4A4A]">No products tagged yet.</p>}
              </div>
              <button data-testid="close-look" onClick={() => setActive(null)} className="mt-6 w-full bg-[#1A1A1A] text-white py-2 text-xs uppercase tracking-widest">Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ShopTheLook;
