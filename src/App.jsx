import React, { useState, useMemo, useEffect } from 'react'
import { Search, ShoppingCart, Plus, X, Store, Filter, CloudCog } from 'lucide-react'
import stockReal from './data/stock_final.json'

// Diccionario para transformar abreviaturas en nombres legibles
const SET_NAMES = {
  "Todos": "Todos",
  "PAF": "PAF - Paldean Fates",
  "MEG": "MEG - Mega Evolution",
  "PFL": "PFL - Phantasmal Flames",
  "JTG": "JTG - Journey Together",
  "ASC": "ASC - Ascended Heroes",
  "SSP": "SSP - Surging Sparks",
  "SCR": "SCR - Stellar Crown",
  "PAR": "PAR - Paradox Rift",
  "TWM": "TWM - Twilight Masquerade",
  "OBF": "OBF - Obsidian Flames",
  "PAL": "PAL - Paldea Evolved",
  "DRI": "DRI - Destined Rivals",
  "TEF": "TEF - Temporal Forces",
  "SVI": "SVI - Scarlet & Violet Base",
  "F": "F - Silver Tempest"
};

function App() {
  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [visibleCount, setVisibleCount] = useState(40)

  // Filtros seleccionados
  const [selectedSet, setSelectedSet] = useState("Todos")
  const [selectedType, setSelectedType] = useState("Todos")
  const [selectedCategory, setSelectedCategory] = useState("Todos")

  // const [inventory, setInventory] = useState(stockReal)
  const [inventory, setInventory] = useState(() => 
    stockReal.map((card, index) => ({ ...card, idInterno: index }))
  );

  // --- LÓGICA PARA OBTENER VALORES ÚNICOS (Para los selectores) ---
  // Esto hace que los filtros se actualicen solos según tu stock
  const setsOptions = useMemo(() => ["Todos", ...new Set(inventory.map(c => c.Expansión))], [inventory]);
  const typesOptions = useMemo(() => ["Todos", ...new Set(inventory.map(c => c.Tipo))], [inventory]);
  const categoriesOptions = useMemo(() => ["Todos", ...new Set(inventory.map(c => c.Categoria))], [inventory]);

  // --- LÓGICA DE FILTRADO MULTIPLE ---
  const filteredCards = inventory.filter(card => {
    if (!card || !card.Nombre) return false;

    const matchesSearch = card.Nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSet = selectedSet === "Todos" || card.Expansión === selectedSet;
    const matchesType = selectedType === "Todos" || card.Tipo === selectedType;
    const matchesCat = selectedCategory === "Todos" || card.Categoria === selectedCategory;

    return matchesSearch && matchesSet && matchesType && matchesCat;
  });

  // --- FUNCIONES ---
  // const addToCart = (card) => {
  //   setCart([...cart, card])
  //   setInventory(prev => prev.map(item => item.id === card.id ? { ...item, Stock: 0 } : item))
  // }

  const addToCart = (card) => {
    setCart([...cart, card])
    // Cambiamos item.id por item.idInterno
    setInventory(prev => prev.map(item => item.idInterno === card.idInterno ? { ...item, Stock: 0 } : item))
  }

  // const removeFromCart = (index) => {
  //   const item = cart[index]
  //   setCart(cart.filter((_, i) => i !== index))
  //   setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, Stock: 1 } : inv))
  // }

  const removeFromCart = (index) => {
    const item = cart[index]
    setCart(cart.filter((_, i) => i !== index))
    // Cambiamos inv.id por inv.idInterno
    setInventory(prev => prev.map(inv => inv.idInterno === item.idInterno ? { ...inv, Stock: 1 } : inv))
  }

  const total = cart.reduce((acc, card) => acc + (Number(card.Precio) || 0), 0)

  const finalizarPedido = () => {
    const nro = "5493562671975"
    // let msg = `¡Hola PokeKiosco! 👋 Pedido:\n\n${cart.map(i => `- ${i.Nombre} (${SET_NAMES[i.Expansión] || i.Expansión}) [${i.Categoria}]`).join('\n')}\n\n*Total: $${total}*`
    let msg = `¡Hola PokeKiosco! 👋 Pedido:\n\n${cart.map(i => `- ${i.Nombre} (${SET_NAMES[i.Expansión] || i.Expansión}) [${i.Categoria}]`).join('\n')}\n\n*Total: $${total}*`
    window.open(`https://wa.me/${nro}?text=${encodeURIComponent(msg)}`)
  }

  // useEffect(() => {
  //   console.log(cart)
  // }, [cart])

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* NAVBAR */}
      <nav className="bg-red-600 p-4 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-white text-3xl font-black italic tracking-tighter">POKEKIOSCO</h1>

            {/* Buscador Principal */}
            <div className="relative w-full md:w-1/2">
              <input
                type="text"
                placeholder="¿Qué carta buscás?..."
                className="w-full py-3 px-12 rounded-full border-none shadow-lg focus:ring-4 focus:ring-yellow-400 outline-none text-black"
                onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(40); }}
              />
              <Search className="absolute left-4 top-3.5 text-slate-400" size={24} />
            </div>

            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 bg-yellow-400 text-red-700 px-6 py-3 rounded-full font-bold shadow-lg">
              <ShoppingCart size={24} />
              <span className="bg-red-600 text-white px-2 rounded-full text-sm">{cart.length}</span>
            </button>
          </div>

          {/* BARRA DE FILTROS */}
          <div className="flex flex-wrap items-center justify-center gap-3 bg-red-700/50 p-2 rounded-2xl">
            <div className="flex items-center gap-2 text-white/80 text-xs font-bold mr-2">
              <Filter size={14} /> FILTRAR POR:
            </div>

            {/* Selector de COLECCIÓN (Traducido) */}
            <select
              value={selectedSet}
              onChange={(e) => setSelectedSet(e.target.value)}
              className="bg-white text-slate-800 text-xs font-bold py-2 px-4 rounded-lg outline-none cursor-pointer hover:bg-yellow-50"
            >
              <option disabled>Colección</option>
              {/* {setsOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)} */}
              {setsOptions.map(opt => (
                <option key={opt} value={opt}>
                  {SET_NAMES[opt] || opt} {/* Muestra el nombre largo o el código si no existe en el mapa */}
                </option>
              ))}
            </select>

            {/* Selector de TIPO */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white text-slate-800 text-xs font-bold py-2 px-4 rounded-lg outline-none cursor-pointer hover:bg-yellow-50"
            >
              <option disabled>Tipo de Energía</option>
              {typesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>

            {/* Selector de CATEGORIA (Holo/Reverse) */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white text-slate-800 text-xs font-bold py-2 px-4 rounded-lg outline-none cursor-pointer hover:bg-yellow-50"
            >
              <option disabled>Estilo</option>
              {categoriesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>

            {/* Botón resetear */}
            {(selectedSet !== "Todos" || selectedType !== "Todos" || selectedCategory !== "Todos") && (
              <button
                onClick={() => { setSelectedSet("Todos"); setSelectedType("Todos"); setSelectedCategory("Todos"); }}
                className="text-white hover:text-yellow-400 text-[10px] font-black underline uppercase"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8 border-b-4 border-red-600 pb-2">
          <div className="flex items-center gap-2">
            <Store className="text-red-600" />
            <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">
              {filteredCards.length} Cartas Encontradas
            </h2>
          </div>
        </div>

        {/* GRILLA */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredCards.slice(0, visibleCount).map((card, index) => {
            const hasStock = card.Stock > 0;
            return (
              <div key={card.id + index} onClick={() => hasStock && setSelectedCard(card)}
                className={`bg-white rounded-xl p-3 shadow-md transition-all relative border-b-4 border-slate-200 
                  ${hasStock ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : 'opacity-50 grayscale cursor-not-allowed'}`}
              >
                {!hasStock && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 rounded-xl">
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded rotate-12 shadow-lg">AGOTADA</span>
                  </div>
                )}
                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 mb-3 flex items-center justify-center">
                  <img src={card.images?.small} alt={card.Nombre} className="w-full h-full object-contain" loading="lazy" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <p className="text-[9px] text-red-600 font-black uppercase">{card.Expansión}</p>
                    <span className={`text-[8px] px-1 rounded font-bold ${card.Categoria === 'Holo' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      {card.Categoria}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold truncate leading-tight">{card.Nombre}</h3>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                    <span className="text-sm font-black text-slate-900">${card.Precio}</span>
                    <button disabled={!hasStock} onClick={(e) => { e.stopPropagation(); addToCart(card); }}
                      className={`p-1.5 rounded-md transition-all ${hasStock ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCards.length > visibleCount && (
          <div className="flex justify-center mt-12">
            <button onClick={() => setVisibleCount(prev => prev + 40)} className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold hover:bg-black">
              Ver más resultados
            </button>
          </div>
        )}
      </main>

      {/* 1. CARRITO LATERAL */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in">
            <div className="p-6 bg-red-600 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart /> Mi Pedido
              </h3>
              <button onClick={() => setIsCartOpen(false)}><X size={30} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map((item, index) => (
                <div key={index} className="flex gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <img src={item.images?.small} className="w-12 h-16 object-contain" alt="" />
                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.Nombre}</p>
                    <p className="text-red-600 font-black text-sm">${item.Precio}</p>
                  </div>
                  <button onClick={() => removeFromCart(index)} className="text-slate-400 hover:text-red-500">
                    <X size={20} />
                  </button>
                </div>
              ))}
              {cart.length === 0 && <p className="text-center text-slate-400 mt-10 italic font-medium text-sm">El carrito está vacío.</p>}
            </div>
            <div className="p-6 border-t bg-slate-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between text-2xl font-black mb-4">
                <span>TOTAL:</span>
                <span className="text-red-600">${total.toLocaleString()}</span>
              </div>
              <button
                onClick={finalizarPedido}
                disabled={cart.length === 0}
                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold text-xl shadow-lg transition-transform active:scale-95"
              >
                FINALIZAR POR WHATSAPP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL DE DETALLE */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:row relative">
            <button onClick={() => setSelectedCard(null)} className="absolute top-4 right-4 z-50 bg-white/80 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all shadow">
              <X size={24} />
            </button>

            <div className="flex flex-col md:flex-row w-full">
              <div className="md:w-1/2 bg-slate-100 p-8 flex items-center justify-center">
                <img
                  src={selectedCard.images?.large}
                  alt={selectedCard.Nombre}
                  className="w-full max-h-[500px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="md:w-1/2 p-8 flex flex-col">
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase w-fit mb-2">
                  {selectedCard.Expansión}
                </span>
                <h2 className="text-4xl font-black text-slate-800 leading-tight mb-2">{selectedCard.Nombre}</h2>

                <div className="grid grid-cols-2 gap-3 my-6">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-bold">Idioma</p>
                    <p className="font-bold text-slate-700">{selectedCard.Idioma}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-bold">Estado</p>
                    <p className="font-bold text-green-600">{selectedCard.Estado}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-bold">Categoría</p>
                    <p className="font-bold text-slate-700">{selectedCard.Categoria}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-bold">Rareza</p>
                    <p className="font-bold text-purple-600">{selectedCard.rarity || 'Common'}</p>
                  </div>
                </div>

                <p className="text-slate-600 italic leading-relaxed mb-8 flex-1">
                  "{selectedCard.flavorText || 'Sin descripción disponible para esta carta.'}"
                </p>

                <div className="pt-6 border-t flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Precio Kiosco</p>
                    <p className="text-3xl font-black text-red-600">${selectedCard.Precio}</p>
                  </div>
                  <button
                    onClick={() => { addToCart(selectedCard); setSelectedCard(null); }}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-transform active:scale-95"
                  >
                    Agregar al Mazo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App