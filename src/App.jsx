import React, { useState, useMemo } from 'react'
import { Search, ShoppingCart, Plus, X, Store, Filter } from 'lucide-react'
import stockReal from './data/stock_final.json'

// Diccionario para transformar abreviaturas en nombres legibles
const SET_NAMES = {
  "PAF": "Paldean Fates",
  "MEG": "Mega Evolution",
  "PFL": "Phantasmal Flames",
  "JTG": "Journey Together",
  "ASC": "Ascended Heroes",
  "SSP": "Surging Sparks",
  "SCR": "Stellar Crown",
  "PAR": "Paradox Rift",
  "TWM": "Twilight Masquerade",
  "OBF": "Obsidian Flames",
  "PAL": "Paldea Evolved",
  "DRI": "Destined Rivals",
  "TEF": "Temporal Forces",
  "SVI": "Scarlet & Violet Base",
  "F": "Silver Tempest"
};

function App() {
  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [visibleCount, setVisibleCount] = useState(40)
  
  const [selectedSet, setSelectedSet] = useState("Todos")
  const [selectedType, setSelectedType] = useState("Todos")
  const [selectedCategory, setSelectedCategory] = useState("Todos")

  const [inventory, setInventory] = useState(stockReal)

  // --- LÓGICA PARA OBTENER VALORES ÚNICOS ---
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
  const addToCart = (card) => {
    setCart([...cart, card])
    setInventory(prev => prev.map(item => item.id === card.id ? { ...item, Stock: 0 } : item))
  }

  const removeFromCart = (index) => {
    const item = cart[index]
    setCart(cart.filter((_, i) => i !== index))
    setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, Stock: 1 } : inv))
  }

  const total = cart.reduce((acc, card) => acc + (Number(card.Precio) || 0), 0)

  const finalizarPedido = () => {
    const nro = "5493562671975"
    let msg = `¡Hola PokeKiosco! 👋 Pedido:\n\n${cart.map(i => `- ${i.Nombre} (${SET_NAMES[i.Expansión] || i.Expansión}) [${i.Categoria}]`).join('\n')}\n\n*Total: $${total}*`
    window.open(`https://wa.me/${nro}?text=${encodeURIComponent(msg)}`)
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* NAVBAR */}
      <nav className="bg-red-600 p-4 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-white text-3xl font-black italic tracking-tighter">POKEKIOSCO</h1>
            
            <div className="relative w-full md:w-1/2">
              <input 
                type="text" 
                placeholder="¿Qué carta buscás?..." 
                className="w-full py-3 px-12 rounded-full border-none shadow-lg focus:ring-4 focus:ring-yellow-400 outline-none text-black font-medium"
                onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(40); }}
              />
              <Search className="absolute left-4 top-3.5 text-slate-400" size={24} />
            </div>

            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-red-700 px-6 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95">
              <ShoppingCart size={24} />
              <span className="bg-red-600 text-white px-2 rounded-full text-sm font-black">{cart.length}</span>
            </button>
          </div>

          {/* BARRA DE FILTROS ACTUALIZADA */}
          <div className="flex flex-wrap items-center justify-center gap-3 bg-red-700/50 p-2 rounded-2xl">
            <div className="flex items-center gap-2 text-white/80 text-xs font-bold mr-2 uppercase tracking-wider">
              <Filter size={14} /> Filtrar:
            </div>
            
            {/* Selector de COLECCIÓN (Traducido) */}
            <select 
              value={selectedSet}
              onChange={(e) => setSelectedSet(e.target.value)}
              className="bg-white text-slate-800 text-xs font-bold py-2 px-4 rounded-lg outline-none cursor-pointer hover:bg-yellow-50 shadow-sm min-w-[140px]"
            >
              <option value="Todos">Todas las Colecciones</option>
              {setsOptions.filter(opt => opt !== "Todos").map(opt => (
                <option key={opt} value={opt}>
                  {SET_NAMES[opt] || opt} {/* Muestra el nombre largo o el código si no existe en el mapa */}
                </option>
              ))}
            </select>

            {/* Selector de TIPO */}
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white text-slate-800 text-xs font-bold py-2 px-4 rounded-lg outline-none cursor-pointer hover:bg-yellow-50 shadow-sm"
            >
              <option value="Todos">Todos los Tipos</option>
              {typesOptions.filter(opt => opt !== "Todos").map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>

            {/* Selector de CATEGORIA */}
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white text-slate-800 text-xs font-bold py-2 px-4 rounded-lg outline-none cursor-pointer hover:bg-yellow-50 shadow-sm"
            >
              <option value="Todos">Cualquier Estilo</option>
              {categoriesOptions.filter(opt => opt !== "Todos").map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>

            {/* Botón resetear */}
            {(selectedSet !== "Todos" || selectedType !== "Todos" || selectedCategory !== "Todos") && (
              <button 
                onClick={() => { setSelectedSet("Todos"); setSelectedType("Todos"); setSelectedCategory("Todos"); }}
                className="text-white hover:text-yellow-400 text-[10px] font-black underline uppercase ml-2"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ... Resto del componente (Main, Cart, Detail) se mantiene igual ... */}
      {/* (Asegúrate de copiar el resto del código que ya tenías debajo) */}

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8 border-b-4 border-red-600 pb-2">
          <div className="flex items-center gap-2">
            <Store className="text-red-600" />
            <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">
              {filteredCards.length} Cartas Encontradas
            </h2>
          </div>
        </div>

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
             <button onClick={() => setVisibleCount(prev => prev + 40)} className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-colors">
               Ver más resultados
             </button>
          </div>
        )}
      </main>

      {/* MODAL DETALLE Y CARRITO (Incluidos para que no falte nada) */}
      {/* ... [Aquí van tus modales de Carrito y Detalle que ya tenías] ... */}
    </div>
  )
}

export default App