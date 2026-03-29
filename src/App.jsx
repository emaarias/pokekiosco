import React, { useState, useEffect } from 'react'
import { Search, ShoppingCart, Plus, X, Store } from 'lucide-react'
import stockReal from './data/stock_final.json' // Usamos el stock ya fusionado

function App() {
  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [visibleCount, setVisibleCount] = useState(40)

  // IMPORTANTE: Creamos un estado local para el inventario para poder restar el stock visualmente
  const [inventory, setInventory] = useState(stockReal)

  // --- LÓGICA DE FILTRADO SEGURO ---
  const filteredCards = inventory.filter(card => {
    if (!card || !card.Nombre) return false;
    return card.Nombre.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // --- FUNCIONES DE CARRITO Y STOCK ---
  const addToCart = (card) => {
    // 1. Agregamos al carrito
    setCart([...cart, card])

    // 2. Restamos stock en el estado local (asumimos que solo tenés 1 de cada una)
    setInventory(prevInv => 
      prevInv.map(item => 
        item.id === card.id ? { ...item, Stock: 0 } : item
      )
    )
  };

  const removeFromCart = (index) => {
    const itemToRemove = cart[index];
    
    // 1. Quitamos del carrito
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);

    // 2. Devolvemos el stock al inventario local
    setInventory(prevInv => 
      prevInv.map(item => 
        item.id === itemToRemove.id ? { ...item, Stock: 1 } : item
      )
    );
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 40)
  };

  // Cálculo del total usando la propiedad 'Precio' de tu Excel
  const total = cart.reduce((acc, card) => acc + (Number(card.Precio) || 0), 0)

  // Función para WhatsApp corregida
  const finalizarPedido = () => {
    const nro = "54911XXXXXXXX" // Cambiá esto por tu número real
    let msg = "¡Hola PokeKiosco! 👋 Quiero realizar este pedido:\n\n"
    cart.forEach(item => {
      msg += `- *${item.Nombre}* (${item.Expansión}) - $${item.Precio}\n`
    })
    msg += `\n*Total a pagar: $${total.toLocaleString()}*`
    window.open(`https://wa.me/${nro}?text=${encodeURIComponent(msg)}`)
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* NAVBAR */}
      <nav className="bg-red-600 p-4 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full border-4 border-black flex items-center justify-center shadow-inner overflow-hidden relative">
               <div className="w-full h-1/2 bg-red-500 absolute top-0"></div>
               <div className="w-3 h-3 bg-white border-2 border-black rounded-full z-10"></div>
               <img src="/logo.png" className="z-20 w-10" alt="" onError={(e) => e.target.style.display='none'}/>
            </div>
            <h1 className="text-white text-3xl font-black tracking-tighter italic">POKEKIOSCO</h1>
          </div>

          <div className="relative w-full md:w-1/2">
            <input 
              type="text" 
              placeholder="¿Qué carta buscás en el stock?..." 
              className="w-full py-3 px-12 rounded-full border-none shadow-lg focus:ring-4 focus:ring-yellow-400 outline-none text-lg text-black"
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setVisibleCount(40)
              }}
            />
            <Search className="absolute left-4 top-3.5 text-slate-400" size={24} />
          </div>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-red-700 px-6 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95"
          >
            <ShoppingCart size={24} />
            <span className="bg-red-600 text-white px-2 rounded-full text-sm">{cart.length}</span>
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8 border-b-4 border-red-600 pb-2">
          <div className="flex items-center gap-2">
            <Store className="text-red-600" />
            <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">Nuestro Stock Real ({inventory.length})</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredCards.slice(0, visibleCount).map((card, index) => {
            const hasStock = card.Stock > 0;
            
            return (
              <div 
                key={card.id + index} 
                onClick={() => hasStock && setSelectedCard(card)}
                className={`bg-white rounded-xl p-3 shadow-md transition-all relative border-b-4 border-slate-200 
                  ${hasStock ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : 'opacity-50 grayscale cursor-not-allowed'}`}
              >
                {/* Badge Agotada */}
                {!hasStock && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 rounded-xl">
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded rotate-12 shadow-lg">SIN STOCK</span>
                  </div>
                )}

                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 mb-3 text-center flex items-center justify-center">
                  <img 
                    src={card.images?.small} 
                    alt={card.Nombre} 
                    className="w-full h-full object-contain"
                    loading="lazy"
                    onError={(e) => e.target.src = 'https://images.pokemontcg.io/generic/card.png'}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-red-600 font-bold uppercase">{card.Expansión}</p>
                  <h3 className="text-xs font-bold truncate">{card.Nombre}</h3>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                    <span className="text-sm font-black text-slate-900">${card.Precio}</span>
                    <button 
                      disabled={!hasStock}
                      onClick={(e) => { e.stopPropagation(); addToCart(card); }}
                      className={`p-1.5 rounded-md transition-all ${hasStock ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-200 text-slate-400'}`}
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
             <button onClick={loadMore} className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-colors">
               Cargar más cartas
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
              <button onClick={() => setIsCartOpen(false)}><X size={30}/></button>
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
                    <X size={20}/>
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